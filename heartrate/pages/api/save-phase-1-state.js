// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { savePhase1State } from "../../store-web";

export default async({ body }, res) => {
  if(body !== undefined)
    await savePhase1State(body);

  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.statusCode = 200;
  res.end();
};
