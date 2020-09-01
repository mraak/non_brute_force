import { combine, createEvent, createEffect, createStore, guard, restore, sample } from "effector";
import { throttle } from "lodash";

import { admin$ } from "./admin";

// current phase
export const setPhase = createEvent();
const phase$ = restore(setPhase, 0);

phase$.watch((phase) => {
  if(phase === 0)
    return;

  console.log("saveCurrentPhase", phase);

  fetch("https://heartrate.miran248.now.sh/api/save-current-phase", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(phase),
  });
});

const fetchRemotePhase = createEffect();
fetchRemotePhase.use(() => fetch("https://heartrate.miran248.now.sh/api/current-phase").then(
  (response) => response.json()
));
export const remotePhase$ = createStore(0)
.on(setPhase, (_, phase) => phase) // only admin calls setPhase directly
.on(fetchRemotePhase.done, (_, { result }) => result ? result.phase : 0);

if(admin$.getState() === false)
  setInterval(() => fetchRemotePhase(), 1000);

fetchRemotePhase();

// phase 1
const savePhase1StateFx = createEffect();
savePhase1StateFx.use(async(state) => {
  await fetch("https://heartrate.miran248.now.sh/api/save-phase-1-state", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state),
  });
  
  return state;
});
export const savePhase1State = throttle(savePhase1StateFx, 500, { leading: true });

let phase1StateTimeout = 0;
const fetchPhase1State = createEvent();
const fetchPhase1StateFx = createEffect();
fetchPhase1StateFx.use(() => {
  clearTimeout(phase1StateTimeout);

  return fetch("https://heartrate.miran248.now.sh/api/phase-1-state").then(
    (response) => response.json()
  );
});
fetchPhase1StateFx.finally.watch(() => {
  phase1StateTimeout = setTimeout(() => fetchPhase1State(), 1000);
});
export const phase1State$ = createStore(null)
.on(savePhase1StateFx.done, (_, { result }) => result)
.on(fetchPhase1StateFx.done, (_, { result }) => result ? result.state : null);

// phase 2
const savePhase2StateFx = createEffect();
savePhase2StateFx.use(async(state) => {
  await fetch("https://heartrate.miran248.now.sh/api/save-phase-2-state", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state),
  });

  return state;
});
export const savePhase2State = throttle(savePhase2StateFx, 500, { leading: true });

let phase2StateTimeout = 0;
const fetchPhase2State = createEvent();
const fetchPhase2StateFx = createEffect();
fetchPhase2StateFx.use(() => {
  clearTimeout(phase2StateTimeout);

  return fetch("https://heartrate.miran248.now.sh/api/phase-2-state").then(
    (response) => response.json()
  );
});
fetchPhase2StateFx.finally.watch(() => {
  phase2StateTimeout = setTimeout(() => fetchPhase2State(), 1000);
});
export const phase2State$ = createStore(null)
.on(savePhase2StateFx.done, (_, { result }) => result)
.on(fetchPhase2StateFx.done, (_, { result }) => result ? result.state : null);

// kickoff
guard({
  source: sample(remotePhase$, fetchPhase1State),
  filter: combine(
    admin$, remotePhase$, fetchPhase1StateFx.pending, phase1State$,
    (admin, phase, pending, state) => (state === null && phase > 0 || admin === false && phase === 1) && pending === false
  ),
  target: fetchPhase1StateFx,
});

guard({
  source: sample(remotePhase$, fetchPhase2State),
  filter: combine(
    admin$, remotePhase$, fetchPhase2StateFx.pending, phase2State$,
    (admin, phase, pending, state) => (state === null && phase > 1 || admin === false && phase === 2) && pending === false
  ),
  target: fetchPhase2StateFx,
});

remotePhase$.watch(() => {
  fetchPhase1State();
  fetchPhase2State();
});
