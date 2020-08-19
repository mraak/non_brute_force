// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import processIteration from "../../processIteration";
import { loadAggregate } from "../../store-ios";
import { lastSyncedIteration, loadIterationsSince, saveIteration, saveLastSyncedIteration } from "../../store-web";

export const syncIteration = async(iteration) => {
  const aggregate = await loadAggregate({
    start: { $gte: (new Date(iteration.timestamp)).toISOString() },
  });

  return processIteration(iteration, aggregate);
};

const processIterations = async(iterationsCursor) => {
  // processes every iteration
  while(true) {
    let iteration = await iterationsCursor.next();

    if(iteration === null)
      break;

    iteration = await syncIteration(iteration);
    await saveIteration(iteration);
    await saveLastSyncedIteration(iteration.timestamp);
  }
};

export const syncIterations = async() => {
  const point = await lastSyncedIteration();
  console.log("lastSyncedIteration", point);
  const iterationsCursor = await loadIterationsSince(point
    ? point.date
    : 0);

  return processIterations(iterationsCursor);
};

export default async(req, res) => {
  await syncIterations();

  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.statusCode = 200;
  res.end();
};
