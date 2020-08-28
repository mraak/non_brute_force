// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { saveCurrentPhase } from "../../store-web";

export default async({ body }, res) => {
  if(body)
    await saveCurrentPhase(body);

  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.statusCode = 200;
  res.end();
};
