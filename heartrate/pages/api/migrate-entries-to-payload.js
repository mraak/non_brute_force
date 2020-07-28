// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { loadEntriesAsc, savePayload } from "../../store-ios";

export default async(req, res) => {
  const entries = await loadEntriesAsc();

  let running = false;

  const payloads = entries.reduce((memo, entry) => {
    const date = new Date(entry.timestamp * 1000).toISOString();

    if(entry.type === "start") {
      running = true;

      memo[date] = {
        _id: date,
        date,
        data: null,
        deviceName: entry.device,
        type: "start",
      };

      return memo;
    } else if(entry.type === "end") {
      running = false;

      memo[date] = {
        _id: date,
        date,
        data: null,
        deviceName: entry.device,
        type: "stop",
      };

      return memo;
    }

    if(running === false)
      return memo;

    const groupKey = new Date(Math.floor(entry.timestamp / 30) * 30).toISOString();

    const payload = memo[groupKey] = memo[groupKey] || {
      data: [],
      type: "entry",
    };
    payload._id = date;
    payload.date = date;

    if(entry.device)
      payload.deviceName = entry.name;

    payload.data.push({
      date,
      device: entry.device,
      bpm: entry.bpm,
    });

    return memo;
  }, {});

  for(let payload of Object.values(payloads)) {
    await savePayload(payload);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.statusCode = 200;
  res.json({ payloads });
};
