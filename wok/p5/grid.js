import map from "../data/map1";
import Grid from "../models/Grid";

const grid = new Grid(map.size.x, map.size.y, map.size.z);
for (let key of map.tiles) {
  const c = key.split("|").map(i => +i);

  grid.get(grid.toIndex(...c)).type = map.tiles[key];
}
for (let key in map.food) {
  const c = key.split("|").map(i => +i);

  grid.get(grid.toIndex(...c)).food = map.food[key];
}

export default grid;
