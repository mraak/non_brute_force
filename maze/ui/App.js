import React, { Fragment } from "react";
import { useSelector } from "react-redux";

import { ThemeProvider } from "mineral-ui/themes";
import {
  Grid, GridItem,
  Box,
  Table
} from "mineral-ui";

import styled from "@emotion/styled";
import * as d3 from "d3";

// import Camera from "./Camera";
import Navigation from "./Navigation";

import DogsPane from "./DogsPane";
import MapsPane from "./MapsPane";
import RunPane from "./RunPane";

const Canvas = styled.canvas`
  width: 100%;
  height: 192px;
`;

function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const ctx = canvas.getContext("2d");

  ctx.scale(dpr, dpr);

  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = canvas.offsetHeight * dpr;

  return ctx;
}

const D3 = () => {
  const log = useSelector((state) => state.run.log);

  return (
    <Canvas ref={(canvas) => {
      if(!canvas) // || log.length === 0)
        return;

      const context = setupCanvas(canvas);

      const { width, height } = canvas;

      const x = d3.scaleLinear().range([ 40, width - 20 ]);
      const y = d3.scaleLinear().range([ height - 40, 20 ]);

      var line = d3.line()
          .x((d) => x(d.iterationIndex))
          .y((d) => y(d.reverseScore))
          // .curve(d3.curveStep)
          .context(context);

      x.domain(d3.extent(log, (d) => d.iterationIndex));
      y.domain(d3.extent(log, (d) => d.reverseScore));

      xAxis();
      yAxis();

      context.beginPath();
      line(log);
      context.lineWidth = 1.5;
      context.strokeStyle = "steelblue";
      context.stroke();

      function xAxis() {
        var tickCount = Math.min(20, log.length),
            ticks = x.ticks(tickCount),
            tickFormat = x.tickFormat(tickCount);

        // draws ticks
        context.beginPath();
        ticks.forEach((d) => {
          context.moveTo(x(d), 20);
          context.lineTo(x(d), height - 40);
        });
        context.strokeStyle = "gray";
        context.stroke();

        // draws axis
        context.beginPath();
        context.moveTo(40, height - 40);
        context.lineTo(width - 20, height - 40);
        context.strokeStyle = "gray";
        context.stroke();

        // draws tick text
        context.textAlign = "center";
        context.textBaseline = "top";
        context.font = "20px Arial";
        ticks.forEach((d) => {
          context.fillText(tickFormat(d + 1), x(d), height - 30);
        });
      }

      function yAxis() {
        var tickCount = 3,
            ticks = y.ticks(tickCount),
            tickFormat = y.tickFormat(tickCount);

        // draws ticks
        context.beginPath();
        ticks.forEach((d) => {
          context.moveTo(40, y(d));
          context.lineTo(width - 20, y(d));
        });
        context.strokeStyle = "gray";
        context.stroke();

        // draws axis
        context.beginPath();
        context.moveTo(40, 20);
        context.lineTo(40, height - 40);
        context.strokeStyle = "gray";
        context.stroke();

        // draws tick text
        context.textAlign = "right";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        ticks.forEach((d) => {
          context.fillText(tickFormat(d), 30, y(d));
        });

        // context.save();
        // context.rotate(-Math.PI / 2);
        // context.textAlign = "center";
        // context.font = "bold 10px sans-serif";
        // context.fillText("Reverse Score", 0, 0);
        // context.restore();
      }
    }}
      />
  );
};

export default () => {
  const viewIndex = useSelector((state) => state.views.selectedIndex);
  const log = useSelector((state) => state.run.log);

  const data = log.map(
    (o) => ({
      name: o.name,
      iterationIndex: o.iterationIndex + 1,
      indicatorCount: o.indicatorCount,
      wrongTurnCount: o.wrongTurnCount,
      wrongTileCount: o.wrongTileCount,
      time: `${o.time}s`,
      reverseScore: o.reverseScore,
      // explorationThreshold: `${o.currentExplorationThreshold.toFixed(2)}/${o.explorationThreshold.toFixed(2)}`,
    })
  );

  const columns = [
    { content: "Dog", key: "name", primary: true },
    { content: "Iteration", key: "iterationIndex" },
    { content: "Indicators", key: "indicatorCount" },
    { content: "Wrong Turns", key: "wrongTurnCount" },
    { content: "Wrong Tiles", key: "wrongTileCount" },
    { content: "Time", key: "time" },
    { content: "Reverse Score", key: "reverseScore" },
  ];

  return (
    <ThemeProvider>
      <Fragment>
        <Navigation />

        <Grid>
          <GridItem>
            <Box padding={10}>
              {viewIndex === 0 && (<MapsPane />)}
              {viewIndex === 1 && (<DogsPane />)}
              {viewIndex === 2 && (<RunPane />)}
            </Box>
          </GridItem>
          <GridItem>
            <Box id="canvas-container" padding={10} />
          </GridItem>
        </Grid>

        <Box padding={10}>
          <D3 />
        </Box>

        <Box padding={10}>
          <Table
            density="spacious"
            columns={columns}
            data={data}
            rowKey="Fruits"
            title="Logs"
            striped />
        </Box>

        {/* <Camera /> */}
      </Fragment>
    </ThemeProvider>
  );
};