const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 5000;

const SECRET_KEY = "fakjhrfiqhfnwaefnjkwaenfliuwae";
const MONGODB_URI = "mongodb://localhost:27017/prices_db"; // Update with your MongoDB URI

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = decoded; // Attach user data to the request object
    next();
  });
};

let db;

async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true });
    db = client.db();
    console.log("Connected to MongoDB database");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

connectToDatabase();

// Serve your API endpoints
app.use(express.static(path.join(__dirname, "dist")));
app.use(express.json());

// User registration endpoint
app.post("/api/register", async (req, res) => {
  const { user_name, full_name, password } = req.body;
  if (!user_name || !full_name || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await db.collection("users").insertOne({ user_name, full_name, password: hashedPassword });
    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error during registration" });
  }
});

// User login endpoint
app.post("/api/login", async (req, res) => {
  const { user_name, password } = req.body;
  if (!user_name || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const user = await db.collection("users").findOne({ user_name });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Password is invalid" });
    }
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "30m" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error during login" });
  }
});

// Serve your API endpoints

// get all the items
app.get("/api/items", async (req, res) => {
  console.log("API Request:", req.url);
  try {
    const items = await db.collection("items").aggregate([
      {
        $lookup: {
          from: "stores",
          localField: "item_id",
          foreignField: "item_id",
          as: "store"
        }
      },
      {
        $unwind: "$store"
      },
      {
        $group: {
          _id: "$store.store_id",
          storeName: { $first: "$store.name" },
          itemCount: { $sum: 1 },
          averagePrice: { $avg: "$store.price" }
        }
      }
    ]).toArray();
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get all the prices for one item
app.get("/api/items/:id", async (req, res) => {
  console.log("API Request:", req.url);
  const itemId = req.params.id;
  try {
    const prices = await db.collection("prices").find({ item_id: itemId }).toArray();
    res.json(prices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// delete a price from the prices table
app.post("/api/items/delete/:id/:sid", verifyJWT, async (req, res) => {
  console.log("API Request:", req.url);
  const itemId = req.params.id;
  const storeId = req.params.sid;
  try {
    await db.collection("prices").deleteOne({ item_id: itemId, store_id: storeId });
    res.json({ message: "Price deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// add a price to the prices table
app.post("/api/items/add/:id/:sid/:price", verifyJWT, async (req, res) => {
  console.log("API Request:", req.url);
  const itemId = req.params.id;
  const storeId = req.params.sid;
  const price = parseFloat(req.params.price);
  try {
    await db.collection("prices").insertOne({ item_id: itemId, store_id: storeId, price: price });
    res.json({ message: "Price added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// update a price in the prices table
app.post("/api/items/update", verifyJWT, async (req, res) => {
  console.log("API Request:", req.url);
  const { itemId, storeId, price } = req.body;
  try {
    await db.collection("prices").updateOne({ item_id: itemId, store_id: storeId }, { $set: { price: price } });
    res.json({ message: "Price updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
