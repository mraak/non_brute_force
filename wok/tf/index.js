import { combine } from "effector";
import * as tf from "@tensorflow/tfjs";

import { map, size } from "../store";

combine(size, map, ({ x, y, z }, map) => {
  if(!map)
    return;

  var t = tf.tensor(map, [ z, y, x ], "int32");
  console.log("arraySync", t.arraySync());

  t.dispose();
});

// export const test = (x, y, z) =>

// import trainBatch from "./gan";