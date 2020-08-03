import { format } from "date-fns";

export const formatBpm = (bpm) => Number.isFinite(bpm) ? Math.round(bpm) : "NA";
export const formatRank = (rank) => Number.isFinite(rank) ? rank : "NA";
export const formatDate = (date) => format(date, "yyyy-MM-dd HH:mm:ss");
