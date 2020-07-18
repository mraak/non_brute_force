// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { payload } from "../../store-ios";

export default async({ body }, res) => {
  console.log(body);

  if(body) {
    await payload({
      ...body,
      _id: `${body.date}`,
    });
  }

  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.statusCode = 200;
  res.end();
};
