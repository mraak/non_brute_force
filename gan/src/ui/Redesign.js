import { Composition } from "atomic-layout";
import React from "react";
import styled from "styled-components";

const Nav = styled.nav`
  & > a + a {
    margin-left: 1ch;
  }
`;

const Header = () => (
  <>
    <h1>nbf</h1>
    <Nav>
      <a href="#main">main</a>
      <a href="#archive">archive</a>
      <a href="#map">map</a>
    </Nav>
  </>
);

const statsAreas = `
  heart graph
  co2 temp
  start end
`
const Stats = ({ who }) => (
  <Composition areas={statsAreas} as="section" gap={10}>
    {({ Heart, Graph, Co2, Temp, Start, End }) => (
      <>
        <Heart>{who} heart</Heart>
        <Graph>graph</Graph>
        <Co2>co2</Co2>
        <Temp>temp</Temp>
        <Start>start</Start>
        <End>end</End>
      </>
    )}
  </Composition>
)
const HumanStats = () => (
  <Stats who="human" />
)
const DogStats = () => (
  <Stats who="dog" />
)
const Sidebar = () => (
  <>
    <HumanStats />
    <DogStats />
  </>
)

const phaseTitle = `
  phase title
`
const PhaseTitle = ({ phase, title }) => (
  <Composition areas={phaseTitle} gap={10}>
    {({ Phase, Title }) => (
      <>
        <Phase as="h3">{phase}:</Phase>
        <Title as="h2">{title}</Title>
      </>
    )}
  </Composition>
)

const phase1ContentStatsAreas = `
  who bpm graph
`
const Phase1ContentStats = ({ who }) => (
  <Composition areas={phase1ContentStatsAreas} gap={10}>
    {({ Who, Bpm, Graph }) => (
      <>
        <Who>{who}</Who>
        <Bpm>avg bpm</Bpm>
        <Graph>{who} graph</Graph>
      </>
    )}
  </Composition>
)
const phase1ContentAreas = `
  human class
  dog class
`
const Phase1Content = () => (
  <Composition areas={phase1ContentAreas} gap={10}>
    {({ Human, Dog, Class }) => (
      <>
        <Human>
          <Phase1ContentStats who="human" />
        </Human>
        <Dog>
          <Phase1ContentStats who="dog" />
        </Dog>
        <Class>class</Class>
      </>
    )}
  </Composition>
)
const Phase1 = () => (
  <section>
    <PhaseTitle phase={1} title="previous iteration" />
    <Phase1Content />
  </section>
)

const Phase2ContentGraph = ({ what }) => (
  <>
    <div>graph</div>
    <h4>{what}</h4>
  </>
)
const phase2ContentAreas = `
  accuracy loss
`
const Phase2Content = () => (
  <Composition areas={phase2ContentAreas} gap={10}>
    {({ Accuracy, Loss }) => (
      <>
        <Accuracy>
          <Phase2ContentGraph what="accuracy" />
        </Accuracy>
        <Loss>
          <Phase2ContentGraph what="loss" />
        </Loss>
      </>
    )}
  </Composition>
)
const Phase2 = () => (
  <section>
    <PhaseTitle phase={2} title="training model w/ cnn" />
    <Phase2Content />
  </section>
)

const phase3ContentSectionAreas = `
  header
  graph
  description
`
const Phase3ContentSection = ({ header, description }) => (
  <Composition areas={phase3ContentSectionAreas} gap={10}>
    {({ Header, Graph, Description }) => (
      <>
        <Header as="h3">{header}</Header>
        <Graph>graph</Graph>
        <Description as="h4">{description}</Description>
      </>
    )}
  </Composition>
)
const phase3ContentAreas = `
  input hidden output
`
const Phase3Content = () => (
  <Composition areas={phase3ContentAreas} gap={10}>
    {({ Input, Hidden, Output }) => (
      <>
        <Input>
          <Phase3ContentSection header="attempt: 14" description="input" />
        </Input>
        <Hidden>
          <Phase3ContentSection header="---" description="hidden" />
        </Hidden>
        <Output>
          <Phase3ContentSection header="class: 0" description="output" />
        </Output>
      </>
    )}
  </Composition>
)
const Phase3 = () => (
  <section>
    <PhaseTitle phase={3} title="generating new layout" />
    <Phase3Content />
  </section>
)

const phase4ContentAreas = `
  graph actions
  details details
`
const Phase4Content = () => (
  <Composition areas={phase4ContentAreas} gap={10}>
    {({ Graph, Actions, Details }) => (
      <>
        <Graph>graph</Graph>
        <Actions>
          <button>start new</button>
        </Actions>
        <Details>
          <h4>iteration ended:</h4>
          <div>expected delta: 0 human/dog</div>
          <div>actual delta: 0 human/dog</div>
        </Details>
      </>
    )}
  </Composition>
)
const Phase4 = () => (
  <section>
    <PhaseTitle phase={4} title="new iteration layout" />
    <Phase4Content />
  </section>
)

const areas = `
  header header
  sidebar main
`
export default () => (
  <Composition areas={areas} gap={30}>
    {(c) => (
      <>
        <c.Header as="header">
          <Header />
        </c.Header>
        <c.Sidebar as="aside">
          <Sidebar />
        </c.Sidebar>
        <c.Main as="main">
          <Phase4 />
          <Phase3 />
          <Phase2 />
          <Phase1 />
        </c.Main>
      </>
    )}
  </Composition>
);
