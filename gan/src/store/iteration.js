import { combine } from "effector";

import { entries$ } from "./entries";
import { iterationIndex$ } from "./iterationIndex";
import { iterations$, rawIterations$, setRawIterations } from "./iterations";

export const iteration$ = combine(iterationIndex$, iterations$, (iterationIndex, iterations) => {
  if(iterationIndex < 0 || iterations === null)
    return null;

  return iterations[iterationIndex];
});

combine(iteration$, entries$, async(iteration, entries) => {
  if(iteration === null || entries === null)
    return;

  if(("_id" in iteration) === false)
    return;

  const group = entries[entries.current];
  const keys = Object.keys(group);
    
    // TODO: Simplify
  const maja = group[keys[0]].avg;
  const dog = keys[1] ? group[keys[1]].avg : 0;

  if(iteration.trainable && maja === iteration.maja && dog === iteration.dog)
    return;

  const payload = {
    _id: iteration._id,
    title: iteration.title,
    data: iteration.data,
    expectedRank: iteration.expectedRank,
    timestamp: iteration.timestamp,
    iterationKey: iteration.iterationKey,
    maja,
    dog,
  };

  console.log(iteration, payload);

  await fetch("https://heartrate.miran248.now.sh/api/iteration", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  setRawIterations([
    ...rawIterations$.getState().map(
      (iteration) => iteration._id === payload._id ? payload : iteration
    ),
  ]);
});
