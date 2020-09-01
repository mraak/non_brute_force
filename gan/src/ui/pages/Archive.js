import { format } from "date-fns";
import { useStore } from "effector-react";
import React from "react";
import styled from "styled-components";

import { formatBpm, formatRank, formatDate } from "../../formatters";
import { admin$ } from "../../store/admin";
import { iterations$, saveIteration } from "../../store/iterations";

import * as colors from "../colors";
import { Center, Horizontal, HR, Label, LabelX, LabelY, Panel, Vertical, VR, Title } from "../components";
import HorizontalPreview from "../HorizontalPreview";

const Container = styled.div`
  display: grid;
  grid-auto-columns: inherit;
  grid-auto-flow: row;
  grid-auto-rows: 322px 300px;
  grid-gap: 17px;
  height: 639px;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`;

const Grid = styled.div`
  color: ${colors.array[5]};
  display: grid;
  flex: 1;
  font-size: 1ch;
  grid-auto-columns: 49px;
  grid-auto-flow: column;
  grid-template-rows: repeat(5, 49px);
  overflow-x: auto;

  & > * {
    border-right: 1px dashed ${colors.array[1]};
    display: grid;
    place-items: center;
  }
`;

const IterationsContainer = styled.div`
  overflow-y: auto;

  & > * + * {
    border-top: 1px solid ${colors.array[1]};
  }
`;

const renderColumn = (memo, { actualRank, timestamp }, i) => {
  const skip = 4 - actualRank;
  const span = actualRank + 1;

  return [
    ...memo,
    ...(skip === 0 ? [] : [(
      <div key={`${i}-skip`} style={{
        gridRow: `span ${skip}`,
      }} />
    )]),
    (
      <div key={`${i}-span`} style={{
        alignItems: "flex-start",
        backgroundColor: colors.array[10],
        gridRow: `span ${span}`,
        paddingTop: 10,
      }}>{format(timestamp, "MM/dd")}<br />{format(timestamp, "HH:mm")}</div>
    ),
  ];
};

const renderIteration = (admin) => (iteration, i) => {
  const { actualRank, animal, combined, delta, expectedRank, human, timestamp, title, trainable, valid } = iteration;

  const key = `${timestamp}-${title}`;

  return (
    <div key={key} style={{ backgroundColor: i & 1 === 1 ? colors.array[4] : colors.array[0], display: "flex" }}> {/*, height: 269 }}> */}
      <Center style={{ gridGap: 10, padding: 26, textAlign: "center", width: 202 }}>
        {admin && (
          <>
            <input type="checkbox"
              id={key}
              checked={valid}
              disabled={!("_id" in iteration)}
              onChange={() => saveIteration({ _id: iteration._id, valid: !valid })}
              />
            <label htmlFor={key}></label>
          </>
        )}
        <Label style={{ lineHeight: "32px" }}>{formatDate(timestamp)}</Label>
      </Center>
      <VR />
      <div style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 26,
      }}>
        <HorizontalPreview layout={combined} />
        <div style={{
          display: "flex",
          justifyContent: "space-around",
          paddingTop: 14,
        }}>
          <Center style={{ gridGap: 10 }}>
            <Label>maja bpm</Label>
            <Label as={"b"} style={{ color: colors.array[8] }}>{formatBpm(human === null ? null : human.bpm)}</Label>
          </Center>
          <Center style={{ gridGap: 10 }}>
            <Label>dog bpm</Label>
            <Label as={"b"} style={{ color: colors.array[8] }}>{formatBpm(animal === null ? null : animal.bpm)}</Label>
          </Center>
          <Center style={{ gridGap: 10 }}>
            <Label>delta bpm</Label>
            <Label as={"b"} style={{ color: colors.array[8] }}>{formatBpm(delta)}</Label>
          </Center>
          <Center style={{ gridGap: 10 }}>
            <Label>class</Label>
            <Label as={"b"} style={{ color: colors.array[8] }}>{formatRank(actualRank)}</Label>
          </Center>
          <Center style={{ gridGap: 10 }}>
            <Label>match</Label>
            <Label as={"b"} style={{ color: colors.array[8] }}>{expectedRank === actualRank ? "YES" : "NO"}</Label>
          </Center>
          <Center style={{ gridGap: 10 }}>
            <Label>trainable</Label>
            <Label as={"b"} style={{ color: colors.array[8] }}>{trainable ? "YES" : "NO"}</Label>
          </Center>
        </div>
      </div>
    </div>
  );
};

export default () => {
  const admin = useStore(admin$);
  const iterations = useStore(iterations$);

  const valid = admin === false;

  const data = iterations && iterations.filter(
    (iteration) => valid === false || iteration.valid
  ) || [];

  const trainableData = iterations && iterations.filter(
    (iteration) => iteration.trainable
  ) || [];
  trainableData.sort(
    (a, b) => b.timestamp - a.timestamp
  );

  return (
    <Container>
      <Panel>
        <Title>neural network learning curve through time (all iterations)</Title>
        <HR />
        <Horizontal>
          <LabelY style={{ textTransform: "uppercase" }}>class</LabelY>
          <Vertical style={{ flex: 1, overflowX: "hidden" }}>
            <Grid className="graph">
              <Center style={{ backgroundColor: colors.array[4] }}><Label>4</Label></Center>
              <Center style={{ backgroundColor: colors.array[4] }}><Label>3</Label></Center>
              <Center style={{ backgroundColor: colors.array[4] }}><Label>2</Label></Center>
              <Center style={{ backgroundColor: colors.array[4] }}><Label>1</Label></Center>
              <Center style={{ backgroundColor: colors.array[4] }}><Label>0</Label></Center>
              {trainableData.reduce(renderColumn, [])}
            </Grid>
            <LabelX style={{ textTransform: "uppercase" }}>time</LabelX>
          </Vertical>
        </Horizontal>
      </Panel>
      
      <Panel>
        <IterationsContainer>
        {data.map(renderIteration(admin))}
        </IterationsContainer>
      </Panel>
    </Container>
  );
};
