import { Composition } from "atomic-layout";
import { useStore } from "effector-react";
import React from "react";
import styled from "styled-components";

import { formatBpm, formatRank, formatDate } from "../../formatters";
import { iteration$ } from "../../store/iteration";

import { Image } from "../components";
import Guess, { attempts$, rank$ } from "../Guess";

const phase3ContentAreas = `
  attempt progress class
  graph graph graph
`;
// input hidden output
export default () => {
  const attempts = useStore(attempts$);
  const rank = useStore(rank$);

  return (
    <Composition areas={phase3ContentAreas} gap={10}>
      {({ Attempt, Progress, Class, Graph, Input, Hidden, Output }) => (
        <>
          <Attempt as="h3">attempt: {attempts}</Attempt>
          <Progress as="h3">--</Progress>
          <Class as="h3">class: {rank}</Class>
          <Graph>
            <Image src="phase3-canvas.png" />
            <Guess />
          </Graph>
          {/* <Input as="h4">input</Input>
          <Hidden as="h4">hidden</Hidden>
          <Output as="h4">output</Output> */}
        </>
      )}
    </Composition>
  );
};
