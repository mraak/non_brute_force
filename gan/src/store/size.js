import { createEvent, restore } from "effector";

export const setSize = createEvent();
export const size$ = restore(setSize, null);
