// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { loadPhase1State } from "../../store-web";

export default async(req, res) => {
  const data = await loadPhase1State();

  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.statusCode = 200;
  res.json(data);
};
