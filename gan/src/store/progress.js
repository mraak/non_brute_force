import { createEvent, restore } from "effector";

export const setProgress = createEvent();
export const progress$ = restore(setProgress, 0);
