const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

const dbName = "nbf-bpm-activity-ios-dev";
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

export const loadEntriesDesc = async() => {
  const db = await dbPromise;
  const collection = db.collection("entries");

  return collection.find({}).sort({ timestamp: -1 }).toArray();
};
export const loadEntriesAsc = async() => {
  const db = await dbPromise;
  const collection = db.collection("entries");

  return collection.find({}).sort({ timestamp: 1 }).toArray();
};

export const sync = async(items) => {
  const db = await dbPromise;
  const collection = db.collection("entries");

  return collection.bulkWrite(items.map((item) => ({
    updateOne: {
      filter: { _id: item._id },
      // update: { $setOnInsert: item },
      update: { $set: item },
      upsert: true,
    },
  })));
};

export const loadPayloadsSince = async(date) => {
  const db = await dbPromise;
  const collection = db.collection("payload");

  return collection.find({ date: { $gte: date } }, { timeout: true });
};
export const savePayload = async(item) => {
  const db = await dbPromise;
  const collection = db.collection("payload");

  return collection.bulkWrite([{
    updateOne: {
      filter: { _id: item._id },
      // update: { $setOnInsert: item },
      update: { $set: item },
      upsert: true,
    },
  }]);
};

export const loadAggregate = async(query) => {
  const db = await dbPromise;
  const collection = db.collection("aggregates");

  return collection.findOne(query);
};
export const saveAggregate = async(item) => {
  const db = await dbPromise;
  const collection = db.collection("aggregates");

  return collection.bulkWrite([{
    updateOne: {
      filter: { _id: item._id },
      // update: { $setOnInsert: item },
      update: { $set: item },
      upsert: true,
    },
  }]);
};

export const lastSyncedAggregate = async() => {
  const db = await dbPromise;
  const collection = db.collection("aggregates-sync");

  return collection.findOne({ _id: 1 });
};
export const saveLastSyncedAggregate = async(date) => {
  console.log("saveLastSyncedAggregate", date);
  
  const db = await dbPromise;
  const collection = db.collection("aggregates-sync");

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

const cleanUpServer = (eventType) => {
  if(disconnect) {
    disconnect();
    disconnect = null;
  }
};

for(let eventType of [ "exit", "SIGINT", "SIGTERM", "SIGUSR1", "SIGUSR2", "uncaughtException" ]) {
  process.on(eventType, cleanUpServer.bind(null, eventType));
}
