import { useStore } from "effector-react";
import p5 from "p5";
import React, { useEffect, useRef } from "react";

import { linksGraph$ } from "../store/graph";
import { currentIteration$ } from "../store/iterations";
import { size$ } from "../store/size";
import { fromIndex } from "../utils";

import * as colors from "./colors";

const TILE_SIZE = 60;

const sketch = (iteration, size) => (p) => {
  const W = 558;
  const H = 413;

  let cp = null;

  p.setup = () => {
    // p.setAttributes("depth", false);
    // p.setAttributes("premultipliedAlpha", true);
    // p.setAttributes("perPixelLighting", false);
    p.createCanvas(W, H, p.WEBGL);
    p.frameRate(12);
    p.stroke(colors.array[1]);
    // p.blendMode(p.SCREEN);
    // p.rectMode(p.CENTER);

    cp = p.createVector(0, -200, (H * .5) / p.tan(p.PI * 30 / 180));
  };
  p.draw = () => {
    p.clear();
    // p.debugMode();

    // p.normalMaterial();

    // cp.x = p.mouseX;
    // cp.y = H/2 + p.mouseY;

    p.camera(
      cp.x, cp.y, cp.z, // x, y, z,
      cp.x, 40, 0, // cx, cy, cz
      0, 1, 0
    );

    // p.camera(W/2 + p.mouseX, H/2 + p.mouseY, (H/2) / p.tan(p.PI/6), W/2 + p.mouseX, H/2 + p.mouseY, 0, 0, 1, 0);

    // p.rotateX(p.PI * .25);
    p.rotateY(p.mouseX / W * p.PI * 2);

    p.translate(
      -.5 * TILE_SIZE * size.x,
      -.5 * TILE_SIZE * size.y,
      -.5 * TILE_SIZE * size.z
    );

    for(let i in iteration) {
      if(iteration[i] === 0)
        continue;

      const { x, y, z } = fromIndex(size, i);

      p.push();

      p.translate(
        TILE_SIZE * (x + .5),
        TILE_SIZE * (z + .5),
        TILE_SIZE * (y + .5)
      );
      p.rotateX(p.PI * .5);

      let c = null;

      // if(iteration[i] === 2)
      //   c = colors.array[8];
      //   // c = `${colors.array[8]}99`;
      // else if(iteration[i] === 1)
      //   c = colors.array[7];
        // c = `${colors.array[7]}66`;

      if(iteration[i] === 2)
        c = p.color(51, 51, 51);
      else if(iteration[i] === 1)
        c = p.color(153, 153, 153);

      if(c !== null) {
        p.fill(c);
        p.plane(TILE_SIZE);
      }

      // p.box(TILE_SIZE - 1, TILE_SIZE - 1, TILE_SIZE - 1);

      // p._renderer.immediateMode.geometry.computeFaces();
      // p._renderer.immediateMode.geometry.computeNormals();
      // p._renderer.immediateMode.geometry.reset();
      // p._renderer.immediateMode.geometry.normalize();

      p.pop();
    }

    const linksGraph = linksGraph$.getState();
    for(let [ k, ka, s, t, sa, ta ] of linksGraph.edgeEntries()) {
      const sp = fromIndex(size, +s);
      const tp = fromIndex(size, +t);

      if(iteration[s] < 2 || iteration[t] < 2)
        continue;

      p.push();

      p.strokeWeight(2);
      // p.stroke(colors.array[6]);
      p.stroke(0, 102, 255);
      p.line(
        TILE_SIZE * (sp.x + .5), TILE_SIZE * (sp.z + .5), TILE_SIZE * (sp.y + .5),
        TILE_SIZE * (tp.x + .5), TILE_SIZE * (tp.z + .5), TILE_SIZE * (tp.y + .5)
      );

      p.pop();
    }
  };
};

export default () => {
  const iteration = useStore(currentIteration$);
  const size = useStore(size$);

  const ref = useRef(null);

  useEffect(() => {
    if(ref.current === null || iteration === null)
      return;

    const p = new p5(sketch(iteration.combined, size), ref.current);

    return () => p.remove();
  }, [ iteration && JSON.stringify(iteration.combined) ]);

  if(iteration === null) {
    return (
      <div><a href="#pick">pick iteration</a></div>
    );
  }

  return (
    <div ref={ref} />
  );
};
