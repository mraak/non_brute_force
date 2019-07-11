class Modes {
  constructor() {
    this.pick = new PickMode(10);
    this.train = new TrainMode(30);
    this.board = new BoardMode(50);
    this.edit = new EditMode(70);
  }

  setCurrent(mode) {
    if(this.mode == mode)
      return;

    this.mode = mode;

    console.log("switched to", mode.constructor.name);
  }

  update() {
    if(this.mode)
      this.mode.update();

    textAlign(LEFT, TOP);

    fill(this.mode == this.pick ? 0 : 102);
    text(this.mode == this.pick ? "P pick" : `P ${players[this.pick.playerIndex].name}`, 10, this.pick.offsetY);

    fill(this.mode == this.train ? 0 : 102);
    text("T train", 10, this.train.offsetY);

    fill(this.mode == this.board ? 0 : 102);
    text("M map", 10, this.board.offsetY);

    fill(this.mode == this.edit ? 0 : 102);
    text("E edit", 10, this.edit.offsetY);

    fill(0);
  }

  keymap() {
    if(key == "p") {
      this.setCurrent(this.pick);
    } else if(key == "t") {
      this.setCurrent(this.train);
    } else if(key == "m") {
      this.setCurrent(this.board);
    } else if(key == "e") {
      this.train.setTraining(false);

      this.setCurrent(this.edit);
    } else if(this.mode)
      this.mode.keymap();
  }

  mouse(initial) {
    if(this.mode)
      this.mode.mouse(initial);
  }
}

class Mode {
  constructor(offsetY = 0) {
    this.offsetY = offsetY;
  }

  keymap() {

  }

  mouse(initial) {

  }

  update() {

  }
}
class PickMode extends Mode {
  constructor(offsetY) {
    super(offsetY);

    this.playerIndex = 0;
  }

  keymap() {
    const index = +key;

    if(index > 0 && index <= players.length) {
      modes.train.setTraining(false);

      this.playerIndex = index - 1;
    }
  }

  update() {
    fill(0);

    for(let i = 0, n = players.length, x = 60; i < n; ++i) {
      const label = `${i + 1} ${players[i].name}`;

      fill(i == this.playerIndex ? 0 : 102);
      text(label, x, this.offsetY);

      x += textWidth(label) + 10;
    }

    fill(0);
  }
}
class TrainMode extends Mode {
  constructor(offsetY) {
    super(offsetY);

    this.training = false;
  }

  keymap() {
    if(key == "s") {
      this.setTraining(!this.training);
    } else if(key == "+") {
      currentBoard.iterationSpeed += 1;
    } else if(key == "-") {
      currentBoard.iterationSpeed = max(1, currentBoard.iterationSpeed - 1);
    } else if(key == " ") {
      currentBoard.paused = !currentBoard.paused;
    } else {
      const index = +key;

      if(index > 0 && index <= currentBoard.iterationCount) {
        const force = this.training;

        this.setTraining(true);

        const player = currentBoard.players[0];

        player.setIterationIndex(force ? index : index - 1);

        if(force)
          player.nextIteration();
      }
    }
  }

  mouse(initial) {
    // const board = boards.find(
    //   (board) => board.bounds.contains(mouseX, mouseY)
    // );

    const board = currentBoard;

    if(!board)
      return;

    const localX = board.bounds.toLocalX(mouseX);
    const localY = board.bounds.toLocalY(mouseY);

    const tileIndex = board.localToIndex(localX, localY);

    const tile = board.get(tileIndex);

    // if(!tile)
    //   return;

    // if(!board.isWalkable(tile))
    //   return;

    // board.placePlayerAt(tileIndex, players[modes.pick.playerIndex]);

    console.log(tile);
  }

  update() {
    fill(0);

    if(this.training)
      text("S stop", 60, this.offsetY);
    else
      text("S start", 60, this.offsetY);

    if(!this.training)
      fill(102);

    if(currentBoard.paused)
      text("_ resume", 120, this.offsetY);
    else
      text("_ pause", 120, this.offsetY);

    text(`+/- speed: ${currentBoard.iterationSpeed}`, 180, this.offsetY);

    for(let i = 0, n = currentBoard.iterationCount, x = 280; i < n; ++i) {
      fill(currentBoard.players.length > 0 && i + 1 == currentBoard.players[0].iterationIndex ? 0 : 102);

      text(`${i + 1}`, x, this.offsetY);
      x += 20;
    }

    fill(0);
  }

  setTraining(training) {
    if(this.training == training)
      return;

    this.training = training;

    if(!training)
      currentBoard.players = [];
    else {
      randomSeed(123);

      const player = currentBoard.placePlayerAt(currentBoard.startIndex, players[modes.pick.playerIndex]);
      player.states.setCurrent(player.states.idle);
    }
  }
}
class BoardMode extends Mode {
  constructor(offsetY) {
    super(offsetY);
  }

  keymap() {
    const index = +key;

    if(index >= 0 && index < boards.length) {
      if(boards[index].edges == currentBoard.edges)
        return;

      modes.train.setTraining(false);

      createBoard(boards[index]);
    }
  }

  update() {
    for(let i = 0, n = boards.length, x = 60; i < n; ++i) {
      const label = `${i}`;

      fill(boards[i].edges == currentBoard.edges ? 0 : 102);
      text(label, x, this.offsetY);

      x += textWidth(label) + 10;
    }

    fill(0);
  }
}
class EditMode extends Mode {
  constructor(offsetY) {
    super(offsetY);

    this.selectedType = 3;
  }

  keymap() {
    if(key == "l") {
      const data = prompt("load board");

      if(!data)
        return;

      const config = JSON.parse(data);

      createBoard(config);

      return;
    }

    if(key == "s") {
      prompt("save board", currentBoard.toJson());

      return;
    }

    if(key == "+") {
      currentBoard.boardSize += 1;

      currentBoard.setBoardSize(currentBoard.boardSize);

      return;
    }
    if(key == "-") {
      currentBoard.boardSize = max(1, currentBoard.boardSize - 1);

      currentBoard.setBoardSize(currentBoard.boardSize);

      return;
    }

    const type = +key;

    if(type > 0 && type < 4)
      this.selectedType = type;
  }

  mouse(initial) {
    // const board = boards.find(
    //   (board) => board.bounds.contains(mouseX, mouseY)
    // );

    const board = currentBoard;

    if(!board)
      return;

    const localX = board.bounds.toLocalX(mouseX);
    const localY = board.bounds.toLocalY(mouseY);

    const tileIndex = board.localToIndex(localX, localY);
    const tile = board.get(tileIndex);

    if(!tile)
      return;

    if(this.selectedType == 1)
      board.startIndex = tileIndex;
    else if(this.selectedType == 2)
      board.endIndex = tileIndex;
    else if(this.selectedType == 3) {
      if(initial) {
        this.selectedTile = tile;
        this.targetTile = null;
      } else if(this.selectedTile != tile)
        this.targetTile = tile;

      if(this.selectedTile && this.targetTile) {
        board.toggleEdge(this.selectedTile, this.targetTile);

        this.selectedTile = this.targetTile;
        this.targetTile = null;
      }
    }
    // else
    //   board.get(tileIndex).setType(this.selectedType);
  }

  update() {
    text("L load", 60, this.offsetY);
    text("S save", 100, this.offsetY);

    text(`+/- size: ${currentBoard.boardSize}`, 160, this.offsetY);

    for(let i = 1, x = 240; i < 4; ++i) {
      const label = `${i} ${this.getTypeLabel(i)}`;

      fill(this.selectedType == i ? 0 : 102);
      text(label, x, this.offsetY);

      x += textWidth(label) + 10;
    }

    fill(0);
  }

  getTypeLabel(type) {
    if(type == 1)
      return "START";

    if(type == 2)
      return "END";

    if(type == 3)
      return "PATH";

    return "NA";
  }
}
