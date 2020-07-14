// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { load } from "../../store-watch";

export default async(req, res) => {
  const data = await load();

  res.statusCode = 200;
  res.json({ beats: data });
};