import { useStore } from "effector-react";
import p5 from "p5";
import React, { useEffect } from "react";
import styled from "styled-components";

import { ids$ } from "../store/ids";
import { iteration$ } from "../store/iteration";
import { size$ } from "../store/size";
import { inside, fromIndex, toIndex, generateIteration } from "../utils";

const TILE_SIZE = 12;

const sketch = (iteration, size) => (p) => {
  const ids = ids$.getState();

  const W = size.x * TILE_SIZE;
  const H = ((size.y + 1) * size.z - 1) * TILE_SIZE;
  const bounds = [ 0, 0, W, H ];

  let dragging = -1;

  p.setup = () => {
    p.createCanvas(W, H, p.CANVAS);
    p.noLoop();
    p.textSize(TILE_SIZE * .6);
    p.textAlign(p.CENTER, p.CENTER);
  };
  p.mousePressed = () => {
    if(inside(p, bounds)) {
      const l = [ p.mouseX - bounds[0], p.mouseY - bounds[1] ];
      const x = p.floor(l[0] / TILE_SIZE);
      const z = p.floor(l[1] / (TILE_SIZE * (size.y + 1)));
      const y = p.floor(l[1] / TILE_SIZE) - (size.y + 1) * z;

      if(x < size.x && y < size.y && z < size.z) {
        const i = toIndex(size, x, y, z);

        if(iteration[i] === 2)
          dragging = iteration[i] = 1;
        else if(iteration[i] === 1)
          dragging = iteration[i] = 2;
        else
          dragging = -1;

        p.redraw();
      }
    } else
      dragging = -1;
  };
  p.mouseReleased = () => {
    dragging = -1;
  };
  p.mouseDragged = () => {
    if(dragging < 0)
      return;

    if(inside(p, bounds)) {
      const l = [ p.mouseX - bounds[0], p.mouseY - bounds[1] ];
      const x = p.floor(l[0] / TILE_SIZE);
      const z = p.floor(l[1] / (TILE_SIZE * (size.y + 1)));
      const y = p.floor(l[1] / TILE_SIZE) - (size.y + 1) * z;

      if(x < size.x && y < size.y && z < size.z) {
        const i = toIndex(size, x, y, z);

        if(iteration[i] > 0)
          iteration[i] = dragging;

        p.redraw();
      }
    }
  }
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

const generateClickHandler = () => {
  const iteration = generateIteration(p);

  console.log(iteration);
};

let p;

export default () => {
  const iteration = useStore(iteration$);
  const size = useStore(size$);

  const id = `draw-container`;

  useEffect(() => {
    p = new p5(sketch(iteration.combined, size), id);

    return p.remove;
  }, []);

  return (
    <div>
      <p>
        <button onClick={generateClickHandler}>Generate</button>
      </p>
      <div id={id} />
    </div>
  );
};
