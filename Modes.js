class Modes {
  constructor() {
    this.place = new PlaceMode;
    this.map = new MapMode;
    this.edit = new EditMode;
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

    fill(this.mode == this.place ? 0 : 102);
    text("T train", 10, 10);

    fill(this.mode == this.map ? 0 : 102);
    text("M map", 10, 30);

    fill(this.mode == this.edit ? 0 : 102);
    text("E edit", 10, 50);

    fill(0);
  }

  keyboard() {
    if(key == "t") {
      this.setCurrent(this.place);
    } else
    if(key == "m") {
      this.setCurrent(this.map);
    } else if(key == "e") {
      this.place.setTraining(false);

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
  keyboard() {

  }

  mouse() {

  }

  update() {

  }
}
class PlaceMode extends Mode {
  constructor() {
    super();

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

    // map.placePlayerAt(tileIndex);

    console.log(tile);
  }

  update() {
    fill(0);

    if(this.training)
      text("S stop", 60, 10);
    else
      text("S start", 60, 10);

    if(!this.training)
      fill(102);

    if(currentMap.paused)
      text("_ resume", 120, 10);
    else
      text("_ pause", 120, 10);

    text(`+/- speed: ${currentMap.iterationSpeed}`, 180, 10);

    for(let i = 0, n = currentMap.iterationCount, x = 280; i < n; ++i) {
      fill(currentMap.players.length > 0 && i + 1 == currentMap.players[0].iterationIndex ? 0 : 102);

      text(`${i + 1}`, x, 10);
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
      const player = currentMap.placePlayerAt(currentMap.startIndex);
      player.states.setCurrent(player.states.idle);
    }
  }
}
class MapMode extends Mode {
  constructor() {
    super();
  }

  keyboard() {
    const index = +key;

    if(index >= 0 && index < maps.length) {
      if(maps[index].data == currentMap.data)
        return;

      modes.place.setTraining(false);

      createMap(maps[index]);
    }
  }

  update() {
    for(let i = 0, n = maps.length, x = 60; i < n; ++i) {
      const label = `${i}`;

      fill(maps[i].data == currentMap.data ? 0 : 102);
      text(label, x, 30);

      x += textWidth(label) + 10;
    }

    fill(0);
  }
}
class EditMode extends Mode {
  constructor() {
    super();

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
    text("L load", 60, 50);
    text("S save", 100, 50);

    for(let i = 0, x = 160; i < 5; ++i) {
      const label = `${i} ${getTypeLabel(i)}`;

      fill(this.selectedType == i ? 0 : 102);
      text(label, x, 50);

      x += textWidth(label) + 10;
    }

    fill(0);
  }
}
