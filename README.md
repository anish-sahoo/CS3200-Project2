# CS3200-Project2

Second Project for Spring 2024 Database Design

## Documentation:

- [Requirements Document](docs/design_document.pdf)
- [MongoDB Collection Structure](uml_diagram.json)

### Data:

- [Sample JSON data](sample_data.json)
- [Dump File](dump/nearbyPrices/)

### Queries

- [Query 1](queries/query1.js)
- [Query 2](queries/query2.js)
- [Query 3](queries/query3.js)
- [Query 4](queries/query4.js)
- [Query 5](queries/query5.js)

### Try it out:

In order to test out the Express server, head on to [nearbyprices.asahoo.dev](https://nearbyprices.asahoo.dev)!

To test out the queries,
- Import the data into the MongoDB database:
```bash
mongoimport --db nearbyPrices --collection items --file dump/nearbyPrices/items.bson
```
```bash
mongoimport --db nearbyPrices --collection users --file dump/nearbyPrices/users.bson
```
- Run `npm install` in the project  directory
- run queries by typing `node queries/query1.js` (replace 1 with the correct query number)
