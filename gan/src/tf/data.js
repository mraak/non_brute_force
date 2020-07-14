/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as tf from "@tensorflow/tfjs";

import { IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS, NUM_OUTPUT_CLASSES } from "./constants";

import fours from "../data/fours";
import ones from "../data/ones";
import threes from "../data/threes";
import twos from "../data/twos";
import zeros from "../data/zeros";

const trainImages = [
  ...zeros,
  ...ones,
  ...twos,
  ...threes,
  ...fours,
];
const testImages = [
  zeros[0],
  ones[0],
  twos[0],
  threes[0],
  fours[0],
];
const trainLabels = [
  ...zeros .map((item) => [ 1, 0, 0, 0, 0 ]),
  ...ones  .map((item) => [ 0, 1, 0, 0, 0 ]),
  ...twos  .map((item) => [ 0, 0, 1, 0, 0 ]),
  ...threes.map((item) => [ 0, 0, 0, 1, 0 ]),
  ...fours .map((item) => [ 0, 0, 0, 0, 1 ]),
];
const testLabels = [
  [ 1, 0, 0, 0, 0 ],
  [ 0, 1, 0, 0, 0 ],
  [ 0, 0, 1, 0, 0 ],
  [ 0, 0, 0, 1, 0 ],
  [ 0, 0, 0, 0, 1 ],
];

const IMAGE_SIZE = IMAGE_WIDTH * IMAGE_HEIGHT;
const NUM_CLASSES = NUM_OUTPUT_CLASSES;

export const NUM_TRAIN_ELEMENTS = trainImages.length;
export const NUM_TEST_ELEMENTS = testImages.length;

/**
 * A class that fetches the sprited MNIST dataset and returns shuffled batches.
 *
 * NOTE: This will get much easier. For now, we do data fetching and
 * manipulation manually.
 */
export class MnistData {
  constructor() {
    this.shuffledTrainIndex = 0;
    this.shuffledTestIndex = 0;
  }

  async load() {
    // Create shuffled indices into the train/test set for when we select a
    // random dataset element for training / validation.
    this.trainIndices = tf.util.createShuffledIndices(NUM_TRAIN_ELEMENTS);
    this.testIndices = tf.util.createShuffledIndices(NUM_TEST_ELEMENTS);

    this.trainImages = trainImages;
    this.testImages = testImages;
    this.trainLabels = trainLabels;
    this.testLabels = testLabels;
  }

  allTrainData() {
    return this.nextTrainBatch(NUM_TRAIN_ELEMENTS);
  }

  nextTrainBatch(batchSize) {
    return this.nextBatch(
      batchSize,
      [this.trainImages, this.trainLabels],
      () => {
        this.shuffledTrainIndex =
          (this.shuffledTrainIndex + 1) % this.trainIndices.length;
        return this.trainIndices[this.shuffledTrainIndex];
      }
    );
  }

  nextTestBatch(batchSize) {
    return this.nextBatch(batchSize, [this.testImages, this.testLabels], () => {
      this.shuffledTestIndex =
        (this.shuffledTestIndex + 1) % this.testIndices.length;
      return this.testIndices[this.shuffledTestIndex];
    });
  }

  nextBatch(batchSize, data, index) {
    const batchImagesArray = [];
    const batchLabelsArray = [];

    for (let i = 0; i < batchSize; i++) {
      const idx = index();

      const image = data[0][idx];
      batchImagesArray.push(image);

      const label = data[1][idx];
      batchLabelsArray.push(label);
    }

    const xs = tf.tensor2d(batchImagesArray, [batchSize, IMAGE_SIZE]);
    const labels = tf.tensor2d(batchLabelsArray, [batchSize, NUM_CLASSES]);

    return { xs, labels };
  }
}
