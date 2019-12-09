import { createLogic } from "redux-logic";

import {
  getTopNeighborIndex,
  getLeftNeighborIndex,
  getRightNeighborIndex,
  getBottomNeighborIndex,
  getEdgeIndex,
  getEdges,
  getForkScores
} from "../../p5/functions";

var timeInterval = 0;
var previousDone = null;

const handleTraining = createLogic({
  type: "run/training",
  warnTimeout: 0,
  // latest: true,
  process({ getState, action }, dispatch, done) {
    const { maps, run } = getState();

    if(timeInterval > 0) {
      clearInterval(timeInterval);
      timeInterval = 0;
      previousDone();
      previousDone = null;
    }

    if(run.training) {
      const state = {
        counter: Array.from(Array(maps.tileCount), () => 0),
        forks: new Map,
        wrongTurnCount: 0, wrongTileCount: 0,
        previousTileIndex: null,
      };

      for(let i = 0, n = maps.tileCount; i < n; ++i) {
        const edges = getEdges(i);
        if(edges.length < 3)
          continue;

        state.forks.set(i, new Map(edges.map(
          (edge) => [ edge, 1 ]
        )));
      }

      dispatch({ type: "run/state", payload: state });
      dispatch({ type: "run/food", payload: maps.current.iterations[0] });
      dispatch({ type: "run/currentTileIndex", payload: maps.current.startIndex });
      dispatch({ type: "run/iterationIndex", payload: 0 });

      timeInterval = setInterval(() => {
        dispatch({ type: "run/time", payload: getState().run.time + 1 });
      }, 1000);

      previousDone = done;
    } else
      done();
  }
});
const handleIterationIndex = createLogic({
  type: "run/iterationIndex",
  // latest: true,
  process({ getState, action }, dispatch, done) {
    const { dogs, maps, run } = getState();

    createPlayer(dogs.current);

    done();
  }
});

const handleCurrentTileIndex = createLogic({
  type: "run/currentTileIndex",
  // latest: true,
  process({ getState, action }, dispatch, done) {
    const { dogs, maps, run } = getState();

    const { state } = run;

    // Eats food
    if(run.food.has(run.currentTileIndex)) {
      run.food.delete(run.currentTileIndex);

      dispatch({ type: "run/food", payload: run.food });
    }

    state.counter[run.currentTileIndex] = state.previousTileIndex === null ? 1 : state.counter[state.previousTileIndex] + 1;

    // Handles end tile
    if(run.currentTileIndex === maps.current.endIndex) {
      state.forks.forEach(
        (fork, tileIndex) => {
          fork.forEach(
            (score, i) => {
              fork.set(
                i,
                score + (
                  maps.steps[tileIndex] > maps.steps[i] && state.counter[i] > 0
                    ? (dogs.current.learningRate * (run.iterationIndex + 1)) / maps.complexityRank
                    : 0
                )
              );
            }
          );
        }
      );

      const wrongTurnCount = state.wrongTurnCount;
      const wrongTileCount = state.wrongTileCount;
      state.counter = Array.from(Array(maps.tileCount), () => 0);
      state.wrongTurnCount = 0;
      state.wrongTileCount = 0;
      state.previousTileIndex = null;

      const indicatorCount = (maps.current.iterations[run.iterationIndex] || []).length;

      const time = run.time * run.iterationSpeed;

      dispatch({ type: "run/log/add", payload: {
        name: dogs.current.name,
        iterationIndex: run.iterationIndex,
        indicatorCount: indicatorCount,
        wrongTurnCount: wrongTurnCount,
        wrongTileCount: wrongTileCount,
        time: time,
        reverseScore: indicatorCount + wrongTurnCount * 5 + wrongTileCount + round(time / 10),
        currentExplorationThreshold: run.explorationThreshold,
        explorationThreshold: dogs.current.explorationThreshold,
      } });

      if(run.endless || run.iterationIndex + 1 < maps.iterationCount) {
        dispatch({ type: "run/state", payload: state });
        dispatch({ type: "run/food", payload: maps.current.iterations[run.iterationIndex + 1] });
        dispatch({ type: "run/currentTileIndex", payload: maps.current.startIndex });
        dispatch({ type: "run/iterationIndex", payload: run.iterationIndex + 1 });
      } else
        dispatch({ type: "run/training", payload: false });

      done();

      return;
    }

    const rewards = actionNames.reduce(
      (memo, actionName) => {
        let stepCount = countSteps(run.currentTileIndex, actionName, Array.from(run.food));
        if(stepCount > 0)
          memo.push([ 1, actionName ]);

        stepCount = countSteps(run.currentTileIndex, actionName, [ maps.current.endIndex ]);
        if(stepCount > 0)
          memo.push([ 10, actionName ]);

        return memo;
      },
      []
    ).sort(
      (a, b) => b[0] - a[0]
    );

    if(rewards.length > 0) {
      const [ action ] = rewards;
      state.targetTileIndex = actions[action[1]](run.currentTileIndex);
    } else {
      const fork = state.forks.get(run.currentTileIndex);

      if(fork) {
        do {
          state.targetTileIndex = pickRoute(fork);
        } while(state.targetTileIndex === state.previousTileIndex);
      } else {
        const edges = getEdges(run.currentTileIndex).sort(
          (a, b) => state.counter[a] - state.counter[b]
        );

        state.targetTileIndex = edges[0];
      }
    }

    state.previousTileIndex = run.currentTileIndex;

    const targetTileIndex = state.targetTileIndex;

    if(maps.steps[run.currentTileIndex] < maps.steps[targetTileIndex]) {
      if(getEdges(run.currentTileIndex).length > 2)
        ++state.wrongTurnCount;

      ++state.wrongTileCount;

      console.log("wrong count", state.wrongTurnCount, state.wrongTileCount);
    }

    if(targetTileIndex < 0) {
      dispatch({ type: "run/training", payload: false });

      done();

      return;
    }

    dispatch({ type: "run/state", payload: state });

    if(run.currentTileIndex !== targetTileIndex)
      dispatch({ type: "run/targetTileIndex", payload: targetTileIndex });

    done();
  }
});

function pickRoute(fork) {
  var rnd = Math.random();

  for(let [ tileIndex, weight ] of getForkScores(fork)) {
    if(rnd < weight)
      return tileIndex;

    rnd -= weight;
  }

	return -1;
}

function countSteps(tileIndex, actionName, rewards, stepCount = 0) {
  if(tileIndex < 0)
    return -1;

  const rewardIndex = rewards.indexOf(tileIndex);

  if(rewardIndex < 0)
    return countSteps(actions[actionName](tileIndex), actionName, rewards, stepCount + 1);

  return stepCount;
}

const actions = {
  moveLeft: (position) => {
    const newPosition = getLeftNeighborIndex(position);
    // console.log("moveLeft", position, newPosition);
    if(newPosition < 0 || getEdgeIndex(position, newPosition) < 0)
      return -1;

    return newPosition;
  },
  moveRight: (position) => {
    const newPosition = getRightNeighborIndex(position);
    // console.log("moveRight", position, newPosition);
    if(newPosition < 0 || getEdgeIndex(position, newPosition) < 0)
      return -1;

    return newPosition;
  },
  moveUp: (position) => {
    const newPosition = getTopNeighborIndex(position);
    // console.log("moveUp", position, newPosition);
    if(newPosition < 0 || getEdgeIndex(position, newPosition) < 0)
      return -1;

    return newPosition;
  },
  moveDown: (position) => {
    const newPosition = getBottomNeighborIndex(position);
    // console.log("moveDown", position, newPosition);
    if(newPosition < 0 || getEdgeIndex(position, newPosition) < 0)
      return -1;

    return newPosition;
  },
};
const actionNames = Object.keys(actions);
const inverseActionNames = {
  moveLeft: "moveRight",
  moveRight: "moveLeft",
  moveUp: "moveDown",
  moveDown: "moveUp",
};

export default [
  handleTraining,
  handleIterationIndex,
  handleCurrentTileIndex,
];