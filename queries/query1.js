import { MongoClient } from "mongodb";

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const client = await MongoClient.connect("mongodb://localhost:27017/");
const coll = client.db("nearbyPrices").collection("items");
const result = await coll.find({"prices.store.culture_specialty": "colombian"}).toArray();

console.log(
  `The count of items that are sold in Colombian grocery stores is: ${result.length}`
);

await client.close();


// query 1: get count of items that are sold in Colombian grocery stores
// query with aggregation framework & counting all documents for a specific user