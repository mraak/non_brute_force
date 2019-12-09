import "p5";
import abc from "p5";

import store from "../redux/store";

import {
  getEdges,
  getEdgeIndex,
  getTopNeighborIndex,
  getLeftNeighborIndex,
  getRightNeighborIndex,
  getBottomNeighborIndex,
  getForkScores,
  mouseToIndex,
  getBounds,
  getColor,
  isFood
} from "./functions";

function setup() {
  createBoard(reduxState.maps.current);
  createPlayer(reduxState.dogs.current);

  store.dispatch({ type: "maps/selectedIterationIndex", payload: 0 });

  frameRate(30);
}

const wallSize = 4;
const wallSize2 = wallSize / 2;

function draw() {
  window.reduxState = store.getState();

  background(255);
  noStroke();

  drawMap();

  drawDog(reduxState.run.iterationSpeed);
}
function drawMap() {
  ellipseMode(CORNER);

  for(let tileIndex = 0, n = reduxState.maps.tileCount; tileIndex < n; ++tileIndex) {
    const bounds = getBounds(tileIndex);

    if(isFood(tileIndex)) {
      fill(getColor(-1));

      rect(
        bounds.left, bounds.top,
        bounds.width, bounds.height
      );

      fill(getColor(tileIndex));

      ellipse(
        bounds.left + 14, bounds.top + 14,
        bounds.width - 28, bounds.height - 28
      );
    } else {
      fill(getColor(tileIndex));

      rect(
        bounds.left, bounds.top,
        bounds.width, bounds.height
      );
    }
  }

  fill(0);

  for(let tileIndex = 0, n = reduxState.maps.tileCount; tileIndex < n; ++tileIndex) {
    if(getEdges(tileIndex).length === 0)
      continue;

    const bounds = getBounds(tileIndex);

    if(getEdgeIndex(tileIndex, getTopNeighborIndex(tileIndex)) < 0) {
      rect(bounds.left - wallSize2, bounds.top - wallSize2, bounds.width + wallSize, wallSize); // top
    }
    if(getEdgeIndex(tileIndex, getLeftNeighborIndex(tileIndex)) < 0) {
      rect(bounds.left - wallSize2, bounds.top - wallSize2, wallSize, bounds.height + wallSize); // left
    }
    if(getEdgeIndex(tileIndex, getRightNeighborIndex(tileIndex)) < 0) {
      rect(bounds.right - wallSize2, bounds.top - wallSize2, wallSize, bounds.height + wallSize); // right
    }
    if(getEdgeIndex(tileIndex, getBottomNeighborIndex(tileIndex)) < 0) {
      rect(bounds.left - wallSize2, bounds.bottom - wallSize2, bounds.width + wallSize, wallSize); // bottom
    }
  }

  textSize(reduxState.maps.current.tileSize / 4);
  textAlign(CENTER, CENTER);

  reduxState.maps.steps.forEach(
    (count, tileIndex) => {
      if(getEdges(tileIndex).length === 0)
        return;

      const bounds = getBounds(tileIndex);

      text(`${tileIndex} | ${count}`, bounds.center.x - 0, bounds.center.y - 10);
    }
  );

  if(reduxState.run.state && reduxState.run.state.forks) {
    // textSize(reduxState.maps.current.tileSize / 4);
    // textAlign(CENTER, CENTER);

    reduxState.run.state.forks.forEach(
      (fork, tileIndex) => {
        getForkScores(fork).forEach(
          (score, tileIndex) => {
            const bounds = getBounds(tileIndex);

            text(`${floor(score * 100)}%`, bounds.center.x, bounds.center.y);
          }
        );
      }
    );
  }
  // if(reduxState.run.state && reduxState.run.state.visited) {
  //   textSize(reduxState.maps.current.tileSize / 2);
  //   textAlign(CENTER, CENTER);

  //   reduxState.run.state.visited.forEach(
  //     (value, key) => {
  //       const tileIndex = key;
  //       const bounds = getBounds(tileIndex);

  //       text(value, bounds.center.x, bounds.center.y);
  //     }
  //   );
  // }
  // if(reduxState.run.intelligence) {
  //   textSize(reduxState.maps.current.tileSize / 6);
  //   textAlign(CENTER, CENTER);

  //   reduxState.run.intelligence.qualityMap.forEach(
  //     (value, key) => {
  //       const tileIndex = +key;
  //       const bounds = getBounds(tileIndex);

  //       for(let v of value) {
  //         if(v[1] === "moveLeft") {
  //           text(v[0].toFixed(2), bounds.center.x - 10, bounds.center.y);
  //         } else if(v[1] === "moveUp") {
  //           text(v[0].toFixed(2), bounds.center.x, bounds.center.y - 10);
  //         } else if(v[1] === "moveRight") {
  //           text(v[0].toFixed(2), bounds.center.x + 10, bounds.center.y);
  //         } else if(v[1] === "moveDown") {
  //           text(v[0].toFixed(2), bounds.center.x, bounds.center.y + 10);
  //         }
  //       }
  //     }
  //   );
  // }
}

var acceleration;
var velocity;
var position;

function applyForce(force) {
  acceleration.add(force);
}

function arrive(target, multiplier) {
  const desired = abc.Vector.sub(target, position);

  const d = desired.mag();

  if(d < 40)
    desired.setMag(map(d, 0, 40, 0, maxSpeed));
  else
    desired.setMag(maxSpeed);

  desired.mult(multiplier);

  const steer = abc.Vector.sub(desired, velocity);
  steer.limit(maxForce * multiplier * multiplier);

  return steer;
}

const radius = 4;
const maxSpeed = 3;
const maxForce = .2;

function drawDog(multiplier) {
  if(reduxState.run.targetTileIndex < 0)
    return;

  if(!reduxState.run.paused) {
    applyForce(arrive(getBounds(reduxState.run.targetTileIndex).center, multiplier));

    velocity.add(acceleration);
    velocity.limit(maxSpeed * multiplier);

    position.add(velocity);

    acceleration.mult(0);

    const tileIndex = mouseToIndex(position.x, position.y);

    if(tileIndex > -1 && reduxState.run.currentTileIndex !== tileIndex)
      store.dispatch({ type: "run/currentTileIndex", payload: tileIndex });
  }

  fill(51);

  push();
  translate(position.x, position.y);
  rotate(velocity.heading() + HALF_PI);
  // stroke(0);
  triangle(
    0, -radius * 2,
    -radius, radius * 2,
    radius, radius * 2
  );
  pop();
}

function mousePressed() {
  handleMouse(true);
}
function mouseDragged() {
  handleMouse();
}

// TODO: Use new p5 instance instead of global one
// Exposes functions to p5
Object.assign(window, {
  setup,
  draw,
  mousePressed,
  mouseDragged,
});


// TODO: Should be private
window.createBoard = function createBoard(config) {
  const s = config.size * config.tileSize;

  const canvas = createCanvas(s, s);
  canvas.parent("canvas-container");
}
window.createPlayer = function createPlayer(config) {
  acceleration = createVector();
  velocity = createVector();
  position = getBounds(reduxState.maps.current.startIndex).center;
}

var selectedTileIndex = -1;
var targetTileIndex = -1;
function handleMouse(initial) {
  const tileIndex = mouseToIndex(mouseX, mouseY);

  if(tileIndex < 0)
    return;

  const { selectedType } = reduxState.maps;

  if(selectedType === 0)
    store.dispatch({ type: "maps/current/startIndex", payload: tileIndex });
  else if(selectedType === 1)
    store.dispatch({ type: "maps/current/endIndex", payload: tileIndex });
  else if(selectedType === 2) {
    if(initial) {
      selectedTileIndex = tileIndex;
      targetTileIndex = -1;
    } else if(selectedTileIndex !== tileIndex)
      targetTileIndex = tileIndex;

    if(selectedTileIndex > -1 && targetTileIndex > -1) {
      store.dispatch({ type: "maps/current/toggleEdge", payload: [ selectedTileIndex, targetTileIndex ] });

      selectedTileIndex = targetTileIndex;
      targetTileIndex = -1;
    }
  } else if(selectedType === 3) {
    if(initial) {
      selectedTileIndex = tileIndex;
      targetTileIndex = tileIndex;
    } else if(selectedTileIndex !== tileIndex)
      targetTileIndex = tileIndex;

    if(selectedTileIndex > -1 && targetTileIndex > -1) {
      store.dispatch({ type: "maps/current/toggleFood", payload: targetTileIndex });

      selectedTileIndex = targetTileIndex;
      targetTileIndex = -1;
    }
  }
}