import * as tf from "@tensorflow/tfjs";

window.tf = tf;

const optimizer = tf.train.sgd(.5);

const model = tf.sequential({
  layers: [
    // hidden
    tf.layers.dense({
      // batchInputShape: [ null, 7 ],
      batchInputShape: [ null, 1 ],
      units: 100,
      activation: "sigmoid",
    }),
    // output
    tf.layers.dense({
      units: 5,
      activation: "sigmoid",
    }),
  ],
});
model.compile({
  loss: tf.losses.meanSquaredError,
  optimizer,
});

export const toDigits = (number) => number.toString(2).padStart(7, "0").split("").map(Number);;
export const toGroup = (number) => {
  const i = floor(number / 20);

  return Array.from(Array(5), (_, j) => j === i ? 1 : 0);
};

function generateDigits() {
  const number = floor(random(0, 100));
  const digits = toDigits(number);
  const group = toGroup(number);

  // return { digits, group };
  return { digits: number, group };
}

export const train = async() => {
  // const digits = generateDigits();
  const batch = Array.from(Array(1000), generateDigits);

  console.log(batch);

  const xs = tf.tensor(batch.map((batch) => batch.digits), [ 1000, 1 ], "int32");
  const ys = tf.tensor(batch.map((batch) => batch.group), [ 1000, 5 ]); // , "int32");

  const response = await model.fit(xs, ys, {
    epochs: 10,
  });

  return response;
};

export const guess = async(number) => {
  const xs = tf.tensor([ number ]);
  // const xs = tf.tensor([ toDigits(number) ]);
  return model.predict(xs);
};


// import { combine } from "effector";

// import { map, size } from "../store";

// import trainBatch, { seed, guess, BATCH, SEED_SIZE } from "./gan";

// export const train = async() => {
//   const shape = [ BATCH, SEED_SIZE ];

//   const batch = Array.from(Array(BATCH), generateDigits);
//   const real = tf.tensor(batch, shape);
//   // const real = tf.data.array(batch);
//   // console.log(real);
//   // return;

//   for(let i = 0; i < 100; ++i) {
//     const fake = seed(shape);

//     // const result = await fake.array();
//     // console.log(result);
//     // return;

//     const [ dcost, gcost ] = await trainBatch(real, fake);

//     // if (i % 50 === 0 || i === (num-1)) {
//       console.log('i', i);
//       console.log('discriminator cost', dcost.dataSync());
//       console.log('generator cost', gcost.dataSync());
//     // }

//   }

//   const result = await guess();

//   console.log(result);
// };

// // combine(size, map, ({ x, y, z }, map) => {
// //   if(!map)
// //     return;

// //   var t = tf.tensor(map, [ z, y, x ], "int32");
// //   console.log("arraySync", t.arraySync());

// //   t.dispose();
// // });