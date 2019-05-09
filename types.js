const EMPTY = -1;
const WALL = 0;
const FLOOR = 1;
const REWARD = 2;
const START = 3;
const END = 4;
const PENALTY = 5;

function isWalkable(type) {
  if(type == EMPTY || type == WALL)
    return false;

  return true;
}

function isEnd(type) {
  return type == END;
}

function isEditable(type) {
  return type == FLOOR || type == REWARD || type == PENALTY;
}

function getColor(type) {
  if(type == EMPTY)
    return undefined;

  if(type == REWARD)
    return [ 255 ];

  if(type == FLOOR)
    return [ 204 ];

  if(type == START)
    return [ 255, 153, 51 ];

  if(type == END)
    return [ 51, 153, 255 ];

  if(type == PENALTY)
    return [ 102 ];

  // wall
  return [ 51 ];
}

function getReward(type) {
  if(type == END)
    return 10;

  if(type == START)
    return -10;

  if(type == REWARD)
    return 1;

  if(type == PENALTY)
    return -1;

  return 0;
}
