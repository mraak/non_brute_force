import React from "react";

import { Navigation, NavItem } from "./components";

export default () => (
  <Navigation>
    <NavItem to="/" exact>main</NavItem>
    <NavItem to="/archive" exact>archive</NavItem>
    <NavItem to="/map" exact>map</NavItem>
  </Navigation>
);