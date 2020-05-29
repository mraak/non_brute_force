import * as tf from "@tensorflow/tfjs";

import fours from "../data/fours";
import ones from "../data/ones";
import threes from "../data/threes";
import twos from "../data/twos";
import zeros from "../data/zeros";

const trainData = [
  ...zeros .map((item) => [ item, 0, [ 1, 0, 0, 0, 0 ] ]),
  ...ones  .map((item) => [ item, 1, [ 0, 1, 0, 0, 0 ] ]),
  ...twos  .map((item) => [ item, 2, [ 0, 0, 1, 0, 0 ] ]),
  ...threes.map((item) => [ item, 3, [ 0, 0, 0, 1, 0 ] ]),
  ...fours .map((item) => [ item, 4, [ 0, 0, 0, 0, 1 ] ]),
];

window.tf = tf;

const model = tf.sequential({
  layers: [
    tf.layers.dense({
      batchInputShape: [ null, 36 ],
      units: 5,
      activation: "softmax",
    }),
    // hidden
    // tf.layers.dense({
    //   batchInputShape: [ null, 36 ],
    //   units: 1024,
    //   activation: "sigmoid",
    // }),
    // // output
    // tf.layers.dense({
    //   units: 2,
    //   activation: "softmax",
    // }),
  ],
});
model.compile({
  loss: tf.losses.softmaxCrossEntropy,
  optimizer: tf.train.sgd(.2),
});

const xs = tf.tensor2d(trainData.map((item) => item[0]), [ trainData.length, 36 ], "int32");
// const ys = tf.oneHot(tf.tensor1d(trainData.map((item) => item[1]), "int32"), 5);
const ys = tf.tensor2d(trainData.map((item) => item[2]), [ trainData.length, 5 ], "int32");
export const train = async() => {
  const response = await model.fit(xs, ys, {
    epochs: 50,
    shuffle: true,
    // validationSplit: .1,
    callbacks: {
      // unblocks p5.draw
      // onBatchEnd: tf.nextFrame,
      onEpochEnd: (i, history) => {
        console.log(`epoch ${i}, loss ${history.loss}`);
      },
    }
  });

  // xs.dispose();
  // ys.dispose();

  return response;
};

export const guess = async(number) => {
  const xs = tf.tensor([ number ]);
  // const xs = tf.tensor([ toDigits(number) ]);
  const response = model.predict(xs);

  xs.dispose();

  return response;
};

export const test = async() => {
  for(let i of trainData) {
    const response = await guess(i[0]);
    const argMax = await response.argMax(1).data();
    const data = await response.data();

    const fake = Array.from(data);
    const realIndex = i[1];
    const fakeIndex = Array.from(argMax)[0];

    console.log(realIndex === fakeIndex, realIndex, fakeIndex, i[2], fake.map((i) => i.toFixed(2)));
  }
};
