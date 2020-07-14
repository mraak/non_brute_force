// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { load, save } from "../../store-watch";

export default async({ body }, res) => {
  console.log(body);

  if(body) {
    const iso = (new Date).toISOString();

    await save({
      id: iso,
      device: `${body.device}`,
      iteration: `${body.iteration}`,
      timestamp: `${body.timestamp}`,
      bpm: `${body.bpm}`,
    });
  }

  // const response = await load();
  //
  // res.statusCode = 200;
  // res.json({ beats: response.Items });

  res.statusCode = 200;
  res.end();
};
