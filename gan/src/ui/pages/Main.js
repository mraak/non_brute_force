import { Composition } from "atomic-layout";
import { useStore } from "effector-react";
import React from "react";
import styled from "styled-components";

import { formatBpm, formatRank, formatDate } from "../../formatters";
import { iteration$ } from "../../store/iteration";
import { phase$ } from "../../store/phase";

import Heartrate from "../Heartrate";

import Phase1 from "./Phase1";
import Phase2 from "./Phase2";
import Phase3 from "./Phase3";
import Phase4 from "./Phase4";

const Section = styled.section`
  min-height: 100vh;
`;

const statsAreas = `
  heart graph
  co2 temp
  start end
`;
const Stats = ({ who, bpm }) => (
  <Composition areas={statsAreas} as="section" gap={10}>
    {({ Heart, Graph, Co2, Temp, Start, End }) => (
      <>
        <Heart>{who} heart</Heart>
        <Graph>
          graph: {bpm}
          <Heartrate bpm={bpm} />
        </Graph>
        <Co2>co2</Co2>
        <Temp>temp</Temp>
        <Start>start</Start>
        <End>end</End>
      </>
    )}
  </Composition>
);
const Sidebar = () => {
  const iteration = useStore(iteration$);
  
  if(iteration === null) {
    return (
      <div>loading iteration</div>
    );
  }

  return (
    <>
      <Stats who="human" bpm={formatBpm(iteration.maja)} />
      <Stats who="dog" bpm={formatBpm(iteration.dog)} />
    </>
  );
};

const phaseTitle = `
  phase title
`;
const PhaseTitle = ({ phase, title }) => (
  <Composition areas={phaseTitle} gap={10}>
    {({ Phase, Title }) => (
      <>
        <Phase as="h1">phase {phase}:</Phase>
        <Title as="h2">{title}</Title>
      </>
    )}
  </Composition>
);

const areas = `
  sidebar main
`;
export default () => {
  const phase = useStore(phase$);

  return (
    <Composition areas={areas} gap={30}>
      {(c) => (
        <>
          <c.Sidebar as="aside">
            <Sidebar />
          </c.Sidebar>
          <c.Main as="main">
            {phase > 3 && (
              <Section id="phase-4">
                <PhaseTitle phase={4} title="new iteration layout" />
                <Phase4 />
              </Section>
            )}
            {phase > 2 && (
              <Section id="phase-3">
                <PhaseTitle phase={3} title="generating new layout" />
                <Phase3 />
              </Section>
            )}
            {phase > 1 && (
              <Section id="phase-2">
                <PhaseTitle phase={2} title="training model w/ cnn" />
                <Phase2 />
              </Section>
            )}
            {phase > 0 && (
              <Section id="phase-1">
                <PhaseTitle phase={1} title="previous iteration" />
                <Phase1 />
              </Section>
            )}
          </c.Main>
        </>
      )}
    </Composition>
  );
};
