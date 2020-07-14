import { createEvent, restore } from "effector";

export const setTraining = createEvent();
export const training$ = restore(setTraining, false);
