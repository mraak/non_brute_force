import { combine } from "effector";
import Graph from "graphology";

import { layout$ } from "./layout";
import { size$ } from "./size";

import { fromIndex, toIndex } from "../utils";

// all possible links / paths, ignoring clusters and floors
export const linksGraph$ = combine(layout$, size$, (layout, size) => {
  if(layout === null || size === null)
    return null;

  const graph = new Graph({
    allowSelfLoops: false,
    edgeKeyGenerator: ({ undirected, source, target, attributes }) => `${source}->${target}`,
    multi: true,
    type: "directed",
  });

  let id = 0;
  for(let i in layout) {
    if(layout[i] === 0)
      continue;

    const attributes = {
      ...fromIndex(size, i),
      i,
      id: ++id,
    };

    graph.addNode(i, attributes);
  }

  for(let [ i, a ] of graph.nodeEntries()) {
    // right
    if(a.x < size.x - 1) {
      const j = toIndex(size, a.x + 1, a.y, a.z);
      if(graph.hasNode(j))
        graph.addEdge(i, j, { x: 1, y: 0, z: 0 });
    }
    // down
    if(a.y < size.y - 1) {
      const j = toIndex(size, a.x, a.y + 1, a.z);
      if(graph.hasNode(j))
        graph.addEdge(i, j, { x: 0, y: 1, z: 0 });
    }
    // // left
    if(a.x > 0) {
      const j = toIndex(size, a.x - 1, a.y, a.z);
      if(graph.hasNode(j))
        graph.addEdge(i, j, { x: -1, y: 0, z: 0 });
    }
    // up
    if(a.y > 0) {
      const j = toIndex(size, a.x, a.y - 1, a.z);
      if(graph.hasNode(j))
        graph.addEdge(i, j, { x: 0, y: -1, z: 0 });
    }

    // next floor
    if(a.z < size.z - 1) {
      // right
      if(a.x < size.x - 1) {
        const j = toIndex(size, a.x + 1, a.y, a.z + 1);
        if(graph.hasNode(j))
          graph.addEdge(i, j, { x: 1, y: 0, z: 1 });
      }
      // down
      if(a.y < size.y - 1) {
        const j = toIndex(size, a.x, a.y + 1, a.z + 1);
        if(graph.hasNode(j))
          graph.addEdge(i, j, { x: 0, y: 1, z: 1 });
      }
      // left
      if(a.x > 0) {
        const j = toIndex(size, a.x - 1, a.y, a.z + 1);
        if(graph.hasNode(j))
          graph.addEdge(i, j, { x: -1, y: 0, z: 1 });
      }
      // up
      if(a.y > 0) {
        const j = toIndex(size, a.x, a.y - 1, a.z + 1);
        if(graph.hasNode(j))
          graph.addEdge(i, j, { x: 0, y: -1, z: 1 });
      }
    }
  }

  return graph;
});

// group neighbors (on the same floor) into clusters
const clusters$ = combine(linksGraph$, size$, (linksGraph, size) => {
  if(linksGraph === null || size === null)
    return null;

  let id = 0;
  const idClusters = {};
  const clusterIds = {};

  const traverseNode = (i) => {
    const a = linksGraph.getNodeAttributes(i);
    // right
    if(a.x < size.x - 1)
      process(i, toIndex(size, a.x + 1, a.y, a.z));
    // down
    if(a.y < size.y - 1)
      process(i, toIndex(size, a.x, a.y + 1, a.z));
    // left
    if(a.x > 0)
      process(i, toIndex(size, a.x - 1, a.y, a.z));
    // up
    if(a.y > 0)
      process(i, toIndex(size, a.x, a.y - 1, a.z));
  };

  const process = (i, j) => {
    if(i in idClusters && j in idClusters)
      return;

    if(linksGraph.hasNode(j) && linksGraph.hasEdge(i, j)) {
      if(!(i in idClusters)) {
        idClusters[i] = ++id;
        clusterIds[idClusters[i]] = [ +i ];
      }

      if(!(j in idClusters)) {
        idClusters[j] = idClusters[i];
        clusterIds[idClusters[j]].push(+j);
      }

      traverseNode(j);
    }
  };

  for(let i of linksGraph.nodes())
    traverseNode(+i);

  return [ clusterIds, idClusters ];
});
export const clusterIds$ = clusters$.map((clusters) => {
  if(clusters === null)
    return null;

  const [ clusterIds, _ ] = clusters;

  for(let key in clusterIds)
    clusterIds[key].sort();

  return clusterIds;
});
export const idClusters$ = clusters$.map((clusters) => {
  if(clusters === null)
    return null;

  const [ _, idClusters ] = clusters;

  return idClusters;
});
