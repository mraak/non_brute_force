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
      // this.player.map.log.unshift(`player ${this.player.id} exited ${this.state.constructor.name}`);

      this.state.exit();
    }

    this.state = state;

    if(state) {
      // this.player.map.log.unshift(`player ${this.player.id} entered ${state.constructor.name}`);

      state.enter();
    }
  }

  update() {
    if(this.state)
      return this.state.update();
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
  }

  update() {
    const { player } = this.states;
    const { map } = player;
    const { bounds } = map;

    const global = createVector(mouseX, mouseY);
    const local = createVector(
      bounds.toLocalX(global.x),
      bounds.toLocalY(global.y)
    );

    return player.arrive(local);
  }
}
class PlayerIdleState extends PlayerState {
  constructor(states) {
    super(states);
  }

  enter() {

  }

  update() {
    const { states } = this;
    const { player } = states;
    const { map } = player;

    player.setIterationIndex(player.iterationIndex + 1);

    if(player.iterationIndex < map.iterationCount) {
      player.nextIteration();
    } else {
      map.log.unshift(`player ${player.id} reached the end`);

      map.removePlayer(player);

      if(map.players.length == 0)
        modes.place.setTraining(false);

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
    const { tileIndex, map, visited, counted } = player;

    const tile = map.get(tileIndex);

    if(isEnd(tile.type)) {
      states.setCurrent(states.idle);

      return;
    }

    let neighbors = tile.getWalkableNeighbors();

    if(player.foodInSight.length) {
      player.targetTileIndex = player.foodInSight[0];

      for(let n of neighbors) {
        if(player.counted[n] == 0 || n != player.previousTileIndex)
          player.counted[n] = Infinity;
      }
    } else {
      neighbors = neighbors.filter(
        (n) => n != Infinity
      );

      neighbors.sort(
        (a, b) => counted[a] == 0 ? -1 : counted[b] == 0 ? 1 : counted[a] - counted[b]
      );

      player.targetTileIndex = player.targetTileIndex || neighbors[0];
    }

    const targetTile = map.get(player.targetTileIndex);

    if(targetTile)
      return player.arrive(targetTile.bounds.center);
  }
}
class PlayerRunState extends PlayerState {
  constructor(states) {
    super(states);
  }
}
