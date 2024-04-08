import { MongoClient } from "mongodb";

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const client = await MongoClient.connect("mongodb://localhost:27017/");
const coll = client.db("nearbyPrices").collection("items");
const result = await coll.aggregate([
    {
      $match: {
        $or: [
          { "category": "food" },
          { "category": "produce" }
        ]
      }
    },
    {
      $unwind: "$prices"
    },
    {
      $group: {
        _id: "$item_id",
        item_name: { $first: "$item_name" },
        category: { $first: "$category" },
        lowest_price: { $min: "$prices.price" }
      }
    }
])
.toArray();

// fancy table style output
console.log('Cheapest prices for Food or Produce:');
console.log(`${'Item Name'.padEnd(40)} | ${'Category'.padEnd(10)} | Lowest Price |`);
console.log('-'.repeat(68) + '-|');
result.forEach(item => {
  console.log(`${item.item_name.padEnd(40)} | ${item.category.padEnd(10)} | ${item.lowest_price.toFixed(2).padStart(9).padEnd(12)} |`);
});

await client.close();

// query 2: get the cheapest price all items that are food and produce
// query with complex criterion & aggregation framework