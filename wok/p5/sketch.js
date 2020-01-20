import "p5";
import Grid from "../models/Grid";

let xInput,
  yInput,
  zInput,
  setSizebutton,
  placeRandomTilesButton,
  titleText,
  xText,
  yText,
  zText,
  grid,
  tiles = [];

const tileSize = 80;
const gap = 0;

function setup() {
  frameRate(30);

  const canvas = createCanvas(1280, 960, WEBGL);
  canvas.parent("canvas-container");

  createCubeConfigForm(10, 0);
}

function createCubeConfigForm(posX, posY) {
  titleText = createElement("h2", "Cube Config");
  titleText.position(posX + 20, posY + 5);

  xText = createElement("p", "X:");
  xText.position(posX + 5, posY + 45);

  yText = createElement("p", "Y:");
  yText.position(posX + 5, posY + 75);

  zText = createElement("p", "Z:");
  zText.position(posX + 5, posY + 105);

  xInput = createInput();
  xInput.position(posX + 25, posY + 60);

  yInput = createInput();
  yInput.position(posX + 25, posY + 90);

  zInput = createInput();
  zInput.position(posX + 25, posY + 120);

  setSizebutton = createButton("Set Size");
  setSizebutton.position(posX + 75, posY + 150);
  setSizebutton.mousePressed(onSetCubeSize);
  placeRandomTilesButton = createButton("Place RandomTiles");
  placeRandomTilesButton.position(posX + 75, posY + 100);
  placeRandomTilesButton.hide();
  placeRandomTilesButton.mousePressed(onPlaceRandomTiles);
}

function onPlaceRandomTiles() {
  //clear previous tiles
  /*tiles.splice(0, tiles.length);
  for (let tile of grid.tiles) {
    tile.type = 0;
  }*/
  //end clear previous tiles
  let x = Math.round(Math.random() * (xInput.value() - 1));
  let y = Math.round(Math.random() * (yInput.value() - 1));
  let z = Math.round(Math.random() * (zInput.value() - 1));
  tiles.push(x + "|" + y + "|" + z);
  for (let key of tiles) {
    const c = key.split("|").map(i => +i);
    grid.get(grid.toIndex(...c)).type = tiles[key];
  }
}

function hideCubeForm() {
  titleText.hide();

  xText.hide();
  yText.hide();
  zText.hide();

  xInput.hide();
  yInput.hide();
  zInput.hide();

  setSizebutton.hide();
  placeRandomTilesButton.show();
}

function onSetCubeSize() {
  hideCubeForm();
  if (xInput.value() != "" && yInput.value() != "" && zInput.value() != "") {
    grid = new Grid(
      parseInt(xInput.value()),
      parseInt(yInput.value()),
      parseInt(zInput.value())
    );
    for (let key of tiles) {
      const c = key.split("|").map(i => +i);
      grid.get(grid.toIndex(...c)).type = map.tiles[key];
    }
  }
}

function draw() {
  background(255);

  normalMaterial();
  // rotateX(-mouseY * .01);
  rotateX(-0.5);
  rotateY(mouseX * 0.01);

  if (grid != null) {
    translate(
      -0.5 * (tileSize + gap) * grid.size.x,
      -0.5 * (tileSize + gap) * grid.size.y,
      -0.5 * (tileSize + gap) * grid.size.z
    );
    for (let x = 0; x < grid.size.x + 1; ++x) {
      for (let y = 0; y < grid.size.y + 1; ++y) {
        for (let z = 0; z < grid.size.z + 1; ++z) {
          push();
          translate(
            (tileSize + gap) * x,
            (tileSize + gap) * y,
            (tileSize + gap) * z
          );
          sphere(10 * 0.5);
          pop();
        }
      }
    }

    for (let x = 0; x < grid.size.x; ++x) {
      for (let y = 0; y < grid.size.y; ++y) {
        for (let z = 0; z < grid.size.z; ++z) {
          const tile = grid.get(grid.toIndex(x, y, z));
          if (tile.isEmpty()) continue;

          push();
          translate(
            (tileSize + gap) * (x + 0.5),
            (tileSize + gap) * (y + 1),
            (tileSize + gap) * (z + 0.5)
          );
          rotateX(PI * -0.5);
          plane(tileSize + gap);
          pop();
        }
      }
    }
  }
}

function mousePressed() {}
function mouseDragged() {}

// TODO: Use new p5 instance instead of global one
// Exposes functions to p5
Object.assign(window, {
  setup,
  draw,
  mousePressed,
  mouseDragged
});
