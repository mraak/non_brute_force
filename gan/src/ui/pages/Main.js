import { useStore } from "effector-react";
import React from "react";
import styled from "styled-components";

import Sidebar from "../Sidebar";
import { HR, Panel, Title } from "../components";
import { phase$ } from "../../store/phase";

import Phase1 from "./Phase1";
import Phase2 from "./Phase2";
import Phase3 from "./Phase3";
import Phase4 from "./Phase4";

const Container = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: 100%;
  grid-gap: 17px;
  grid-template-columns: repeat(2, 1fr);
  height: 639px;
`;
const Main = styled.main`
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: 100%;
  grid-gap: 17px;
  overflow-y: auto;
  width: 606px;
`;

export default () => {
  const phase = useStore(phase$);

  return (
    <Container>
      <Sidebar />
      <Main>
      {phase > 3 && (
        <Panel id="phase-4">
          <Title>phase 4_current climbing layout</Title>
          <HR />
          <Phase4 />
        </Panel>
      )}
      {phase > 2 && (
        <Panel id="phase-3">
          <Title>phase 3_neural network rendering new map</Title>
          <HR />
          <Phase3 />
        </Panel>
      )}
      {phase > 1 && (
        <Panel id="phase-2">
          <Title>phase 2_training model w. neural network</Title>
          <HR />
          <Phase2 />
        </Panel>
      )}
      {phase > 0 && (
        <Panel id="phase-1">
          <Title>phase 1_previous climbing data</Title>
          <HR />
          <Phase1 />
        </Panel>
      )}
      </Main>
    </Container>
  );
};
