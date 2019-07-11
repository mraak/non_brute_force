class BoardTile {
  constructor(board, index) {
    this.board = board;
    this.index = index;

    const [ x, y ] = board.fromIndex(index);

    this.neighbors = [
      // board.toIndex(x - 1, y - 1), // tl
      board.toIndex(x, y - 1), // tc
      // board.toIndex(x + 1, y - 1), // tr
      board.toIndex(x - 1, y), // l
      board.toIndex(x + 1, y), // r
      // board.toIndex(x - 1, y + 1), // bl
      board.toIndex(x, y + 1), // bc
      // board.toIndex(x + 1, y + 1), // br
    ];

    this.edges = new Set;

    this.bounds = new BoardTileBounds(
      x, y,
      board.tileSize, board.tileSize
    );
  }

  getWalkableNeighbors() {
    return Array.from(this.edges);
  }

  isDeadEnd() {
    return this.getWalkableNeighbors().length <= 1;
  }

  isFork() {
    return this.getWalkableNeighbors().length > 2;
  }

  update() {
    const { bounds, index, board } = this;

    const c = board.getColor(this);

    if(!c)
      return;

    fill(board.players.length && board.players[0].visited.indexOf(index) > -1 ? color(255, 204, 153) : c);

    rect(
      bounds.left, bounds.top,
      bounds.width, bounds.height
    );

    if(board.isWalkable(this)) {
      // var value = board.players.length > 0 ? board.players[0].counted[index].toString() : index.toString();
      // var value = board.players.length > 0 && board.players[0].currentScores ? board.players[0].currentScores[index].toString() : index.toString();
      var value = index.toString();

      if(board.isStart(this))
        value = "S";
      else if(board.isEnd(this))
        value = "E";

      fill(51);
      textSize(bounds.width / 2);
      textAlign(CENTER, CENTER);
      text(value, bounds.centerX, bounds.centerY);
    }
  }
}

class BoardTileBounds {
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
