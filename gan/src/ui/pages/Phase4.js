import { useStore } from "effector-react";
import React from "react";
import styled from "styled-components";

import { formatBpm, formatRank, formatDate } from "../../formatters";
import { currentIteration$ } from "../../store/iterations";

import { Apart, Center, Chart, HR, Label, Value } from "../components";
import HorizontalPreview from "../HorizontalPreview";
import Preview from "../Preview";
import Train from "../Train";

export default () => {
  const iteration = useStore(currentIteration$);
  
  if(iteration === null) {
    return (
      <Center>loading 3d preview</Center>
    );
  }

  return (
    <>
      <Chart>
        <Preview />
        <HorizontalPreview layout={iteration.combined} />
        <Train />
      </Chart>
      <HR />
      <Apart small>
        <Label>iteration status</Label><Value>{iteration.ended ? "ended" : "in progress"}</Value>
      </Apart>
      <HR />
      <Apart small>
        <Label>expected class</Label><Value>{formatRank(iteration.expectedRank)}</Value>
      </Apart>
      <HR />
      <Apart small>
        <Label>actual class</Label><Value>{formatRank(iteration.actualRank)}</Value>
      </Apart>
    </>
  );
};
