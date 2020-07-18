import { horizontalTracks, verticalTracks } from "./data/tracks";
import { clusterIds$, idClusters$, linksGraph$ } from "./store/graph";
import { ids$ } from "./store/ids";
import { size$ } from "./store/size";

export function inside(p, [ x, y, w, h ]) {
  return p.mouseX > x && p.mouseX < x + w && p.mouseY > y && p.mouseY < y + h;
}

export function fromIndex(size, i) {
  const xy = size.x * size.y;
  const z = Math.floor(i / xy);

  i -= z * xy;
  const y = Math.floor(i / size.x);
  const x = i - y * size.x;

  return { x, y, z };
}
export function toIndex(size, x, y, z) {
  return z * size.x * size.y + y * size.x + x;
}

export const generateIteration = (p) => {
  const clusterIds = clusterIds$.getState();
  const idClusters = idClusters$.getState();
  const linksGraph = linksGraph$.getState();
  const ids = ids$.getState();
  const size = size$.getState();

  const id2index = Object.fromEntries(Object.keys(idClusters).map((index) => [ ids[index], index ]));
  // const edges = Array.from(linksGraph.edgeEntries());

  // console.log("clusterIds", clusterIds);
  // console.log("idClusters", idClusters);
  // // console.log("linksGraph", edges.filter(([ k, ka, s ]) => s == 19)); // ids[+s] === 1));
  // console.log("ids", ids);

  const horizontalSteps = (s, e) => {
    let steps = [ s ];

    for(let i = s; i !== e;) {
      const a = linksGraph.getNodeAttributes(id2index[i]);

      i = ids[toIndex(size, a.x + 1, a.y, a.z)];

      steps = [ ...steps, i ];
    }

    return steps;
  };
  const verticalSteps = (s, e) => {
    let steps = [ s ];

    for(let i = s; i !== e;) {
      const a = linksGraph.getNodeAttributes(id2index[i]);

      i = ids[toIndex(size, a.x, a.y + 1, a.z)];

      steps = [ ...steps, i ];
    }

    return steps;
  };

  const pick = (steps) => steps[Math.floor(Math.random() * steps.length)];

  const addPending = (i, a, floorTiles, pending) => {
    if(a.x < 0 || a.y < 0 || a.x >= size.x || a.y >= size.y)
      return;

    const j = toIndex(size, a.x, a.y, a.z);
    if(!linksGraph.hasEdge(i, j) || floorTiles.indexOf(ids[j]) < 0) {
      const k = toIndex(size, a.x, a.y, a.z + 1);
      if(linksGraph.hasEdge(i, k) && pending.indexOf(ids[k]) < 0)
        pending.push(ids[k]);
    }
  };

  let iteration = [];
  let pending = [];

  for(let floorIndex = 0; floorIndex < 5; ++floorIndex) {
    const floor = horizontalTracks[floorIndex] || verticalTracks[floorIndex];

    let floorTiles = [];

    for(let [ n, s, e ] of floor) {
      const steps = s === 0 ? null : horizontalTracks[floorIndex] ? horizontalSteps(s, e) : verticalSteps(s, e);
      const row = [];

      if(pending.length > 0) {
        if(s === 0) {
          const i = pending.indexOf(e);
          if(i > -1)
            row.push(e);
          else {
            for(let i = 0; i < n; ++i) {
              let id = 0;

              do {
                if(s === 0) {
                  id = [ s, e ][Math.round(Math.random())];
                } else {
                  id = pick(steps);
                }
              } while(row.indexOf(id) > -1);

              if(id > 0)
                row.push(id);
            }
          }
        } else {
          const is = pending.filter((i) => steps.indexOf(i) > -1);
          if(is.length > 0) {
            for(let i = 0; i < n; ++i) {
              let id = 0;

              do {
                if(Math.random() < .5)
                  id = is[Math.floor(Math.random() * is.length)];
                else {
                  id = pick(steps);
                }
              } while(row.indexOf(id) > -1);

              row.push(id);
            }
          } else {
            for(let i = 0; i < n; ++i) {
              let id = 0;

              do {
                if(s === 0) {
                  id = [ s, e ][Math.round(Math.random())];
                } else {
                  id = pick(steps);
                }
              } while(row.indexOf(id) > -1);

              if(id > 0)
                row.push(id);
            }
          }
        }
      } else {
        for(let i = 0; i < n; ++i) {
          let id = 0;

          do {
            if(s === 0) {
              id = [ s, e ][Math.round(Math.random())];
            } else {
              id = pick(steps);
            }
          } while(row.indexOf(id) > -1);

          if(id > 0)
            row.push(id);
        }
      }

      floorTiles = [ ...floorTiles, ...row ];
    }

    pending = [];

    for(let id of floorTiles) {
      const i = id2index[id];
      const a = linksGraph.getNodeAttributes(i);

      // right
      addPending(i, { x: a.x + 1, y: a.y, z: a.z }, floorTiles, pending);
      // down
      addPending(i, { x: a.x, y: a.y + 1, z: a.z }, floorTiles, pending);
      // // left
      addPending(i, { x: a.x - 1, y: a.y, z: a.z }, floorTiles, pending);
      // up
      addPending(i, { x: a.x, y: a.y - 1, z: a.z }, floorTiles, pending);
    }

    // console.log("pending", pending);

    iteration = [ ...iteration, ...floorTiles ];
  }

  iteration.sort((a, b) => a - b);

  return iteration;
};

export const iterationToLayout = (layout, iteration) => {
  let id = 0;

  return layout.map((item) => {
    if(item === 0)
      return 0;

    return iteration.indexOf(++id) > -1 ? 1 : 0;
  });
};

export const join = (xs, ys) => xs.map((x, i) => x + ys[i]);
