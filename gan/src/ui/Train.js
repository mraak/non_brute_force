import { combine, createEffect } from "effector";
import { useStore } from "effector-react";
import React from "react";
import * as tf from "@tensorflow/tfjs";

import { rawIterations$ } from "../store/iterations";
import { model$ } from "../store/model";
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
import { join } from "../utils";

const EPOCH_COUNT = 50;

let xs;
let ys;
combine(rawIterations$, size$, (iterations, size) => {
  if(iterations === null || size === null)
    return;

  if(xs)
    xs.dispose();

  if(ys)
    ys.dispose();

  const data = iterations.map((iteration) => iteration.data);
  xs = tf.tensor(data, [ data.length, size.x, size.y, size.z ], "int32");

  const output = iterations.map((iteration) => iteration.output);
  ys = tf.tensor(output, [ data.length, 5 ], "int32");
});

const train = createEffect();
train.use(async() => {
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
train.finally.watch(() => setTraining(false));

export default () => {
  const progress = useStore(progress$);
  const training = useStore(training$);

  return (
    <div>
      <p>
        <button onClick={train}
                disabled={training}>{training ? "training ..." : "train"}</button>
      </p>
      <progress value={progress}>{Math.round(progress * 100)}%</progress>
    </div>
  );
};
