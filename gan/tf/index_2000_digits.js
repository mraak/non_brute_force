import * as tf from "@tensorflow/tfjs";

window.tf = tf;

const allNumbers = Array.from(Array(2000), (_, i) => i);
const testNumbers = [ 3, 12, 25, 40, 65, 77, 102, 154, 189, 205, 243, 560, 565, 589, 657, 780, 781, 999 ];
const trainNumbers = allNumbers.filter((number) => testNumbers.indexOf(number) < 0).filter((_, i) => i % 2 === 0);

const model = tf.sequential({
  layers: [
    // hidden
    tf.layers.dense({
      // batchInputShape: [ null, 7 ],
      batchInputShape: [ null, 1 ],
      units: 4000,
      activation: "sigmoid",
    }),
    // hidden
    // tf.layers.dense({
    //   units: 200,
    //   activation: "sigmoid",
    // }),
    // output
    tf.layers.dense({
      units: 20,
      activation: "sigmoid",
    }),
  ],
});
model.compile({
  loss: tf.losses.meanSquaredError,
  optimizer: tf.train.sgd(.1),
});

export const toDigits = (number) => number.toString(2).padStart(7, "0").split("").map(Number);;
export const toGroup = (number) => {
  const i = Math.floor(number / 100);

  return Array.from(Array(20), (_, j) => j === i ? 1 : 0);
};

console.log("train data");
for(let i of trainNumbers) {
  const group = toGroup(i);
  console.log(i, group.indexOf(1), group);
}
console.log("--------------------------------------------");

export const train = async() => {
  // tf.util.shuffle(trainNumbers);

  const xs = tf.tensor(trainNumbers, [ trainNumbers.length, 1 ], "int32");
  const ys = tf.tensor(trainNumbers.map((number) => toGroup(number)), [ trainNumbers.length, 20 ]); // , "int32");

  const response = await model.fit(xs, ys, {
    epochs: 100,
    shuffle: true,
  });

  xs.dispose();
  ys.dispose();

  return response;
};

export const guess = async(number) => {
  const xs = tf.tensor([ number ]);
  // const xs = tf.tensor([ toDigits(number) ]);
  const response = await model.predict(xs);

  xs.dispose();

  return response;
};

export const test = async() => {
  for(let i of testNumbers) {
    const response = await guess(i);
    const data = await response.data();

    const real = toGroup(i);
    const fake = Array.from(data);
    const realIndex = real.indexOf(1);
    const fakeIndex = fake.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);

    // console.log(i, "should be group", toGroup(i), response.toString());
    console.log(i, realIndex === fakeIndex, realIndex, fakeIndex, real, fake.map((i) => i.toFixed(2)));
  }
};
