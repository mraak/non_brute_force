import { combine, createEffect } from "effector";
import { useStore } from "effector-react";
import React from "react";
import * as tf from "@tensorflow/tfjs";

import { iterations$ } from "../store/iterations";
import { model$ } from "../store/model";
import { setPhase } from "../store/phase";
import { setProgress, progress$ } from "../store/progress";
import { size$ } from "../store/size";
import { setTraining, training$ } from "../store/training";
import {
  showExamples,
  showAccuracy,
  showConfusion,
  visualizeModel,
  getFitCallbacks,
} from "../tf/vis";

import { find } from "./Guess";

const EPOCH_COUNT = 250;

let xs;
let ys;
combine(iterations$, size$, (iterations, size) => {
  if(iterations === null || size === null)
    return;

  if(xs)
    xs.dispose();

  if(ys)
    ys.dispose();

  const validIterations = iterations.filter((iteration) => iteration.trainable);

  const data = validIterations.map((iteration) => iteration.layout);
  xs = tf.tensor(data, [ data.length, size.x, size.y, size.z ], "int32");

  const output = validIterations.map((iteration) => iteration.output);
  ys = tf.tensor(output, [ data.length, 5 ], "int32");
});

const train = createEffect();
train.use(async() => {
  // const element1 = document.getElementById("phase-1");
  setTimeout(() => {
    setPhase(1);
    // window.scrollTo({
    //   behavior: element1 ? "smooth" : "auto",
    //   top: element1 ? element1.offsetTop : 0,
    // });
  }, 100);
  // const element2 = document.getElementById("phase-2");
  setTimeout(() => {
    setPhase(2);
    // window.scrollTo({
    //   behavior: element2 ? "smooth" : "auto",
    //   top: element2 ? element2.offsetTop : 0,
    // });
  }, 10100);

  const model = model$.getState();

  visualizeModel(model);

  const callbacks = getFitCallbacks();

  const response = await model.fit(xs, ys, {
    epochs: EPOCH_COUNT,
    shuffle: true,
    // validationSplit: .1,
    callbacks: {
      // unblocks p5.draw
      // onBatchEnd: tf.nextFrame,
      onEpochEnd: (...args) => {
        const [ i, history ] = args;

        const epoch = i + 1;

        // console.log(`epoch ${epoch}, loss ${history.loss}`);

        setProgress(epoch / EPOCH_COUNT);

        return callbacks.onEpochEnd(...args);
      },
    },
  });

  return response;
});
train.pending.watch((pending) => pending && setTraining(true));
train.fail.watch((error) => {
  console.error("train error", error);
})
train.finally.watch(() => {
  setTraining(false);

  find({ rank: 0 });
});

export default () => {
  const progress = useStore(progress$);
  const training = useStore(training$);

  return (
    <div>
      <p>
        <button onClick={train}
                disabled={training}>{training ? "training ..." : "start new"}</button>
      </p>
      <progress value={progress}>{Math.round(progress * 100)}%</progress>
    </div>
  );
};
