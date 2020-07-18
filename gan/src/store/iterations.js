import { combine, createEvent, restore } from "effector";

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

  return 4; // [ 80, inf )
};

export const setRawIterations = createEvent();
export const rawIterations$ = restore(setRawIterations, null);

export const iterations$ = combine(layout$, rawIterations$, (layout, rawIterations) => {
  if(layout === null || rawIterations === null)
    return null;
    
  return rawIterations.map((iteration) => {
    const iterationLayout = iterationToLayout(layout, iteration.data);

    const maja = iteration.maja;
    const dog = heartRateDog(iteration);

    const actualRank = "actualRank" in iteration
      ? iteration.actualRank
      : heartRateDeltaRank(Math.abs(maja - dog));
    const trainable = isNaN(actualRank) === false;
    const output = trainable
      ? Array.from(Array(5), (_, i) => i === actualRank ? 1 : 0)
      : null;
    
    return {
      ...iteration,
      actualRank,
      combined: join(layout, iterationLayout),
      dog,
      layout: iterationLayout,
      maja,
      output,
      trainable,
    };
  });
});
