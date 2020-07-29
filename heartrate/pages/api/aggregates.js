// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { loadAggregatesAsc } from "../../store-ios";

export default async(req, res) => {
  const data = await loadAggregatesAsc();

  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.statusCode = 200;
  res.json({ aggregates: data });
};
