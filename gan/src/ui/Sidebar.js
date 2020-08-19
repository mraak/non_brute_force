import { format } from "date-fns";
import { createEvent, restore } from "effector";
import { useStore } from "effector-react";
import p5 from "p5";
import React, { useMemo } from "react";
import styled from "styled-components";

import { formatBpm, formatRank, formatDate } from "../formatters";
import { currentIteration$ } from "../store/iterations";
import { training$ } from "../store/training";

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
  const training = useStore(training$);
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

  const humanBpm = human === null
    ? null
    : human.bpm;
  const animalBpm = animal === null
    ? null
    : animal.bpm;

  const humanEntries = human === null
    ? []
    : human.entries.map(({ bpm, date }) => ({ maja: bpm, date: +new Date(date) }));
  const animalEntries = animal === null
    ? []
    : animal.entries.map(({ bpm, date }) => ({ dog: bpm, date: +new Date(date) }));

  const humanStart = human === null || humanEntries.length === 0
    ? null
    : humanEntries[0].date;
  const humanStop = human === null || humanEntries.length === 0
    ? null
    : humanEntries[humanEntries.length - 1].date;
  const animalStart = animal === null || animalEntries.length === 0
    ? null
    : animalEntries[0].date;
  const animalStop = animal === null || animalEntries.length === 0
    ? null
    : animalEntries[animal.entries.length - 1].date;

  return (
    <Container>
      <Panel>
        <Title>human</Title>
        <HR />
        <div style={{ paddingBottom: 11, paddingLeft: 22, paddingRight: 22, paddingTop: 11 }}>
          <img src="Heart_Icon.png" style={{ display: "block", height: 28 }} />
        </div>
        <div style={{ paddingLeft: 22, paddingRight: 22 }}>
          <Heartrate bpm={training || ended ? 0 : humanBpm || 0} />
        </div>
        <Table style={{ paddingBottom: 36, paddingTop: 25 }}>
          <Label>heart</Label><BigValue human>{training || ended ? "NA" : formatBpm(humanBpm)}</BigValue><Label>bpm</Label>
        </Table>
        <HR />
        <Table style={{ paddingBottom: 30, paddingTop: 24 }}>
          <Label>resp</Label><BigValue human>{training || ended || humanStart === null ? "NA" : Math.round(respHuman)}</BigValue><Label>bpm</Label>
        </Table>
        <Table style={{ paddingBottom: 34 }}>
          <Label>temp</Label><BigValue human>{training || ended || humanStart === null ? "NA" : tempHuman.toFixed(1)}</BigValue><Label>&deg;c</Label>
        </Table>
        <HR />
        <Apart>
          <Label>start</Label><Value human>{training || humanStart === null ? "NA" : format(humanStart, "HH:mm:ss")}</Value>
        </Apart>
        <HR />
        <Apart>
          <Label>end</Label><Value human>{training || ended === false || humanStop === null ? "NA" : format(humanStop, "HH:mm:ss")}</Value>
        </Apart>
      </Panel>
      <Panel>
        <Title>animal</Title>
        <HR />
        <div style={{ paddingBottom: 11, paddingLeft: 22, paddingRight: 22, paddingTop: 11 }}>
          <img src="Heart_Icon.png" style={{ display: "block", height: 28 }} />
        </div>
        <div style={{ paddingLeft: 22, paddingRight: 22 }}>
          <Heartrate bpm={training || ended ? 0 : animalBpm || 0} />
        </div>
        <Table style={{ paddingBottom: 36, paddingTop: 25 }}>
          <Label>heart</Label><BigValue>{training || ended ? "NA" : formatBpm(animalBpm)}</BigValue><Label>bpm</Label>
        </Table>
        <HR />
        <Table style={{ paddingBottom: 30, paddingTop: 24 }}>
          <Label>resp</Label><BigValue>{training || ended || animalStart === null ? "NA" : Math.round(respAnimal)}</BigValue><Label>bpm</Label>
        </Table>
        <Table style={{ paddingBottom: 34 }}>
          <Label>temp</Label><BigValue>{training || ended || animalStart === null ? "NA" : tempAnimal.toFixed(1)}</BigValue><Label>&deg;c</Label>
        </Table>
        <HR />
        <Apart>
          <Label>start</Label><Value>{training || animalStart === null ? "NA" : format(animalStart, "HH:mm:ss")}</Value>
        </Apart>
        <HR />
        <Apart>
          <Label>end</Label><Value>{training || ended === false || animalStop === null ? "NA" : format(animalStop, "HH:mm:ss")}</Value>
        </Apart>
      </Panel>
    </Container>
  );
};
