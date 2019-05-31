// higher threshold (0..1) increases chances

const byron = {
  name: "Byron",
  explorationThreshold: .5,
  explorationThresholdDelta: .05,
  backtrackingThreshold: .05,
};
const ada = {
  name: "Ada",
  explorationThreshold: .5,
  explorationThresholdDelta: .05,
  backtrackingThreshold: .05,
};
const kiki = {
  name: "Kiki",
  explorationThreshold: .5,
  explorationThresholdDelta: .2,
  backtrackingThreshold: 0,
};
const george = {
  name: "George",
  explorationThreshold: .5,
  explorationThresholdDelta: .1,
  backtrackingThreshold: 0,
};
const mala = {
  name: "Mala",
  explorationThreshold: .5,
  explorationThresholdDelta: .1,
  backtrackingThreshold: 0,
};

const players = [
  byron,
  ada,
  kiki,
  george,
  mala,
];