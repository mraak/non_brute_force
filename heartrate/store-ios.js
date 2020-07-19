// import AWS from "aws-sdk";
//
// AWS.config.update({
//   credentials: new AWS.Credentials("client", "secret"),
//   region: "eu-west-1",
// });
//
// const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });
//
// export const load = () => ddb.scan({
//   TableName: "nbf-bpm-activity-dev",
// }).promise();
//
// export const save = (data) => ddb.put({
//   TableName: "nbf-bpm-activity-dev",
//   Item: data,
// }).promise();

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

export const load = async() => {
  const db = await dbPromise;
  const collection = db.collection("entries");

  return collection.find({}).sort({ timestamp: -1 }).toArray();
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

export const payloads = async() => {
  const db = await dbPromise;
  const collection = db.collection("payload");

  return collection.find({}).sort({ date: -1 }).toArray();
};
export const payload = async(item) => {
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

const cleanUpServer = (eventType) => {
  if(disconnect) {
    disconnect();
    disconnect = null;
  }
};

for(let eventType of [ "exit", "SIGINT", "SIGTERM", "SIGUSR1", "SIGUSR2", "uncaughtException" ]) {
  process.on(eventType, cleanUpServer.bind(null, eventType));
}
