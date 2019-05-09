class Map {
  constructor(x, y, config) {
    Object.assign(this, config);

    this.bounds = new MapBounds(
      x, y,
      config.columns * config.tileWidth,
      config.rows * config.tileHeight
    );

    this.tiles = config.data.map(
      (type, index) => new MapTile(this, index, type)
    );

    this.players = [];

    const startIndex = config.data.findIndex(
      (type) => type == START
    );
    this.placePlayerAt(startIndex);
  }

  update() {
    const { bounds } = this;

    push();
    translate(bounds.left, bounds.top);

    for(let tile of this.tiles)
      tile.update();

    for(let player of this.players)
      player.update();

    pop();
  }

  toIndex(x, y) {
    if(x < 0 || x >= this.columns || y < 0 || y >= this.rows)
      return undefined;

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
    return this.tiles[index];
  }

  setCurrentPlayer(currentPlayer) {
    if(this.currentPlayer)
      this.currentPlayer.states.setCurrent(this.currentPlayer.states.idle);

    this.currentPlayer = currentPlayer;

    if(currentPlayer)
      currentPlayer.states.setCurrent(currentPlayer.states.manual);
  }

  placePlayerAt(index) {
    console.log("placed player at tile", index);

    const player = new Player(this, index);

    this.players.push(player);

    this.setCurrentPlayer(player);
  }

  removePlayer(player) {
    const { players } = this;

    const index = players.indexOf(player);

    if(index < 0)
      return;

    players.splice(index, 1);
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
