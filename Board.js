const wallSize = 4;
const wallSize2 = wallSize / 2;

class Board {
  constructor(x, y, config) {
    this.x = x;
    this.y = y;
    this.config = config;

    // TODO: Remove!
    Object.assign(this, config);

    this.iterationSpeed = 1;
    this.iterationCount = config.iterations.length;

    this.paused = false;

    this.resetTiles();

    this.players = [];
    this.playerIdGen = 0;

    this.log = [];
  }

  resetTiles() {
    const { config } = this;

    this.setBoardSize(config.boardSize);
    this.setEdges(config.edges);
    this.setFood([]);

    this.startIndex = config.startIndex;
    this.endIndex = config.endIndex;

    this.paths = bfs(this, this.startIndex, this.endIndex);
  }
  setBoardSize(boardSize) {
    this.boardSize = boardSize;

    this.bounds = new BoardBounds(
      this.x, this.y,
      boardSize * this.config.tileSize,
      boardSize * this.config.tileSize
    );

    createCanvas(this.bounds.right + 10 + 400, this.bounds.bottom + 10);

    this.tiles = Array.from(
      Array(boardSize * boardSize),
      (_, index) => new BoardTile(this, index)
    );
  }
  setEdges(edges) {
    this.edges = edges;

    if(edges) {
      for(let e of edges)
        this.toggleEdge(this.tiles[e[0]], this.tiles[e[1]]);
    }
  }
  toggleEdge(a, b) {
    if(a.neighbors.indexOf(b.index) > -1) {
      if(a.edges.has(b.index)) {
        a.edges.delete(b.index);
        b.edges.delete(a.index);
      } else {
        a.edges.add(b.index);
        b.edges.add(a.index);
      }
    }
  }
  setFood(food) {
    this.food = new Set(food);
  }

  update() {
    const { bounds, tiles } = this;

    push();
    translate(bounds.left, bounds.top);

    for(let tile of tiles)
      tile.update();

    for(let i = 0; i < this.iterationSpeed; ++i) {
      for(let player of this.players)
        player.update();
    }

    fill(0);

    for(let t of tiles) {
      if(t.neighbors[0] == -1 || !t.edges.has(t.neighbors[0])) {
        rect(t.bounds.left - wallSize2, t.bounds.top - wallSize2, t.bounds.width + wallSize, wallSize); // top
      }
      if(t.neighbors[1] == -1 || !t.edges.has(t.neighbors[1])) {
        rect(t.bounds.left - wallSize2, t.bounds.top - wallSize2, wallSize, t.bounds.height + wallSize); // left
      }
      if(t.neighbors[2] == -1 || !t.edges.has(t.neighbors[2])) {
        rect(t.bounds.right - wallSize2, t.bounds.top - wallSize2, wallSize, t.bounds.height + wallSize); // right
      }
      if(t.neighbors[3] == -1 || !t.edges.has(t.neighbors[3])) {
        rect(t.bounds.left - wallSize2, t.bounds.bottom - wallSize2, t.bounds.width + wallSize, wallSize); // bottom
      }
    }

    textAlign(LEFT, TOP);
    textSize(20);
    text(this.log.join("\n"), bounds.width + 10, 0);

    pop();
  }

  isStart(tile) {
    return tile.index == this.startIndex;
  }
  isEnd(tile) {
    return tile.index == this.endIndex;
  }
  isWalkable(tile) {
    return tile.edges.size > 0;
  }

  getColor(tile) {
    if(this.food.has(tile.index))
      return color(255);

    if(tile.index == this.startIndex)
      return red;

    if(tile.index == this.endIndex)
      return blue;

    return color(204);
  }

  toIndex(x, y) {
    if(x < 0 || x >= this.boardSize || y < 0 || y >= this.boardSize)
      return -1;

    return x + this.boardSize * y;
  }
  fromIndex(index) {
    return [
      index % this.boardSize,
      Math.floor(index / this.boardSize),
    ];
  }

  localToX(x) {
    return floor(x / this.tileSize);
  }
  localToY(y) {
    return floor(y / this.tileSize);
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

  getTargets(tileIndex, targets) {
    const { tiles } = this;

    const tile = tiles[tileIndex];

    const items = [];

    for(let i = 0, n = tile.neighbors.length; i < n; ++i) {
      if(tile.neighbors[i] < 0 || !tile.edges.has(tile.neighbors[i]))
        continue;

      let item = this.getTargetDirection(tile.neighbors[i], i, targets);

      if(item > -1)
        items.push(item);
    }

    return items;
  }

  getTargetDirection(tileIndex, i, targets) {
    const tile = this.tiles[tileIndex];

    if(!this.isWalkable(tile))
      return -1;

    if(targets.indexOf(tileIndex) > -1)
      return tileIndex;

    const neighborIndex = tile.neighbors[i];

    if(neighborIndex < 0)
      return -1;

    return this.getTargetDirection(neighborIndex, i, targets);
  }

  placePlayerAt(index, config) {
    const player = new Player(this, ++this.playerIdGen, config);

    // this.log.unshift(`placed ${player.name} at ${index}`);

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
      boardSize: this.boardSize,
      tileSize: this.tileSize,
      edges: this.tiles.reduce(
        (list, tile) => [
          ...list,
          ...Array.from(tile.edges).reduce(
            (edges, t) => tile.index < t ? [
              ...edges,
              [ tile.index, t ]
            ] : edges, []
          )
        ], []
      ),
      startIndex: this.startIndex,
      endIndex: this.endIndex,
      iterations: this.iterations,
      food: Array.from(this.food),
    };
  }

  toJson() {
    return JSON.stringify(this.toConfig());
  }
}

class BoardBounds {
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
