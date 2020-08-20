import { useStore } from "effector-react";
import React from "react";

import * as colors from "../colors";
import { Apart, Chart, HR, Label, Value } from "../components";
import { formatBpm, formatRank, formatDate } from "../../formatters";

import Generator, { attempts$, rank$ } from "../Generator";

// input hidden output
export default () => {
  const attempts = useStore(attempts$);
  const rank = useStore(rank$);

  return (
    <>
      <Chart style={{ padding: 52 }}>
        <Generator />
      </Chart>
      <HR />
      <Apart>
        <Label style={{ fontSize: 15 }}>installation map</Label>
        <Label style={{ fontSize: 15, color: colors.array[1] }}>|</Label>
        <Label style={{ fontSize: 15 }}>hidden layers</Label>
        <Label style={{ fontSize: 15, color: colors.array[1] }}>|</Label>
        <Label style={{ fontSize: 15 }}>matching classes</Label>
      </Apart>
      {/* <Apart small>
        <Label>attempts</Label><Value>{attempts}</Value>
      </Apart>
      <HR />
      <Apart small>
        <Label>class</Label><Value>{formatRank(rank)}</Value>
      </Apart> */}
    </>
  );
};
