import { combineReducers } from "redux";

import dogs from "./dogs";
import maps from "./maps";
import run from "./run";
import views from "./views";

export default combineReducers({
  dogs,
  maps,
  run,
  views,
});