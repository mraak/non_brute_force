import { useStore } from "effector-react";
import React from "react";
import styled from "styled-components";

import { currentIteration$ } from "../../store/iterations";

import { Center, Chart, Panel } from "../components";
import HorizontalPreview from "../HorizontalPreview";

const Container = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: 100%;
  grid-gap: 17px;
  grid-template-columns: 1fr;
  height: 639px;
`;

export default () => {
  const iteration = useStore(currentIteration$);
  
  if(iteration === null) {
    return (
      <Container>
        <Panel>
          <Center>loading preview</Center>
        </Panel>
      </Container>
    );
  }

  return (
    <Container>
      <Panel>
        <Chart style={{ display: "block" }}>
          <HorizontalPreview layout={iteration.combined} />
        </Chart>
      </Panel>
    </Container>
  );
};
