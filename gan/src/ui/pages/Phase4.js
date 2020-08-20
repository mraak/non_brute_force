import { useStore } from "effector-react";
import React from "react";
import styled from "styled-components";

import { formatBpm, formatRank, formatDate } from "../../formatters";
import { currentIteration$ } from "../../store/iterations";

import { Apart, Center, Chart, HR, Label, Spacer, Value } from "../components";
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
        <Train />
      </Chart>
      <Spacer />
      <HR />
      <Apart small style={{ alignItems: "start", flexDirection: "column", gap: 10, height: "initial", paddingBottom: 17, paddingTop: 18 }}>
        <Label>map</Label>
        <HorizontalPreview layout={iteration.combined} />
      </Apart>
      <HR />
      <Apart small>
        <Label>status</Label><Value style={{ fontSize: 20 }}>{iteration.ended ? "ended" : "in progress"}</Value>
      </Apart>
      {/* <HR />
      <Apart small>
        <Label>expected class</Label><Value>{formatRank(iteration.expectedRank)}</Value>
      </Apart>
      <HR />
      <Apart small>
        <Label>actual class</Label><Value>{formatRank(iteration.actualRank)}</Value>
      </Apart> */}
    </>
  );
};
