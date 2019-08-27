import { createLogic } from "redux-logic";
import { createIntelligence, decide, learn } from "../../qlearn/qlearn";

import {
  getTopNeighborIndex,
  getLeftNeighborIndex,
  getRightNeighborIndex,
  getBottomNeighborIndex,
  getEdgeIndex,
  isFork
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
      const intelligence = createIntelligence();
      // Object.assign(intelligence, {
      //   defaultQuality: 0,
      //   learnFactor: .1,
      //   discountFactor: .9,
      //   exploreBonus: .1,
      //   qualityMap: new Map,
      // });

      const state = {
        rewards: [], // [4, 2]],
        score: 0,
        rewardsTouched: [],
      };

      previousActionName = null;
      previousTileIndex = -1;

      dispatch({ type: "run/intelligence", payload: intelligence });
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
    const { dogs, maps } = getState();

    createPlayer(dogs.current);

    done();
  }
});

var previousActionName = null;
var previousTileIndex = -1;
const handleCurrentTileIndex = createLogic({
  type: "run/currentTileIndex",
  // latest: true,
  process({ getState, action }, dispatch, done) {
    const { dogs, maps, run } = getState();

    // Eats food
    if(run.food.has(run.currentTileIndex)) {
      run.food.delete(run.currentTileIndex);

      dispatch({ type: "run/food", payload: run.food });
    }

    // Handles end tile
    if(run.currentTileIndex === maps.current.endIndex) {
      previousActionName = null;
      previousTileIndex = -1;

      dispatch({ type: "run/log/add", payload: {
        name: dogs.current.name,
        iterationIndex: run.iterationIndex,
        indicatorCount: (maps.current.iterations[run.iterationIndex] || []).length,
        wrongTurnCount: 0,
        wrongTileCount: 0,
        time: run.time,
        reverseScore: 0,
        currentExplorationThreshold: run.explorationThreshold,
        explorationThreshold: dogs.current.explorationThreshold,
      } });

      // if(run.iterationIndex + 1 < maps.iterationCount) {
        dispatch({ type: "run/food", payload: maps.current.iterations[run.iterationIndex + 1] });
        dispatch({ type: "run/currentTileIndex", payload: maps.current.startIndex });
        dispatch({ type: "run/iterationIndex", payload: run.iterationIndex + 1 });
      // } else
      //   dispatch({ type: "run/training", payload: false });

      done();

      return;
    }

    const { intelligence, state } = run;

    const currentPosition = `${run.currentTileIndex}`;

    const scoreBefore = state.score;
    var scoreAfter = 0;

    // Handles new tile
    if(!intelligence.qualityMap.has(currentPosition)) {
      const weights = [];

      const allowed = actionNames.reduce(
        (memo, actionName) => {
          const targetTileIndex = actions[actionName](run.currentTileIndex);

          if(targetTileIndex < 0)
            weights.push([ -1, actionName ]); // wall
          else {
            weights.push([ intelligence.defaultQuality, actionName ]); // walkable

            memo[actionName] = targetTileIndex;
          }

          return memo;
        },
        {}
      );

      intelligence.qualityMap.set(currentPosition, weights);

      if(Object.keys(allowed).length == 0) {
        dispatch({ type: "run/training", payload: false });

        done();

        return;
      }
    }

    // Looks for food and end
    for(let actionName of actionNames) {
      let stepCount = countSteps(run.currentTileIndex, actionName, Array.from(run.food));
      let weight = stepCount <= 0
        ? intelligence.defaultQuality
        : 1; // / stepCount;

      stepCount = countSteps(run.currentTileIndex, actionName, [ maps.current.endIndex ]);
      weight += stepCount <= 0
        ? intelligence.defaultQuality
        : 10; // / stepCount;

      if(weight > intelligence.defaultQuality) {
        learn(intelligence, currentPosition, currentPosition, actionName, actionNames, weight);
        scoreAfter += weight;
      }
    }

    var actionName;
    var targetTileIndex;
    var reward;

    // const unexploredActionNames = intelligence.qualityMap.get(currentPosition).filter(
    //   (action) => action[0] === 0
    // ).map(
    //   (action) => action[1]
    // );

    // if(!isFork(run.currentTileIndex) || unexploredActionNames.length === 0 || Math.random() < .5)
      actionName = decide(intelligence, currentPosition, actionNames);
    // else
    //   // Pick unexplored path
    //   actionName = unexploredActionNames[floor(Math.random() * unexploredActionNames.length)];

    targetTileIndex = actions[actionName](run.currentTileIndex);

    console.log("decided", currentPosition, actionName, targetTileIndex);

    if(targetTileIndex < 0) {
      dispatch({ type: "run/training", payload: false });

      done();

      return;
    }

    // if(previousActionName) {
    //   intelligence.qualityMap.get(currentPosition).find(
    //     (action) => action[1] === inverseActionNames[previousActionName]
    //   )[0] = intelligence.qualityMap.get(`${previousTileIndex}`).find(
    //     (action) => action[1] === previousActionName
    //   )[0] * .9;
    // }

    // scoreAfter = !intelligence.qualityMap.has(`${targetTileIndex}`)
    //   ? 0
    //   : intelligence.qualityMap.get(`${targetTileIndex}`).reduce(
    //     (memo, action) => {
    //       // if(action[0] > 0)
    //         return memo + action[0];

    //       return memo;
    //     },
    //     0
    //   ) / 4;
    reward = scoreAfter; // - scoreBefore;

    // learn(intelligence, currentPosition, `${targetTileIndex}`, actionName, actionNames, reward);
    learn(intelligence, currentPosition, currentPosition, actionName, actionNames, reward);

    // if(previousActionName) {
    //   // learn(intelligence, currentPosition, currentPosition, inverseActionNames[previousActionName], actionNames, 0);
    //   const qualityForState = intelligence.qualityMap.get(currentPosition);
    //   const previousActionIndex = qualityForState.findIndex(([, a]) => {
    //     return a === actionName;
    //   });
    //   qualityForState[previousActionIndex][0] += intelligence.learnFactor * (
    //     0 +
    //     intelligence.discountFactor * (-qualityForState[previousActionIndex][0])
    //   ) - intelligence.exploreBonus;
    // }

    state.score = scoreAfter;

    previousActionName = actionName;
    previousTileIndex = run.currentTileIndex;

    dispatch({ type: "run/state", payload: state });

    // dispatch({ type: "run/currentTileIndex", payload: targetTileIndex });
    // else
    if(run.currentTileIndex !== targetTileIndex)
      dispatch({ type: "run/targetTileIndex", payload: targetTileIndex });

    // dispatch({ type: "run/intelligence", payload: intelligence });

    done();
  }
});

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