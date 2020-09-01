import { useStore } from "effector-react";
import p5 from "p5";
import React, { useEffect, useRef } from "react";

import { ids$ } from "../store/ids";
import { size$ } from "../store/size";
import { fromIndex } from "../utils";

import * as colors from "./colors";

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
    p.frameRate(12);
    p.noLoop();
    p.textSize(TILE_SIZE * .6);
    p.textAlign(p.CENTER, p.CENTER);
    p.stroke(colors.array[1]);
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

      let c = colors.array[0];

      if(iteration[i] === 2)
        c = colors.array[8];
      else if(iteration[i] === 1)
        c = colors.array[7];

      p.fill(c);
      p.rect(x, y, TILE_SIZE, TILE_SIZE);

      p.fill(colors.array[0]);
      // p.text(i, x + TILE_SIZE * .5, y + TILE_SIZE * .5);
      if(ids[i] > 0) {
        p.text(ids[i], x + TILE_SIZE * .5, y + TILE_SIZE * .5);
      }
    }
  };
};
export default ({ layout = null }) => {
  const size = useStore(size$);

  const ref = useRef(null);

  useEffect(() => {
    if(ref.current === null || layout === null)
      return;

    const p = new p5(sketch(layout, size), ref.current);

    return () => p.remove();
  }, [ layout ]);

  return (
    <div ref={ref} />
  );
};
