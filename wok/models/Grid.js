export default class Grid {
  constructor(x, y, z) {
    this.size = { x, y, z };

    this.tiles = Array.from(Array(x * y * z), (_, i) => new Tile(this, i));
  }

  fromIndex(i) {
    const xy = this.size.x * this.size.y;
    const z = floor(i / xy);

    i -= z * xy;
    const y = floor(i / this.size.x);
    const x = i - y * this.size.x;

    return { x, y, z };
  }
  toIndex(x, y, z) {
    return z * this.size.x * this.size.y + y * this.size.x + x;
  }
  get(i) {
    return this.tiles[i];
  }
}

const EMPTY = 0;
const FLOOR = 1;
class Tile {
  constructor(owner, index) {
    this.owner = owner;
    this.index = index;
    this.id = 0;

    this.type = EMPTY;
    this.food = 0;
  }

  isEmpty() {
    return this.type === EMPTY;
  }
  hasFloor() {
    return this.type === FLOOR;
  }
}