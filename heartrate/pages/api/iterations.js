// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { loadIterations } from "../../store-web";

export default async(req, res) => {
  const data = await loadIterations();

  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.statusCode = 200;
  res.json(data);
};
