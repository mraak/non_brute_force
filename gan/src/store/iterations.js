import { combine, createEvent, restore } from "effector";

import { layout$ } from "./layout";

import { join } from "../utils";

export const setRawIterations = createEvent();
export const rawIterations$ = restore(setRawIterations, null);

export const iterations$ = combine(layout$, rawIterations$, (layout, rawIterations) => {
  if(layout === null || rawIterations === null)
    return null;

  return rawIterations.map((iteration) => ({
    ...iteration,
    data: join(layout, iteration.data),
  }));
});
