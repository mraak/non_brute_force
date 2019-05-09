class Modes {
  constructor() {
    this.place = new PlaceMode;
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
  }

  keyboard() {
    if(key == "p") {
      this.setCurrent(this.place);
    } else if(key == "e") {
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
  mouse() {
    const map = maps.find(
      (map) => map.bounds.contains(mouseX, mouseY)
    );

    if(!map)
      return;

    const localX = map.bounds.toLocalX(mouseX);
    const localY = map.bounds.toLocalY(mouseY);

    const tileIndex = map.localToIndex(localX, localY);

    const tile = map.get(tileIndex);

    if(!tile)
      return;

    if(!isWalkable(tile.type))
      return;

    map.placePlayerAt(tileIndex);
  }

  update() {

  }
}
class EditMode extends Mode {
  constructor() {
    super();

    this.selectedType = FLOOR;
  }

  keyboard() {
    const type = +key;

    if(!isEditable(type))
      return;

    this.selectedType = type;
  }

  mouse() {
    const map = maps.find(
      (map) => map.bounds.contains(mouseX, mouseY)
    );

    if(!map)
      return;

    const localX = map.bounds.toLocalX(mouseX);
    const localY = map.bounds.toLocalY(mouseY);

    const tileIndex = map.localToIndex(localX, localY);

    const tile = map.get(tileIndex);

    if(!tile)
      return;

    if(!isEditable(tile.type))
      return;

    map.get(tileIndex).setType(this.selectedType);
  }

  update() {

  }
}
