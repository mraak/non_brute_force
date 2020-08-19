import { useStore } from "effector-react";
import React from "react";

import { Apart, Chart, HR, Label, Value } from "../components";
import { formatBpm, formatRank, formatDate } from "../../formatters";

import Generator, { attempts$, rank$ } from "../Generator";

// input hidden output
export default () => {
  const attempts = useStore(attempts$);
  const rank = useStore(rank$);

  return (
    <>
      <Chart style={{ padding: 22 }}>
        <Generator />
      </Chart>
      <HR />
      <Apart small>
        <Label>attempts</Label><Value>{attempts}</Value>
      </Apart>
      <HR />
      <Apart small>
        <Label>class</Label><Value>{formatRank(rank)}</Value>
      </Apart>
    </>
  );
};
