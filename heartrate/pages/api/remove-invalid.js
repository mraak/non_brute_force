// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { removeInvalidIterations } from "../../store-web";

export default async(req, res) => {
  await removeInvalidIterations();

  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.statusCode = 200;
  res.end();
};
