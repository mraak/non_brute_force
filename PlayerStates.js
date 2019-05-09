class PlayerStates {
  constructor(player) {
    this.player = player;

    this.manual = new PlayerManualState(this);
    this.idle = new PlayerIdleState(this);
    this.explore = new PlayerExploreState(this);
    this.run = new PlayerRunState(this);
  }

  setCurrent(state) {
    if(this.state == state)
      return;

    if(this.state) {
      console.log("exited", this.state.constructor.name);

      this.state.exit();
    }

    this.state = state;

    if(state) {
      console.log("entered", state.constructor.name);

      state.enter();
    }
  }

  update() {
    if(this.state)
      this.state.update();
  }
}

class PlayerState {
  constructor(states) {
    this.states = states;
  }

  enter() {

  }

  exit() {

  }

  update() {

  }
}
class PlayerManualState extends PlayerState {
  constructor(states) {
    super(states);

    this.angleRatioAcc = .1;
    this.angleRatio = 0;

    this.speedRatioAcc = .1;
    this.speedRatio = 0;
  }

  update() {
    const { player } = this.states;

    if(keyIsDown(LEFT_ARROW)) {
      this.angleRatio = max(this.angleRatio - this.angleRatioAcc, -1);
    } else if(keyIsDown(RIGHT_ARROW)) {
      this.angleRatio = min(this.angleRatio + this.angleRatioAcc, 1);
    } else if(abs(this.angleRatio) < .01) {
      this.angleRatio *= .9;
    } else {
      this.angleRatio = 0;
    }

    if(keyIsDown(UP_ARROW)) {
      this.speedRatio = min(this.speedRatio + this.speedRatioAcc, 1);
    } else if(keyIsDown(DOWN_ARROW)) {
      this.speedRatio = max(this.speedRatio - this.speedRatioAcc, -.25);
    } else if(abs(this.speedRatio) < .01) {
      this.speedRatio *= .9;
    } else {
      this.speedRatio = 0;
    }

    player.applyAngleRatio(this.angleRatio);
    player.applySpeedRatio(this.speedRatio);
  }
}
class PlayerIdleState extends PlayerState {
  constructor(states) {
    super(states);
  }

  enter() {
    this.states.player.applySpeedRatio(0);
  }

  update() {
    const { states } = this;
    const { player } = states;
    const { map } = player;

    const tile = map.get(player.tileIndex);

    if(isEnd(tile.type)) {
      map.removePlayer(player);

      return;
    }

    states.setCurrent(states.explore);
  }
}
class PlayerExploreState extends PlayerState {
  constructor(states) {
    super(states);
  }

  update() {
    const { states } = this;
    const { player } = states;
    const { map } = player;

    const tile = map.get(player.tileIndex);

    if(isEnd(tile.type)) {
      states.setCurrent(states.idle);

      return;
    }

    const neighbor = tile.neighbors.find((neighbor) => isWalkable(neighbor));


    // player.applyAngleRatio(this.angleRatio);
    player.applySpeedRatio(1);
  }
}
class PlayerRunState extends PlayerState {
  constructor(states) {
    super(states);
  }
}
