import { useStore } from "effector-react";
import React from "react";
import styled from "styled-components";

import { HR, Label, Table, Value } from "../components";
import { formatBpm, formatRank, formatDate } from "../../formatters";
import { iteration$ } from "../../store/iteration";

import { Image } from "../components";
import Generator, { attempts$, rank$ } from "../Generator";

// input hidden output
export default () => {
  const attempts = useStore(attempts$);
  const rank = useStore(rank$);

  return (
    <>
      <Generator />
      <Table>
        <HR style={{ gridColumn: "span 3" }} />
        <Label style={{ alignItems: "center" }}>attempt</Label><Value style={{ fontSize: "25px", gridColumn: "span 2" }}>{attempts}</Value>
        <HR style={{ gridColumn: "span 3" }} />
        <Label style={{ alignItems: "center" }}>class</Label><Value style={{ fontSize: "25px", gridColumn: "span 2" }}>{rank}</Value>
      </Table>
    </>
  );
};
