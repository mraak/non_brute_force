import * as d3 from "d3";
import { format } from "date-fns";
import { useStore } from "effector-react";
import React, { Fragment, useMemo } from "react";
import { useTable } from "react-table";
import styled from "styled-components";

import { formatBpm, formatRank, formatDate } from "../../formatters";
import { admin$ } from "../../store/admin";
import { iterations$, saveIteration } from "../../store/iterations";

import * as colors from "../colors";
import { Apart, Center, HR, Label, Panel, Title } from "../components";
import HorizontalPreview from "../HorizontalPreview";

const Container = styled.div`
  display: grid;
  grid-auto-columns: inherit;
  grid-auto-flow: row;
  grid-auto-rows: 322px 300px;
  grid-gap: 17px;
  height: 639px;

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

const Grid = styled.div`
  // border: 1px solid #000000;
  color: #000000;
  display: grid;
  font-size: 1ch;
  grid-auto-columns: 6ch;
  grid-auto-flow: column;
  grid-gap: 1ch;
  grid-template-rows: repeat(5, 6ch);
  overflow-x: auto;

  * {
    border: 1px solid #000000;
    display: grid;
    place-items: center;
  }
`;

var rankColor = d3.scaleSequential()
      .interpolator(d3.scaleOrdinal(d3.schemePastel1))
      .domain([ 0, 4 ]);

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

const renderRank = (targetRank, { actualRank, timestamp }) => actualRank === targetRank
  ? (<div style={{ backgroundColor: rankColor(actualRank) }}>{format(timestamp, "MM/dd")}<br />{format(timestamp, "HH:mm")}</div>)
  : (<div />);
export default () => {
  const admin = useStore(admin$);
  const iterations = useStore(iterations$);

  const valid = admin === false;

  const columns = useMemo(
    () => [
      ...(admin ? [{
        Header: "valid",
        accessor: "valid",
        Cell: ({ row: { original }, value }) => (
          <input type="checkbox"
                 checked={value}
                 disabled={!("_id" in original)}
                 onChange={() => saveIteration({ _id: original._id, valid: !value })}
                 />
        ),
      }] : []),
      {
        Header: "date",
        accessor: ({ timestamp }) => formatDate(timestamp),
      },
      {
        Header: "layout",
        accessor: "combined",
        Cell: ({ value }) => (
          <HorizontalPreview layout={value} />
        ),
      },
      {
        Header: "maja bpm",
        accessor: ({ human }) => formatBpm(human === null ? null : human.bpm),
      },
      {
        Header: "dog bpm",
        accessor: ({ animal }) => formatBpm(animal === null ? null : animal.bpm),
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
        accessor: ({ expectedRank, actualRank }) => expectedRank === actualRank ? "YES" : "NO",
      },
      {
        Header: "trainable",
        accessor: ({ trainable }) => trainable ? "YES" : "NO",
      },
    ],
    [ admin ]
  );

  const data = iterations && iterations.filter(
    (iteration) => valid === false || iteration.valid
  ) || [];

  const trainableData = iterations && iterations.filter(
    (iteration) => iteration.trainable
  ) || [];
  trainableData.sort(
    (a, b) => b.timestamp - a.timestamp
  );

  return (
    <Container>
      <Panel>
        <Title>neural network learning curve through time (all iterations)</Title>
        <HR />
        <Grid>
          <Center style={{ backgroundColor: colors.array[4] }}><Label>4</Label></Center>
          <Center style={{ backgroundColor: colors.array[4] }}><Label>3</Label></Center>
          <Center style={{ backgroundColor: colors.array[4] }}><Label>2</Label></Center>
          <Center style={{ backgroundColor: colors.array[4] }}><Label>1</Label></Center>
          <Center style={{ backgroundColor: colors.array[4] }}><Label>0</Label></Center>
          {trainableData.map(
            (iteration, i) => (
              <Fragment key={i}>
                {renderRank(4, iteration)}
                {renderRank(3, iteration)}
                {renderRank(2, iteration)}
                {renderRank(1, iteration)}
                {renderRank(0, iteration)}
              </Fragment>
            )
          )}
        </Grid>
        <HR />
        <Apart style={{ justifyContent: "center" }}>
          <Label style={{ fontSize: 15, textTransform: "initial" }}>class / time</Label>
        </Apart>
      </Panel>
      
      <Panel>
        <Title>historic iterations</Title>
        <HR />
        <div style={{ overflowY: "auto" }}>
          <Table columns={columns} data={data} />
        </div>
      </Panel>
    </Container>
  );
};
