function bfs(board, start, end) {
  const queue = [[ start ]];

  const paths = [];

  while(queue.length) {
    const path = queue.shift();
    const last = path[path.length - 1];

    if(last == end)
      paths.push(path);

    const tile = board.get(last);

    for(let index of tile.edges) {
      if(path.indexOf(index) < 0)
        queue.push([ ...path, index ]);
    }
  }

  return paths;
}
