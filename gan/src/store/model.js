import * as tf from "@tensorflow/tfjs";

import { size$ } from "../store/size";

export const model$ = size$.map((size) => {
  if(size === null)
    return null;

  const model = tf.sequential({
    layers: [
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
      tf.layers.conv2d({
        batchInputShape: [ null, size.x, size.y, size.z ],
        kernelSize: 5,
        filters: 16,
        strides: 2,
        activation: "relu",
        kernelInitializer: "varianceScaling",
      }),

      // The MaxPooling layer acts as a sort of downsampling using max values
      // in a region instead of averaging.
      // tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }),

      // Now we flatten the output from the 2D filters into a 1D vector to prepare
      // it for input into our last layer. This is common practice when feeding
      // higher dimensional data to a final classification output layer.
      tf.layers.flatten(),

      // output
      tf.layers.dense({
        units: 5,
        kernelInitializer: "varianceScaling",
        activation: "softmax",
      }),
    ],
  });

  model.compile({
    // loss: tf.losses.categoricalCrossentropy,
    loss: "categoricalCrossentropy",
    metrics: [ "accuracy" ],
    // loss: tf.losses.softmaxCrossEntropy,
    // optimizer: tf.train.sgd(.2),
    optimizer: tf.train.adam(),
  });

  return model;
});
