let modes;
// let boards;
let currentBoard;

let red;
let green;
let blue;

function setupTypes() {
  red = color(255, 153, 51);
  green = color(153, 255, 51);
  blue = color(51, 153, 255);
}

function setup() {
  // const configs = [
  //   // board1,
  //   // board2,
  //   board3,
  // ];

  setupTypes();

  modes = new Modes;
  modes.setCurrent(modes.train);

  // let x = 10, y = 50, h = 0;
  // boards = configs.map(
  //   (config) => {
  //     const board = new Board(x, y, config);
  //     x += board.bounds.width + 10 + 400;
  //     h = max(board.bounds.bottom + 10, h);

  //     return board;
  //   }
  // );

  createBoard(boards[0]);

  frameRate(30);
}

function draw() {
  background(255);
  noStroke();

  modes.update();

  // for(let board of boards)
  //   board.update();

  currentBoard.update();
}

function keyTyped() {
  modes.keymap();
}

function mousePressed() {
  handleMouse(true);
}
function mouseDragged() {
  handleMouse();
}

function createBoard(config) {
  let x = 10, y = 90;

  currentBoard = new Board(x, y, config);
}

function handleMouse(initial) {
  modes.mouse(initial);
}
