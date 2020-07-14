import { createEffect } from "effector";
import { useStore } from "effector-react";
import p5 from "p5";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";

import { layout$ } from "../store/layout";
import { model$ } from "../store/model";
import { size$ } from "../store/size";
import { setTraining } from "../store/training";
import { fromIndex } from "../utils";

const classNames = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
];

const ranks = [
  [ 1, 0, 0, 0, 0 ],
  [ 0, 1, 0, 0, 0 ],
  [ 0, 0, 1, 0, 0 ],
  [ 0, 0, 0, 1, 0 ],
  [ 0, 0, 0, 0, 1 ],
];

const generate = createEffect();
generate.use(async({ number, rank }) => {
  const size = size$.getState();

  const xs = tf.tensor([ number ], [ 1, size.x, size.y, size.z ], "int32");
  // const xs = tf.tensor([ number ], [ 1, size.x, size.y, size.z ]);
  const response = model$.getState().predict(xs);
  const preds = response.argMax(1);
  const argMax1 = await preds.data();
  const data = await response.data();

  const l = tf.tensor([ ranks[rank] ], [ 1, 5 ]);
  const labels = await l.argMax(1);

  console.log("generated", argMax1[0], Array.from(data), labels);

  // accuracy
  const classAccuracy = await tfvis.metrics.perClassAccuracy(labels, preds);
  const container = { name: "Accuracy", tab: "Evaluation" };
  tfvis.show.perClassAccuracy(container, classAccuracy, classNames);

  // confusion
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

  xs.dispose();
  l.dispose();

  return response;
});
generate.pending.watch((pending) => pending && setTraining(true));
generate.fail.watch((error) => {
  console.error("generate error", error);
})
generate.finally.watch(() => setTraining(false));

const TILE_SIZE = 12;

const sketch = (size) => (p) => {
  const W = size.x * TILE_SIZE;
  const H = ((size.y + 1) * size.z - 1) * TILE_SIZE;
  const bounds = [ 0, 0, W, H ];

  p.setup = () => {
    p.createCanvas(W, H, p.CANVAS);
    p.noLoop();
  };
  p.draw = () => {
    // aligns to top left
    // p.translate(-W / 2, -H / 2, 0);

    for(let i in layout) {
      const { x, y, z } = fromIndex(size, i);

      const posX = x * TILE_SIZE;
      const posY = y * TILE_SIZE;
      const posZ = z * (size.y + 1) * TILE_SIZE;

      let c = 255;

      if(yout[i] === 2)
        c = 51;
      else if(yout[i] === 1)
        c = 204;

      p.fill(c);
      p.rect(posX, posY + posZ, TILE_SIZE, TILE_SIZE);
    }
  };
};

const generateClickHandler = (form) => {
  const rank = +form.rank;
  generate(rank);
};

let p, layout;

export default () => {
  layout = useStore(layout$);
  const size = useStore(size$);

  const { errors, formState, handleSubmit, register } = useForm({
    mode: "onChange",
  });

  const id = `generate-container`;

  useEffect(() => {
    p = new p5(sketch(size), id);

    return p.remove;
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit(generateClickHandler)}>
        <fieldset>
          <legend>options</legend>
          <label>
            <h6>class</h6>
            <select name="rank" ref={register}>
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
            {errors.rank && "class is required"}
          </label>
          <hr />
          <input type="submit" value="generate" disabled={!formState.isValid || formState.isSubmitting} />
        </fieldset>
      </form>
      <p id={id} />
    </div>
  );
};
