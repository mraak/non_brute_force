import { Composition } from "atomic-layout";
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

const Section = styled.section`
  min-height: 100vh;
`;

const phaseTitle = `
  phase title
`;
const PhaseTitle = ({ phase, title }) => (
  <Composition areas={phaseTitle} gap={10}>
    {(c) => (
      <>
        <c.Phase as={Title}>phase {phase}:</c.Phase>
        <c.Title as={Title}>{title}</c.Title>
      </>
    )}
  </Composition>
);

const Container = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-gap: 15px;
  grid-template-columns: repeat(2, 1fr);
  padding-left: 17px;
  padding-right: 17px;
`;
const Main = styled.main`
  
`;

export default () => {
  const phase = useStore(phase$);

  return (
    <Container>
      <aside>
        <Sidebar />
      </aside>
      <Main>
      {phase > 3 && (
        <Section id="phase-4">
          <Panel>
            <PhaseTitle phase={4} title="new iteration layout" />
            <HR />
            <Phase4 />
          </Panel>
        </Section>
      )}
      {phase > 2 && (
        <Section id="phase-3">
          <Panel>
            <PhaseTitle phase={3} title="generating new layout" />
            <HR />
            <Phase3 />
          </Panel>
        </Section>
      )}
      {phase > 1 && (
        <Section id="phase-2">
          <Panel>
            <PhaseTitle phase={2} title="training model w/ cnn" />
            <HR />
            <Phase2 />
          </Panel>
        </Section>
      )}
      {phase > 0 && (
        <Section id="phase-1">
          <Panel>
            <PhaseTitle phase={1} title="previous iteration" />
            <HR />
            <Phase1 />
          </Panel>
        </Section>
      )}
      </Main>
    </Container>
  );
};
