import { useStore } from "effector-react";
import p5 from "p5";
import React, { useEffect, useRef } from "react";
import styled from "styled-components";

import { linksGraph$ } from "../store/graph";
import { iteration$ } from "../store/iteration";
import { size$ } from "../store/size";
import { fromIndex } from "../utils";

const TILE_SIZE = 60;

const sketch = (iteration, size) => (p) => {
  const W = 750;
  // const W = 400;
  const H = W * 10 / 16;

  p.setup = () => {
    p.createCanvas(W, H, p.WEBGL);
    p.frameRate(12);
  };
  p.draw = () => {
    p.clear();

    // p.normalMaterial();
    p.ambientLight(255, 255, 255);

    //p.rotateX(-p.mouseY * .01);
    p.rotateX(-.6);
    p.rotateY(p.mouseX * .01);

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
      p.rotateX(p.PI * -.5);

      if(iteration[i] === 2)
        p.fill(51, 51, 51);
      else if(iteration[i] === 1)
        p.fill(153, 153, 153);

      p.plane(TILE_SIZE);

      // p.box(TILE_SIZE - 1, TILE_SIZE - 1, TILE_SIZE - 1);

      p.pop();
    }

    const linksGraph = linksGraph$.getState();
    for(let [ k, ka, s, t, sa, ta ] of linksGraph.edgeEntries()) {
      const sp = fromIndex(size, +s);
      const tp = fromIndex(size, +t);

      p.push();

      p.strokeWeight(2);
      p.stroke(0, 102, 255);
      p.line(
        TILE_SIZE * (sp.x + .5), TILE_SIZE * (sp.z + .5), TILE_SIZE * (sp.y + .5),
        TILE_SIZE * (tp.x + .5), TILE_SIZE * (tp.z + .5), TILE_SIZE * (tp.y + .5)
      );

      p.pop();
    }
  };
};

const Code = styled.code`
  word-break: break-all;
`;
const Card = styled.div`
  & canvas {
    height: auto !important;
    width: 100% !important;
  }
`;

export default () => {
  const iteration = useStore(iteration$);
  const size = useStore(size$);

  const ref = useRef(null);

  useEffect(() => {
    if(ref.current === null || iteration === null)
      return;

    const p = new p5(sketch(iteration.combined, size), ref.current);

    return p.remove;
  }, [ ref.current, iteration ]);

  if(iteration === null) {
    return (
      <div><a href="#pick">pick iteration</a></div>
    );
  }

  const text = JSON.stringify(iteration.combined);

  return (
    <Card>
      <p>
        <Code>{text}</Code>
      </p>
      <div ref={ref} />
    </Card>
  );
};
