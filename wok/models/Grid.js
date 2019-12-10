export default class Grid {
  constructor(x, y, z) {
    this.size = { x, y, z };

    this.tiles = Array.from(Array(x * y * z), (_, i) => new Tile(this, i));
  }

  fromIndex(i) {
    const yz = this.size.y * this.size.z;
    const x = floor(i / yz);
    const y = floor((i - x * yz) / this.size.z);
    const z = i - x * yz - y * this.size.z;

    return { x, y, z };
  }
  toIndex(x, y, z) {
    return x * this.size.y * this.size.z + y * this.size.z + z;
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