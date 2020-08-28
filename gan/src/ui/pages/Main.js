import { useStore } from "effector-react";
import React from "react";
import styled from "styled-components";

import Sidebar from "../Sidebar";
import { HR, Panel, Title } from "../components";
import { remotePhase$ } from "../../store/phases";

import MapPopup, { mapPopupVisible$ } from "./MapPopup";
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
  position: relative;
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
  const mapPopupVisible = useStore(mapPopupVisible$);
  const phase = useStore(remotePhase$);

  return (
    <>
      <Container>
        <Sidebar />
        <Main>
        {phase > 3 && (
          <Panel>
            <Title>phase 4_climbing data</Title>
            <HR />
            <Phase4 />
          </Panel>
        )}
        {phase > 2 && (
          <Panel>
            <Title>phase 3_climbing layout</Title>
            <HR />
            <Phase3 />
          </Panel>
        )}
        {phase > 1 && (
          <Panel>
            <Title>phase 2_neural network rendering new map</Title>
            <HR />
            <Phase2 />
          </Panel>
        )}
        {phase > 0 && (
          <Panel>
            <Title>phase 1_training model w. neural network</Title>
            <HR />
            <Phase1 />
          </Panel>
        )}
        </Main>
        {mapPopupVisible && (
          <MapPopup />
        )}
      </Container>
    </>
  );
};
