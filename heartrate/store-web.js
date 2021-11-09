const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

const dbName = "nbf-bpm-activity-web-dev";
const url = "mongodb+srv://nbf:nuVVgpFO5F2WO1Vm@cluster0-azq8r.mongodb.net/${dbName}?retryWrites=true&w=majority";

let connected;
const dbPromise = new Promise((resolve, reject) => connected = resolve);
let disconnect;

// Use connect method to connect to the server
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect((error) => {
  assert.equal(null, error);

  console.log("Connected successfully to server");

  connected(client.db(dbName));
  connected = null;

  disconnect = () => client.close();
});

export const loadIterations = async() => {
  const db = await dbPromise;
  const collection = db.collection("iterations");

  return collection.find({}, { projection: { "aggregate.human.entries": 0, "aggregate.animal.entries": 0 } }).sort({ timestamp: -1 }).toArray();
};
export const loadIteration = async(id) => {
  const db = await dbPromise;
  const collection = db.collection("iterations");

  return collection.findOne({ _id: id });
};
export const loadCurrentIteration = async() => {
  const db = await dbPromise;
  const collection = db.collection("iterations");

  return collection.findOne({ valid: true }, { sort: { timestamp: -1 }, skip: 0 });
};
export const loadPreviousIteration = async() => {
  const db = await dbPromise;
  const collection = db.collection("iterations");

  return collection.findOne({ trainable: true }, { sort: { timestamp: -1 }, skip: 1 });
};

export const saveIteration = async(item) => {
  const db = await dbPromise;
  const collection = db.collection("iterations");

  return collection.bulkWrite([{
    updateOne: {
      filter: { _id: item._id },
      // update: { $setOnInsert: item },
      update: { $set: item },
      upsert: true,
    },
  }]);
};

export const removeInvalidIterations = async() => {
  const db = await dbPromise;
  const collection = db.collection("iterations");

  return collection.deleteMany({ valid: false });
};

export const loadIterationsSince = async(date) => {
  const db = await dbPromise;
  const collection = db.collection("iterations");

  return collection.find({ timestamp: { $gte: date } }, { timeout: true });
};

export const lastSyncedIteration = async() => {
  const db = await dbPromise;
  const collection = db.collection("iterations-sync");

  return collection.findOne({ _id: 1 });
};
export const saveLastSyncedIteration = async(date) => {
  console.log("saveLastSyncedIteration", date);
  
  const db = await dbPromise;
  const collection = db.collection("iterations-sync");

  return collection.bulkWrite([{
    updateOne: {
      filter: { _id: 1 },
      // update: { $setOnInsert: item },
      update: { $set: {
        _id: 1,
        date,
      } },
      upsert: true,
    },
  }]);
};

export const loadCurrentPhase = async() => {
  const db = await dbPromise;
  const collection = db.collection("current-phase");

  return collection.findOne({ _id: 1 });
};
export const saveCurrentPhase = async(phase) => {
  console.log("saveCurrentPhase", phase);
  
  const db = await dbPromise;
  const collection = db.collection("current-phase");

  return collection.bulkWrite([{
    updateOne: {
      filter: { _id: 1 },
      // update: { $setOnInsert: item },
      update: { $set: {
        _id: 1,
        phase,
      } },
      upsert: true,
    },
  }]);
};
export const loadPhase1State = async() => {
  const db = await dbPromise;
  const collection = db.collection("phase-1-state");

  return collection.findOne({ _id: 1 });
};
export const savePhase1State = async(state) => {
  console.log("savePhase1State", state);
  
  const db = await dbPromise;
  const collection = db.collection("phase-1-state");

  return collection.bulkWrite([{
    updateOne: {
      filter: { _id: 1 },
      // update: { $setOnInsert: item },
      update: { $set: {
        _id: 1,
        state,
      } },
      upsert: true,
    },
  }]);
};
export const loadPhase2State = async() => {
  const db = await dbPromise;
  const collection = db.collection("phase-2-state");

  return collection.findOne({ _id: 1 });
};
export const savePhase2State = async(state) => {
  console.log("savePhase2State", state);
  
  const db = await dbPromise;
  const collection = db.collection("phase-2-state");

  return collection.bulkWrite([{
    updateOne: {
      filter: { _id: 1 },
      // update: { $setOnInsert: item },
      update: { $set: {
        _id: 1,
        state,
      } },
      upsert: true,
    },
  }]);
};

const cleanUpServer = (eventType) => {
  if(disconnect) {
    disconnect();
    disconnect = null;
  }
};

for(let eventType of [ "exit", "SIGINT", "SIGTERM", "SIGUSR1", "SIGUSR2", "uncaughtException" ]) {
  process.on(eventType, cleanUpServer.bind(null, eventType));
}
