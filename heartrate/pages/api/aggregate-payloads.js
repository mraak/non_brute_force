// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { lastSyncedAggregate, loadPayloadsSince, saveAggregate, saveLastSyncedAggregate } from "../../store-ios";

const toIterations = (payloads) => {
  let running = false;

  // groups all payloads into iterations
  const { iterations } = payloads.reduce((memo, payload) => {
    if(payload.type === "start") {
      running = true;

      if(memo.current === null) {
        const iteration = [ payload ];
        memo.iterations.push(iteration);
        memo.current = iteration;
      }

      return memo;
    } else if(payload.type === "stop") {
      running = false;

      if(memo.current !== null) {
        memo.current.push(payload);
        memo.current = null;
      }

      return memo;
    }

    if(running === false)
      return memo;
    
    // TODO: repeat previous payload if current has null data
    // const [ last ] = memo.current.slice(-1);

    if(payload.data !== null)
      memo.current.push(payload);

    return memo;
  }, { iterations: [], current: null });

  return iterations;
};
const toAggregate = (iteration) => iteration.reduce(
  (memo, payload) => {
    if(payload.type === "start") {
      memo._id = payload.date;
      memo.start = payload.date;
    } else if(payload.type === "stop") {
      memo.stop = payload.date;
    } else {
      const device = memo.devices[payload.deviceName] = memo.devices[payload.deviceName] || {};
      // processes every payload's entry
      payload.data.reduce(
        (memo, entry) => {
          const source = memo[entry.device] = memo[entry.device] || { bpms: [] };
          source.bpms.push(entry.bpm);
          return memo;
        },
        device
      );
    }
    return memo;
  },
  { start: null, stop: null, devices: {} }
);

const transformAggregate = (iteration) => ({
  ...iteration,
  // iterates through every device
  devices: Object.keys(iteration.devices).reduce(
    (memo, deviceKey) => {
      const device = iteration.devices[deviceKey];

      return {
        ...memo,
        // iterates through every source
        [deviceKey]: Object.keys(device).reduce(
          (memo, sourceKey) => {
            const source = device[sourceKey];

            return {
              ...memo,
              [sourceKey]: {
                bpms: source.bpms,
                // averages bpms
                bpm: source.bpms.reduce((memo, bpm) => memo + bpm, 0) / source.bpms.length,
              },
            };
          },
          {}
        ),
      };
    },
    {}
  ),
});
const aggregatePayloads = async(payloads) => {
  const iterations = toIterations(payloads);

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
};

export const syncAggregates = async() => {
  const [ point ] = await lastSyncedAggregate();
  console.log("lastSyncedAggregate", point);
  const payloads = await loadPayloadsSince(point
    ? point.date
    : "1970-01-01T00:00:00.000Z");
  console.log("payloads", payloads.length);

  return aggregatePayloads(payloads);
};

export default async(req, res) => {
  await syncAggregates();

  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.statusCode = 200;
  res.end();
};
