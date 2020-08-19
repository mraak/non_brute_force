import { useStore } from "effector-react";
import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import * as tfvis from "@tensorflow/tfjs-vis";

import { Chart } from "../components";

import * as colors from "../colors";
import { trainStats$ } from "../Train";

const Container = styled.div`
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

    tfvis.show.history(ref.current, metricLogs, presentMetrics, historyOpts); // { ...historyOpts, seriesColors: [ "#FF0000", "#00FF00", "#0000FF" ] });
  }, [ ref.current, stats ]);

  return (
    <Chart>
      <Container ref={ref} />
    </Chart>
  );
};