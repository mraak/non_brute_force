import { combine, createEffect, createStore, createEvent, guard, restore, sample } from "effector";

import { iterationToLayout, join } from "../utils";

import { admin$ } from "./admin";
import { layout$ } from "./layout";
import { setPhase } from "./phases";
import { remotePhase$, } from "./phases";

const heartRateDog = (iteration) => {
  const rates = [];

  if("dog" in iteration)
    rates.push(iteration.dog);
  if("george" in iteration)
    rates.push(iteration.george);
  if("boogie" in iteration)
    rates.push(iteration.boogie);
  if("mala" in iteration)
    rates.push(iteration.mala);
  if("ada" in iteration)
    rates.push(iteration.ada);

  const n = rates.length;

  if(n === 0)
    return null;

  return { bpm: rates.reduce((memo, rate) => memo + rate, 0) / n, entries: [] };
};

export const setHardcodedIterations = createEvent();
const hardcodedIterations$ = restore(setHardcodedIterations, null);

// current iteration
let currentIterationTimeout = 0;
const fetchCurrentIteration = createEvent();
const fetchCurrentIterationFx = createEffect();
fetchCurrentIterationFx.use(() => {
  clearTimeout(currentIterationTimeout);

  return fetch("https://heartrate.miran248.now.sh/api/current-iteration").then(
    (response) => response.json()
  );
});
fetchCurrentIterationFx.finally.watch(() => {
  currentIterationTimeout = setTimeout(() => fetchCurrentIteration(), 1000);
});
const fetchedCurrentIteration$ = createStore(null)
.on(fetchCurrentIterationFx.done, (_, { result }) => result);

export const currentIteration$ = combine(layout$, fetchedCurrentIteration$, (layout, fetchedCurrentIteration) => {
  if(layout === null || fetchedCurrentIteration === null)
    return null;

  const iterationLayout = iterationToLayout(layout, fetchedCurrentIteration.data);

  const { aggregate } = fetchedCurrentIteration;
  const { human, animal } = aggregate || { human: null, animal: null };

  const iteration = {
    ...fetchedCurrentIteration,
    animal,
    combined: join(layout, iterationLayout),
    human,
    layout: iterationLayout,
  };

  if(admin$.getState() && remotePhase$.getState() > 2)
    setPhase(human !== null || animal !== null ? 4 : 3);

  return iteration;
});

// iterations
export const saveIteration = createEffect();
saveIteration.use((payload) => {
  console.log("saveIteration", payload);

  return fetch("https://heartrate.miran248.now.sh/api/iteration", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
});
saveIteration.done.watch(() => {
  fetchCurrentIteration();
  fetchIterations();
});

let iterationTimeout = 0;
const fetchIterations = createEvent();
const fetchIterationsFx = createEffect();
fetchIterationsFx.use(() => {
  clearTimeout(iterationTimeout);

  return fetch("https://heartrate.miran248.now.sh/api/iterations").then(
    (response) => response.json()
  );
});
fetchIterationsFx.finally.watch(() => {
  iterationTimeout = setTimeout(() => fetchIterations(), 30000);
});
const fetchedIterations$ = createStore(null)
.on(fetchIterationsFx.done, (_, { result }) => result);

// TODO: Move to utils
const heartRateDeltaRank = (rate) => {
  if(rate < 5)
    return 0; // [ 0, 5 )

  if(rate < 10)
    return 1; // [ 5, 10 )

  if(rate < 20)
    return 2; // [ 10, 20 )

  if(rate < 40)
    return 3; // [ 20, 40 )

  return 4; // [ 40, inf )
};
export const iterations$ = combine(layout$, hardcodedIterations$, fetchedIterations$, (layout, hardcodedIterations, fetchedIterations) => {
  if(layout === null || hardcodedIterations === null || fetchedIterations === null)
    return null;

  const all = [
    ...hardcodedIterations,
    ...fetchedIterations,
  ];

  all.sort((a, b) => a.timestamp - b.timestamp);

  const iterations = all.map(
    (iteration) => {
      const iterationLayout = iterationToLayout(layout, iteration.data);

      const { aggregate = null } = iteration;
      let { human, animal } = aggregate || { human: null, animal: null };

      if("_id" in iteration) {
        human = { entries: [], ...(human || {}) };
        animal = { entries: [], ...(animal || {}) };

        return {
          ...iteration,
          animal,
          combined: join(layout, iterationLayout),
          human,
          layout: iterationLayout,
        };
      }

      if("maja" in iteration)
        human = { bpm: iteration.maja, entries: [] };
  
      animal = heartRateDog(iteration);

      const valid = "valid" in iteration ? iteration.valid : true;

      const delta = human !== null && animal !== null ? Math.abs(human.bpm - animal.bpm) : null;
      const actualRank = Number.isFinite(delta) ? heartRateDeltaRank(delta) : null;
      const trainable = valid && Number.isFinite(actualRank);
      const output = trainable
        ? Array.from(Array(5), (_, i) => i === actualRank ? 1 : 0)
        : null;
    
      return {
        ...iteration,
        animal,
        combined: join(layout, iterationLayout),
        human,
        layout: iterationLayout,

        actualRank,
        aggregate,
        delta,
        ended: aggregate !== null && !!aggregate.stop,
        output,
        trainable,
        valid,
      };
    }
  );

  iterations.sort((a, b) => b.timestamp - a.timestamp);

  return iterations;
});

export const ready$ = iterations$.map((iterations) => iterations !== null);

// kickoff
guard({
  source: sample(remotePhase$, fetchCurrentIteration),
  filter: combine(
    ready$, remotePhase$, fetchCurrentIterationFx.pending,
    (ready, phase, pending) => (ready === false || phase > 2) && pending === false
  ),
  target: fetchCurrentIterationFx,
});

guard({
  source: sample(remotePhase$, fetchIterations),
  filter: combine(
    ready$, remotePhase$, fetchIterationsFx.pending,
    (ready, phase, pending) => (ready === false || phase > 2) && pending === false
  ),
  target: fetchIterationsFx,
});

remotePhase$.watch(() => {
  fetchCurrentIteration();
});

combine(ready$, remotePhase$, () => {
  fetchIterations();
});
