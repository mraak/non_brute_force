import { useStore } from "effector-react";
import React from "react";

import { admin$ } from "../../store/admin";
import { currentIteration$ } from "../../store/iterations";

import { Apart, Button, Center, Chart, HR, Label, Spacer, Value } from "../components";
import HorizontalPreview from "../HorizontalPreview";
import Preview from "../Preview";
import { setPhase } from "../../store/phases";

import { setMapPopupVisible } from "./MapPopup";

export default () => {
  const admin = useStore(admin$);
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
        {admin && (
          <Button onClick={() => setPhase(1)}>start new</Button>
        )}
      </Chart>
      <Spacer />
      <HR />
      <Apart small
             style={{ alignItems: "start", flexDirection: "column", gap: 10, height: "initial", paddingBottom: 17, paddingTop: 18 }}
             onClick={() => setMapPopupVisible(true)}>
        <Label>map</Label>
        <HorizontalPreview layout={iteration.combined} />
      </Apart>
      <HR />
      <Apart small>
        <Label>status</Label><Value style={{ fontSize: 20 }}>{iteration.ended ? "ended" : "in progress"}</Value>
      </Apart>
    </>
  );
};
