import React, { Fragment } from "react";
import { useSelector } from "react-redux";

import { ThemeProvider } from "mineral-ui/themes";
import {
  Grid, GridItem,
  Box,
  Table
} from "mineral-ui";

import Navigation from "./Navigation";

import DogsPane from "./DogsPane";
import MapsPane from "./MapsPane";
import RunPane from "./RunPane";

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
          <Table
            density="spacious"
            columns={columns}
            data={data}
            rowKey="Fruits"
            title="Logs"
            striped />
        </Box>
      </Fragment>
    </ThemeProvider>
  );
};