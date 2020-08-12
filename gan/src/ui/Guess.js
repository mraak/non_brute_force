import { createEvent, createEffect, restore } from "effector";
import { useStore } from "effector-react";
import p5 from "p5";
import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";

import { ids$ } from "../store/ids";
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

const guess = createEffect();
guess.use(async({ number, rank }) => {
  const size = size$.getState();

  const xs = tf.tensor([ number ], [ 1, size.x, size.y, size.z ], "int32");
  // const xs = tf.tensor([ number ], [ 1, size.x, size.y, size.z ]);
  const response = model$.getState().predict(xs);
  const preds = response.argMax(1);
  const argMax1 = await preds.data();
  const data = await response.data();

  const l = tf.tensor([ ranks[rank] ], [ 1, 5 ]);
  const labels = await l.argMax(1);

  console.log("guessed", argMax1[0], Array.from(data));

  // accuracy
  const classAccuracy = await tfvis.metrics.perClassAccuracy(labels, preds);
  const container = { name: "Accuracy", tab: "Evaluation" };
  tfvis.show.perClassAccuracy(container, classAccuracy, classNames);

  // confusion
  const confusionMatrix = await tfvis.metrics.confusionMatrix(labels, preds);
  // console.log("tfvis.show", tfvis.show)
  // console.log("tfvis.render", tfvis.render)
  // console.log("tfvis.metrics", tfvis.metrics)

  tfvis.render.confusionMatrix({ name: "Confusion Matrix", tab: "Evaluation" }, {
    values: confusionMatrix,
    tickLabels: classNames,
  });
  // tfvis.render.heatmap({ name: "Heatmap", tab: "Evaluation" }, {
  //   values: confusionMatrix,
  // });
  // tfvis.render.histogram({ name: "Histogram", tab: "Evaluation" }, {
  //   values: confusionMatrix,
  // });

  xs.dispose();
  l.dispose();

  return response;
});
guess.pending.watch((pending) => pending && setTraining(true));
guess.fail.watch((error) => {
  console.error("guess error", error);
})
guess.finally.watch(() => setTraining(false));

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

    // randomizeClickHandler();
    
    iteration = generateIteration(p);
    const iterationLayout = join(l, iterationToLayout(l, iteration));

    layout = iterationLayout;

    p.redraw();

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
    const classAccuracy = await tfvis.metrics.perClassAccuracy(labels, preds);
    const container = { name: "Accuracy", tab: "Evaluation" };
    tfvis.show.perClassAccuracy(container, classAccuracy, classNames);

    // confusion
    const confusionMatrix = await tfvis.metrics.confusionMatrix(labels, preds);
    // console.log("tfvis.show", tfvis.show)
    // console.log("tfvis.render", tfvis.render)
    // console.log("tfvis.metrics", tfvis.metrics)

    tfvis.render.confusionMatrix({ name: "Confusion Matrix", tab: "Evaluation" }, {
      values: confusionMatrix,
      tickLabels: classNames,
    });
    // tfvis.render.heatmap({ name: "Heatmap", tab: "Evaluation" }, {
    //   values: confusionMatrix,
    // });
    // tfvis.render.histogram({ name: "Histogram", tab: "Evaluation" }, {
    //   values: confusionMatrix,
    // });

    xs.dispose();
    ys.dispose();
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

// const test = async() => {
//   for(let i of trainData) {
//     const response = await guess(i[0]);
//     const argMax = await response.argMax(1).data();
//     const data = await response.data();
//
//     const fake = Array.from(data);
//     const realIndex = i[1];
//     const fakeIndex = Array.from(argMax)[0];
//
//     console.log(realIndex === fakeIndex, realIndex, fakeIndex, i[2], fake.map((i) => i.toFixed(2)));
//   }
// };

const TILE_SIZE = 12;

const sketch = (size) => (p) => {
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

        if(layout[i] === 2)
          dragging = layout[i] = 1;
        else if(layout[i] === 1)
          dragging = layout[i] = 2;
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

        if(layout[i] > 0)
          layout[i] = dragging;

        p.redraw();
      }
    }
  }
  p.draw = () => {
    // aligns to top left
    // p.translate(-W / 2, -H / 2, 0);

    for(let i in layout) {
      const { x, y, z } = fromIndex(size, i);

      const posX = x * TILE_SIZE;
      const posY = y * TILE_SIZE;
      const posZ = z * (size.y + 1) * TILE_SIZE;

      let c = 255;

      if(layout[i] === 2)
        c = 51;
      else if(layout[i] === 1)
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

const randomizeClickHandler = () => {
  const l = layout$.getState();

  const iteration = generateIteration(p);
  const iterationLayout = join(l, iterationToLayout(l, iteration));

  layout = iterationLayout;

  p.redraw();
};
const guessClickHandler = (form) => {
  const rank = +form.rank;
  guess({ number: layout.map((item) => Math.max(0, item - 1)), rank });
};
const findClickHandler = (form) => {
  const rank = +form.rank;
  find({ rank });
};

let p, layout;

export default () => {
  const size = useStore(size$);

  // const { errors, formState, handleSubmit, register } = useForm({
  //   mode: "onChange",
  // });

  const ref = useRef(null);

  useEffect(() => {
    if(ref.current === null)
      return;

    layout = layout$.getState();

    p = new p5(sketch(size), ref.current);
    p.redraw();

    return p.remove;
  }, [ ref.current ]);

  return (
    <div ref={ref} />
  );
};
