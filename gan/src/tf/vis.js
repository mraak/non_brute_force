import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";

import { IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS, NUM_OUTPUT_CLASSES } from "./constants";

export async function visualizeModel(model) {
  tfvis.show.modelSummary({ name: "Model Architecture" }, model);
}

export async function showExamples(data) {
  // Create a container in the visor
  const surface = tfvis
    .visor()
    .surface({ name: "Input Data Examples", tab: "Input Data" });

  // Get the examples
  // const examples = data.nextTestBatch(20);
  // const examples = data.allTrainData();
  const examples = data;
  const numExamples = examples.xs.shape[0];

  // Create a canvas element to render each example
  for (let i = 0; i < numExamples; i++) {
    const imageTensor = tf.tidy(() => {
      // Reshape the image to 28x28 px
      return examples.xs
        .slice([i, 0], [1, examples.xs.shape[1]])
        .reshape([IMAGE_WIDTH, IMAGE_HEIGHT, /*IMAGE_CHANNELS*/]);
    });

    const canvas = document.createElement("canvas");
    canvas.width = IMAGE_WIDTH;
    canvas.height = IMAGE_HEIGHT;
    canvas.style.margin = "4px";
    await tf.browser.toPixels(imageTensor, canvas);
    surface.drawArea.appendChild(canvas);

    imageTensor.dispose();
  }
}

export function getFitCallbacks() {
  const metrics = ["loss", "val_loss", "acc", "val_acc"];
  // const metrics = ["val_loss", "val_acc"];
  const container = {
    name: "Model Training",
    tab: "Training",
    styles: { height: "800px" }
  };

  return tfvis.show.fitCallbacks(container, metrics, {
    callbacks: ["onEpochEnd"]
  });
}

export async function showAccuracy(
  [preds, labels],
  data,
  classNames
) {
  const classAccuracy = await tfvis.metrics.perClassAccuracy(labels, preds);
  const container = { name: "Accuracy", tab: "Evaluation" };
  tfvis.show.perClassAccuracy(container, classAccuracy, classNames);
}

export async function showConfusion(
  [preds, labels],
  data,
  classNames
) {
  const confusionMatrix = await tfvis.metrics.confusionMatrix(labels, preds);
  // console.log("tfvis.show", tfvis.show)
  // console.log("tfvis.render", tfvis.render)
  // console.log("tfvis.metrics", tfvis.metrics)

  tfvis.render.confusionMatrix({ name: "Confusion Matrix", tab: "Evaluation" }, {
    values: confusionMatrix,
    tickLabels: classNames,
  });
  // tfvis.render.heatmap({ name: "Heatmap", tab: "Evaluation" }, {
  //   values: confusionMatrix,
  // });
  // tfvis.render.histogram({ name: "Histogram", tab: "Evaluation" }, {
  //   values: confusionMatrix,
  // });
}

export function openVis() {
  tfvis.visor().open();
}

export function isVisOpen() {
  return tfvis.visor().isOpen();
}
