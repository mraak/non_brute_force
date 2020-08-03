import { Composition } from "atomic-layout";
import { useStore } from "effector-react";
import React from "react";
import styled from "styled-components";

import { formatBpm, formatRank, formatDate } from "../../formatters";
import { iteration$ } from "../../store/iteration";

import { Image } from "../components";

const phase2ContentAreas = `
  accGraph lossGraph
  accDescription lossDescription
`;
export default () => (
  <Composition areas={phase2ContentAreas} gap={10}>
    {({ AccGraph, LossGraph, AccDescription, LossDescription }) => (
      <>
        <AccGraph>
          <Image src="accuracy-graph.png" />
        </AccGraph>
        <LossGraph>
          <Image src="loss-graph.png" />
        </LossGraph>
        <AccDescription as="h4">accuracy</AccDescription>
        <LossDescription as="h4">loss</LossDescription>
      </>
    )}
  </Composition>
);
