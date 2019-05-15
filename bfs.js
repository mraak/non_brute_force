function bfs(map, start, end) {
  const queue = [[ start ]];

  const paths = [];

  while(queue.length) {
    const path = queue.shift();
    const last = path[path.length - 1];

    if(last == end)
      paths.push(path);
    
    const tile = map.get(last);

    for(let i = 0, n = tile.neighbors.length; i < n; ++i) {
      const neighbor = map.get(tile.neighbors[i]);
      
      if(neighbor && isWalkable(neighbor.type) && path.indexOf(neighbor.index) < 0)
        queue.push([ ...path, neighbor.index ]);
    }
  }

  return paths;
}
