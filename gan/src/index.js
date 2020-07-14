import "regenerator-runtime/runtime";
import "@exampledev/new.css";

import React from "react";
import ReactDOM from "react-dom";

import { entriesFx } from "./store/entries";
import { setRawIterations } from "./store/iterations";
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
import { iterationToLayout } from "./utils";
const classifyHumanHeartRate = (rate) => {
  if(rate < 60)
    return [ 1, 0, 0, 0, 0 ]; // [ 0, 60 )

  if(rate < 80)
    return [ 0, 1, 0, 0, 0 ]; // [ 60, 80 )

  if(rate < 100)
    return [ 0, 0, 1, 0, 0 ]; // [ 80, 100 )

  if(rate < 120)
    return [ 0, 0, 0, 1, 0 ]; // [ 100, 120 )

  return [ 0, 0, 0, 0, 1 ]; // [ 120, inf )
};
const classifyDogHeartRate = (iteration) => {
  const rates = [];

  if("george" in iteration)
    rates.push(iteration.george);
  if("boogie" in iteration)
    rates.push(iteration.boogie);
  if("mala" in iteration)
    rates.push(iteration.mala);
  if("ada" in iteration)
    rates.push(iteration.ada);

  const rate = rates.reduce((memo, rate) => memo + rate, 0) / rates.length;

  if(rate < 60)
    return [ 1, 0, 0, 0, 0 ]; // [ 0, 60 )

  if(rate < 80)
    return [ 0, 1, 0, 0, 0 ]; // [ 60, 80 )

  if(rate < 100)
    return [ 0, 0, 1, 0, 0 ]; // [ 80, 100 )

  if(rate < 120)
    return [ 0, 0, 0, 1, 0 ]; // [ 100, 120 )

  return [ 0, 0, 0, 0, 1 ]; // [ 120, inf )
};
const classifyDeltaHeartRate = (rate) => {
  if(rate < 20)
    return [ 1, 0, 0, 0, 0 ]; // [ 0, 20 )

  if(rate < 40)
    return [ 0, 1, 0, 0, 0 ]; // [ 20, 40 )

  if(rate < 60)
    return [ 0, 0, 1, 0, 0 ]; // [ 40, 60 )

  if(rate < 80)
    return [ 0, 0, 0, 1, 0 ]; // [ 60, 80 )

  return [ 0, 0, 0, 0, 1 ]; // [ 80, inf )
};
const props = {
  iterations: iterations.map((iteration) => ({
    ...iteration,
    data: iterationToLayout(layout, iteration.data),
    majaOutput: classifyHumanHeartRate(iteration.maja),
    dogOutput: classifyDogHeartRate(iteration),
    output: classifyDeltaHeartRate(Math.abs(classifyHumanHeartRate(iteration.maja) - classifyDogHeartRate(iteration))),
  })),
  layout,
  size: layoutSize,
};

setRawIterations(props.iterations);
setLayout(props.layout);
setSize(props.size);

ReactDOM.render(
  <App />,
  document.getElementById("root")
);
