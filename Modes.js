class Modes {
  constructor() {
    this.pick = new PickMode(10);
    this.train = new TrainMode(30);
    this.map = new MapMode(50);
    this.edit = new EditMode(70);
  }

  setCurrent(mode) {
    if(this.mode == mode)
      return;

    this.mode = mode;

    console.log("switched to", mode.constructor.name);
  }

  update() {
    if(this.mode)
      this.mode.update();

    textAlign(LEFT, TOP);

    fill(this.mode == this.pick ? 0 : 102);
    text(this.mode == this.pick ? "P pick" : `P ${players[this.pick.playerIndex].name}`, 10, this.pick.offsetY);

    fill(this.mode == this.train ? 0 : 102);
    text("T train", 10, this.train.offsetY);

    fill(this.mode == this.map ? 0 : 102);
    text("M map", 10, this.map.offsetY);

    fill(this.mode == this.edit ? 0 : 102);
    text("E edit", 10, this.edit.offsetY);

    fill(0);
  }

  keyboard() {
    if(key == "p") {
      this.setCurrent(this.pick);
    } else if(key == "t") {
      this.setCurrent(this.train);
    } else if(key == "m") {
      this.setCurrent(this.map);
    } else if(key == "e") {
      this.train.setTraining(false);

      this.setCurrent(this.edit);
    } else if(this.mode)
      this.mode.keyboard();
  }

  mouse() {
    if(this.mode)
      this.mode.mouse();
  }
}

class Mode {
  constructor(offsetY = 0) {
    this.offsetY = offsetY;
  }

  keyboard() {

  }

  mouse() {

  }

  update() {

  }
}
class PickMode extends Mode {
  constructor(offsetY) {
    super(offsetY);

    this.playerIndex = 0;
  }

  keyboard() {
    const index = +key;

    if(index > 0 && index <= players.length) {
      modes.train.setTraining(false);

      this.playerIndex = index - 1;
    }
  }

  update() {
    fill(0);

    for(let i = 0, n = players.length, x = 60; i < n; ++i) {
      const label = `${i + 1} ${players[i].name}`;

      fill(i == this.playerIndex ? 0 : 102);
      text(label, x, this.offsetY);

      x += textWidth(label) + 10;
    }

    fill(0);
  }
}
class TrainMode extends Mode {
  constructor(offsetY) {
    super(offsetY);

    this.training = false;
  }

  keyboard() {
    if(key == "s") {
      this.setTraining(!this.training);
    } else if(key == "+") {
      currentMap.iterationSpeed += 1;
    } else if(key == "-") {
      currentMap.iterationSpeed = max(1, currentMap.iterationSpeed - 1);
    } else if(key == " ") {
      currentMap.paused = !currentMap.paused;
    } else {
      const index = +key;

      if(index > 0 && index <= currentMap.iterationCount) {
        const force = this.training;

        this.setTraining(true);

        const player = currentMap.players[0];

        player.setIterationIndex(force ? index : index - 1);

        if(force)
          player.nextIteration();
      }
    }
  }

  mouse() {
    // const map = maps.find(
    //   (map) => map.bounds.contains(mouseX, mouseY)
    // );

    const map = currentMap;

    if(!map)
      return;

    const localX = map.bounds.toLocalX(mouseX);
    const localY = map.bounds.toLocalY(mouseY);

    const tileIndex = map.localToIndex(localX, localY);

    const tile = map.get(tileIndex);

    // if(!tile)
    //   return;

    // if(!isWalkable(tile.type))
    //   return;

    // map.placePlayerAt(tileIndex, players[modes.pick.playerIndex]);

    console.log(tile);
  }

  update() {
    fill(0);

    if(this.training)
      text("S stop", 60, this.offsetY);
    else
      text("S start", 60, this.offsetY);

    if(!this.training)
      fill(102);

    if(currentMap.paused)
      text("_ resume", 120, this.offsetY);
    else
      text("_ pause", 120, this.offsetY);

    text(`+/- speed: ${currentMap.iterationSpeed}`, 180, this.offsetY);

    for(let i = 0, n = currentMap.iterationCount, x = 280; i < n; ++i) {
      fill(currentMap.players.length > 0 && i + 1 == currentMap.players[0].iterationIndex ? 0 : 102);

      text(`${i + 1}`, x, this.offsetY);
      x += 20;
    }

    fill(0);
  }

  setTraining(training) {
    if(this.training == training)
      return;

    this.training = training;

    if(!training)
      currentMap.players = [];
    else {
      const player = currentMap.placePlayerAt(currentMap.startIndex, players[modes.pick.playerIndex]);
      player.states.setCurrent(player.states.idle);
    }
  }
}
class MapMode extends Mode {
  constructor(offsetY) {
    super(offsetY);
  }

  keyboard() {
    const index = +key;

    if(index >= 0 && index < maps.length) {
      if(maps[index].data == currentMap.data)
        return;

      modes.train.setTraining(false);

      createMap(maps[index]);
    }
  }

  update() {
    for(let i = 0, n = maps.length, x = 60; i < n; ++i) {
      const label = `${i}`;

      fill(maps[i].data == currentMap.data ? 0 : 102);
      text(label, x, this.offsetY);

      x += textWidth(label) + 10;
    }

    fill(0);
  }
}
class EditMode extends Mode {
  constructor(offsetY) {
    super(offsetY);

    this.selectedType = FLOOR;
  }

  keyboard() {
    if(key == "l") {
      const data = prompt("load map");

      if(!data)
        return;

      const config = JSON.parse(data);

      createMap(config);

      return;
    }

    if(key == "s") {
      prompt("save map", currentMap.toJson());

      return;
    }

    const type = +key;

    // if(!isEditable(type))
    //   return;

    if(type >= 0 && type < 5)
      this.selectedType = type;
  }

  mouse() {
    // const map = maps.find(
    //   (map) => map.bounds.contains(mouseX, mouseY)
    // );

    const map = currentMap;

    if(!map)
      return;

    const localX = map.bounds.toLocalX(mouseX);
    const localY = map.bounds.toLocalY(mouseY);

    const tileIndex = map.localToIndex(localX, localY);

    const tile = map.get(tileIndex);

    if(!tile)
      return;

    // if(!isEditable(tile.type))
    //   return;

    map.get(tileIndex).setType(this.selectedType);
  }

  update() {
    text("L load", 60, this.offsetY);
    text("S save", 100, this.offsetY);

    for(let i = 0, x = 160; i < 5; ++i) {
      const label = `${i} ${getTypeLabel(i)}`;

      fill(this.selectedType == i ? 0 : 102);
      text(label, x, this.offsetY);

      x += textWidth(label) + 10;
    }

    fill(0);
  }
}
