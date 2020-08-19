// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { savePayload } from "../../store-ios";

import { syncAggregates } from "./aggregate-payloads";
import { syncIterations } from "./sync-iterations";

export default async({ body }, res) => {
  console.log(body);

  if(body) {
    await savePayload({
      ...body,
      _id: `${body.date}`,
    });

    await syncAggregates();
    await syncIterations();
  }

  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.statusCode = 200;
  res.end();
};
