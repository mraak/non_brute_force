class MapTile {
  constructor(map, index, type) {
    this.map = map;
    this.index = index;
    this.type = type;

    const [ x, y ] = map.fromIndex(index);

    this.neighbors = [
      // map.toIndex(x - 1, y - 1), // tl
      map.toIndex(x, y - 1), // tc
      // map.toIndex(x + 1, y - 1), // tr
      map.toIndex(x - 1, y), // l
      map.toIndex(x + 1, y), // r
      // map.toIndex(x - 1, y + 1), // bl
      map.toIndex(x, y + 1), // bc
      // map.toIndex(x + 1, y + 1), // br
    ];

    this.bounds = new MapTileBounds(
      x, y,
      map.tileWidth, map.tileHeight
    );
  }

  getWalkableNeighbors() {
    const { map } = this;

    return this.neighbors.filter(
      (neighborIndex) => isWalkable(map.get(neighborIndex).type)
    );
  }

  isDeadEnd() {
    return this.getWalkableNeighbors().length <= 1;
  }

  isFork() {
    return this.getWalkableNeighbors().length > 2;
  }

  setType(type) {
    this.type = type;
  }

  update() {
    const { bounds, type } = this;

    const color = getColor(type);

    if(!color)
      return;

    fill(color);

    rect(
      bounds.left, bounds.top,
      bounds.width, bounds.height
    );

    if(isWalkable(type)) {
      // var value = this.map.players.length > 0 ? this.map.players[0].counted[this.index].toString() : this.index.toString();
      // var value = this.map.players.length > 0 && this.map.players[0].currentScores ? this.map.players[0].currentScores[this.index].toString() : this.index.toString();
      var value = this.index.toString();

      if(isStart(type))
        value = "S";
      else if(isEnd(type))
        value = "E";

      fill(51);
      textSize(bounds.width / 2);
      textAlign(CENTER, CENTER);
      text(value, bounds.centerX, bounds.centerY);
    }
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

    this.center = createVector(this.centerX, this.centerY);
  }
}
