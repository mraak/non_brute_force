import produce from "immer";

const initialState = {
  // ui
  selectedIndex: 0,

  iterationSpeed: 1,
  paused: true,
  training: false,
  endless: false,
  intelligence: null,
  state: null,
  iterationIndex: 0,
  iterations: [],
  food: new Set,
  explorationThreshold: 0,
  time: 0,

  currentTileIndex: -1,
  targetTileIndex: -1,

  log: [],
};

export default (state, action) => produce(state || initialState, (draft) => {
  if(!action.type.startsWith("run/"))
    return;

  switch(action.type) {
    case "run/selectedIndex":
      draft.selectedIndex = action.payload;
      break;
    case "run/iterationSpeed":
      draft.iterationSpeed = +action.payload;
      break;
    case "run/iterationIndex":
      draft.iterationIndex = action.payload;
      draft.targetTileIndex = -1;
      draft.time = 0;
      break;
    case "run/training":
      draft.training = action.payload;
      draft.paused = !action.payload;
      break;
    case "run/paused":
      draft.paused = action.payload;
      break;
    case "run/intelligence":
      draft.intelligence = action.payload;
      break;
    case "run/state":
      draft.state = action.payload;
      break;
    case "run/training":
      draft.training = action.payload;
      break;
    case "run/endless":
      draft.endless = action.payload;
      break;
    case "run/food":
      draft.food = new Set(action.payload);
      break;
    case "run/currentTileIndex":
      draft.currentTileIndex = action.payload;
      break;
    case "run/targetTileIndex":
      draft.targetTileIndex = action.payload;
      break;
    case "run/explorationThreshold":
      draft.explorationThreshold = action.payload;
      break;
    case "run/time":
      draft.time = action.payload;
      break;
    case "run/log/add":
      draft.log.unshift(action.payload);
      break;
  }
});
