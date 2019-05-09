// A | B | C
// ---------
// ctr |   A
//
// ctr: train, cancel; play, stop

let modes;
let maps;

function setup() {
  const configs = [
    mapSmall,
    // mapMedium,
  ];

  modes = new Modes;
  modes.setCurrent(modes.place);

  let x = 10, y = 10, h = 0;
  maps = configs.map(
    (config) => {
      const map = new Map(x, y, config);
      x += map.bounds.width + 10;
      h = max(map.bounds.bottom + 10, h);

      return map;
    }
  );

  frameRate(30);
  createCanvas(x, h);

  // var button = createButton("WALL");
  // button.position(10, 10);
  // button.mousePressed(changeBG);
}

function draw() {
  modes.update();

  for(let map of maps)
    map.update();
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

function handleMouse() {
  modes.mouse();
}

const speedMax = 2;
const speedAcc = .1;
const speedDec = .2;
var speed = 0;

// class Player {
//   constructor(index) {
//     this.size = 10;
//     this.rotation = PI * 1.5;
//     this.score = 0;
//     this.index = -1;
//
//     this.acceleration = createVector(0, 0);
//     this.velocity = createVector(0, 0);
//     this.r = 4;
//     this.maxSpeed = 1;    // Maximum speed
//     this.maxForce = 0.5; // Maximum steering force
//
//     const x = index % w;
//     const y = floor(index / w);
//     this.setPosition(tileSize * (x + .5), tileSize * (y + .5));
//   }
//
//   setPosition(x, y) {
//     const index = getIndex(x, y);
//
//     if(!isWalkable(_map[index]))
//       return false;
//
//     // if(this.index > -1) {
//     //   let desired = p5.Vector.sub(createVector(x, y), this.position);
//     //
//     //   // let d = desired.mag();
//     //   // if (d <= 100) {
//     //   //   let m = map(d, 0, 100, 0, this.maxSpeed);
//     //   //   desired.setMag(m);
//     //   // } else {
//     //   //   desired.setMag(this.maxSpeed);
//     //   // }
//     //
//     //   let steering = p5.Vector.sub(desired, this.velocity);
//     //   // steering.limit(this.maxForce);
//     //   this.acceleration.add(steering);
//     //   // this.acceleration.limit(this.maxSpeed);
//     //
//     //   this.velocity.add(this.acceleration);
//     //   this.velocity.limit(this.maxSpeed);
//     //   this.position.add(this.velocity);
//     //   // this.acceleration.set(0, 0);
//     // }
//
//     if(this.index != index) {
//       if(this.index > -1) {
//         this.score += getReward(_map[index]);
//         this.score += stepCost;
//       } else
//         this.position = createVector(x, y);
//
//       this.index = index;
//
//       if(_map[index] == REWARD)
//         _map[index] = FLOOR;
//     }
//
//     this.x = this.position.x;
//     this.y = this.position.y;
//
//     return true;
//   }
//
//   // moveX(delta) {
//   //   let theta = this.acceleration.heading();
//   //
//   //   this.acceleration.add(createVector(cos(theta + delta), sin(theta + delta)));
//   // }
//   // moveY(delta) {
//   //   let theta = this.acceleration.heading();
//   //
//   //   // this.setPosition(this.x, this.y + delta);
//   //   this.applyForce(this.seek(createVector(this.position.x + cos(theta), this.position.y + sin(theta))));
//   // }
//   //
//   // seek(target) {
//   //   const desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
//   //
//   //   // Scale to maximum speed
//   //   desired.setMag(this.maxSpeed);
//   //
//   //   // Steering = Desired minus velocity
//   //   const steer = p5.Vector.sub(desired, this.velocity);
//   //   steer.limit(this.maxForce); // Limit to maximum steering force
//   //
//   //   return steer;
//   //   //this.applyForce(steer);
//   // }
//
//   update() {
//     const theta = this.velocity.heading();
//
//     this.acceleration.add(createVector(cos(theta + steer), sin(theta + steer * speed)));
//
//     this.velocity.add(this.acceleration);
//     this.velocity.limit(speed);
//     // if(this.setPosition(this.velocity.x, this.velocity.y))
//     this.position.add(this.velocity);
//     this.acceleration.mult(0);
//   }
//
//   applyForce(force) {
//     // We could add mass here if we want A = F / M
//     this.acceleration.add(force);
//   }
//
//   boundaries() {
//     const d = 25;
//
//     let desired = null;
//
//     if (this.position.x < d) {
//       desired = createVector(this.maxSpeed, this.velocity.y);
//     } else if (this.position.x > width - d) {
//       desired = createVector(-this.maxSpeed, this.velocity.y);
//     }
//
//     if (this.position.y < d) {
//       desired = createVector(this.velocity.x, this.maxSpeed);
//     } else if (this.position.y > height - d) {
//       desired = createVector(this.velocity.x, -this.maxSpeed);
//     }
//
//     if (desired !== null) {
//       desired.normalize();
//       desired.mult(this.maxSpeed);
//       const steer = p5.Vector.sub(desired, this.velocity);
//       steer.limit(this.maxForce);
//       this.applyForce(steer);
//     }
//   }
//
//   draw() {
//     fill(51);
//     // ellipse(this.x, this.y, this.size, this.size);
//
//     let theta = this.velocity.heading() + PI * .5;
//
//     push();
//     translate(this.position.x, this.position.y);
//     rotate(theta);
//     beginShape();
//     vertex(0, -this.r * 2);
//     vertex(-this.r, this.r * 2);
//     vertex(this.r, this.r * 2);
//     endShape(CLOSE);
//     pop();
//   }
// }
