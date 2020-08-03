import React from "react";
import {
  NavLink,
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
} from "react-router-dom";
import styled from "styled-components";

import Archive from "./pages/Archive";
import Main from "./pages/Main";
import Map from "./pages/Map";

const root = "/non-brute-force-ui";

const Nav = styled.nav`
  & > a + a {
    margin-left: 1ch;
  }
`;

const Header = () => (
  <header>
    {/* <h1>nbf</h1> */}
    <Nav>
      <NavLink to="/" exact>main</NavLink>
      <NavLink to="/archive" exact>archive</NavLink>
      <NavLink to="/map" exact>map</NavLink>
    </Nav>
  </header>
);

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
