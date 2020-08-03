import { Composition } from "atomic-layout";
import { useStore } from "effector-react";
import React from "react";
import styled from "styled-components";

import { formatBpm, formatRank, formatDate } from "../../formatters";
import { iteration$ } from "../../store/iteration";

import { Image } from "../components";

const phase1ContentStatsAreas = `
  who bpm graph
`
const Phase1ContentStats = ({ who, bpm, graph }) => (
  <Composition areas={phase1ContentStatsAreas} gap={10}>
    {({ Who, Bpm, Graph }) => (
      <>
        <Who>{who}</Who>
        <Bpm>avg bpm: {bpm}</Bpm>
        <Graph><Image src={graph} /></Graph>
      </>
    )}
  </Composition>
);
const phase1ContentAreas = `
  human class
  dog class
  delta class
`;
export default () => {
  const iteration = useStore(iteration$);
  
  if(iteration === null) {
    return (
      <div>loading previous iteration</div>
    );
  }

  return (
    <Composition areas={phase1ContentAreas} gap={10}>
      {({ Human, Dog, Delta, Class }) => (
        <>
          <Human>
            <Phase1ContentStats who="human" bpm={formatBpm(iteration.maja)} graph="human-chart.png" />
          </Human>
          <Dog>
            <Phase1ContentStats who="dog" bpm={formatBpm(iteration.dog)} graph="dog-chart.png" />
          </Dog>
          <Delta>
            <Phase1ContentStats who="delta" bpm={formatBpm(iteration.delta)} graph="delta-chart.png" />
          </Delta>
          <Class>class: {iteration.actualRank}</Class>
        </>
      )}
    </Composition>
  );
};
