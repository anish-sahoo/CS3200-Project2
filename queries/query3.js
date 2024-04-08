import { MongoClient } from "mongodb";

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const client = await MongoClient.connect("mongodb://localhost:27017/");
const coll = client.db("nearbyPrices").collection("items");

const originalItem = await coll.findOne({
  "item_id": 2,
  "prices.store.store_id": 291
})

const originalItemObj = originalItem.prices.find(price => price.store.store_id === 291);

console.log('\nOriginal price:', originalItemObj.price);
console.log('\nUpdating price to 8.99');

const updatePrice = async (item_id, store_id, price) => {
  const result = await coll.updateOne(
    {
      "item_id": item_id,
      "prices.store.store_id": store_id
    },
    {
      $set: { "prices.$.price": price, "prices.$.timestamp": new Date() }
    }
  )
  console.log('Modified:', result.modifiedCount, '\n');
}

await updatePrice(2, 291, 8.99);

const updatedItem = await coll.findOne({
  "item_id": 2,
  "prices.store.store_id": 291
})

const updatedItemObj = updatedItem.prices.find(price => price.store.store_id === 291);

console.log('Updated price:', updatedItemObj.price);


await client.close();

// query 3 - update the price of an item at a specific store
// query with update operation

// expected output:
// Original price: 5.1

// Updating price to 8.99
// Modified: 1 

// Updated price: 8.99