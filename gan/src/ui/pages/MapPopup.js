import { useStore } from "effector-react";
import { createEvent, restore } from "effector";
import React from "react";
import styled from "styled-components";

import { currentIteration$ } from "../../store/iterations";

import * as colors from "../colors";
import { Apart, Button, Center, Chart, HR, Panel, Title } from "../components";
import HorizontalPreview from "../HorizontalPreview";

export const setMapPopupVisible = createEvent();
export const mapPopupVisible$ = restore(setMapPopupVisible, false);

const Container = styled.div`
  background-color: ${colors.array[4]};
  bottom: 0;
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: 100%;
  grid-gap: 17px;
  grid-template-columns: 1fr;
  // height: 639px;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
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
        <Title>map</Title>
        <HR />
        <Chart style={{ display: "block", paddingTop: 22 }}>
          <HorizontalPreview layout={iteration.combined} />
        </Chart>
        <HR />
        <Apart style={{ justifyContent: "flex-end", marginBottom: 22, marginTop: 22 }}>
          <Button onClick={() => setMapPopupVisible(false)}>close</Button>
        </Apart>
      </Panel>
    </Container>
  );
};
