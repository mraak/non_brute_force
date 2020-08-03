import { createEvent, restore } from "effector";

export const setPhase = createEvent();
export const phase$ = restore(setPhase, 4);
