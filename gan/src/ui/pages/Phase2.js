import { useStore } from "effector-react";
import p5 from "p5";
import React, { useEffect, useRef } from "react";

import * as colors from "../colors";
import { Apart, Chart, HR, Label } from "../components";
import { ids$ } from "../../store/ids";
import { phase2State$, remotePhase$ } from "../../store/phases";
import { size$ } from "../../store/size";
import { fromIndex } from "../../utils";

const ranges = [
  "0 - 4",
  "5 - 9",
  "10 - 19",
  "20 - 39",
  "40 - inf",
];

const TILE_SIZE = 14;

const outputOffsetX = 26 * TILE_SIZE;
const outputOffsetY = 0;

const HIDDEN_WIDTH = 7 * TILE_SIZE;
const HIDDEN_HEIGHT = 5 * TILE_SIZE;

const OUTPUT_WIDTH = 7 * TILE_SIZE;
const OUTPUT_HEIGHT = 5 * TILE_SIZE;

const INPUT_TEXT = [ TILE_SIZE * .5, TILE_SIZE * .5 ];
const IN_LINES = [
  [ 0, -(OUTPUT_HEIGHT + TILE_SIZE) * 2, TILE_SIZE * 6, 0 ],
  [ 0, -(OUTPUT_HEIGHT + TILE_SIZE),     TILE_SIZE * 6, 0 ],
  [ 0, 0,                                TILE_SIZE * 6, 0 ],
  [ 0, +(OUTPUT_HEIGHT + TILE_SIZE),     TILE_SIZE * 6, 0 ],
  [ 0, +(OUTPUT_HEIGHT + TILE_SIZE) * 2, TILE_SIZE * 6, 0 ],
];
const OUT_LINES = [
  [ HIDDEN_WIDTH * .5, 0, outputOffsetX, -(OUTPUT_HEIGHT + TILE_SIZE) * 2 ],
  [ HIDDEN_WIDTH * .5, 0, outputOffsetX, -(OUTPUT_HEIGHT + TILE_SIZE) ],
  [ HIDDEN_WIDTH * .5, 0, outputOffsetX, 0 ],
  [ HIDDEN_WIDTH * .5, 0, outputOffsetX, +(OUTPUT_HEIGHT + TILE_SIZE) ],
  [ HIDDEN_WIDTH * .5, 0, outputOffsetX, +(OUTPUT_HEIGHT + TILE_SIZE) * 2 ],
];

const sketch = (state) => (p) => {
  const ids = ids$.getState();
  const phase = remotePhase$.getState();
  const size = size$.getState();

  const { currentRank, layout } = state;

  const W = (26 + 7) * TILE_SIZE;
  const H = ((size.y + 1) * size.z - 1) * TILE_SIZE;

  let progress = phase === 2 ? 0 : 1;

  p.setup = () => {
    p.createCanvas(W, H, p.CANVAS);
    p.textAlign(p.CENTER, p.CENTER);
    p.stroke(colors.array[1]);
  };
  p.draw = () => {
    if(!layout)
      return;

    const layoutCount = layout.length;
    const progressIndex = Math.floor(progress * layoutCount);

    // aligns to top left
    // p.translate(-W / 2, -H / 2, 0);

    let posX, posY;

    // input
    p.textSize(TILE_SIZE * .6);
    for(let i = 0; i < layoutCount; ++i) {
      const { x, y, z } = fromIndex(size, i);

      posX = x * TILE_SIZE;
      posY = y * TILE_SIZE;
      const posZ = z * (size.y + 1) * TILE_SIZE;

      let c = colors.array[0];

      if(layout[i] === 2)
        c = i < progressIndex ? colors.array[8] : colors.array[1];
      else if(layout[i] === 1)
        c = colors.array[1];

      if(i === progressIndex)
        p.fill(colors.array[6]);
      else
        p.fill(c);
      
      p.rect(posX, posY + posZ, TILE_SIZE, TILE_SIZE);

      p.fill(colors.array[0]);
      if(ids[i] > 0) {
        p.text(ids[i], posX + INPUT_TEXT[0], posY + posZ + INPUT_TEXT[1]);
      }
    }

    // in lines
    posX = TILE_SIZE * 7;
    posY = H * .5;
    for(let i = 0; i < 5; ++i) {
      if(i === Math.floor(progress * 5))
        p.stroke(colors.array[8]);
      else
        p.stroke(colors.array[1]);
      p.line(posX + IN_LINES[i][0], posY + IN_LINES[i][1], posX + IN_LINES[i][2], posY + IN_LINES[i][3]);
      p.stroke(colors.array[1]);
    }

    // hidden
    posX = W * .5;
    posY = H * .5;
    p.fill(colors.array[4]);
    p.rect(posX - HIDDEN_WIDTH * .5, posY - HIDDEN_HEIGHT * .5, HIDDEN_WIDTH, HIDDEN_HEIGHT);

    // out lines
    for(let i = 0; i < 5; ++i) {
      if(i === currentRank && progress >= 1)
        p.stroke(colors.array[8]);
      else
        p.stroke(colors.array[1]);
      p.line(posX + OUT_LINES[i][0], posY + OUT_LINES[i][1], OUT_LINES[i][2], posY + OUT_LINES[i][3]);
      p.stroke(colors.array[1]);
    }

    p.fill(colors.array[1]);
    p.textSize(TILE_SIZE * 2);
    p.text("CNN", posX, posY);

    // output
    for(let i = 0; i < 5; ++i) {
      // const { x, y, z } = fromIndex(size, i);
      
      posX = outputOffsetX;
      posY = outputOffsetY + i * (OUTPUT_HEIGHT + TILE_SIZE);

      if(i === currentRank && progress >= 1)
        p.fill(colors.array[8]);
      else
        p.fill(colors.array[0]);

      p.rect(posX, posY, OUTPUT_WIDTH, OUTPUT_HEIGHT);

      if(i === currentRank && progress >= 1)
        p.fill(colors.array[0]);
      else
        p.fill(colors.array[3]);

      p.line(posX, posY + TILE_SIZE * 2, posX + OUTPUT_WIDTH, posY + TILE_SIZE * 2);

      p.textSize(TILE_SIZE * 1.6);
      p.text(i, posX + OUTPUT_WIDTH * .5, posY + TILE_SIZE * 1);
      
      p.textSize(TILE_SIZE * 1);
      p.text(`${ranges[i]}\nBPM DELTA`, posX + OUTPUT_WIDTH * .5, posY + TILE_SIZE * 3.5);
    }

    // progress = (progress + .01) % 1;
    if(progress < 1) {
      progress += p.deltaTime / 3000;
    } else {
      p.noLoop();
    }
  };
};

export default () => {
  const phase2State = useStore(phase2State$);

  const ref = useRef(null);

  useEffect(() => {
    if(ref.current === null || phase2State === null)
      return;

    const p = new p5(sketch(phase2State), ref.current);

    return () => p.remove();
  }, [ phase2State === null ? 0 : phase2State.attempts ]);

  return (
    <>
      <Chart style={{ padding: 52 }}>
        <div ref={ref} />
      </Chart>
      <HR />
      <Apart>
        <Label style={{ fontSize: 15 }}>installation map</Label>
        <Label style={{ fontSize: 15, color: colors.array[1] }}>|</Label>
        <Label style={{ fontSize: 15 }}>hidden layers</Label>
        <Label style={{ fontSize: 15, color: colors.array[1] }}>|</Label>
        <Label style={{ fontSize: 15 }}>matching classes</Label>
      </Apart>
      {/* <Apart small>
        <Label>attempts</Label><Value>{attempts}</Value>
      </Apart>
      <HR />
      <Apart small>
        <Label>class</Label><Value>{formatRank(rank)}</Value>
      </Apart> */}
    </>
  );
};
