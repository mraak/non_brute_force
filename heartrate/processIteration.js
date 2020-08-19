// TODO: Move to utils
const heartRateDeltaRank = (rate) => {
  if(rate < 5)
    return 0; // [ 0, 5 )

  if(rate < 10)
    return 1; // [ 5, 10 )

  if(rate < 20)
    return 2; // [ 10, 20 )

  if(rate < 40)
    return 3; // [ 20, 40 )

  return 4; // [ 40, inf )
};

export default (iteration, aggregate) => {
  const { human, animal } = aggregate || { human: null, animal: null };

  const valid = "valid" in iteration ? iteration.valid : true;

  const delta = human !== null && animal !== null ? Math.abs(human.bpm - animal.bpm) : null;
  const actualRank = Number.isFinite(delta) ? heartRateDeltaRank(delta) : null;
  const trainable = valid && Number.isFinite(actualRank);
  const output = trainable
    ? Array.from(Array(5), (_, i) => i === actualRank ? 1 : 0)
    : null;

  return {
    ...iteration,
    actualRank,
    aggregate,
    delta,
    ended: aggregate !== null && !!aggregate.stop,
    output,
    trainable,
    valid,
  };
};
