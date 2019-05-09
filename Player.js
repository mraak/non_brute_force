const angleSpeed = Math.PI / 16;
const stepCost = -.1;

class Player {
  constructor(map, tileIndex) {
    this.map = map;
    this.tileIndex = tileIndex;

    this.radius = 4;
    this.angle = 0;
    this.speed = 0;

    const tile = map.get(tileIndex);

    this.position = createVector(tile.bounds.centerX, tile.bounds.centerY);

    this.states = new PlayerStates(this);
  }

  applyAngleRatio(ratio) {
    this.angle += ratio * angleSpeed;
  }
  applySpeedRatio(ratio) {
    this.speed = ratio * 2;
  }

  setPosition(x, y) {
    const { map } = this;

    const tileIndex = map.localToIndex(x, y);

    const tile = map.get(tileIndex);

    let walkable = [];
    let correct = false;
    // for(let neighborIndex of tile.neighbors) {
    //   const neighbor = neighborIndex && map.get(neighborIndex);
    //
    //   if(neighbor && isWalkable(neighbor.type)) {
    //     walkable.push(neighbor);
    //
    //     continue;
    //   }
    //
    //   if()
    //
    //   correct = true;
    // }

    if(correct) {
      // const neighbor = walkable[i];

      const direction = -this.angle - HALF_PI;

      // NOTE: setPosition might override position and angle
      this.setPosition(
        x + cos(direction) * this.speed,
        y + sin(direction) * this.speed
      );

      return;
    }

    // console.log(dist(x, y, neighbor.bounds.centerX, neighbor.bounds.centerY));

    // if(isWalkable(tile.type)) {
      this.position.x = x;
      this.position.y = y;

      if(this.tileIndex != tileIndex) {
        if(this.tileIndex > -1) {
          this.score += getReward(tile);
          this.score += stepCost;
        }
        // else
        //   this.position = createVector(x, y);

        this.tileIndex = tileIndex;

        if(map.get(tileIndex).type == REWARD)
          map.get(tileIndex).setType(FLOOR);
      }
    // } else {
    //   const t = map.get(this.tileIndex);
    //
    //   this.position.x = t.bounds.centerX;
    //   this.position.y = t.bounds.centerY;
    // }
  }

  update() {
    const { position, radius, speed } = this;

    this.states.update();

    const direction = this.angle - HALF_PI;

    console.log(this.angle);

    // NOTE: setPosition might override position and angle
    this.setPosition(
      position.x + cos(direction) * speed,
      position.y + sin(direction) * speed
    );

    fill(51);

    push();
    translate(position.x, position.y);
    rotate(this.angle);
    stroke(102);
    line(-20, -20, 0, 0);
    line(0, -30, 0, 0);
    line(20, -20, 0, 0);
    line(-30, 0, 0, 0);
    line(30, 0, 0, 0);
    line(-20, 20, 0, 0);
    line(0, 30, 0, 0);
    line(20, 20, 0, 0);
    stroke(0);
    triangle(
      0, -radius * 2,
      -radius, radius * 2,
      radius, radius * 2
    );
    pop();
  }
}
