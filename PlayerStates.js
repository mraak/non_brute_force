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
      // this.player.board.log.unshift(`player ${this.player.id} exited ${this.state.constructor.name}`);

      this.state.exit();
    }

    this.state = state;

    if(state) {
      // this.player.board.log.unshift(`player ${this.player.id} entered ${state.constructor.name}`);

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
    const { board } = player;
    const { bounds } = board;

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
    const { board } = player;

    if(board.log.length && player.iterationIndex > 0)
      board.log[0] = `${player.name}: ${player.iterationIndex}. it, ${player.explorationThreshold.toFixed(2)}/${player.config.explorationThreshold.toFixed(2)}, ${player.visited.length}/${board.paths[0].length} (${(board.paths[0].length / player.visited.length).toFixed(2)})`;

    player.setIterationIndex(player.iterationIndex + 1);

    if(player.iterationIndex <= board.iterationCount) {
      player.nextIteration();
    } else {
      board.log.unshift(`${player.name} has finished training`);

      board.removePlayer(player);

      if(board.players.length == 0)
        modes.train.setTraining(false);

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
    const { tileIndex, board, valid, invalid, counted } = player;

    const tile = board.get(tileIndex);

    if(board.isEnd(tile)) {
      states.setCurrent(states.idle);

      return;
    }

    let neighbors = tile.getWalkableNeighbors();

    if(player.foodInSight.length) {
      player.targetTileIndex = player.foodInSight[0];

      for(let n of neighbors) {
        if(counted[n] == 0 || valid.indexOf(n) < 0)
          counted[n] = Infinity;
      }
    } else if(!("targetTileIndex" in player)) {
      if(player.backtracking)
        player.targetTileIndex = bfs(board, player.tileIndex, player.visitedForks[player.visitedForks.length - 1])[0][1] || player.visitedForks[player.visitedForks.length - 1]; // valid.pop();
      else {
        if(tile.isFork()) {
          if(random() > player.backtrackingThreshold) {
            neighbors = neighbors.filter(
              (n) => valid.indexOf(n) < 0 && invalid.indexOf(n) < 0
            );
          }

          neighbors.sort(
            (a, b) => player.currentScores[a] == 0 ? -1 : player.currentScores[b] == 0 ? 1 : player.currentScores[b] - player.currentScores[a]
          );

          if(random() < player.explorationThreshold) {
            const n = neighbors.length, i = n > 1 ? floor(Math.random() * n) : 0;
            player.targetTileIndex = neighbors[i];
          } else
            player.targetTileIndex = neighbors[0];
        } else {
          neighbors.sort(
            (a, b) => counted[a] == 0 ? -1 : counted[b] == 0 ? 1 : counted[a] - counted[b]
          );

          player.targetTileIndex = neighbors[0];
        }
      }
    }

    const targetTile = board.get(player.targetTileIndex);

    if(targetTile)
      return player.arrive(targetTile.bounds.center);
  }
}
class PlayerRunState extends PlayerState {
  constructor(states) {
    super(states);
  }
}
