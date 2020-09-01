import React, { useEffect } from "react";
import {
  Redirect,
  Route,
  HashRouter as Router,
  Switch,
} from "react-router-dom";
import styled from "styled-components";
import { Fullscreen as FullscreenIcon, FullscreenExit as ExitFullscreenIcon } from "@styled-icons/bootstrap";

import useFullscreen from "../hooks/useFullscreen";

import * as colors from "./colors";
import Header from "./Header";
import Archive from "./pages/Archive";
import Dictionary from "./pages/Dictionary";
import Main from "./pages/Main";

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
  grid-auto-columns: 100%;
  grid-auto-flow: rows;
  height: 750px;
  padding-bottom: 22px;
  padding-left: 17px;
  padding-right: 17px;
  position: relative;
  transform-origin: 0 0;
  width: 1334px;
`;

const FloatingButton = styled.button`
  top: 3px;
  position: absolute;
  right: 17px;

  background-color: ${colors.array[9]};
  border: 1px solid ${colors.array[10]};
  border-radius: 5px;
  color: ${colors.array[5]};
  padding: 12px;
  text-transform: uppercase;
`;

const FullscreenButton = () => {
  const {
    isAvailable,
    enter,
    exit,
    isFullscreen,
  } = useFullscreen();

  if(isAvailable == false)
    return null;

  if(isFullscreen) {
    return (
      <FloatingButton onClick={() => exit()}><ExitFullscreenIcon size={30} /></FloatingButton>
    );
  }

  return (
    <FloatingButton onClick={() => enter()}><FullscreenIcon size={30} /></FloatingButton>
  );
};

export default () => {
  useEffect(resize, []);

  return (
    <Container id="content">
      <Router>
        <Header />
        <Switch>
          <Route path="/" exact>
            <Main />
          </Route>
          <Route path="/archive" exact>
            <Archive />
          </Route>
          <Route path="/dictionary" exact>
            <Dictionary />
          </Route>
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </Router>

      <FullscreenButton />
    </Container>
  );
};
