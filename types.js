const EMPTY = -1;
const WALL = 0;
const FLOOR = 1;
const REWARD = 2;
const START = 3;
const END = 4;
// const PENALTY = 5;

let red;
let green;
let blue;

function setupTypes() {
  red = color(255, 153, 51);
  green = color(153, 255, 51);
  blue = color(51, 153, 255);
}

function isWalkable(type) {
  if(type == EMPTY || type == WALL)
    return false;

  return true;
}

function isStart(type) {
  return type == START;
}
function isEnd(type) {
  return type == END;
}

function isEditable(type) {
  return type == FLOOR || type == REWARD; //  || type == PENALTY;
}

function getTypeLabel(type) {
  if(type == -1)
    return "EMPTY";

  if(type == 0)
    return "WALL";

  if(type == 1)
    return "FLOOR";

  if(type == 2)
    return "REWARD";

  if(type == 3)
    return "START";

  if(type == 4)
    return "END";

  return "NA";
}

function getColor(type) {
  if(type == EMPTY)
    return undefined;

  if(type == REWARD)
    return color(255);

  if(type == FLOOR)
    return color(204);

  if(type == START)
    return red;

  if(type == END)
    return blue;

  // if(type == PENALTY)
  //   return color(102);

  // wall
  return color(51);
}

function getReward(type) {
  if(type == END)
    return 10;

  if(type == START)
    return -10;

  if(type == REWARD)
    return 1;

  // if(type == PENALTY)
  //   return -1;

  return 0;
}