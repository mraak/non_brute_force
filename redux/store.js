import { applyMiddleware, compose, createStore } from "redux";
import { createLogicMiddleware } from "redux-logic";

import reducers from "./reducers";
import logic from "./logic";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const enhancers = composeEnhancers(
  applyMiddleware(
    createLogicMiddleware(logic)
  )
);


// window.__REDUX_DEVTOOLS_EXTENSION__
//   ? applyMiddleware(
//       window.__REDUX_DEVTOOLS_EXTENSION__(),
//       logicMiddleware
//     )
//   : applyMiddleware(
//       logicMiddleware
//     );

const store = createStore(
  reducers,
  enhancers
);

window.reduxState = store.getState();

export default store;