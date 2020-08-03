import { Composition } from "atomic-layout";
import { useStore } from "effector-react";
import React from "react";

import { formatBpm, formatRank, formatDate } from "../../formatters";
import { iteration$ } from "../../store/iteration";

import Preview from "../Preview";
import Train from "../Train";

const phase4ContentAreas = `
  graph actions
  details details
`;
export default () => {
  const iteration = useStore(iteration$);
  
  if(iteration === null) {
    return (
      <div>loading 3d preview</div>
    );
  }

  return (
    <Composition areas={phase4ContentAreas} gap={10}>
      {({ Graph, Actions, Details }) => (
        <>
          <Graph>
            <Preview />
          </Graph>
          <Actions>
            <Train />
          </Actions>
          <Details>
            <h4>iteration ended:</h4>
            <div>expected rank: {formatRank(iteration.expectedRank)} human/dog</div>
            <div>actual rank: {formatRank(iteration.actualRank)} human/dog</div>
          </Details>
        </>
      )}
    </Composition>
  );
};
