import "p5";

import grid from "./grid";

function setup() {
  frameRate(30);

  const canvas = createCanvas(1280, 960, WEBGL);
  canvas.parent("canvas-container");
}

const tileSize = 80;
const gap = 0;
function draw() {
  background(255);

  normalMaterial();

  // rotateX(-mouseY * .01);
  rotateX(-.5);
  rotateY(mouseX * .01);

  translate(
    -.5 * (tileSize + gap) * grid.size.x,
    -.5 * (tileSize + gap) * grid.size.y,
    -.5 * (tileSize + gap) * grid.size.z,
  );
  // translate(
  //   .5 * (tileSize + gap) - .5 * (tileSize + gap) * grid.size.x,
  //   .5 * (tileSize + gap) - .5 * (tileSize + gap) * grid.size.y,
  //   .5 * (tileSize + gap) - .5 * (tileSize + gap) * grid.size.z,
  // );

  for(let x = 0; x < grid.size.x + 1; ++x) {
    for(let y = 0; y < grid.size.y + 1; ++y) {
      for(let z = 0; z < grid.size.z + 1; ++z) {
        push();
        translate(
          (tileSize + gap) * x,
          (tileSize + gap) * y,
          (tileSize + gap) * z,
        );
        sphere(10 * .5);
        pop();
      }
    }
  }

  for(let x = 0; x < grid.size.x; ++x) {
    for(let y = 0; y < grid.size.y; ++y) {
      for(let z = 0; z < grid.size.z; ++z) {
        const tile = grid.get(grid.toIndex(x, y, z));
        if(tile.isEmpty())
          continue;

        push();
        translate(
          (tileSize + gap) * (x + .5),
          (tileSize + gap) * (y + 1),
          (tileSize + gap) * (z + .5),
        );
        rotateX(PI * -.5);
        plane(tileSize + gap);
        pop();
      }
    }
  }
}

function mousePressed() {

}
function mouseDragged() {

}

// TODO: Use new p5 instance instead of global one
// Exposes functions to p5
Object.assign(window, {
  setup,
  draw,
  mousePressed,
  mouseDragged,
});