// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { loadPayloadsAsc } from "../../store-ios";

export default async(req, res) => {
  const data = await loadPayloadsAsc();

  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.statusCode = 200;
  res.json({ payloads: data });
};
