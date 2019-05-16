let modes;
// let maps;
let currentMap;

function setup() {
  // const configs = [
  //   // map1,
  //   // map2,
  //   map3,
  // ];

  setupTypes();

  modes = new Modes;
  modes.setCurrent(modes.train);

  // let x = 10, y = 50, h = 0;
  // maps = configs.map(
  //   (config) => {
  //     const map = new Map(x, y, config);
  //     x += map.bounds.width + 10 + 400;
  //     h = max(map.bounds.bottom + 10, h);

  //     return map;
  //   }
  // );

  createMap(maps[2]);

  const map = currentMap;

  frameRate(30);
  createCanvas(map.bounds.right + 10 + 400, map.bounds.bottom + 10);
}

function draw() {
  background(255);

  modes.update();

  // for(let map of maps)
  //   map.update();

  currentMap.update();
}

function keyTyped() {
  modes.keyboard();
}

function mousePressed() {
  handleMouse();
}
function mouseDragged() {
  handleMouse();
}

function createMap(config) {
  let x = 10, y = 90;

  currentMap = new Map(x, y, config);
}

function handleMouse() {
  modes.mouse();
}
