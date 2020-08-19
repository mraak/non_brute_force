// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { loadPreviousIteration } from "../../store-web";

export default async(req, res) => {
  const data = await loadPreviousIteration();

  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.statusCode = 200;
  res.json(data);
};
