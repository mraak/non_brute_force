import { useStore } from "effector-react";
import React from "react";

import { formatBpm, formatRank, formatDate } from "../../formatters";
import { iteration$ } from "../../store/iteration";

import { HR, Label, Table, Value } from "../components";
import Preview from "../Preview";
import Train from "../Train";

export default () => {
  const iteration = useStore(iteration$);
  
  if(iteration === null) {
    return (
      <div>loading 3d preview</div>
    );
  }

  return (
    <>
      <Preview />
      <Train />
      <Table>
        <HR style={{ gridColumn: "span 3" }} />
        <Label style={{ alignItems: "center" }}>status</Label><Value style={{ fontSize: "25px", gridColumn: "span 2" }}>in progress</Value>
        <HR style={{ gridColumn: "span 3" }} />
        <Label style={{ alignItems: "center" }}>expected class</Label><Value style={{ fontSize: "25px", gridColumn: "span 2" }}>{formatRank(iteration.expectedRank)}</Value>
        <HR style={{ gridColumn: "span 3" }} />
        <Label style={{ alignItems: "center" }}>actual class</Label><Value style={{ fontSize: "25px", gridColumn: "span 2" }}>{formatRank(iteration.actualRank)}</Value>
      </Table>
    </>
  );
};
