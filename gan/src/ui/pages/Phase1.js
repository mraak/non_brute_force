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

import { HR, Label, Table, Value } from "../components";
import { formatBpm, formatRank, formatDate } from "../../formatters";
import { previousIteration$ } from "../../store/iteration";

import { format } from "date-fns";

export default () => {
  const iteration = useStore(previousIteration$);
  
  if(iteration === null) {
    return (
      <div>loading previous iteration</div>
    );
  }

  const majaBpms = (iteration.majaBpms || []).map(({ bpm, date }) => ({ maja: bpm, date: +new Date(date) }));
  const dogBpms = (iteration.dogBpms || []).map(({ bpm, date }) => ({ dog: bpm, date: +new Date(date) }));

  const bpms = [
    ...majaBpms,
    ...dogBpms,
  ].sort(
    (a, b) => a.date - b.date
  );

  let previousMaja = null, previousDog = null;
  const data = bpms.map((item) => {
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
      <Table>
        <Label style={{ alignItems: "center" }}>class</Label><Value style={{ fontSize: "25px", gridColumn: "span 2" }}>{formatRank(iteration.actualRank)}</Value>
        <HR style={{ gridColumn: "span 3" }} />
      </Table>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 40, right: 40, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <Line yAxisId="left" type="monotone" dataKey="maja" stroke="#FF6600" connectNulls isAnimationActive={false} />
          <Line yAxisId="left" type="monotone" dataKey="dog" stroke="#0066FF" connectNulls isAnimationActive={false} />
          <Line yAxisId="right" type="monotone" dataKey="delta" stroke="#333333" connectNulls isAnimationActive={false} />
          <XAxis dataKey="date" tickFormatter={(date) => format(date, "HH:mm:ss")} isAnimationActive={false} />
          <YAxis yAxisId="left" type="number" unit="bpm" isAnimationActive={false} />
          <YAxis yAxisId="right" type="number" unit="bpm" orientation="right" isAnimationActive={false} />
          <Legend isAnimationActive={false} />
          <Tooltip labelFormatter={(date) => format(date, "HH:mm:ss")} formatter={(value) => `${value}bpm`} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
      <Table>
        <HR style={{ gridColumn: "span 3" }} />
        <Label style={{ alignItems: "center" }}>avg human bpm</Label><Value style={{ fontSize: "25px", gridColumn: "span 2" }}>{formatBpm(iteration.maja)}</Value>
        <HR style={{ gridColumn: "span 3" }} />
        <Label style={{ alignItems: "center" }}>avg animal bpm</Label><Value style={{ fontSize: "25px", gridColumn: "span 2" }}>{formatBpm(iteration.dog)}</Value>
        <HR style={{ gridColumn: "span 3" }} />
        <Label style={{ alignItems: "center" }}>avg delta bpm</Label><Value style={{ fontSize: "25px", gridColumn: "span 2" }}>{formatBpm(iteration.delta)}</Value>
      </Table>
    </>
  );
};
