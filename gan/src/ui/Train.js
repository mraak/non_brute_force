import { combine, createEffect, createEvent, restore } from "effector";
import { useStore } from "effector-react";
import React from "react";
import * as tf from "@tensorflow/tfjs";

import { iterations$ } from "../store/iterations";
import { model$ } from "../store/model";
import { setPhase } from "../store/phase";
import { setProgress, progress$ } from "../store/progress";
import { size$ } from "../store/size";
import { setTraining, training$ } from "../store/training";

import { Button } from "./components";
import { find } from "./Generator";

const EPOCH_COUNT = 250;

let xs;
let ys;
combine(iterations$, size$, (iterations, size) => {
  if(iterations === null || size === null)
    return;

  // if(xs)
  //   xs.dispose();

  // if(ys)
  //   ys.dispose();

  const validIterations = iterations.filter((iteration) => iteration.trainable);

  const data = validIterations.map((iteration) => iteration.layout);
  xs = tf.tensor(data, [ data.length, size.x, size.y, size.z ], "int32");

  const output = validIterations.map((iteration) => iteration.output);
  ys = tf.tensor(output, [ data.length, 5 ], "int32");
});

function getAccumulator(accumulators, callback, metric) {
  if(accumulators[callback] == null) {
    accumulators[callback] = {};
  }
  if(accumulators[callback][metric] == null) {
    accumulators[callback][metric] = [];
  }
  return accumulators[callback][metric];
}

const setTrainStats = createEvent();
export const trainStats$ = restore(setTrainStats, null);

const train = createEffect();
train.use(async() => {
  setTimeout(() => setPhase(1), 0);
  setTimeout(() => setPhase(2), 10000);

  // await new Promise((resolve, reject) => setTimeout(resolve, 100));

  const model = model$.getState();

  // visualizeModel(model);

  // const callbacks = getFitCallbacks(parent);

  const metrics = [ "loss", "val_loss", "acc", "val_acc" ];
  const accumulators = {};
  const historyOpts = { xLabel: "Epoch" };
  // const drawArea = getDrawArea(container);
  const response = await model.fit(xs, ys, {
    epochs: EPOCH_COUNT,
    shuffle: true,
    // validationSplit: .1,
    callbacks: {
      // unblocks p5.draw
      // onBatchEnd: tf.nextFrame,
      onEpochEnd: async(...args) => {
        const [ i, log ] = args;

        const epoch = i + 1;

        // console.log(`epoch ${epoch}, loss ${log.loss}`);

        setProgress(epoch / EPOCH_COUNT);

        // return callbacks.onEpochEnd(...args);

        // -- inlined and modified callbacks.onEpochEnd

        const callbackName = "onEpochEnd";
  
        // Because of how the _ (iteration) numbers are given in the layers api
        // we have to store each metric for each callback in different arrays else
        // we cannot get accurate "global" batch numbers for onBatchEnd.
  
        // However at render time we want to be able to combine metrics for a
        // given callback. So here we make a nested list of metrics, the first
        // level are arrays for each callback, the second level contains arrays
        // (of logs) for each metric within that callback.
  
        const metricLogs = [];
        const presentMetrics = [];
        for(const metric of metrics) {
          // not all logs have all kinds of metrics.
          if(log[metric] != null) {
            presentMetrics.push(metric);
  
            const accumulator = getAccumulator(accumulators, callbackName, metric);
            accumulator.push({ [metric]: log[metric] });
            metricLogs.push(accumulator);
          }
        }
  
        // const subContainer = subSurface(drawArea, callbackName, { title: callbackName });
        // history(subContainer, metricLogs, presentMetrics, historyOpts);

        setTrainStats({ metricLogs, presentMetrics, historyOpts });

        await tf.nextFrame();
      },
    },
  });

  return response;
});
train.pending.watch((pending) => {
  pending && setTraining(true);
});
train.fail.watch((error) => {
  console.error("train error", error);
})
train.done.watch(() => {
  // setTraining(false);

  find({ rank: 0 });
});

export default () => {
  // const progress = useStore(progress$);
  const training = useStore(training$);

  return (
    <>
      <Button onClick={train}
              disabled={training}>{training ? "training ..." : "start new"}</Button>
      {/* <progress value={progress}>{Math.round(progress * 100)}%</progress> */}
    </>
  );
};
