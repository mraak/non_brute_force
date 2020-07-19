import { format } from "date-fns";
import { createEffect, createEvent, restore } from "effector";

const setEntries = createEvent();
export const entries$ = restore(setEntries, null);

export const fetchEntries = createEffect();
fetchEntries.use(() => fetch("https://heartrate.miran248.now.sh/api/entries"));
fetchEntries.done.watch(async({ params, result }) => {
  const { entries } = await result.json();

  const sorted = entries.sort((a, b) => a.timestamp - b.timestamp);

  let iterationTimestamp = 0;

  const iterations = {};

  for(let entry of sorted) {
    entry.date = format(entry.timestamp * 1000, "yyyy-MM-dd HH:mm:ss");

    if(entry.type === "start")
      iterationTimestamp = entry.timestamp;
    // else if(entry.type === "end")
    //   iterationTimestamp = 0;
    else if(entry.type === "entry") {
      const deviceName = entry.name || "unknown";
      const iteration = iterations[iterationTimestamp] = iterations[iterationTimestamp] || {};
      const device = iteration[deviceName] = iteration[deviceName] || { entries: [], avg: 0 };
      device.entries.push(entry);
    }
  }

  for(let iterationKey in iterations) {
    const iteration = iterations[iterationKey];

    for(let deviceKey in iteration) {
      const device = iteration[deviceKey];
      device.avg = Math.round(device.entries.reduce((memo, entry) => memo + entry.bpm, 0) / device.entries.length);
    }
  }

  // console.log("entries", entries);
  console.log("entries", iterations);

  const iterationKeys = Object.keys(iterations).sort((a, b) => b - a);
  iterations.current = iterationKeys[0];

  setEntries(iterations);

  setTimeout(() => fetchEntries(), 60000);
});

// fetchEntries();
