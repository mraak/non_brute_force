import { Composition } from "atomic-layout";
import { useStore } from "effector-react";
import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import * as tfvis from "@tensorflow/tfjs-vis";

import { formatBpm, formatRank, formatDate } from "../../formatters";
import { iteration$ } from "../../store/iteration";

import { Image } from "../components";
import { trainStats$ } from "../Train";

const Container = styled.div`
  * {
    border: none;
    margin: 0;
  }
`;

// const phase2ContentAreas = `
//   accGraph lossGraph
//   accDescription lossDescription
// `;
export default () => {
  const stats = useStore(trainStats$);

  const ref = useRef(null);

  console.log("stats", stats);

  // const subContainer = subSurface(drawArea, callbackName, { title: callbackName });
  // tfvis.show.history(subContainer, metricLogs, presentMetrics, historyOpts);

  useEffect(() => {
    if(ref.current === null || stats === null)
      return;

    const { metricLogs, presentMetrics, historyOpts } = stats;

    tfvis.show.history(ref.current, metricLogs, presentMetrics, historyOpts);
  }, [ ref.current, stats ]);

  return (
    <Container ref={ref} />
    // <Composition areas={phase2ContentAreas} gap={10}>
    //   {({ AccGraph, LossGraph, AccDescription, LossDescription }) => (
    //     <>
    //       <AccGraph>
    //         <Container ref={ref} />
    //       </AccGraph>
    //       <LossGraph>
    //         <Image src="loss-graph.png" />
    //       </LossGraph>
    //       <AccDescription as="h4">accuracy</AccDescription>
    //       <LossDescription as="h4">loss</LossDescription>
    //     </>
    //   )}
    // </Composition>
  );
};
