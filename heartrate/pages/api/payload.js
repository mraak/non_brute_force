// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { savePayload, lastAggregate, loadPayloadsSince } from "../../store-ios";

import { aggregatePayloads, saveAggregates } from "./aggregate-payloads";

export default async({ body }, res) => {
  console.log(body);

  if(body) {
    await savePayload({
      ...body,
      _id: `${body.date}`,
    });

    await updateAggregates();
  }

  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.statusCode = 200;
  res.end();
};

const updateAggregates = async() => {
  const [ aggregate ] = await lastAggregate();
  console.log("lastAggregate", aggregate);
  const payloads = await loadPayloadsSince(aggregate.start);
  // console.log("payloads", payloads);

  const aggregates = aggregatePayloads(payloads);
  // console.log("aggregates", aggregates);

  await saveAggregates(aggregates);
};
