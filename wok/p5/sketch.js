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
  _JsonText,
  loadBtn,
  grid,
  tiles = [];

const tileSize = 80;
const gap = 0;

let planes = [];
let clickablePlanes = [
  [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]
  ],
  [
    [0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 0]
  ],
  [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0]
  ],
  [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0]
  ],
  [
    [0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0]
  ]
];

function setup() {
  frameRate(30);

  const canvas = createCanvas(1280, 960, WEBGL);
  canvas.parent("canvas-container");

  createCubeConfigForm(10, 0);

  createCopyCubeConfig(10, 0);
}

function createCopyCubeConfig(posX, posY) {
  _JsonText = createElement("textarea").size(200, 100);
  var myJSON = JSON.stringify(planes);

  _JsonText.value(myJSON);
  _JsonText.input(onChanged);

  _JsonText.position(posX + 1000, posY + 10);
}

function onChanged() {
  var error = false;
  try {
    planes = JSON.parse(_JsonText.elt.value);
  } catch (error) {
    error = true;
  }
  if (error == false) TilesChangeFromJson();
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

  placeRandomTilesButton = createButton("randomTiles");
  placeRandomTilesButton.position(posX + 75, posY + 10);
  placeRandomTilesButton.mousePressed(onPlaceRandomTiles);
  placeRandomTilesButton.hide();
}

function onPlaceRandomTiles() {
  placeRandomTile(yInput.value() - 1);

  for (let key of tiles) {
    const c = key.split("|").map(i => +i);
    grid.get(grid.toIndex(...c)).type = tiles[key];
  }
}

function placeRandomTile(_y) {
  var n = 2 + Math.round(Math.random() * 4);
  for (let i = 0; i < n; i++) {
    let x = Math.round(Math.random() * (xInput.value() - 1));
    let y = _y;
    let z = Math.round(Math.random() * (zInput.value() - 1));
  }
  --_y;
  if (_y >= 0) {
    placeRandomTile(_y);
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

  planes = [];
  for (let i = 0; i < yInput.value(); i++) {
    let plane = [];
    for (let k = 0; k < zInput.value(); k++) {
      let rows = [];
      for (let j = 0; j < xInput.value(); j++) {
        // console.log(clickablePlanes[i][k][j]);
        rows.push(clickablePlanes[i][k][j]);
      }
      plane.push(rows);
    }
    planes.push(plane);
  }

  var myJSON = JSON.stringify(planes);

  _JsonText.value(myJSON);
}

function draw1() {
  //normalMaterial();
  ambientLight(130, 130, 130);

  //rotateX(-mouseY * 0.01);
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
          // sphere(10 * 1);

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
          // plane(tileSize + gap);
          // fill(0, 0, 250);

          box(tileSize - 1, tileSize - 1, tileSize - 1);

          pop();
        }
      }
    }
  }
}

function TilesChangeFromJson() {
  for (let y = 0; y < planes.length; y++) {
    for (let z = 0; z < planes[y].length; z++) {
      for (let x = 0; x < planes[y][z].length; x++) {
        var name = x + "|" + y + "|" + z;
        if (planes[y][z][x] == 0) {
          removeTile(name);
          const c = name.split("|").map(i => +i);
          grid.get(grid.toIndex(...c)).type = 0;
        } else {
          tiles.push(name);
        }
        for (let key of tiles) {
          if (planes[y][z][x] == 1) {
            const c = key.split("|").map(i => +i);
            grid.get(grid.toIndex(...c)).type = 1;
          }
        }
      }
    }
  }
}

function mousePressed() {
  let bx;
  let by;
  let boxSize = 20;
  var update = false;
  for (let index = 0; index < planes.length; index++) {
    for (let y = 0; y < planes[index].length; y++) {
      by = (index + 1) * 150 + y * 20;
      for (let x = 0; x < planes[index][y].length; x++) {
        bx = x * boxSize;
        if (
          mouseX > bx &&
          mouseX < bx + boxSize &&
          mouseY > by &&
          mouseY < by + boxSize
        ) {
          update = true;
          var name = x + "|" + index + "|" + y;

          if (planes[index][y][x] == 1) {
            planes[index][y][x] = 0;
            removeTile(name);
            const c = name.split("|").map(i => +i);
            //grid.get(grid.toIndex(...c)).type = 0;
          } else {
            // if (clickablePlanes[index][y][x] == 1)
            // {
            planes[index][y][x] = 1;
            tiles.push(name);
            //}
          }
          for (let key of tiles) {
            if (planes[index][y][x] == 1) {
              const c = key.split("|").map(i => +i);
              //grid.get(grid.toIndex(...c)).type = 1;
            }
          }
        }
      }
    }
  }
  TilesChangeFromJson();
  if (update) {
    var myJSON = JSON.stringify(planes);

    _JsonText.value(myJSON);
  }
}
function removeTile(name) {
  for (let index = 0; index < tiles.length; index++) {
    if (tiles[index] == name) {
      tiles.splice(index, 1);
    }
  }
}
function mouseDragged() {}
///////////

function draw2() {
  let size = 20;

  translate(1080, -720, 0);
  for (let index = 0; index < planes.length; index++) {
    translate(0, 150, 0);

    for (let y = 0; y < planes[index].length; y++) {
      for (let x = 0; x < planes[index][y].length; x++) {
        let xpos = x * size;
        let ypos = y * size;

        if (planes[index][y][x] == 1) {
          fill(158, 158, 158);
        } else {
          fill(255);
        }
        stroke(255);

        rect(xpos, ypos, size, size);
      }
    }
  }
}
////////////
function draw() {
  background(220);
  textAlign(CENTER, CENTER);
  let size = 20;

  translate(-1280 / 2, -960 / 2, 0);
  for (let index = 0; index < planes.length; index++) {
    translate(0, 150, 0);

    for (let y = 0; y < planes[index].length; y++) {
      for (let x = 0; x < planes[index][y].length; x++) {
        let xpos = x * size;
        let ypos = y * size;

        if (planes[index][y][x] == 1) {
          fill(255);
        } else {
          fill(185, 185, 185);
        }

        stroke(0);

        rect(xpos, ypos, size, size);
      }
    }
  }
  draw2();

  translate(-450, -300, -100);

  draw1();
}

function inside(x, y, w, h) {
  if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
    return true;
  } else {
    return false;
  }
}
// TODO: Use new p5 instance instead of global one
// Exposes functions to p5
Object.assign(window, {
  setup,
  draw,
  mousePressed,
  mouseDragged
});
