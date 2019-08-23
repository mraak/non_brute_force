import produce from "immer";

// higher threshold (0..1) increases chances

const ada = {
  name: "Ada",
  explorationThreshold: .5,
  explorationThresholdDelta: .05,
  backtrackingThreshold: .05,
  learningRate: .65,
};
const byron = {
  name: "Byron",
  explorationThreshold: .5,
  explorationThresholdDelta: .05,
  backtrackingThreshold: .05,
  learningRate: .7,
};
const george = {
  name: "George",
  explorationThreshold: .5,
  explorationThresholdDelta: .1,
  backtrackingThreshold: 0,
  learningRate: .9,
};
const kiki = {
  name: "Kiki",
  explorationThreshold: .5,
  explorationThresholdDelta: .2,
  backtrackingThreshold: 0,
  learningRate: .2,
};
const mala = {
  name: "Mala",
  explorationThreshold: .5,
  explorationThresholdDelta: .1,
  backtrackingThreshold: 0,
  learningRate: .6,
};

const dogs = [
  ada,
  byron,
  george,
  kiki,
  mala,
];

const initialState = {
  // ui
  selectedIndex: 0,

  dogs,

  current: { ...dogs[0] },

  isValid: true,
};

export default (state, action) => produce(state || initialState, (draft) => {
  if(!action.type.startsWith("dogs/"))
    return;

  switch(action.type) {
    case "dogs/selectedIndex":
      draft.selectedIndex = action.payload;
      draft.current = { ...dogs[action.payload] };
      break;
  }

  draft.isValid = draft.selectedIndex >= 0
    && draft.selectedIndex < draft.dogs.length;
});