import React from "react";
import styled from "styled-components";

import Draw from "./Draw";
// import Generate from "./Generate";
import Guess from "./Guess";
import Pick from "./Pick";
import Preview from "./Preview";
import Train from "./Train";

const Nav = styled.nav`
  & > a + a {
    margin-left: 1ch;
  }
`;

const Header = () => (
  <header>
    <h1>nbf</h1>
    <Nav>
      <a href="#pick">pick</a>
      {/* <a href="#draw">draw</a> */}
      <a href="#preview">preview</a>
      <a href="#train">train</a>
      <a href="#guess">guess</a>
      {/* <a href="#generate">generate</a> */}
    </Nav>
  </header>
);

const PickSection = () => (
  <details id="pick" open>
    <summary>pick iteration</summary>

    <Pick />
  </details>
);
const DrawSection = () => (
  <details id="draw">
    <summary>draw</summary>

    <Draw />
  </details>
);
const PreviewSection = () => (
  <details id="preview" open>
    <summary>3d preview</summary>

    <Preview />
  </details>
);
const TrainSection = () => (
  <details id="train" open>
    <summary>train</summary>

    <Train />
  </details>
);
const GuessSection = () => (
  <details id="guess" open>
    <summary>guess</summary>

    <Guess />
  </details>
);
// const GenerateSection = () => (
//   <details id="generate" open>
//     <summary>generate</summary>
//
//     <Generate />
//   </details>
// );

export default () => (
  <>
    <Header />
    <main>
      <PickSection />
      <hr />
      {/* <DrawSection />
      <hr /> */}
      <PreviewSection />
      <hr />
      <TrainSection />
      <hr />
      <GuessSection />
      {/* <hr />
      <GenerateSection /> */}
    </main>
  </>
);
