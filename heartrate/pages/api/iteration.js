// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { loadIteration, saveIteration } from "../../store-web";

import { syncIteration } from "./sync-iterations";

export default async({ body }, res) => {
  console.log(body);

  if(body) {
    let iteration = await loadIteration(body._id);
    iteration = await syncIteration({ ...(iteration || {}), ...body });
    await saveIteration(iteration);
  }

  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.statusCode = 200;
  res.end();
};
