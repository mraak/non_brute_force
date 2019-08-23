import produce from "immer";

import { getNeighbors, getEdges } from "../../p5/functions";

const map190614 = {
  "name": "2019/06/14",
  "size":10,"tileSize":40,
  "edges":[[19,29],[28,29],[27,28],[26,27],[25,26],[24,25],[24,34],[34,35],[35,45],[44,45],[45,46],[36,46],[36,37],[37,38],[39,49],[49,59],[59,69],[48,58],[38,48],[37,47],[47,57],[57,67],[67,68],[68,69],[69,79],[78,79],[77,78],[76,77],[66,76],[56,66],[55,56],[54,55],[53,54],[43,44],[42,43],[33,43],[23,33],[13,23],[13,14],[14,15],[15,16],[16,17],[17,18],[12,22],[21,22],[21,31],[31,41],[51,61],[60,61],[50,60],[40,50],[40,41],[10,11],[10,20],[20,30],[30,40],[32,42],[12,13],[62,72],[52,62],[61,71],[71,72],[63,64],[64,65],[65,66]],
  "startIndex":63,"endIndex":19,
  "iterations":[[29,76,69,67,36,45,25,35,34,24,46,37,79,77],null,[76,69,67,36,45,25,29,35,34,24,37,46,77,79],null,[69,67,37,45,24,29,35],null,[37,24,29],null,[45,29],null],
  "food":[]
};

const map1 = {
  "size":7,"tileSize":40,
  "edges":[[0,7],[1,2],[1,8],[2,3],[4,5],[4,11],[5,6],[7,14],[7,8],[8,15],[9,10],[9,16],[10,11],[12,13],[12,19],[14,21],[16,23],[17,18],[17,24],[18,19],[19,26],[20,27],[21,28],[21,22],[22,29],[23,30],[24,31],[25,32],[26,27],[29,30],[29,36],[30,37],[30,31],[32,39],[33,34],[34,41],[35,36],[37,38],[38,45],[38,39],[39,46],[40,47],[40,41],[42,43],[43,44],[44,45],[46,47],[47,48]],
  "startIndex":42,"endIndex":6,
  "iterations":[
    [ 45, 38, 37, 9, 11, 4 ],
    null,null,null,null,null,null,null,null,null,null
  ],
  "food":[]
};
// const map2 = {
//   "size":7,"tileSize":40,
//   "edges":[[0,7],[0,1],[1,2],[1,8],[2,3],[2,9],[3,4],[3,10],[4,5],[4,11],[5,6],[5,12],[6,13],[7,14],[7,8],[8,15],[8,9],[9,10],[9,16],[10,11],[10,17],[11,12],[11,18],[12,13],[12,19],[13,20],[14,21],[14,15],[15,22],[15,16],[16,23],[16,17],[17,24],[17,18],[18,25],[18,19],[19,26],[19,20],[20,27],[21,28],[21,22],[22,29],[22,23],[23,30],[23,24],[24,31],[24,25],[25,32],[25,26],[26,33],[26,27],[27,34],[28,35],[28,29],[29,36],[29,30],[30,37],[30,31],[31,38],[31,32],[32,39],[32,33],[33,40],[33,34],[34,41],[35,42],[35,36],[36,43],[36,37],[37,44],[37,38],[38,45],[38,39],[39,46],[39,40],[40,47],[40,41],[41,48],[42,43],[43,44],[44,45],[45,46],[46,47],[47,48]],
//   "startIndex":42,"endIndex":6,
//   "iterations":[
//     null,
//     null,null,null,null,null,null,null,null,null,null
//   ],
//   "food":[]
// };

const maps = [
  map190614,
  // map1,
  // map2,
];

function findSteps(tileCount, startIndex, source) {
  const queue = [ startIndex ];
  const steps = Array.from(Array(tileCount), () => -1);
  steps[startIndex] = 0;

  while(queue.length > 0) {
    const tileIndex = queue.pop();
    const edges = getEdges(tileIndex, source);

    for(const nextTileIndex of edges) {
      if(nextTileIndex < 0 || steps[nextTileIndex] > -1)
        continue;

      steps[nextTileIndex] = steps[tileIndex] + 1;

      queue.push(nextTileIndex);
    }
  }

  return steps;
}

function getCorrectPath(steps, source, startIndex, endIndex) {
  const queue = [ startIndex ];

  const path = [];

  while(queue.length > 0) {
    const tileIndex = queue.pop();

    // if(path.indexOf(tileIndex) > -1)
    //   break;

    path.push(tileIndex);

    if(tileIndex === endIndex)
      break;

    queue.push(getEdges(tileIndex, source).sort(
      (a, b) => steps[a] - steps[b]
    )[0]);
  }

  return path;
}

function getComplexity(steps, edges, current) {
  const walkableCells = steps.reduce((memo, count, i) => count < 0 ? memo : [ ...memo, i ], []);
  const walkableCellCount = walkableCells.length;
  const correctPathLength = steps[current.startIndex] + 1;
  const forks3 = walkableCells.filter((tileIndex) => getEdges(tileIndex, edges).length === 3);
  const forks4 = walkableCells.filter((tileIndex) => getEdges(tileIndex, edges).length === 4);
  const correctPath = getCorrectPath(steps, edges, current.startIndex, current.endIndex);
  const forksMain3 = forks3.reduce((memo, tileIndex) => correctPath.indexOf(tileIndex) < 0 ? memo : memo + 1, 0);
  const forksOther3 = forks3.reduce((memo, tileIndex) => correctPath.indexOf(tileIndex) < 0 ? memo + 1 : memo, 0);
  const forksMain4 = forks4.reduce((memo, tileIndex) => correctPath.indexOf(tileIndex) < 0 ? memo : memo + 1, 0);
  const forksOther4 = forks4.reduce((memo, tileIndex) => correctPath.indexOf(tileIndex) < 0 ? memo + 1 : memo, 0);

  // console.log(walkableCells, correctPath, forks3, forks4, walkableCellCount, correctPathLength, forksMain4, forksMain3, forksOther4, forksOther3);

  return walkableCellCount + correctPathLength + forksMain4 * 20 + forksMain3 * 15 + forksOther4 * 6 + forksOther3 * 4;
}

const initialMap = {
  size: 10,
  tileSize: 40,
  startIndex: -1,
  endIndex: -1,
  edges: [],
  iterations: [ [] ],
}

const initialState = {
  // ui
  selectedIndex: 1,

  maps,
  steps: null,

  // size constraints
  min: 3,
  max: 10,

  current: { ...maps[0] },
  json: null,

  iterationCount: maps[0].iterations.length,
  selectedIterationIndex: 0,

  complexity: 0,
  complexityRank: 0,

  // editor
  editing: false,
  selectedType: 3,

  isValid: false,
};

export default (state, action) => produce(state || initialState, (draft) => {
  if(!action.type.startsWith("maps/"))
    return;

  switch(action.type) {
    case "maps/selectedIndex":
      draft.selectedIndex = action.payload;
      break;
    case "maps/current":
      draft.current = action.payload;
      draft.iterationCount = action.payload.iterations.length;
      draft.selectedIterationIndex = 0;
      break;
    case "maps/current/size":
      draft.current.size = +action.payload;
      draft.current.startIndex = -1;
      draft.current.endIndex = -1;
      draft.current.edges = [];
      draft.current.iterations = [ [] ];
      draft.iterationCount = 1;
      draft.selectedIterationIndex = 0;
      break;
    case "maps/current/startIndex":
      draft.current.startIndex = action.payload;
      break;
    case "maps/current/endIndex":
      draft.current.endIndex = action.payload;
      break;
    case "maps/current/toggleEdge":
      const edge = action.payload;

      const a = min(edge[0], edge[1]);
      const b = max(edge[0], edge[1]);

      if(getNeighbors(a).indexOf(b) > -1) {
        const i = draft.current.edges.findIndex(
          (edge) => edge[0] === a && edge[1] === b
        );

        if(i < 0)
          draft.current.edges.push([ a, b ]);
        else
          draft.current.edges.splice(i, 1);
      }
      break;
    case "maps/current/toggleFood":
      const iteration = draft.current.iterations[draft.selectedIterationIndex] || [];
      const i = iteration.indexOf(action.payload);

      if(i < 0)
        iteration.push(action.payload);
      else
        iteration.splice(i, 1);

      draft.current.iterations[draft.selectedIterationIndex] = iteration;
      break;
    case "maps/selectedType":
      draft.selectedType = +action.payload;
      break;
    case "maps/iterationCount":
      draft.iterationCount = +action.payload;

      draft.current.iterations.length = draft.iterationCount;
      break;
    case "maps/selectedIterationIndex":
      draft.selectedIterationIndex = +action.payload;
      break;
    case "maps/json":
      draft.current = JSON.parse(action.payload);
      break;
  }

  draft.tileCount = draft.current.size * draft.current.size;
  draft.steps = findSteps(draft.tileCount, draft.current.endIndex, draft.current.edges);

  draft.json = JSON.stringify(draft.current);

  draft.editing = draft.selectedIndex === 1;

  draft.isValid = draft.current.size >= draft.min
    && draft.current.size <= draft.max
    && draft.current.startIndex > -1
    && draft.current.endIndex > -1
    && draft.steps[draft.current.startIndex] > -1;

  draft.complexity = draft.isValid ? getComplexity(draft.steps, draft.current.edges, draft.current) : 0;
  draft.complexityRank = draft.complexity < 100 ? 1 : draft.complexity < 150 ? 2 : 3;
});