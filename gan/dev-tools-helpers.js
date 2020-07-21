// converts iteration from iterations.js to multiline string of empty strings and zeros
// copies the result to clipboard
function idsToBinary(array) {
  const result = Array.from(Array(73), (_, i) => array.indexOf(i + 1) < 0 ? "" : "1");

  copy(result.join("\n"));
}


const groupByIteration = (data) => data.beats.reduce((memo, entry) => {
  let iteration = memo[entry.iteration];
  if(!iteration) {
    iteration = memo[entry.iteration] = {};
  }

  let group = iteration[entry.device];
  if(!group) {
    group = iteration[entry.device] = [];
  }
  group.push(entry);

  return memo;
}, {});

const averageBpm = (groups) => Object.keys(groups).sort((a, b) => a - b).map((groupKey) => {
  const group = groups[groupKey];
  return {
    iteration: groupKey,
    date: new Date(+groupKey * 1000).toLocaleString(),
    devices: Object.keys(group).reduce((memo, deviceKey) => {
      const entries = group[deviceKey];
      entries.sort((a, b) => +a.timestamp - +b.timestamp);

      const count = entries.length;

      const latest = entries[count - 1];

      memo[deviceKey] = {
        latest: {
          timestamp: new Date(+latest.timestamp * 1000).toLocaleString(),
          bpm: +latest.bpm,
        },
        count,
        bpm: Math.round(entries.reduce((memo, entry) => memo + +entry.bpm, 0) / count),
      };

      return memo;
    }, {}),
  };
});

JSON.stringify(averageBpm(groupByIteration(JSON.parse(document.body.getElementsByTagName("pre")[0].textContent))), null, 2)

averageBpm(groupByIteration(JSON.parse(document.body.getElementsByTagName("pre")[0].textContent)))
