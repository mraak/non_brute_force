import { createEffect, createEvent, restore } from "effector";

const setAggregates = createEvent();
export const aggregates$ = restore(setAggregates, null);

const fetchAggregates = createEffect();
fetchAggregates.use(() => fetch("https://heartrate.miran248.now.sh/api/aggregates"));
fetchAggregates.done.watch(async({ params, result }) => {
  const { aggregates } = await result.json();

  setAggregates(aggregates);

  // setTimeout(() => fetchAggregates(), 60000);
});

fetchAggregates();
