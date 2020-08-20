import { createEvent, createEffect, restore } from "effector";
import { useStore } from "effector-react";
import p5 from "p5";
import React, { useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
// import * as tfvis from "@tensorflow/tfjs-vis";

import { ids$ } from "../store/ids";
import { currentIteration$, refresh } from "../store/iterations";
// import { fetchedIterations$, setFetchedIterations } from "../store/iterations";
import { layout$ } from "../store/layout";
import { model$ } from "../store/model";
import { setPhase } from "../store/phase";
import { size$ } from "../store/size";
import { setTraining, training$ } from "../store/training";
import { inside, fromIndex, toIndex, generateIteration, iterationToLayout, join } from "../utils";

import * as colors from "./colors";

const setAttempts = createEvent();
export const attempts$ = restore(setAttempts, 0);

const setRank = createEvent();
export const rank$ = restore(setRank, -1);

const saveIteration = async(iteration, rank) => {
  const now = new Date;
  const timestamp = +now;
  
  const payload = {
    _id: `${timestamp}`,
    title: now.toISOString(),
    data: iteration,
    expectedRank: rank,
    attempts: attempts$.getState(),
    // iterationKey: entries$.getState().current,
    timestamp,
  };

  console.log("saveIteration", payload);

  await fetch("https://heartrate.miran248.now.sh/api/iteration", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  refresh();
};

// const classNames = [
//   "Zero",
//   "One",
//   "Two",
//   "Three",
//   "Four",
//   "Five",
//   "Six",
//   "Seven",
//   "Eight",
//   "Nine",
// ];

// const ranks = [
//   [ 1, 0, 0, 0, 0 ],
//   [ 0, 1, 0, 0, 0 ],
//   [ 0, 0, 1, 0, 0 ],
//   [ 0, 0, 0, 1, 0 ],
//   [ 0, 0, 0, 0, 1 ],
// ];

// const ranges = [
//   "[ 0, 5 )",
//   "[ 5, 10 )",
//   "[ 10, 20 )",
//   "[ 20, 40 )",
//   "[ 40, inf )",
// ];
const ranges = [
  "0 - 4",
  "5 - 9",
  "10 - 19",
  "20 - 39",
  "40 - inf",
];

let animationCompleted = null;
export const find = createEffect();
find.use(async({ rank }) => {
  setTimeout(() => setPhase(3), 0);

  const size = size$.getState();
  const l = layout$.getState();

  let argMax1;
  let response;
  let iteration;

  let tries = 0;

  let pendingRank = currentRank = -1;

  setRank(currentRank);

  do {
    ++tries;

    setAttempts(tries);

    iteration = generateIteration(p);
    const iterationLayout = join(l, iterationToLayout(l, iteration));

    layout = iterationLayout;

    const number = layout.map((item) => Math.max(0, item - 1));

    const xs = tf.tensor([ number ], [ 1, size.x, size.y, size.z ], "int32");
    // const xs = tf.tensor([ number ], [ 1, size.x, size.y, size.z ]);
    response = model$.getState().predict(xs);
    const preds = response.argMax(1);
    argMax1 = await preds.data();
    // const data = await response.data();

    // const ys = tf.tensor([ ranks[rank] ], [ 1, 5 ]);
    // const labels = await ys.argMax(1);

    pendingRank = argMax1[0];
    progress = 0;

    const animationCompletedPromise = new Promise((resolve, reject) => animationCompleted = resolve);
    p.loop();
    await animationCompletedPromise;
    p.noLoop();

    setRank(currentRank = pendingRank);
    p.redraw();

    // xs.dispose();
    // ys.dispose();
  } while(currentRank !== rank);

  await saveIteration(iteration, rank);

  return response;
});
find.pending.watch((pending) => {
  pending && setTraining(true);
});
find.fail.watch((error) => {
  console.error("find error", error);
})
find.done.watch(() => {
  setTimeout(() => {
    setPhase(4);
    setTraining(false);
  }, 0);
});

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

const sketch = (size) => (p) => {
  const ids = ids$.getState();

  const W = (26 + 7) * TILE_SIZE;
  const H = ((size.y + 1) * size.z - 1) * TILE_SIZE;

  p.setup = () => {
    p.createCanvas(W, H, p.CANVAS);
    p.noLoop();
    p.textAlign(p.CENTER, p.CENTER);
    p.stroke(colors.array[1]);
  };
  p.draw = () => {
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
      if(i === currentRank)
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

      if(i === currentRank)
        p.fill(colors.array[8]);
      else
        p.fill(colors.array[0]);

      p.rect(posX, posY, OUTPUT_WIDTH, OUTPUT_HEIGHT);

      if(i === currentRank)
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
      progress += .005;
    } else if(animationCompleted !== null) {
      animationCompleted();
      animationCompleted = null;
    }
  };
};

let p, layout;
let progress = 1.1;
let currentRank = -1;

export default () => {
  const size = useStore(size$);
  const iteration = useStore(currentIteration$);

  const ref = useRef(null);

  useEffect(() => {
    if(ref.current === null || iteration === null)
      return;

    if(training$.getState() === false) {
      layout = iteration.combined;

      setAttempts(iteration.attempts || 0);
      setRank(currentRank = iteration.expectedRank);
    }

    p = new p5(sketch(size), ref.current);

    return p.remove;
  }, [ ref.current, iteration ]);

  return (
    <div ref={ref} />
  );
};
