import { useStore } from "effector-react";
import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import * as tfvis from "@tensorflow/tfjs-vis";

import * as colors from "../colors";
import { Apart, Chart, HR, Label } from "../components";

import { trainStats$ } from "../Train";

const Container = styled.div`
  filter: invert(1);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;

  * {
    border: none;
    margin: 0;
  }
`;

export default () => {
  const stats = useStore(trainStats$);

  const ref = useRef(null);

  useEffect(() => {
    if(ref.current === null || stats === null)
      return;

    const { metricLogs, presentMetrics, historyOpts } = stats;

    tfvis.show.history(ref.current, metricLogs, presentMetrics, historyOpts);
  }, [ ref.current, stats ]);

  return (
    <>
      <Chart style={{ flexDirection: "row", position: "relative" }}>
        <Apart style={{
          borderBottom: `1px solid ${colors.array[1]}`,
          justifyContent: "space-around",
          left: 0,
          position: "absolute",
          transform: "rotate(-90deg)",
          transformOrigin: "146px 146px",
          width: 533,
          zIndex: 1,
        }}>
          <Label style={{ fontSize: 15, textTransform: "initial" }}>Training accuracy</Label>
          <Label style={{ fontSize: 15, color: colors.array[1] }}>|</Label>
          <Label style={{ fontSize: 15, textTransform: "initial" }}>Training loss</Label>
        </Apart>
        <Container style={{
          paddingLeft: 33,
          position: "absolute",
          left: 33,
          right: 0,
          top: 0,
          bottom: 0,
          justifyContent: "space-around",
        }} ref={ref} />
      </Chart>
      <HR />
      <Apart style={{ justifyContent: "center" }}>
        <Label style={{ fontSize: 15, textTransform: "initial" }}>Training progress through time (EPOCHS)</Label>
      </Apart>
    </>
  );
};
