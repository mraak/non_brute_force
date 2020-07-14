import { createEvent, restore } from "effector";

export const setIterationIndex = createEvent();
export const iterationIndex$ = restore(setIterationIndex, 0);
