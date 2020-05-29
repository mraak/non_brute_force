import "p5";

// import { grid, map, setSize, setMap, size } from "../store";
// import { RANDOM_SEED } from "../tf/gan";
import { guess, test, train } from "../tf";

// let xInput,
//   yInput,
//   zInput,
//   mapJsonTextArea;

// const tileSize = 80;
// const mapTileSize = 20;

// var leftMapBounds;
// var rightMapBounds;

// function init() {
//   setSize({ x: 7, y: 5, z: 5 });
//   // setMap([
//   //   0, 0, 0, 0, 0, 0, 0,
//   //   0, 0, 0, 0, 0, 1, 0,
//   //   0, 1, 1, 0, 0, 1, 1,
//   //   0, 0, 0, 0, 0, 0, 0,
//   //   0, 0, 0, 0, 0, 0, 0,

//   //   0, 0, 0, 0, 1, 0, 0,
//   //   0, 0, 1, 1, 1, 1, 0,
//   //   1, 1, 1, 1, 1, 1, 1,
//   //   0, 1, 0, 0, 1, 1, 1,
//   //   0, 0, 0, 0, 0, 1, 0,

//   //   0, 0, 0, 0, 0, 0, 0,
//   //   0, 1, 1, 1, 1, 1, 0,
//   //   1, 1, 1, 1, 1, 1, 0,
//   //   0, 1, 1, 1, 1, 1, 0,
//   //   0, 0, 0, 0, 0, 0, 0,

//   //   0, 0, 0, 0, 1, 0, 0,
//   //   0, 0, 0, 1, 1, 0, 0,
//   //   0, 1, 1, 1, 1, 1, 0,
//   //   0, 1, 1, 1, 1, 0, 0,
//   //   0, 0, 1, 1, 0, 0, 0,

//   //   0, 0, 0, 0, 1, 0, 0,
//   //   0, 0, 0, 1, 1, 0, 0,
//   //   0, 0, 1, 1, 1, 1, 0,
//   //   0, 0, 1, 1, 1, 0, 0,
//   //   0, 0, 1, 1, 0, 0, 0,
//   // ]);

//   setSize({ x: 4, y: 3, z: 2 });
//   setMap([
//     1, 0, 1, 1,
//     0, 1, 0, 1,
//     0, 1, 0, 1,

//     0, 1, 1, 1,
//     0, 0, 0, 1,
//     0, 0, 0, 1,

//     // 0, 1, 1, 0,
//     // 0, 0, 0, 1,
//     // 0, 0, 0, 1,
//   ]);
// }

const W = 1280, H = 960;

// 0 idle
// 1 training
// 2 guessing
let phase = 0;

let font;

function preload() {
  font = loadFont(require("../fonts/Roboto.ttf"));
}

function setup() {
  // frameRate(30);
  frameRate(12);
  // noLoop();

  randomSeed(123);

  const canvas = createCanvas(W, H, WEBGL);
  canvas.parent("canvas-container");

  textFont(font);
  textAlign(CENTER, CENTER);
  textSize(24);

  const trainButton = createButton("train");
  trainButton.position(20, 60);
  trainButton.mousePressed(async() => {
    phase = 1;

    console.log("begin training", ++trainCount);
    await train();
    console.log("end training", trainCount);

    await test();

    phase = 2;
  });

  const guessButton = createButton("guess");
  guessButton.position(20, 80);
  guessButton.mousePressed(async() => {
    console.log("guessing");
    const response = await guess(drawing);
    console.log("guessed", response.argMax(1).dataSync()[0], Array.from(response.dataSync()));
  });

  // init();

  // ui(10, 0);

  // const generateButton = createButton("generate");
  // generateButton.position(20, 20);
  // generateButton.mousePressed(generateButtonClickHandler);
}

let trainCount = 0;
// async function generateButtonClickHandler() {
//   console.log("begin training", ++trainCount);
//   await train();
//   console.log("end training", trainCount);

//   await test();

//   // for(let i = 0; i < 100; i += 5) {
//   //   const response = await guess(i);
//   //   const data = await response.data();

//   //   // console.log(i, "should be group", toGroup(i), response.toString());
//   //   console.log(i, "should be group", toGroup(i), Array.from(data).map((i) => i.toFixed(2)));
//   // }
// }

// function ui(posX, posY) {
//   const titleText = createElement("h2", "Cube Config");
//   titleText.position(posX + 20, posY + 5);

//   const xText = createElement("p", "X:");
//   xText.position(posX + 5, posY + 45);

//   const yText = createElement("p", "Y:");
//   yText.position(posX + 5, posY + 75);

//   const zText = createElement("p", "Z:");
//   zText.position(posX + 5, posY + 105);

//   xInput = createInput();
//   xInput.position(posX + 25, posY + 60);

//   yInput = createInput();
//   yInput.position(posX + 25, posY + 90);

//   zInput = createInput();
//   zInput.position(posX + 25, posY + 120);

//   const setSizeButton = createButton("Set Size");
//   setSizeButton.position(posX + 75, posY + 150);
//   setSizeButton.mousePressed(setSizeButtonClickHandler);

//   mapJsonTextArea = createElement("textarea").size(200, 100);
//   mapJsonTextArea.input(mapJsonTextAreaChangeHandler);
//   mapJsonTextArea.position(posX + 1000, posY + 10);

//   map.watch((map) => mapJsonTextArea.value(JSON.stringify(map)));

//   size.watch(({ x, y, z }) => {
//     xInput.value(`${x}`);
//     yInput.value(`${y}`);
//     zInput.value(`${z}`);
//   });
// }

// function mapJsonTextAreaChangeHandler() {
//   try {
//     const map = JSON.parse(mapJsonTextArea.elt.value);

//     setMap(map);
//   } catch(error) {
//     console.error(error);
//   }
// }
// function setSizeButtonClickHandler() {
//   const x = +xInput.value();
//   const y = +yInput.value();
//   const z = +zInput.value();

//   setSize({ x, y, z });
// }

let dragging = -1;
function mousePressed() {
  const dx = 20,
        dy = 100,
        dw = 6 * 20,
        dh = 6 * 20;

  if(inside([ dx, dy, dw, dh ])) {
    const l = [ mouseX - dx, mouseY - dy ];
    const x = floor(l[0] / 20);
    const y = floor(l[1] / 20);
    const i = x + y * 6;

    dragging = drawing[i] = (drawing[i] + 1) % 2;
  } else
    dragging = -1;
}
function mouseReleased() {
  dragging = -1;
}
function mouseDragged() {
  if(dragging < 0)
    return;

  const dx = 20,
        dy = 100,
        dw = 6 * 20,
        dh = 6 * 20;

  if(inside([ dx, dy, dw, dh ])) {
    const l = [ mouseX - dx, mouseY - dy ];
    const x = floor(l[0] / 20);
    const y = floor(l[1] / 20);
    const i = x + y * 6;

    drawing[i] = dragging;
  }
}
// function mousePressed() {
//   const g = grid.getState();
//   const { size } = g;
//   const m = map.getState();

//   if(inside(leftMapBounds)) {
//     const l = [ mouseX - leftMapBounds[0], mouseY - leftMapBounds[1] ];
//     const x = floor(l[0] / mapTileSize);
//     const z = floor(l[1] / (mapTileSize * (size.y + 1)));
//     const y = floor(l[1] / mapTileSize) - (size.y + 1) * z;

//     if(x < size.x && y < size.y && z < size.z) {
//       const i = g.toIndex(x, y, z);

//       if(m[i] > 0)
//         m[i] = 0;
//       else
//         m[i] = 1;

//       setMap([ ...m ]);
//     }
//   } else if(inside(rightMapBounds)) {
//     const l = [ mouseX - rightMapBounds[0], mouseY - rightMapBounds[1] ];
//     const x = floor(l[0] / mapTileSize);
//     const z = floor(l[1] / (mapTileSize * (size.y + 1)));
//     const y = floor(l[1] / mapTileSize) - (size.y + 1) * z;

//     if(x < size.x && y < size.y && z < size.z) {
//       const i = g.toIndex(x, y, z);

//       if(m[i] === 1)
//         m[i] = 2;
//       else if(m[i] === 2)
//         m[i] = 1;

//       setMap([ ...m ]);
//     }
//   }
// }
// function mouseDragged() {}

let zeroIndex = 0;
function draw() {
  background(220);

  // const g = grid.getState();

  // if(!g)
  //   return;

  // drawPreview(g);

  // aligns to top left
  translate(-W / 2, -H / 2, 0);
  // drawLeftMap(g);
  // drawRightMap(g);

  fill(0);
  text(`phase: ${phase === 2 ? "GUESS" : phase === 1 ? "TRAIN" : "IDLE"}`, 80, 20);

  // drawShape(zeros[zeroIndex], [ 20, 100 ]);
  // zeroIndex = (zeroIndex + 1) % zeros.length;

  drawShape(drawing, [ 20, 100 ]);
}

let drawing = Array.from(Array(36), () => 0);

function drawShape(shape, p) {
  push();

  translate(...p);

  for(let i = 0; i < 36; ++i) {
    const x = i % 6;
    const y = floor(i / 6);

    if(shape[i] === 1)
      fill(158, 158, 158);
    else
      fill(255);

    stroke(0);

    rect(x * 20, y * 20, 20, 20);
  }

  pop();
}

// function drawLeftMap(grid) {
//   leftMapBounds = [
//     mapTileSize,
//     240,
//     grid.size.x * mapTileSize,
//     ((grid.size.y + 1) * grid.size.z - 1) * mapTileSize,
//   ];

//   push();

//   translate(mapTileSize, 240, 0);

//   for(let i = 0, n = grid.tiles.length; i < n; ++i) {
//     const { x, y, z } = grid.fromIndex(i);

//     let xpos = x * mapTileSize;
//     let ypos = y * mapTileSize;
//     let zpos = z * (grid.size.y + 1) * mapTileSize;

//     if(grid.get(i).type == 1)
//       fill(158, 158, 158);
//     else if(grid.get(i).type == 2)
//       fill(58, 18, 15);
//     else
//       fill(255);

//     stroke(0);

//     rect(xpos, ypos + zpos, mapTileSize, mapTileSize);
//   }

//   pop();
// }
// function drawRightMap(grid) {
//   rightMapBounds = [
//     W - (grid.size.x + 1) * mapTileSize,
//     240,
//     grid.size.x * mapTileSize,
//     ((grid.size.y + 1) * grid.size.z - 1) * mapTileSize,
//   ];

//   push();

//   translate(W - (grid.size.x + 1) * mapTileSize, 240, 0);

//   for(let i = 0, n = grid.tiles.length; i < n; ++i) {
//     const { x, y, z } = grid.fromIndex(i);

//     let xpos = x * mapTileSize;
//     let ypos = y * mapTileSize;
//     let zpos = z * (grid.size.y + 1) * mapTileSize;

//     if(grid.get(i).type == 1)
//       fill(158, 158, 158);
//     else if(grid.get(i).type == 2)
//       fill(58, 18, 15);
//     else
//       fill(255);

//     stroke(0);

//     rect(xpos, ypos + zpos, mapTileSize, mapTileSize);
//   }

//   pop();
// }
// function drawPreview(grid) {
//   push();

//   // normalMaterial();
//   ambientLight(158, 158, 158);

//   //rotateX(-mouseY * .01);
//   rotateX(-.5);
//   rotateY(mouseX * .01);

//   translate(
//     -.5 * tileSize * grid.size.x,
//     -.5 * tileSize * grid.size.y,
//     -.5 * tileSize * grid.size.z
//   );

//   for(let i = 0, n = grid.tiles.length; i < n; ++i) {
//     const tile = grid.get(i);

//     if(tile.type === 0)
//       continue;

//     const { x, y, z } = grid.fromIndex(i);

//     push();

//     translate(
//       tileSize * (x + .5),
//       tileSize * (z + 1),
//       tileSize * (y + .5)
//     );
//     rotateX(PI * -.5);

//     if(tile.type === 1)
//       fill(158, 158, 158);
//     else if(tile.type === 2)
//       fill(0, 0, 158);

//     plane(tileSize);

//     // box(tileSize - 1, tileSize - 1, tileSize - 1);

//     pop();
//   }

//   pop();
// }

function inside([ x, y, w, h ]) {
  return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
}

// TODO: Use new p5 instance instead of global one
// Exposes functions to p5
Object.assign(window, {
  preload,
  setup,
  draw,
  mousePressed,
  mouseReleased,
  mouseDragged,
});
