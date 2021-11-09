// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { lastSyncedAggregate, loadPayloadsSince, saveAggregate, saveLastSyncedAggregate } from "../../store-ios";

const toIterations = async(payloadsCursor) => {
  let running = false;

  // groups all payloads into iterations
  const memo = { iterations: [], current: null };
  while(true) {
    if(payloadsCursor.isClosed())
      break;
    
    const payload = await payloadsCursor.next();

    console.log("payload", payload);

    if(payload === null)
      break;

    if(payload.type === "start") {
      running = true;

      if(memo.current === null) {
        const iteration = [ payload ];
        memo.iterations.push(iteration);
        memo.current = iteration;
      }

      continue;
    } else if(payload.type === "stop") {
      running = false;

      if(memo.current !== null) {
        memo.current.push(payload);
        memo.current = null;
      }

      if(memo.iterations.length === 1)
        break;

      continue;
    }

    if(running === false)
      continue;
    
    // TODO: repeat previous payload if current has null data
    // const [ last ] = memo.current.slice(-1);

    if(payload.data !== null)
      memo.current.push(payload);
  }

  return memo.iterations;
};
const toAggregate = (iteration) => iteration.reduce(
  (memo, payload) => {
    if(payload.type === "start") {
      memo._id = payload.date;
      memo.start = payload.date;
    } else if(payload.type === "stop") {
      memo.stop = payload.date;
    } else {
      const deviceName = payload.deviceName === "Maja’s iPhone" ? "Maja’s iPhone" : "Ada’s iPhone";
      const device = memo.devices[deviceName] = memo.devices[deviceName] || {};
      // processes every payload's entry
      payload.data.reduce(
        (memo, entry) => {
          const source = memo[entry.device] = memo[entry.device] || { entries: [] };
          source.entries.push({ bpm: entry.bpm, date: entry.date });
          return memo;
        },
        device
      );
    }
    return memo;
  },
  { start: null, stop: null, devices: {} }
);

const transformAggregate = (aggregate) => {
  const { devices } = aggregate;

  let human, animal;

  human = devices["Maja’s iPhone"];
  animal = devices["Ada’s iPhone"];

  if(human && animal) {
    human = human[Object.keys(human)[0]];
    animal = animal[Object.keys(animal)[0]];
  } else if(human) {
    const keys = Object.keys(human);

    const s = human;
    human = s[keys[0]];

    if(keys.length >= 2) {
      human = s[keys[0]];
      animal = s[keys[1]];
    }
  } else if(animal) {
    const keys = Object.keys(animal);

    const s = animal;
    animal = s[keys[0]];

    if(keys.length >= 2) {
      human = s[keys[0]];
      animal = s[keys[1]];
    }
  }

  return {
    _id: aggregate._id,
    start: aggregate.start,
    stop: aggregate.stop,
    human: human ? aggregateEntries(aggregate, human.entries) : null,
    animal: animal ? aggregateEntries(aggregate, animal.entries) : null,
  };
};
const aggregateEntries = (aggregate, entries) => {
  entries = entries.filter((entry) => entry.date >= aggregate.start);
  
  return {
    entries,
    bpm: entries.reduce((memo, entry) => memo + entry.bpm, 0) / entries.length,
  };
};

const aggregatePayloads = async(payloadsCursor) => {
  while(true) {
    const iterations = await toIterations(payloadsCursor);

    if(iterations.length === 0)
      break;

    // processes every iteration
    for(let iteration of iterations) {
      let aggregate = toAggregate(iteration);

      // removes empty iterations
      if(Object.keys(aggregate.devices).length === 0)
        continue;

      aggregate = transformAggregate(aggregate);

      await saveAggregate(aggregate);
      await saveLastSyncedAggregate(aggregate.start);
    }
  }
};

export const syncAggregates = async() => {
  const point = await lastSyncedAggregate();
  console.log("lastSyncedAggregate", point);
  const payloadsCursor = await loadPayloadsSince(point
    ? point.date
    : "1970-01-01T00:00:00.000Z");

  return aggregatePayloads(payloadsCursor);
};

export default async(req, res) => {
  await syncAggregates();

  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.statusCode = 200;
  res.end();
};
