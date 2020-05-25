import { combine, createEvent, restore } from "effector";

import Grid from "../models/Grid";

export const setSize = createEvent();
export const size = restore(setSize, { x: 4, y: 3, z: 2 });

export const setMap = createEvent();
export const map = restore(setMap, null);

export const grid = combine(size, map, ({ x, y, z }, map) => {
  if(!map)
    return null;

  const grid = new Grid(x, y, z);
  for(let i in map) {
    const tile = grid.get(i);

    if(!tile)
      break;

    tile.type = map[i];
  }

  return grid;
});