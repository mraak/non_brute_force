// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { load, sync } from "../../store-ios";

export default async({ body }, res) => {
  console.log(body);

  if(body) {
    await sync(body.map((item) => ({
      ...item,
      _id: `${item.timestamp}`,
    })));
  }

  res.statusCode = 200;
  res.end();
};
