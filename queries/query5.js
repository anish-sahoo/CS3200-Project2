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
    $group: {
      _id: "$prices.store.store_id",
      storeName: { $first: "$prices.store.name" },
      itemCount: { $sum: 1 },
      averagePrice: { $avg: "$prices.price" }
    }
  },
  {
    $project: {
      _id: 0,
      store_id: "$_id",
      storeName: 1,
      itemCount: 1,
      averagePrice: 1
    }
  }
]).toArray();

result.sort((a, b) => a.store_id - b.store_id);

console.log('Store Id'.padEnd(8),'|', 'Store Name'.padEnd(40),'|', 'Item Count'.padEnd(10),'|', 'Average Price');
console.log('-'.repeat(68));
result.forEach(store => {
  console.log(store.store_id.toFixed(0).padEnd(8),'|', store.storeName.padEnd(40),'|', store.itemCount.toFixed(0).padEnd(10),'|', store.averagePrice.toFixed(2));
});


console.log('\nNumber of stores:', result.length);
console.log('Number of listing:', result.reduce((acc, store) => acc + store.itemCount, 0));
console.log('Average Price of all items:', (result.reduce((acc, store) => acc + store.averagePrice, 0) / result.length).toFixed(2));

await client.close();

// query 5: get the average price of all items at each store
// query with aggregation framework