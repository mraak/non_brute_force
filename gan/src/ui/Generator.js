import { createEvent, createEffect, restore } from "effector";
import { useStore } from "effector-react";
import p5 from "p5";
import React, { useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
// import * as tfvis from "@tensorflow/tfjs-vis";

import { ids$ } from "../store/ids";
import { iteration$ } from "../store/iteration";
import { fetchIterations } from "../store/iterations";
import { layout$ } from "../store/layout";
import { model$ } from "../store/model";
import { setPhase } from "../store/phase";
import { size$ } from "../store/size";
import { setTraining } from "../store/training";
import { inside, fromIndex, toIndex, generateIteration, iterationToLayout, join } from "../utils";

const setAttempts = createEvent();
export const attempts$ = restore(setAttempts, 0);

const setRank = createEvent();
export const rank$ = restore(setRank, 0);

const saveIteration = async(iteration, rank) => {
  const now = new Date;
  const timestamp = +now;
  
  const payload = {
    _id: `${timestamp}`,
    title: now.toISOString(),
    data: iteration,
    expectedRank: rank,
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

  fetchIterations();
};

const classNames = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
];

const ranks = [
  [ 1, 0, 0, 0, 0 ],
  [ 0, 1, 0, 0, 0 ],
  [ 0, 0, 1, 0, 0 ],
  [ 0, 0, 0, 1, 0 ],
  [ 0, 0, 0, 0, 1 ],
];

const ranges = [
  "[ 0, 5 )",
  "[ 5, 10 )",
  "[ 10, 20 )",
  "[ 20, 40 )",
  "[ 40, inf )",
];

let animationCompleted = null;
export const find = createEffect();
find.use(async({ rank }) => {
  // const element = document.getElementById("phase-3");
  setTimeout(() => {
    setPhase(3);
    // window.scrollTo({
    //   behavior: element ? "smooth" : "auto",
    //   top: element ? element.offsetTop : 0,
    // });
  }, 100);

  const size = size$.getState();
  const l = layout$.getState();

  let argMax1;
  let response;
  let iteration;

  let tries = 0;

  do {
    ++tries;

    setAttempts(tries);

    iteration = generateIteration(p);
    const iterationLayout = join(l, iterationToLayout(l, iteration));

    layout = iterationLayout;

    // p.redraw();
    progress = 0;
    p.loop();

    const animationCompletedPromise = new Promise((resolve, reject) => animationCompleted = resolve);

    const number = layout.map((item) => Math.max(0, item - 1));

    const xs = tf.tensor([ number ], [ 1, size.x, size.y, size.z ], "int32");
    // const xs = tf.tensor([ number ], [ 1, size.x, size.y, size.z ]);
    response = model$.getState().predict(xs);
    const preds = response.argMax(1);
    argMax1 = await preds.data();
    const data = await response.data();

    const ys = tf.tensor([ ranks[rank] ], [ 1, 5 ]);
    const labels = await ys.argMax(1);

    setRank(argMax1[0]);

    console.log(`${tries}. found`, argMax1[0]); // , Array.from(data));

    // accuracy
    // const classAccuracy = await tfvis.metrics.perClassAccuracy(labels, preds);
    // const container = { name: "Accuracy", tab: "Evaluation" };
    // tfvis.show.perClassAccuracy(container, classAccuracy, classNames);

    // confusion
    // const confusionMatrix = await tfvis.metrics.confusionMatrix(labels, preds);
    // console.log("tfvis.show", tfvis.show)
    // console.log("tfvis.render", tfvis.render)
    // console.log("tfvis.metrics", tfvis.metrics)

    // tfvis.render.confusionMatrix({ name: "Confusion Matrix", tab: "Evaluation" }, {
    //   values: confusionMatrix,
    //   tickLabels: classNames,
    // });
    // tfvis.render.heatmap({ name: "Heatmap", tab: "Evaluation" }, {
    //   values: confusionMatrix,
    // });
    // tfvis.render.histogram({ name: "Histogram", tab: "Evaluation" }, {
    //   values: confusionMatrix,
    // });

    xs.dispose();
    ys.dispose();

    p.loop();
    
    await animationCompletedPromise;
  } while(argMax1[0] !== rank);

  // "https://heartrate.miran248.now.sh/api/iteration"

  console.log("found rank", rank, "in", tries, "tries");

  await saveIteration(iteration, rank);

  return response;
});
find.pending.watch((pending) => pending && setTraining(true));
find.fail.watch((error) => {
  console.error("find error", error);
})
find.finally.watch(() => {
  // const element = document.getElementById("phase-4");
  setTimeout(() => {
    setPhase(4);
    // setTraining(false);
    // window.scrollTo({
    //   behavior: element ? "smooth" : "auto",
    //   top: element ? element.offsetTop : 0,
    // });
  }, 100);
});

const TILE_SIZE = 12;

const sketch = (size) => (p) => {
  const ids = ids$.getState();

  const W = 800;
  const H = ((size.y + 1) * size.z - 1) * TILE_SIZE;

  const hiddenOffsetX = 20 * TILE_SIZE;
  const hiddenOffsetY = 2 * TILE_SIZE;

  const outputOffsetX = 40 * TILE_SIZE;
  const outputOffsetY = 2.5 * TILE_SIZE;

  const OUTPUT_TILE_SIZE = 4 * TILE_SIZE;

  p.setup = () => {
    p.createCanvas(W, H, p.CANVAS);
    p.noLoop();
  };
  p.draw = () => {
    const layoutCount = layout.length;
    const progressIndex = Math.floor(progress * layoutCount);

    // aligns to top left
    // p.translate(-W / 2, -H / 2, 0);

    p.textSize(TILE_SIZE * .6);
    p.textAlign(p.CENTER, p.CENTER);
    for(let i = 0; i < layoutCount; ++i) {
      const { x, y, z } = fromIndex(size, i);

      const posX = x * TILE_SIZE;
      const posY = y * TILE_SIZE;
      const posZ = z * (size.y + 1) * TILE_SIZE;

      let c = 255;

      if(layout[i] === 2)
        c = 51;
      else if(layout[i] === 1)
        c = 204;

      if(i === progressIndex)
        p.fill(255, 102, 0);
      else
        p.fill(c);
      
      p.rect(posX, posY + posZ, TILE_SIZE, TILE_SIZE);

      p.fill(255 - c);
      // p.text(i, posX + TILE_SIZE * .5, posY + posZ + TILE_SIZE * .5);
      if(ids[i] > 0) {
        p.text(ids[i], posX + TILE_SIZE * .5, posY + posZ + TILE_SIZE * .5);
      }
    }

    for(let i = 0; i < layoutCount; ++i) {
      const { x, y, z } = fromIndex(size, i);

      const posX = hiddenOffsetX + x * TILE_SIZE;
      const posY = hiddenOffsetY + y * TILE_SIZE;
      const posZ = z * size.y * TILE_SIZE;

      let c = 255;

      if(layout[i] === 2)
        c = 51;
      else if(layout[i] === 1)
        c = 204;

      if(i === progressIndex)
        p.fill(255, 102, 0);
      else
        p.fill(c);
      
      p.rect(posX, posY + posZ, TILE_SIZE, TILE_SIZE);

      p.fill(255 - c);
      // p.text(i, posX + TILE_SIZE * .5, posY + posZ + TILE_SIZE * .5);
      if(ids[i] > 0) {
        p.text(ids[i], posX + TILE_SIZE * .5, posY + posZ + TILE_SIZE * .5);
      }
    }

    p.textSize(OUTPUT_TILE_SIZE * .5);
    for(let i = 0; i < 5; ++i) {
      // const { x, y, z } = fromIndex(size, i);
      
      const posX = outputOffsetX;
      const posY = outputOffsetY + i * (OUTPUT_TILE_SIZE + TILE_SIZE);

      if(previousRank > -1 && i === previousRank)
        p.fill(255, 102, 0);
      else
        p.fill(255);

      p.rect(posX, posY, OUTPUT_TILE_SIZE, OUTPUT_TILE_SIZE);

      p.fill(159, 159, 164);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(i, posX + OUTPUT_TILE_SIZE * .5, posY + OUTPUT_TILE_SIZE * .5);
      p.textAlign(p.LEFT, p.CENTER);
      p.text(`${ranges[i]} bpm delta`, posX + OUTPUT_TILE_SIZE * 1.2, posY + OUTPUT_TILE_SIZE * .5);
    }

    // progress = (progress + .01) % 1;
    if(progress < 1) {
      progress += .01;

      if(progress >= 1)
        previousRank = rank$.getState();
    } else if(animationCompleted !== null) {
      p.noLoop();
      animationCompleted();
      animationCompleted = null;
    }
  };
};

let p, layout;
let progress = 1.1;
let previousRank = -1;

export default () => {
  const size = useStore(size$);
  const iteration = useStore(iteration$);

  const ref = useRef(null);

  useEffect(() => {
    if(ref.current === null || iteration === null)
      return;

    layout = iteration.combined;
    
    setRank(previousRank = iteration.actualRank || iteration.expectedRank);

    p = new p5(sketch(size), ref.current);
    p.redraw();

    return p.remove;
  }, [ ref.current, iteration ]);

  return (
    <div ref={ref} />
  );
};
