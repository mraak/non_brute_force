import React, { useEffect } from "react";
import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
} from "react-router-dom";
import styled from "styled-components";

import Header from "./Header";
import Archive from "./pages/Archive";
import Main from "./pages/Main";
import Map from "./pages/Map";

const root = document.getElementById("root");

const resize = () => {
  const content = document.getElementById("content");

  const { width, height } = root.getBoundingClientRect();
  
  const scaleX = width / 1334;
  const scaleY = height / 750;
  
  content.style.transform = `scale(${scaleX}, ${scaleY})`;
};

window.addEventListener("resize", resize);

const Container = styled.div`
  display: grid;
  grid-gap: 22px;
  height: 750px;
  padding-bottom: 22px;
  padding-left: 17px;
  padding-right: 17px;
  transform-origin: 0 0;
  width: 1334px;
`;

export default () => {
  useEffect(resize, []);

  return (
    <Container id="content">
      <Router basename="/non-brute-force-ui">
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
    </Container>
  );
};
