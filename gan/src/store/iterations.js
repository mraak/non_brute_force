import { combine, createEffect, createEvent, restore } from "effector";

import { layout$ } from "./layout";

import { iterationToLayout, join } from "../utils";
import { training$ } from "./training";

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
export const hardcodedIterations$ = restore(setHardcodedIterations, null);

// current iteration
const setFetchedCurrentIteration = createEvent();
export const fetchedCurrentIteration$ = restore(setFetchedCurrentIteration, null);

let currentIterationTimeout = 0;
export const fetchCurrentIteration = createEffect();
fetchCurrentIteration.use(() => {
  clearTimeout(currentIterationTimeout);

  return fetch("https://heartrate.miran248.now.sh/api/current-iteration").then(
    (response) => response.json()
  );
});
fetchCurrentIteration.done.watch(({ params, result }) => {
  setFetchedCurrentIteration(result);
});
fetchCurrentIteration.finally.watch(() => {
  if(training$.getState() === false)
    currentIterationTimeout = setTimeout(() => fetchCurrentIteration(), 30000);
});

fetchCurrentIteration();

combine(layout$, fetchedCurrentIteration$, (layout, fetchedCurrentIteration) => {
  if(layout === null || fetchedCurrentIteration === null)
    return;

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

  setCurrentIteration(iteration);
});

const setCurrentIteration = createEvent();
export const currentIteration$ = restore(setCurrentIteration, null);

// previous iteration
export const setFetchedPreviousIteration = createEvent();
export const fetchedPreviousIteration$ = restore(setFetchedPreviousIteration, null);

let previousIterationTimeout = 0;
const fetchPreviousIteration = createEffect();
fetchPreviousIteration.use(() => {
  clearTimeout(previousIterationTimeout);

  return fetch("https://heartrate.miran248.now.sh/api/previous-iteration").then(
    (response) => response.json()
  );
});
fetchPreviousIteration.done.watch(({ params, result }) => {
  setFetchedPreviousIteration(result);
});
fetchPreviousIteration.finally.watch(() => {
  if(training$.getState() === false)
    previousIterationTimeout = setTimeout(() => fetchPreviousIteration(), 30000);
});

fetchPreviousIteration();

combine(layout$, fetchedPreviousIteration$, (layout, fetchedPreviousIteration) => {
  if(layout === null || fetchedPreviousIteration === null)
    return;

  const iterationLayout = iterationToLayout(layout, fetchedPreviousIteration.data);
  
  const { aggregate } = fetchedPreviousIteration;
  const { human, animal } = aggregate || { human: null, animal: null };

  const iteration = {
    ...fetchedPreviousIteration,
    animal,
    combined: join(layout, iterationLayout),
    human,
    layout: iterationLayout,
  };

  setPreviousIteration(iteration);
});

const setPreviousIteration = createEvent();
export const previousIteration$ = restore(setPreviousIteration, null);

// iterations
const setFetchedIterations = createEvent();
export const fetchedIterations$ = restore(setFetchedIterations, null);

let iterationTimeout = 0;
const fetchIterations = createEffect();
fetchIterations.use(() => {
  clearTimeout(iterationTimeout);

  return fetch("https://heartrate.miran248.now.sh/api/iterations").then(
    (response) => response.json()
  );
});
fetchIterations.done.watch(({ params, result }) => {
  setFetchedIterations(result);
});
fetchIterations.finally.watch(() => {
  if(training$.getState() === false)
    iterationTimeout = setTimeout(() => fetchIterations(), 30000);
});

fetchIterations();

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
combine(layout$, hardcodedIterations$, fetchedIterations$, (layout, hardcodedIterations, fetchedIterations) => {
  if(layout === null || hardcodedIterations === null || fetchedIterations === null)
    return;

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

  setIterations(iterations);
});

const setIterations = createEvent();
export const iterations$ = restore(setIterations, null);

const clear = () => {
  clearTimeout(currentIterationTimeout);
  clearTimeout(previousIterationTimeout);
  clearTimeout(iterationTimeout);
};

training$.watch((training) => {
  if(training)
    clear();
});

export const refresh = () => {
  fetchCurrentIteration();
  fetchPreviousIteration();
  fetchIterations();
};
