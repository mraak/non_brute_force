import { createStore } from "effector";

export const admin$ = createStore(
  window.location.search.indexOf("admin") > -1
);
