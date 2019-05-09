class MapTile {
  constructor(map, index, type) {
    this.map = map;
    this.index = index;
    this.type = type;

    const [ x, y ] = map.fromIndex(index);

    this.neighbors = [
      map.toIndex(x - 1, y - 1), // tl
      map.toIndex(x, y - 1), // tc
      map.toIndex(x + 1, y - 1), // tr
      map.toIndex(x - 1, y), // l
      map.toIndex(x + 1, y), // r
      map.toIndex(x - 1, y + 1), // bl
      map.toIndex(x, y + 1), // bc
      map.toIndex(x + 1, y + 1), // br
    ];

    this.bounds = new MapTileBounds(
      x, y,
      map.tileWidth, map.tileHeight
    );
  }

  setType(type) {
    this.type = type;
  }

  update() {
    const { bounds } = this;

    const color = getColor(this.type);

    if(!color)
      return;

    fill.apply(null, color);

    rect(
      bounds.left, bounds.top,
      bounds.width, bounds.height
    );
  }
}

class MapTileBounds {
  constructor(x, y, w, h) {
    const l = this.left = x * w;
    const t = this.top = y * h;
    this.right = l + w;
    this.bottom = t + h;
    this.width = w;
    this.height = h;

    this.centerX = l + w * .5;
    this.centerY = t + h * .5;
  }
}
