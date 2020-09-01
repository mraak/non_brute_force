import { useStore } from "effector-react";
import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  YAxis
} from "recharts";

import * as colors from "../colors";
import { Horizontal, HR, LabelX, LabelY, Vertical } from "../components";
import { phase1State$ } from "../../store/phases";

export default () => {
  const phase1State = useStore(phase1State$) || [];

  return (
    <>
      <Horizontal>
        <LabelY style={{ width: 33 }}>Training loss</LabelY>
        <Vertical>
          <LineChart data={phase1State} width={569} height={261} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid stroke={colors.array[1]} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="loss" dot={false} stroke={colors.array[8]} connectNulls isAnimationActive={false} />
            <YAxis type="number" stroke={colors.array[5]} isAnimationActive={false} />
            <Tooltip formatter={(value) => value.toFixed(2)} contentStyle={{ backgroundColor: colors.array[4], border: `1px solid ${colors.array[1]}`, color: colors.array[5] }} isAnimationActive={false} />
          </LineChart>
          <LabelX style={{ height: 30 }}>Training progress through time (EPOCHS)</LabelX>
        </Vertical>
      </Horizontal>
      <HR />
      <Horizontal>
        <LabelY style={{ width: 33 }}>Training accuracy</LabelY>
        <Vertical>
          <LineChart data={phase1State} width={569} height={261} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid stroke={colors.array[1]} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="acc" dot={false} stroke={colors.array[8]} connectNulls isAnimationActive={false} />
            <YAxis type="number" stroke={colors.array[5]} isAnimationActive={false} />
            <Tooltip formatter={(value) => value.toFixed(2)} contentStyle={{ backgroundColor: colors.array[4], border: `1px solid ${colors.array[1]}`, color: colors.array[5] }} isAnimationActive={false} />
          </LineChart>
          <LabelX style={{ height: 30 }}>Training progress through time (EPOCHS)</LabelX>
        </Vertical>
      </Horizontal>
    </>
  );
};
