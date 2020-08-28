import { format } from "date-fns";
import { useStore } from "effector-react";
import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import styled from "styled-components";

import * as colors from "../colors";
import { Apart, Chart, HR, Label } from "../components";
import { phase1State$ } from "../../store/phases";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

export default () => {
  const phase1State = useStore(phase1State$) || [];

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
          position: "absolute",
          left: 33 + 10,
          right: 0,
          top: 0,
          bottom: 0,
          justifyContent: "space-around",
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={phase1State} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid stroke={colors.array[1]} strokeDasharray="5 5" />
              <Line yAxisId="left" type="monotone" dataKey="loss" dot={false} stroke={colors.valueAnimal} connectNulls isAnimationActive={false} />
              {/* <Line yAxisId="left" type="monotone" dataKey="delta" dot={false} stroke={colors.array[5]} connectNulls isAnimationActive={false} /> */}
              {/* <XAxis dataKey="date" tickFormatter={(date) => format(date, "HH:mm:ss")} isAnimationActive={false} /> */}
              <YAxis yAxisId="left" type="number" isAnimationActive={false} stroke={colors.array[5]} />
              {/* <YAxis yAxisId="right" type="number" orientation="right" isAnimationActive={false} /> */}
              {/* <Legend isAnimationActive={false} /> */}
              <Tooltip formatter={(value) => value.toFixed(2)} contentStyle={{ backgroundColor: colors.array[4], border: `1px solid ${colors.array[1]}`, color: colors.array[5] }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={phase1State} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid stroke={colors.array[1]} strokeDasharray="5 5" />
              <Line yAxisId="left" type="monotone" dataKey="acc" dot={false} stroke={colors.valueHuman} connectNulls isAnimationActive={false} />
              {/* <Line yAxisId="left" type="monotone" dataKey="delta" dot={false} stroke={colors.array[5]} connectNulls isAnimationActive={false} /> */}
              {/* <XAxis dataKey="date" tickFormatter={(date) => format(date, "HH:mm:ss")} isAnimationActive={false} /> */}
              <YAxis yAxisId="left" type="number" isAnimationActive={false} stroke={colors.array[5]} />
              {/* <YAxis yAxisId="right" type="number" orientation="right" isAnimationActive={false} /> */}
              {/* <Legend isAnimationActive={false} /> */}
              <Tooltip formatter={(value) => value.toFixed(2)} contentStyle={{ backgroundColor: colors.array[4], border: `1px solid ${colors.array[1]}`, color: colors.array[5] }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </Container>
      </Chart>
      <HR />
      <Apart style={{ justifyContent: "center" }}>
        <Label style={{ fontSize: 15, textTransform: "initial" }}>Training progress through time (EPOCHS)</Label>
      </Apart>
    </>
  );
};
