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

import * as colors from "../colors";
import { Apart, Center, Chart, HR, Label, Value } from "../components";
import { formatBpm, formatRank, formatDate } from "../../formatters";
import { previousIteration$ } from "../../store/iterations";

import { format } from "date-fns";

export default () => {
  const iteration = useStore(previousIteration$);
  
  if(iteration === null) {
    return (
      <Center>loading previous iteration</Center>
    );
  }

  const human = iteration.human === null ? [] : iteration.human.entries.map(({ bpm, date }) => ({ maja: bpm, date: +new Date(date) }));
  const animal = iteration.animal === null ? [] : iteration.animal.entries.map(({ bpm, date }) => ({ dog: bpm, date: +new Date(date) }));

  const entries = [
    ...human,
    ...animal,
  ].sort(
    (a, b) => a.date - b.date
  );

  let previousMaja = null, previousDog = null;
  const data = entries.map((item) => {
    const maja = item.maja || previousMaja;
    const dog = item.dog || previousDog;

    previousMaja = maja;
    previousDog = dog;

    return {
      ...item,
      maja,
      dog,
      delta: maja === null || dog === null ? null : Math.abs(maja - dog),
    };
  });

  return (
    <>
      <Apart small>
        <Label>class</Label><Value>{formatRank(iteration.actualRank)}</Value>
      </Apart>
      <HR />
      <Chart style={{ height: "443px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 40, right: 0 /* 40 */, bottom: 5, left: 10 }}>
            <CartesianGrid stroke={colors.border} strokeDasharray="5 5" />
            <Line yAxisId="left" type="monotone" dataKey="maja" dot={false} stroke={colors.valueHuman} connectNulls isAnimationActive={false} />
            <Line yAxisId="left" type="monotone" dataKey="dog" dot={false} stroke={colors.valueAnimal} connectNulls isAnimationActive={false} />
            <Line yAxisId="left" type="monotone" dataKey="delta" dot={false} stroke={colors.label} connectNulls isAnimationActive={false} />
            {/* <XAxis dataKey="date" tickFormatter={(date) => format(date, "HH:mm:ss")} isAnimationActive={false} /> */}
            <YAxis yAxisId="left" type="number" unit="bpm" isAnimationActive={false} stroke={colors.label} />
            {/* <YAxis yAxisId="right" type="number" unit="bpm" orientation="right" isAnimationActive={false} /> */}
            {/* <Legend isAnimationActive={false} /> */}
            <Tooltip labelFormatter={(date) => format(date, "HH:mm:ss")} formatter={(value) => `${value}bpm`} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </Chart>
      <HR />
      <Apart small>
        <Label>avg human bpm</Label><Value human>{formatBpm(iteration.human === null ? null : iteration.human.bpm)}</Value>
      </Apart>
      <HR />
      <Apart small>
        <Label>avg animal bpm</Label><Value>{formatBpm(iteration.animal === null ? null : iteration.animal.bpm)}</Value>
      </Apart>
      <HR />
      <Apart small>
        <Label>avg delta bpm</Label><Value style={{ color: colors.label }}>{formatBpm(iteration.delta)}</Value>
      </Apart>
    </>
  );
};
