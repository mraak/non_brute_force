import { combine } from "effector";

import { iterationIndex$ } from "./iterationIndex";
import { iterations$ } from "./iterations";

export const iteration$ = combine(iterationIndex$, iterations$, (iterationIndex, iterations) => {
  if(iterationIndex < 0 || iterations === null)
    return null;

  // return iterations[iterationIndex];
  return iterations.filter(
    (iteration) => iteration.valid
  )[iterationIndex] || null;
});

export const previousIteration$ = combine(iterationIndex$, iterations$, (iterationIndex, iterations) => {
  if(iterationIndex < 0 || iterations === null)
    return null;

  // return iterations[iterationIndex];
  return iterations.filter(
    (iteration) => iteration.valid
  )[iterationIndex + 1] || null;
});
