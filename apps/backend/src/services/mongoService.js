const { MongoClient, ServerApiVersion } = require('mongodb');
const env = require('../config/env');

let clientPromise = null;

function getClient() {
  if (!clientPromise) {
    const client = new MongoClient(env.mongo.uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    clientPromise = client.connect().then(() => client);
  }
  return clientPromise;
}

async function findImageAnalysisByName(imgName) {
  const client = await getClient();
  const collection = client.db(env.mongo.dbName).collection(env.mongo.collection);
  return collection.findOne({ ImgName: imgName });
}

async function closeConnection() {
  if (clientPromise) {
    const client = await clientPromise;
    await client.close();
    clientPromise = null;
  }
}

module.exports = { findImageAnalysisByName, closeConnection };
