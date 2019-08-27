import { createLogic } from "redux-logic";

const changeBoard = createLogic({
  type: "maps/current",
  // latest: true,
  process({ getState, action }, dispatch, done) {
    const { current } = getState().maps;

    createBoard(current);

    done();
  }
});
const changeBoardSize = createLogic({
  type: "maps/current/size",
  // latest: true,
  process({ getState, action }, dispatch, done) {
    const { current } = getState().maps;

    createBoard(current);

    done();
  }
});
const handleIterationIndex = createLogic({
  type: [ "maps/selectedIterationIndex", "maps/current", "maps/current/size", "maps/current/toggleFood" ],
  // latest: true,
  process({ getState, action }, dispatch, done) {
    const { maps } = getState();

    dispatch({ type: "run/food", payload: maps.current.iterations[maps.selectedIterationIndex] });

    done();
  }
});

export default [
  changeBoard,
  changeBoardSize,
  handleIterationIndex,
];