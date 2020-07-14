import { layout$ } from "./layout";

export const ids$ = layout$.map((layout) => {
  if(!layout)
    return null;

  let id = 0;

  return layout.map((item) => item === 0 ? 0 : ++id);
});
