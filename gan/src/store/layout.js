import { createEvent, restore } from "effector";

export const setLayout = createEvent();
export const layout$ = restore(setLayout, null);
