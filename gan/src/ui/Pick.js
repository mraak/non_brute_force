import { useStore } from "effector-react";
import p5 from "p5";
import React, { useEffect } from "react";
import styled from "styled-components";

import { ids$ } from "../store/ids";
import { iterationIndex$, setIterationIndex } from "../store/iterationIndex";
import { iterations$ } from "../store/iterations";
import { size$ } from "../store/size";
import { fromIndex } from "../utils";

const TILE_SIZE = 12;
// const TILE_SIZE = 24;

const sketch = (iteration, size) => (p) => {
  const ids = ids$.getState();

  const W = size.x * TILE_SIZE;
  const H = ((size.y + 1) * size.z - 1) * TILE_SIZE;

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
      const { x, y, z } = fromIndex(size, i);

      const posX = x * TILE_SIZE;
      const posY = y * TILE_SIZE;
      const posZ = z * (size.y + 1) * TILE_SIZE;

      let c = 255;

      if(iteration[i] === 2)
        c = 51;
      else if(iteration[i] === 1)
        c = 204;

      p.fill(c);
      p.rect(posX, posY + posZ, TILE_SIZE, TILE_SIZE);

      p.fill(255 - c);
      // p.text(i, posX + TILE_SIZE * .5, posY + posZ + TILE_SIZE * .5);
      if(ids[i] > 0)
        p.text(ids[i], posX + TILE_SIZE * .5, posY + posZ + TILE_SIZE * .5);
    }
  };
};

const Cards = styled.div`
  display: grid;
  gap: 1ch;
  grid-auto-flow: column;
  overflow-x: auto;
`;

const Card = ({ id, index, iteration }) => {
  const selectedIndex = useStore(iterationIndex$);
  const size = useStore(size$);

  useEffect(() => {
    const p = new p5(sketch(iteration.data, size), id);

    return p.remove;
  }, []);

  return (
    <button id={id}
            onClick={() => setIterationIndex(index)}
            disabled={selectedIndex === index}>
      <div>{iteration.title}</div>
    </button>
  );
};

export default () => {
  const iterations = useStore(iterations$);

  return (
    <Cards>
    {iterations.map((iteration, i) => {
      const id = `pick-container-${i}`;

      return (
        <Card key={id}
              id={id}
              index={i}
              iteration={iteration} />
      );
    })}
    </Cards>
  );
};
