class Map {
  constructor(x, y, config) {
    Object.assign(this, config);

    this.iterationSpeed = 1;
    this.iterationCount = config.iterations.length;

    this.paused = false;

    this.bounds = new MapBounds(
      x, y,
      config.columns * config.tileWidth,
      config.rows * config.tileHeight
    );

    this.tiles = config.data.map(
      (type, index) => new MapTile(this, index, type)
    );

    this.players = [];
    this.playerIdGen = 0;

    this.log = [];

    const startIndex = this.startIndex = config.data.findIndex(
      (type) => type == START
    );
    const endIndex = this.endIndex = config.data.findIndex(
      (type) => type == END
    );

    this.paths = bfs(this, startIndex, endIndex);

    console.log("paths", this.paths);
  }

  resetTiles() {
    const { data, tiles } = this;

    for(let i = 0, n = tiles.length; i < n; ++i)
      tiles[i].setType(data[i]);
  }
  updateTiles(indices, type) {
    if(!indices)
      return;

    const { tiles } = this;

    for(let i of indices)
      tiles[i].setType(type);
  }

  update() {
    const { bounds } = this;

    push();
    translate(bounds.left, bounds.top);

    for(let tile of this.tiles)
      tile.update();

    for(let i = 0; i < this.iterationSpeed; ++i) {
      for(let player of this.players)
        player.update();
    }

    textAlign(LEFT, TOP);
    textSize(20);
    text(this.log.join("\n"), bounds.width + 10, 0);

    pop();
  }

  toIndex(x, y) {
    if(x < 0 || x >= this.columns || y < 0 || y >= this.rows)
      return -1;

    return x + this.columns * y;
  }
  fromIndex(index) {
    return [
      index % this.columns,
      Math.floor(index / this.columns),
    ];
  }

  localToX(x) {
    return floor(x / this.tileWidth);
  }
  localToY(y) {
    return floor(y / this.tileHeight);
  }
  localToIndex(x, y) {
    return this.toIndex(
      this.localToX(x),
      this.localToY(y)
    );
  }

  get(index) {
    if(index < 0)
      return undefined;

    return this.tiles[index];
  }

  getTargets(tileIndex, type) {
    const { tiles } = this;

    const tile = tiles[tileIndex];

    const items = [];

    for(let i = 0, n = tile.neighbors.length; i < n; ++i) {
      let item = this.getTargetDirection(tile.neighbors[i], i, type);

      if(item > -1)
        items.push(item);
    }

    return items;
  }

  getTargetDirection(tileIndex, i, type) {
    const tile = this.tiles[tileIndex];

    if(!isWalkable(tile.type))
      return -1;

    if(tile.type == type)
      return tileIndex;

    const neighborIndex = tile.neighbors[i];

    if(neighborIndex < 0)
      return -1;

    return this.getTargetDirection(neighborIndex, i, type);
  }

  placePlayerAt(index) {
    const player = new Player(this, ++this.playerIdGen);

    this.log.unshift(`placed player ${player.id} at tile ${index}`);

    this.players.push(player);

    return player;
  }

  removePlayer(player) {
    const { players } = this;

    const index = players.indexOf(player);

    if(index < 0)
      return;

    players.splice(index, 1);
  }

  toConfig() {
    return {
      columns: this.columns,
      rows: this.rows,
      tileWidth: this.tileWidth,
      tileHeight: this.tileHeight,
      data: this.tiles.map(
        (tile) => tile.type
      ),
      iterations: this.iterations,
    };
  }

  toJson() {
    return JSON.stringify(this.toConfig());
  }
}

class MapBounds {
  constructor(l, t, w, h) {
    this.left = l;
    this.top = t;
    this.right = l + w;
    this.bottom = t + h;
    this.width = w;
    this.height = h;
  }

  contains(x, y) {
    if(x < this.left || y < this.top
    || x > this.right || y > this.bottom)
      return false;

    return true;
  }

  toLocalX(x) {
    return x - this.left;
  }

  toLocalY(y) {
    return y - this.top;
  }
}
