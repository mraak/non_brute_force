import React from "react";
import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
} from "react-router-dom";

import Header from "./Header";
import Archive from "./pages/Archive";
import Main from "./pages/Main";
import Map from "./pages/Map";

const root = "/non-brute-force-ui";

export default () => (
  <Router basename={root}>
    <Header />
    <Switch>
      <Route path="/" exact>
        <Main />
      </Route>
      <Route path="/archive" exact>
        <Archive />
      </Route>
      <Route path="/map" exact>
        <Map />
      </Route>
      <Route path="*">
        <Redirect to="/" />
      </Route>
    </Switch>
  </Router>
);
