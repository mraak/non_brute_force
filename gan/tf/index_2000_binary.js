import * as tf from "@tensorflow/tfjs";

window.tf = tf;

const allNumbers = Array.from(Array(2000), (_, i) => i);
const testNumbers = [ 3, 12, 25, 40, 65, 77, 102, 154, 189, 205, 243, 560, 565, 589, 657, 780, 781, 999 ];
const trainNumbers = allNumbers
// .filter((number) => testNumbers.indexOf(number) < 0)
// .filter((_, i) => i % 2 === 0);

const model = tf.sequential({
  layers: [
    // tf.layers.dense({
    //   batchInputShape: [ null, 11 ],
    //   units: 20,
    //   activation: "softmax",
    // }),
    // hidden
    tf.layers.dense({
      batchInputShape: [ null, 11 ],
      units: 1024,
      activation: "sigmoid",
    }),
    // output
    tf.layers.dense({
      units: 20,
      activation: "softmax",
    }),
  ],
});
model.compile({
  loss: tf.losses.softmaxCrossEntropy,
  optimizer: tf.train.sgd(.2),
});

export const toDigits = (number) => number.toString(2).padStart(11, "0").split("").map(Number);
export const toGroup = (number) => {
  const i = Math.floor(number / 100);

  return Array.from(Array(20), (_, j) => j === i ? 1 : 0);
};

// console.log("train data");
// for(let i of trainNumbers) {
//   const group = toGroup(i);
//   console.log(i, toDigits(i), group.indexOf(1), group);
// }
// console.log("--------------------------------------------");

export const train = async() => {
  // tf.util.shuffle(trainNumbers);

  const xs = tf.tensor2d(trainNumbers.map(toDigits), [ trainNumbers.length, 11 ], "int32");
  const ys = tf.oneHot(tf.tensor1d(trainNumbers.map((number) => floor(number / 100)), "int32"), 20);

  const response = await model.fit(xs, ys, {
    epochs: 10,
    shuffle: true,
    validationSplit: .1,
    callbacks: {
      // unblocks p5.draw
      // onBatchEnd: tf.nextFrame,
      onEpochEnd: (i, history) => {
        console.log(`epoch ${i}, loss ${history.loss}`);
      },
    }
  });

  xs.dispose();
  ys.dispose();

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
  for(let i of testNumbers) {
    const response = await guess(toDigits(i));
    const argMax = await response.argMax(1).data();
    const data = await response.data();

    const real = toGroup(i);
    const fake = Array.from(data);
    const realIndex = real.indexOf(1);
    // const fakeIndex = fake.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    const fakeIndex = Array.from(argMax)[0];

    // console.log(i, "should be group", toGroup(i), response.toString());
    console.log(i, toDigits(i), realIndex === fakeIndex, realIndex, fakeIndex, real, fake.map((i) => i.toFixed(2)));
  }
};
