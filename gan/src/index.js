import "regenerator-runtime/runtime";
import "@exampledev/new.css";

import React from "react";
import ReactDOM from "react-dom";

import "./store/entries";
import { rawIterations$, setRawIterations } from "./store/iterations";
import { setLayout } from "./store/layout";
import { setSize } from "./store/size";
import App from "./ui/App";

// import fours from "./data/fours";
// import ones from "./data/ones";
// import threes from "./data/threes";
// import twos from "./data/twos";
// import zeros from "./data/zeros";
// const props = {
//   iterations: [
//     ...zeros .map((item, i) => ({ title: `zeros ${i + 1}`,  data: item, output: [ 1, 0, 0, 0, 0 ] })),
//     ...ones  .map((item, i) => ({ title: `ones ${i + 1}`,   data: item, output: [ 0, 1, 0, 0, 0 ] })),
//     ...twos  .map((item, i) => ({ title: `twos ${i + 1}`,   data: item, output: [ 0, 0, 1, 0, 0 ] })),
//     ...threes.map((item, i) => ({ title: `threes ${i + 1}`, data: item, output: [ 0, 0, 0, 1, 0 ] })),
//     ...fours .map((item, i) => ({ title: `fours ${i + 1}`,  data: item, output: [ 0, 0, 0, 0, 1 ] })),
//   ],
//   layout: Array.from(Array(36), () => 1),
//   size: { x: 6, y: 6, z: 1 },
// };

import iterations from "./data/iterations";
import layout, { layoutSize } from "./data/layout";

const props = {
  iterations,
  layout,
  size: layoutSize,
};

setRawIterations(props.iterations);
setLayout(props.layout);
setSize(props.size);

fetch("https://heartrate.miran248.now.sh/api/iterations").then(
  (response) => response.json()
).then(
  (response) => {
    console.log("fetched iterations", response);

    setRawIterations([
      ...response.iterations,
      ...rawIterations$.getState(),
    ]);
  }
)

ReactDOM.render(
  <App />,
  document.getElementById("root")
);
