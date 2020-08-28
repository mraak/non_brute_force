import { format } from "date-fns";
import { createEvent, restore } from "effector";
import { useStore } from "effector-react";
import p5 from "p5";
import React, { useMemo } from "react";
import styled from "styled-components";

import { formatBpm, formatRank, formatDate } from "../formatters";
import { currentIteration$ } from "../store/iterations";
import { remotePhase$ } from "../store/phases";

import { Apart, BigValue, Center, HR, Label, Panel, Span2, Table, Title, Value } from "./components";
import Heartrate from "./Heartrate";

p5.prototype.noiseSeed(123);
const nextNoise = () => p5.prototype.noise(+new Date / 100000);
const scale = (value, min, max) => value * (max - min) + min;
// const nextValue = (value, min, max, alpha = .03) => {
  // value += ((max - min) * (random() - .5)) * alpha;
  // value = Math.max(min, Math.min(max, value));
  // return Math.round(value * 10) / 10;
// };

const setRespHuman = createEvent();
const respHuman$ = restore(setRespHuman, 15);
const setRespAnimal = createEvent();
const respAnimal$ = restore(setRespAnimal, 20);

const setTempHuman = createEvent();
const tempHuman$ = restore(setTempHuman, 33);
const setTempAnimal = createEvent();
const tempAnimal$ = restore(setTempAnimal, 36.5);

const refreshStats = () => {
  const noise = nextNoise();
  setRespHuman(scale(noise, 12, 18));
  setRespAnimal(scale(noise, 15, 30));

  setTempHuman(scale(noise, 31, 35.5));
  setTempAnimal(scale(noise, 34, 37.2));
};

const Container = styled.aside`
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: 100%;
  grid-gap: 17px;
  grid-template-columns: repeat(2, 330px);
  width: 677px;
`;

export default () => {
  const phase = useStore(remotePhase$);
  const iteration = useStore(currentIteration$);

  const respHuman = useStore(respHuman$);
  const respAnimal = useStore(respAnimal$);
  
  const tempHuman = useStore(tempHuman$);
  const tempAnimal = useStore(tempAnimal$);

  useMemo(() => { setTimeout(refreshStats, 0) }, [ iteration ]);

  if(iteration === null) {
    return (
      <Container>
        <Panel as={Center} style={{ gridColumn: "2 span" }}>loading iteration</Panel>
      </Container>
    );
  }

  const { human, animal, ended } = iteration;

  const humanEntries = human === null
    ? []
    : human.entries.map(({ bpm, date }) => ({ maja: bpm, date: +new Date(date) }));
  const animalEntries = animal === null
    ? []
    : animal.entries.map(({ bpm, date }) => ({ dog: bpm, date: +new Date(date) }));

  const humanEntriesCount = humanEntries.length;
  const animalEntriesCount = animalEntries.length;

  const hideHuman = phase < 4 || humanEntriesCount === 0;
  const hideAnimal = phase < 4 || animalEntriesCount === 0;

  const humanBpm = hideHuman
    ? null
    : human.bpm;
  const animalBpm = hideAnimal
    ? null
    : animal.bpm;

  const humanStart = hideHuman
    ? null
    : humanEntries[0].date;
  const humanStop = hideHuman
    ? null
    : humanEntries[humanEntriesCount - 1].date;
  const animalStart = hideAnimal
    ? null
    : animalEntries[0].date;
  const animalStop = hideAnimal
    ? null
    : animalEntries[animalEntriesCount - 1].date;

  return (
    <Container>
      <Panel>
        <Title>human</Title>
        <HR />
        <div style={{ paddingBottom: 11, paddingLeft: 22, paddingRight: 22, paddingTop: 11 }}>
          <img src="Heart_Icon.png" style={{ display: "block", height: 28 }} />
        </div>
        <div style={{ paddingLeft: 22, paddingRight: 22 }}>
          <Heartrate bpm={hideHuman || ended ? 0 : humanBpm || 0} />
        </div>
        <Table style={{ paddingBottom: 36, paddingTop: 25 }}>
          <Label>heart</Label><BigValue human>{hideHuman || ended ? "NA" : formatBpm(humanBpm)}</BigValue><Label>bpm</Label>
        </Table>
        <HR />
        <Table style={{ paddingBottom: 30, paddingTop: 24 }}>
          <Label>resp</Label><BigValue human>{hideHuman || ended ? "NA" : Math.round(respHuman)}</BigValue><Label>bpm</Label>
        </Table>
        <Table style={{ paddingBottom: 34 }}>
          <Label>temp</Label><BigValue human>{hideHuman || ended ? "NA" : tempHuman.toFixed(1)}</BigValue><Label>&deg;c</Label>
        </Table>
        <HR />
        <Apart>
          <Label>start</Label><Value human>{phase < 4 || hideHuman ? "NA" : format(humanStart, "HH:mm:ss")}</Value>
        </Apart>
        <HR />
        <Apart>
          <Label>end</Label><Value human>{hideHuman ? "NA" : format(humanStop, "HH:mm:ss")}</Value>
        </Apart>
      </Panel>
      <Panel>
        <Title>animal</Title>
        <HR />
        <div style={{ paddingBottom: 11, paddingLeft: 22, paddingRight: 22, paddingTop: 11 }}>
          <img src="Heart_Icon.png" style={{ display: "block", height: 28 }} />
        </div>
        <div style={{ paddingLeft: 22, paddingRight: 22 }}>
          <Heartrate bpm={hideAnimal || ended ? 0 : animalBpm || 0} />
        </div>
        <Table style={{ paddingBottom: 36, paddingTop: 25 }}>
          <Label>heart</Label><BigValue>{hideAnimal || ended ? "NA" : formatBpm(animalBpm)}</BigValue><Label>bpm</Label>
        </Table>
        <HR />
        <Table style={{ paddingBottom: 30, paddingTop: 24 }}>
          <Label>resp</Label><BigValue>{hideAnimal || ended ? "NA" : Math.round(respAnimal)}</BigValue><Label>bpm</Label>
        </Table>
        <Table style={{ paddingBottom: 34 }}>
          <Label>temp</Label><BigValue>{hideAnimal || ended ? "NA" : tempAnimal.toFixed(1)}</BigValue><Label>&deg;c</Label>
        </Table>
        <HR />
        <Apart>
          <Label>start</Label><Value>{phase < 4 || hideAnimal ? "NA" : format(animalStart, "HH:mm:ss")}</Value>
        </Apart>
        <HR />
        <Apart>
          <Label>end</Label><Value>{hideAnimal ? "NA" : format(animalStop, "HH:mm:ss")}</Value>
        </Apart>
      </Panel>
    </Container>
  );
};
