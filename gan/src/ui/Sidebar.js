import { Composition } from "atomic-layout";
import { format } from "date-fns";
import { useStore } from "effector-react";
import React from "react";
import styled from "styled-components";

import { formatBpm, formatRank, formatDate } from "../formatters";
import { iteration$ } from "../store/iteration";
import { training$ } from "../store/training";

import * as colors from "./colors";
import { HR, Label, Panel, Table, Title, Value } from "./components";
import Heartrate from "./Heartrate";

const Container = styled.div`
  display: grid;
  grid-auto-flow: row;
  // grid-auto-rows: 69px;
  grid-gap: 15px;
  grid-template-columns: repeat(2, 330px);
  padding-left: 17px;
  padding-right: 17px;
  // width: 771px;
`;

export default () => {
  const training = useStore(training$);
  const iteration = useStore(iteration$);
  
  if(training) {
    return (
      <div>training model</div>
    );
  }
  
  if(iteration === null) {
    return (
      <div>loading iteration</div>
    );
  }

  const majaBpm = formatBpm(iteration.maja);
  const dogBpm = formatBpm(iteration.dog);

  const majaBpms = (iteration.majaBpms || []).map(({ bpm, date }) => ({ maja: bpm, date: +new Date(date) }));
  const dogBpms = (iteration.dogBpms || []).map(({ bpm, date }) => ({ dog: bpm, date: +new Date(date) }));

  const bpms = [
    ...majaBpms,
    ...dogBpms,
  ].sort(
    (a, b) => b.date - a.date
  );

  const start = format(iteration.timestamp, "HH:mm:ss");
  const end = bpms.length === 0 ? "NA" : format(bpms[0].date, "HH:mm:ss");

  return (
    <Container>
      <Panel>
        <Title>human</Title>
        <HR />
        <Heartrate bpm={majaBpm} color={colors.valueHuman} />
        <Table>
          <Label>heart</Label><Value human>{majaBpm}</Value><Label>bpm</Label>
          <HR style={{ gridColumn: "span 3" }} />
          <Label>resp</Label><Value human>86</Value><Label>bpm</Label>
          <Label>temp</Label><Value human>36.5</Value><Label>&deg;c</Label>
          <HR style={{ gridColumn: "span 3" }} />
          <Label style={{ alignItems: "center" }}>start</Label><Value human style={{ fontSize: "25px", gridColumn: "span 2" }}>{start}</Value>
          <HR style={{ gridColumn: "span 3" }} />
          <Label style={{ alignItems: "center" }}>end</Label><Value human style={{ fontSize: "25px", gridColumn: "span 2" }}>{end}</Value>
        </Table>
      </Panel>
      <Panel>
        <Title>animal</Title>
        <HR />
        <Heartrate bpm={dogBpm} color={colors.valueAnimal} />
        <Table>
          <Label>heart</Label><Value>{dogBpm}</Value><Label>bpm</Label>
          <HR style={{ gridColumn: "span 3" }} />
          <Label>resp</Label><Value>92</Value><Label>bpm</Label>
          <Label>temp</Label><Value>34.8</Value><Label>&deg;c</Label>
          <HR style={{ gridColumn: "span 3" }} />
          <Label style={{ alignItems: "center" }}>start</Label><Value style={{ fontSize: "25px", gridColumn: "span 2" }}>{start}</Value>
          <HR style={{ gridColumn: "span 3" }} />
          <Label style={{ alignItems: "center" }}>end</Label><Value style={{ fontSize: "25px", gridColumn: "span 2" }}>{end}</Value>
        </Table>
      </Panel>
    </Container>
  );
};
