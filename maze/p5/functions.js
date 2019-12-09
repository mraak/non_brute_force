import * as colors from "./colors";

// coordinates
export function xyToIndex(x, y) {
  if(x < 0 || x >= reduxState.maps.current.size || y < 0 || y >= reduxState.maps.current.size)
    return -1;

  return x + reduxState.maps.current.size * y;
}
export function indexToXY(index) {
  return [
    index % reduxState.maps.current.size,
    Math.floor(index / reduxState.maps.current.size),
  ];
}

export const mouseToX = (x) => floor(x / reduxState.maps.current.tileSize);
export const mouseToY = (y) => floor(y / reduxState.maps.current.tileSize);
export const mouseToIndex = (x, y) => xyToIndex(
  mouseToX(x),
  mouseToY(y)
);

// helpers
export const isStart = (tileIndex) => tileIndex === reduxState.maps.current.startIndex;
export const isEnd = (tileIndex) => tileIndex === reduxState.maps.current.endIndex;
export const isWalkable = (tileIndex) => getEdges(tileIndex).length > 0;
export const isDeadEnd = (tileIndex) => getEdges(tileIndex).length <= 1;
export const isFork = (tileIndex) => {
  const [ t, l, r, b ] = getNeighbors(tileIndex).map(
    (neighborIndex) => getEdgeIndex(tileIndex, neighborIndex)
  );

  if(t < 0 && b < 0 || l < 0 && r < 0)
    return false;

  return true;
};
export const isFood = (tileIndex) => {
  return reduxState.run.food.has(tileIndex);
};

// neighbors
export const getEdges = (tileIndex, edges) => (edges || reduxState.maps.current.edges).filter(
  (edge) => edge[0] === tileIndex || edge[1] === tileIndex
).map(
  (edge) => edge[0] === tileIndex ? edge[1] : edge[0]
);
export const getEdgeIndex = (...edge) => {
  const a = min(edge[0], edge[1]);

  if(a < 0)
    return -1;

  const b = max(edge[0], edge[1]);

  return reduxState.maps.current.edges.findIndex(
    (edge) => edge[0] === a && edge[1] === b
  );
};

export function getLeftNeighborIndex(tileIndex) {
  const [ x, y ] = indexToXY(tileIndex);

  return xyToIndex(x - 1, y);
}
export function getTopNeighborIndex(tileIndex) {
  const [ x, y ] = indexToXY(tileIndex);

  return xyToIndex(x, y - 1);
}
export function getRightNeighborIndex(tileIndex) {
  const [ x, y ] = indexToXY(tileIndex);

  return xyToIndex(x + 1, y);
}
export function getBottomNeighborIndex(tileIndex) {
  const [ x, y ] = indexToXY(tileIndex);

  return xyToIndex(x, y + 1);
}
export const getNeighbors = (tileIndex) => [
  getTopNeighborIndex(tileIndex),
  getLeftNeighborIndex(tileIndex),
  getRightNeighborIndex(tileIndex),
  getBottomNeighborIndex(tileIndex),
];

export const getForkScores = (fork) => {
  let total = 0;

  fork.forEach(
    (score) => {
      total += score;
    }
  );

  var scores = new Map;

  fork.forEach(
    (score, tileIndex) => {
      scores.set(tileIndex, score / total);
    }
  );

  return scores;
}

// bounds
export const getBounds = (tileIndex) => {
  const [ x, y ] = indexToXY(tileIndex);
  const s = reduxState.maps.current.tileSize;

  const l = x * s;
  const t = y * s;

  return {
    left: l,
    top: t,
    right: l + s,
    bottom: t + s,
    width: s,
    height: s,

    center: createVector(
      l + s * .5,
      t + s * .5
    ),
  };
};

// colors
export function getColor(tileIndex) {
  if(isFood(tileIndex))
    return colors.food();

  if(tileIndex === reduxState.maps.current.startIndex)
    return colors.start();

  if(tileIndex === reduxState.maps.current.endIndex)
    return colors.end();

  return colors.path();
}