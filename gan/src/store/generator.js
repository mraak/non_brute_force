import { combine, createEffect, guard } from "effector";
import * as tf from "@tensorflow/tfjs";

import { admin$ } from "../store/admin";
import { ready$, saveIteration } from "../store/iterations";
import { layout$ } from "../store/layout";
import { model$ } from "../store/model";
import { remotePhase$, setPhase } from "../store/phases";
import { size$ } from "../store/size";
import { generateIteration, iterationToLayout, join } from "../utils";

import { savePhase2State } from "./phases";
import { trained$ } from "./train";

export const find = createEffect();
find.use(async() => {
  const size = size$.getState();
  const layout = layout$.getState();
  
  savePhase2State(null);

  await new Promise((resolve) => setTimeout(resolve, 500));

  const rank = 0;

  let response;
  let iteration;

  let attempts = 0;
  let currentRank = -1;

  do {
    ++attempts;

    iteration = generateIteration();
    const iterationLayout = join(layout, iterationToLayout(layout, iteration));

    const number = iterationLayout.map((item) => Math.max(0, item - 1));

    const xs = tf.tensor([ number ], [ 1, size.x, size.y, size.z ], "int32");
    // const xs = tf.tensor([ number ], [ 1, size.x, size.y, size.z ]);
    response = model$.getState().predict(xs);
    const preds = response.argMax(1);
    const argMax1 = await preds.data();
    // const data = await response.data();

    // const ys = tf.tensor([ ranks[rank] ], [ 1, 5 ]);
    // const labels = await ys.argMax(1);

    currentRank = argMax1[0];

    savePhase2State({
      attempts,
      currentRank,
      layout: iterationLayout,
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));

    // xs.dispose();
    // ys.dispose();
  } while(currentRank !== rank);

  const now = new Date;
  const timestamp = +now;

  await saveIteration({
    _id: `${timestamp}`,
    title: now.toISOString(),
    data: iteration,
    expectedRank: rank,
    attempts,
    timestamp,
  });

  return response;
});
find.fail.watch((error) => {
  console.error("find error", error);
})
find.done.watch(() => {
  setPhase(3);
});

const source$ = combine(
  admin$, ready$, remotePhase$,
  (admin, ready, phase) => admin && ready && phase === 2
);

guard({
  source: source$,
  filter: combine(
    source$, trained$, find.pending,
    (source, trained, pending) => source && trained && pending == false
  ),
  target: find,
});

guard({
  source: source$,
  filter: combine(
    source$, trained$,
    (source, trained) => source && trained === false
  ),
}).watch(() => {
  setPhase(1);
});
