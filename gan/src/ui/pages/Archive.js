import { useStore } from "effector-react";
import p5 from "p5";
import React, { useEffect, useMemo, useRef } from "react";
import { useTable } from "react-table";
import styled from "styled-components";

import { formatBpm, formatRank, formatDate } from "../../formatters";
import { ids$ } from "../../store/ids";
import { fetchIterations, iterations$ } from "../../store/iterations";
import { size$ } from "../../store/size";
import { fromIndex } from "../../utils";

import { Image } from "../components";

const saveIteration = async(id, diff) => {
  const payload = {
    _id: id,
    ...diff,
  };

  console.log("saveIteration", payload);

  await fetch("https://heartrate.miran248.now.sh/api/iteration", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  fetchIterations();
};

const TILE_SIZE = 12;
const sketch = (iteration, size) => (p) => {
  const ids = ids$.getState();

  // horizontal
  const W = ((size.x + 1) * size.z - 1) * TILE_SIZE;
  const H = size.y * TILE_SIZE;

  // vertical
  // const W = size.x * TILE_SIZE;
  // const H = ((size.y + 1) * size.z - 1) * TILE_SIZE;

  p.setup = () => {
    p.createCanvas(W, H, p.CANVAS);
    p.noLoop();
    p.textSize(TILE_SIZE * .6);
    p.textAlign(p.CENTER, p.CENTER);
  };
  p.draw = () => {
    // aligns to top left
    // p.translate(-W / 2, -H / 2, 0);

    for(let i in iteration) {
      const pos = fromIndex(size, i);

      // horizontal
      const posX = pos.x * TILE_SIZE;
      const posY = pos.y * TILE_SIZE;
      const posZ = pos.z * (size.x + 1) * TILE_SIZE;

      const x = posX + posZ;
      const y = posY;

      // vertical
      // const posX = p.x * TILE_SIZE;
      // const posY = p.y * TILE_SIZE;
      // const posZ = p.z * (size.y + 1) * TILE_SIZE;

      // const x = posX;
      // const y = posY + posZ;

      let c = 255;

      if(iteration[i] === 2)
        c = 51;
      else if(iteration[i] === 1)
        c = 204;

      p.fill(c);
      p.rect(x, y, TILE_SIZE, TILE_SIZE);

      p.fill(255 - c);
      // p.text(i, x + TILE_SIZE * .5, y + TILE_SIZE * .5);
      if(ids[i] > 0)
        p.text(ids[i], x + TILE_SIZE * .5, y + TILE_SIZE * .5);
    }
  };
};
const HorizontalPreview = ({ value: layout }) => {
  const size = useStore(size$);

  const ref = useRef(null);

  useEffect(() => {
    if(ref.current === null)
      return;

    const p = new p5(sketch(layout, size), ref.current);

    return p.remove;
  }, [ ref.current ]);

  return (
    <div ref={ref} />
  );
};

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`;

const Table = ({ columns, data }) => {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  });

  // Render the UI for your table
  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default () => {
  const iterations = useStore(iterations$);

  const columns = useMemo(
    () => [
      {
        Header: "valid",
        accessor: "valid",
        Cell: ({ row: { original }, value }) => (
          <input type="checkbox"
                 checked={value}
                 disabled={!("_id" in original)}
                 onChange={() => saveIteration(original._id, { valid: !value })}
                 />
        ),
      },
      {
        Header: "date",
        accessor: ({ timestamp }) => formatDate(timestamp),
      },
      {
        Header: "layout",
        accessor: "combined",
        Cell: HorizontalPreview,
      },
      {
        Header: "maja bpm",
        accessor: ({ maja }) => formatBpm(maja),
      },
      {
        Header: "dog bpm",
        accessor: ({ dog }) => formatBpm(dog),
      },
      {
        Header: "delta bpm",
        accessor: ({ delta }) => formatBpm(delta),
      },
      {
        Header: "class",
        accessor: ({ actualRank }) => formatRank(actualRank),
      },
      {
        Header: "match",
        accessor: ({ expectedRank, actualRank }) => expectedRank === actualRank,
        Cell: ({ value }) => (
          <input type="checkbox"
                 checked={value}
                 disabled />
        ),
      },
      {
        Header: "trainable",
        accessor: "trainable",
        Cell: ({ value }) => (
          <input type="checkbox"
                 checked={value}
                 disabled />
        ),
      },
    ],
    []
  );

  return (
    <Styles>
      <Image src="archive-histogram.png" />
      <Table columns={columns} data={iterations || []} />
    </Styles>
  );
};
