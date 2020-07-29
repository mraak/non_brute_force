import { combine, createEffect, createEvent, restore } from "effector";

import { aggregates$ } from "./aggregates";
import { layout$ } from "./layout";

import { iterationToLayout, join } from "../utils";

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
    return NaN;

  return rates.reduce((memo, rate) => memo + rate, 0) / n;
};
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

// TODO: Fix me!
const extractBpms = (iteration, aggregate) => {
  let maja;
  let dog;

  if(aggregate !== undefined && "_id" in iteration) {
    const { devices } = aggregate;

    maja = devices["Maja’s iPhone"];
    dog = devices["Ada’s iPhone"];

    if(maja && dog) {
      maja = maja[Object.keys(maja)[0]].bpm;
      dog = dog[Object.keys(dog)[0]].bpm;
    } else if(maja) {
      const keys = Object.keys(maja);

      if(keys.length >= 2) {
        const s = maja;
        maja = s[keys[0]].bpm;
        dog = s[keys[1]].bpm;
      }
    } else if(dog) {
      const keys = Object.keys(dog);

      if(keys.length >= 2) {
        const s = dog;
        maja = s[keys[0]].bpm;
        dog = s[keys[1]].bpm;
      }
    }
  } else {
    maja = iteration.maja;
    dog = heartRateDog(iteration);
  }

  return [ maja, dog ];
};

export const setHardcodedIterations = createEvent();
export const hardcodedIterations$ = restore(setHardcodedIterations, null);

export const fetchIterations = createEffect();
fetchIterations.use(() => fetch("https://heartrate.miran248.now.sh/api/iterations"));

fetchIterations();

const fetchedIterations$ = restore(fetchIterations.done, null);

combine(layout$, hardcodedIterations$, fetchedIterations$, aggregates$, async(layout, hardcodedIterations, fetchedIterationsResponse, aggregates) => {
  if(layout === null || hardcodedIterations === null || fetchedIterationsResponse === null || aggregates === null)
    return;

  const { result } = fetchedIterationsResponse;
  const { iterations: fetchedIterations } = await result.json();
  
  const all = [
    ...hardcodedIterations,
    ...fetchedIterations.map((iteration) => ({
      ...iteration,
      valid: "valid" in iteration ? iteration.valid : true,
    })),
  ];

  all.sort((a, b) => a.timestamp - b.timestamp);

  let currentAggregate;
    
  const iterations = all.map(
    (iteration) => {
      const iterationLayout = iterationToLayout(layout, iteration.data);

      let aggregate;
      if(iteration.valid) {
        const nextAaggregate = aggregates.find(
          (aggregate) => +new Date(aggregate.start) >= iteration.timestamp
        );

        if(currentAggregate !== nextAaggregate) {
          aggregate = currentAggregate = nextAaggregate;
        }
      }
      // iteration.aggregate = aggregate;

      const [ maja, dog ] = extractBpms(iteration, aggregate);

      // const payload = {
      //   _id: iteration._id,
      //   title: iteration.title,
      //   data: iteration.data,
      //   expectedRank: iteration.expectedRank,
      //   timestamp: iteration.timestamp,
      //   iterationKey: iteration.iterationKey,
      //   // maja,
      //   // dog,
      //   aggregate: iteration.aggregate,
      // };

      // await fetch("https://heartrate.miran248.now.sh/api/iteration", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(payload),
      // });

      const actualRank = heartRateDeltaRank(Math.abs(maja - dog));
      const trainable = iteration.valid && isNaN(actualRank) === false;
      const output = trainable
        ? Array.from(Array(5), (_, i) => i === actualRank ? 1 : 0)
        : null;

      const result = {
        ...iteration,
        actualRank,
        combined: join(layout, iterationLayout),
        dog,
        layout: iterationLayout,
        maja,
        output,
        trainable,
      };

      // console.log(iteration, result)
      
      return result;
    }
  );

  iterations.sort((a, b) => b.timestamp - a.timestamp);

  setIterations(iterations);
});

const setIterations = createEvent();
export const iterations$ = restore(setIterations, null);
