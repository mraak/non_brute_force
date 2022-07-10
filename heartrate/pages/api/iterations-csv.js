import { stringify } from "csv-stringify/lib/sync";

import { loadIterations } from "../../store-web";

export default async (req, res) => {
  const data = await loadIterations();

  const output = data
    .filter((item) => item.valid && item.trainable)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((item, e, items) => {
      let ma = 0;
      for (let s = Math.max(e - 3, 0); s <= e; ++s) {
        ma += items[s].actualRank;
      }
      ma /= Math.min(e + 1, 4);
      item.ma = ma;
      return item;
    })
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((item) => ({
      date: item.title.split("T")[0],
      "avg BPM animal": item.aggregate.animal.bpm.toFixed(2),
      "avg BPM human": item.aggregate.human.bpm.toFixed(2),
      "delta BPM": item.delta.toFixed(2),
      class: item.actualRank,
      "moving 4": item.ma.toFixed(2),
      start: item.aggregate.start,
      stop: item.aggregate.stop,
    }));

  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.statusCode = 200;
  res.send(
    stringify(output, { delimiter: ",", encoding: "utf8", header: true })
  );
};
