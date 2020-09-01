import { format } from "date-fns";
import { useStore } from "effector-react";
import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import * as colors from "../colors";
import { Apart, Center, HR, Label, Spacer, Value } from "../components";
import { formatBpm } from "../../formatters";
import { currentIteration$ } from "../../store/iterations";

export default () => {
  const iteration = useStore(currentIteration$);
  
  if(iteration === null) {
    return (
      <Center>loading iteration</Center>
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
      <LineChart data={data} width={602} height={479} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <CartesianGrid stroke={colors.array[1]} strokeDasharray="5 5" />
        <Line type="monotone" dataKey="maja" dot={false} stroke={colors.valueHuman} connectNulls isAnimationActive={false} />
        <Line type="monotone" dataKey="dog" dot={false} stroke={colors.valueAnimal} connectNulls isAnimationActive={false} />
        <Line type="monotone" dataKey="delta" dot={false} stroke={colors.array[5]} connectNulls isAnimationActive={false} />
        <XAxis dataKey="date" tickFormatter={(date) => format(date, "HH:mm:ss")} isAnimationActive={false} hide={true} />
        <YAxis type="number" unit="bpm" stroke={colors.array[5]} isAnimationActive={false} />
        <Tooltip labelFormatter={(date) => format(date, "HH:mm:ss")} formatter={(value) => `${value}bpm`} contentStyle={{ backgroundColor: colors.array[4], border: `1px solid ${colors.array[1]}`, color: colors.array[5] }} isAnimationActive={false} />
      </LineChart>
      <HR />
      <Apart small>
        <Label style={{ width: 130 }}>avg human</Label>
        <img src="Heart_Icon.png" style={{ width: 21 }} />
        <Spacer />
        <Value style={{ width: 50, color: colors.valueHuman }}>{formatBpm(iteration.human === null ? null : iteration.human.bpm)}</Value>
      </Apart>
      <HR />
      <Apart small>
        <Label style={{ width: 130 }}>avg animal</Label>
        <img src="Heart_Icon.png" style={{ width: 21 }} />
        <Spacer />
        <Value style={{ width: 50, color: colors.valueAnimal }}>{formatBpm(iteration.animal === null ? null : iteration.animal.bpm)}</Value>
      </Apart>
      <HR />
      <Apart small>
        <Label style={{ width: 130 }}>avg delta</Label>
        <img src="Heart_Icon.png" style={{ width: 21 }} />
        <Spacer />
        <Value style={{ width: 50, color: colors.array[5] }}>{formatBpm(iteration.delta)}</Value>
      </Apart>
    </>
  );
};
