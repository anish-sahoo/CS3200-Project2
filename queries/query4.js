import { MongoClient } from "mongodb";

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const client = await MongoClient.connect("mongodb://localhost:27017/");
const coll = client.db("nearbyPrices").collection("items");
const result = await coll.aggregate([
  {
    $unwind: "$prices"
  },
  {
    $match: {
      "prices.store.culture_specialty": "colombian"
    }
  },
  {
    $replaceRoot: { newRoot: "$prices.store" }
  }
]).toArray();

console.log('Id'.padEnd(4),'|', 'Store Name'.padEnd(40),'|', 'Location'.padEnd(16),'|', 'Expense Rating'.padEnd(15),'|', 'Culture Specialty');
console.log('-'.repeat(108));
result.sort((a, b) => a.store_id - b.store_id);
result.forEach(store => {
  console.log(store.store_id.toFixed(0).padEnd(4),'|', store.name.padEnd(40),'|', store.geolocation.name_of_location.padEnd(16),'|',store.expense_rating.padEnd(15),'|', store.culture_specialty);
});

await client.close();

// query 4: get all Colombian grocery stores and their locations in order of store id
// query with aggregation framework