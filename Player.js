const stepCost = -.1;

function distancePointBounds(point, bounds) {
  var dx = 0;
  var dy = 0;

  if(point.x < bounds.left)
    dx = bounds.left - point.x;
  else if(point.x > bounds.right)
    dx = bounds.right - point.x;

  if(point.y < bounds.top)
    dy = bounds.top - point.y;
  else if(point.y > bounds.bottom)
    dy = bounds.bottom - point.y;

  return floor(sqrt(dx * dx + dy * dy));
}

class Player {
  constructor(map, id) {
    this.map = map;
    this.id = id;

    this.radius = 4;

    this.maxSpeed = 3;
    this.maxForce = .2;

    this.states = new PlayerStates(this);

    this.pathLength = map.paths.length ? map.paths[0].length : 0;
    this.counted = map.tiles.map(
      () => 0
    );

    this.foodInSight = [];

    this.iterationIndex = 0;
  }

  setIterationIndex(iterationIndex) {
    this.iterationIndex = iterationIndex;

    const { map } = this;

    map.resetTiles();
    map.updateTiles(map.iterations[iterationIndex - 1], REWARD);
  }

  nextIteration() {
    const { map } = this;

    map.log.unshift(`player ${this.id} started ${this.iterationIndex}. iteration`);

    this.tileIndex = map.startIndex;

    const tile = map.get(this.tileIndex);

    this.position = createVector(tile.bounds.centerX, tile.bounds.centerY);

    this.acceleration = createVector(0, 0);
    this.velocity = createVector(0, 0);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  setPosition(x, y) {
    const { map } = this;

    const tileIndex = map.localToIndex(x, y);

    const tile = map.get(tileIndex);

    if(this.tileIndex != tileIndex) {
      delete this.targetTileIndex;

      this.counted = this.counted.map(
        (count) => count == 0 ? 0 : count - 1
      );
      this.counted[this.tileIndex] = this.pathLength;

      this.previousTileIndex = this.tileIndex;

      this.tileIndex = tileIndex;

      const currentTile = map.get(tileIndex);

      if(currentTile.type == REWARD)
        currentTile.setType(FLOOR);
    }
  }

  update() {
    const { map, radius } = this;

    const state = this.states.update();

    if(!map.paused) {
      if(state)
        this.applyForce(state);

      const avoid = this.avoidWalls();
      avoid.mult(4);
      this.applyForce(avoid);

      this.velocity.add(this.acceleration);
      this.velocity.limit(this.maxSpeed);

      this.position.add(this.velocity);

      this.acceleration.mult(0);

      this.setPosition(this.position.x, this.position.y);
    }

    this.foodInSight = [
      ...map.getTargets(this.tileIndex, END),
      ...map.getTargets(this.tileIndex, REWARD),
    ];

    this.drawArrows();

    fill(51);

    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading() + HALF_PI);
    stroke(0);
    triangle(
      0, -radius * 2,
      -radius, radius * 2,
      radius, radius * 2
    );
    pop();
  }

  avoidWalls() {
    let count = 0;

    let steer = createVector(0, 0);

    for(let tile of this.map.tiles) {
      if(isWalkable(tile.type))
        continue;

      const d = distancePointBounds(this.position, tile.bounds);

      if(d > 0 && d < 14) {
        let diff = p5.Vector.sub(this.position, tile.bounds.center);
        diff.normalize();
        diff.div(d);

        steer.add(diff);

        ++count;
      }
    }

    if(count > 0)
      steer.div(count);

    if(steer.mag() > 0) {
      steer.normalize();
      steer.mult(this.maxSpeed);
      steer.sub(this.velocity);
      steer.limit(this.maxForce);
    }

    return steer;
  }

  seek(target) {
    const desired = p5.Vector.sub(target, this.position);
    desired.setMag(this.maxSpeed);

    const steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);

    return steer;
  }

  arrive(target) {
    const desired = p5.Vector.sub(target, this.position);

    const d = desired.mag();

    if(d < 40)
      desired.setMag(map(d, 0, 40, 0, this.maxSpeed));
    else
      desired.setMag(this.maxSpeed);

    const steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);

    return steer;
  }

  drawArrows() {
    const { map, tileIndex } = this;
    const { paths } = map;

    const tile = map.get(tileIndex);

    var set = new Set;

    for(let path of paths) {
      const pathIndex = path.indexOf(tileIndex);

      if(pathIndex < 0)
        continue;

      const toIndex = path[pathIndex + 1];

      if(toIndex > -1)
        set.add(toIndex);
    }

    for(let targetIndex of set) {
      const target = map.get(targetIndex);

      if(!target)
        continue;

      const p = p5.Vector.sub(target.bounds.center, tile.bounds.center);
      p.div(2);

      push();
      translate(tile.bounds.centerX + p.x, tile.bounds.centerY + p.y);
      rotate(p.heading() + HALF_PI);
      noStroke();
      fill(green);
      triangle(
        0, -16,
        -8, 0,
        8, 0
      );
      pop();
    }
  }
}
