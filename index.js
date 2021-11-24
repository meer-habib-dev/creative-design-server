const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

// middlewire
app.use(express.json());
app.use(cors());

// Database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uym3z.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log(uri);
async function run() {
  try {
    client.connect();
    // console.log("hitting inside");

    const database = client.db("Creative_Design");
    const designCollection = await database.collection("designs");
    const ordersCollection = await database.collection("orders");
    const reviewsCollection = await database.collection("reviews");
    const usersCollection = await database.collection("users");

    // Getting Design Templates
    app.get("/designs", async (req, res) => {
      const cursor = designCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });
    // single design
    app.get("/designs/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      // console.log(query);
      // console.log(result);
      const query = { _id: ObjectId(id) };
      const result = await designCollection.findOne(query);
      res.json(result);
    });
    // Get All Orders (admin)
    app.get("/orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });
    // Get My Orders (User)
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };

      const cursor = ordersCollection.find(query);
      const result = await cursor.toArray();
      console.log(email, result);
      res.json(result);
    });
    // Checking User of admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      console.log(user);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    // Get reviews here
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });
    // POST METHODS STATS HERE
    // Post New Design
    app.post("/designs", async (req, res) => {
      const cursor = req.body;
      console.log(cursor);
      const result = await designCollection.insertOne(cursor);
      res.json(result);
    });
    //Placing orders
    app.post("/orders", async (req, res) => {
      const cursor = req.body;
      const result = await ordersCollection.insertOne(cursor);
      res.json(result);
    });
    // Post User Review
    app.post("/reviews", async (req, res) => {
      const cursor = req.body;
      const result = await reviewsCollection.insertOne(cursor);
      res.json(result);
    });
    // Post Users info
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    // DELETE METHODS HERE
    // delete designs here
    app.delete("/designs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await designCollection.deleteOne(query);
      console.log(id, query, result);
      res.json(result);
    });

    // delete myorder here (Admin & User)
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    // UPDATE METHODS HERE
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;

      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: data.status,
        },
      };
      const result = await ordersCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      res.json(result);
    });
    // Update User data for google
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log();
      res.json(result);
    });
    // Create admin role
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    // client.close()
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server Running");
});

app.listen(port, () => {
  console.log("Listening to Port: ", port);
});
