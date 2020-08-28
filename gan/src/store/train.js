import { combine, createEffect, createStore, guard } from "effector";
import * as tf from "@tensorflow/tfjs";

import { admin$ } from "../store/admin";
import { iterations$, ready$ } from "../store/iterations";
import { model$ } from "../store/model";
import { remotePhase$, setPhase } from "../store/phases";
import { size$ } from "../store/size";

import { savePhase1State } from "./phases";

const EPOCH_COUNT = 250;

let xs;
let ys;
const train = createEffect();
train.use(async() => {
  const model = model$.getState();
  const iterations = iterations$.getState();
  const size = size$.getState();

  savePhase1State(null);

  if(xs)
    xs.dispose();

  if(ys)
    ys.dispose();
  
  // await new Promise((resolve) => setTimeout(resolve, 500));

  const validIterations = iterations.filter((iteration) => iteration.trainable);

  const data = validIterations.map((iteration) => iteration.layout);
  xs = tf.tensor(data, [ data.length, size.x, size.y, size.z ], "int32");

  const output = validIterations.map((iteration) => iteration.output);
  ys = tf.tensor(output, [ data.length, 5 ], "int32");

  // await new Promise((resolve) => setTimeout(resolve, 500));

  // const metrics = [ "loss", "val_loss", "acc", "val_acc" ];
  const metrics = [ "loss", "acc" ];
  const state = [];

  const response = await model.fit(xs, ys, {
    epochs: EPOCH_COUNT,
    shuffle: true,
    // validationSplit: .1,
    callbacks: {
      // unblocks p5.draw
      // onBatchEnd: tf.nextFrame,
      onEpochEnd: async(...args) => {
        const [ i, log ] = args;

        const entry = metrics.reduce((memo, key) => key in log ? ({
          ...memo,
          [ key ]: log[key],
        }) : memo, {});

        state.push(entry);

        savePhase1State([ ...state ]);

        await tf.nextFrame();
      },
    },
  });

  return response;
});
train.fail.watch((error) => {
  console.error("train error", error);
})
train.done.watch(() => {
  setPhase(2);
});
export const trained$ = createStore(false)
.on(train.done, (_, { result }) => !!result);

const source$ = combine(
  admin$, ready$, remotePhase$,
  (admin, ready, phase) => admin && ready && phase === 1
);

guard({
  source: source$,
  filter: combine(
    source$, train.pending,
    (source, pending) => source && pending == false
  ),
  target: train,
});
