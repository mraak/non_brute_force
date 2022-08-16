import { Readable } from "stream";
import { utils, write } from "xlsx";

import { loadIterations } from "../../store-web";

const bufferToStream = (buffer) => {
  let stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

const measureColumns = (columns, data) =>
  columns.map((column, i) => {
    let w = column.length;
    for (const row of data) {
      w = Math.max(w, row[column].toString().length);
    }
    return { width: w + 10 };
  });

export default async (req, res) => {
  const data = await loadIterations();

  const sorted = data
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
    .sort((a, b) => b.timestamp - a.timestamp);

  const output = sorted.map((item) => ({
    date: item.title.split("T")[0],
    "avg BPM animal": item.aggregate.animal.bpm.toFixed(2),
    "avg BPM human": item.aggregate.human.bpm.toFixed(2),
    "delta BPM": item.delta.toFixed(2),
    class: item.actualRank,
    "moving 4": item.ma.toFixed(2),
    // start: item.aggregate.start,
    // stop: item.aggregate.stop,
  }));

  const columns = [
    "date",
    "avg BPM animal",
    "avg BPM human",
    "delta BPM",
    "class",
    "moving 4",
  ];

  const worksheet = utils.json_to_sheet(output, {
    header: columns,
  });
  worksheet["!cols"] = measureColumns(columns, output);

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const buffer = write(workbook, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Length", Buffer.byteLength(buffer, "utf8"));
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${sorted[0].title}.xlsx`
  );
  res.status(200);
  bufferToStream(buffer).pipe(res);
};
