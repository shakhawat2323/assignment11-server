const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const corsOptions = {
  origin: ["http://localhost:5173", "https://smirok.netlify.app"],
  Credential: true,
  optionalsucces: true,
};

app.use(express.json());
app.use(cors(corsOptions));

const uri = `mongodb+srv://assignment11:3YqHJfuRz1hVcaby@cluster0.uvwcv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const Artifactcollacetion = client.db("artifactdata").collection("allrtifact ");
const LikeCountcollacetion = client.db("artifactdata").collection("likeCount");
const Blogcollacetion = client.db("artifactdata").collection("Blog");

// app.post("/jwt", async (req, res) => {
//   const email = req.body;
//   const token = jwt.sign(email, process.env.JWT_TOKEN, { expiresIn: "365d" });
//   res
//     .cookie("token", token, {
//       httpOnly: true,
//       secure: false,
//       // secure: process.env.JWT_TOKEN === "production",
//       // sameSite: process.env.JWT_TOKEN === "production" ? "none" : "strict",
//     })
//     .send({ success: true });
// });

app.get("/", (req, res) => {
  res.send("server  is running ok");
});

app.get("/count", async (req, res) => {
  const count = await Artifactcollacetion.estimatedDocumentCount();
  res.send({ count });
});

app.get("/artifact", async (req, res) => {
  console.log("pagination", req.qurey);
  const result = await Artifactcollacetion.find().toArray();
  res.send(result);
});

app.post("/artifact", async (req, res) => {
  const artifac = req.body;
  const result = await Artifactcollacetion.insertOne(artifac);

  res.send(result);
});
app.post("/blog", async (req, res) => {
  const artifac = req.body;
  const result = await Blogcollacetion.insertOne(artifac);
  console.log(result);
  res.send(result);
});
app.get("/blog", async (req, res) => {
  const result = await Blogcollacetion.find().toArray();
  console.log(result);
  res.send(result);
});

app.delete("/blogs/:id", async (req, res) => {
  const id = req.params.id;
  const qurey = { _id: new ObjectId(id) };
  const result = await Blogcollacetion.deleteOne(qurey);
  console.log(id);
  console.log(qurey);
  console.log(result);
  res.send(result);
});

app.get("/arifacts/:email", async (req, res) => {
  const email = req.params.email;

  const query = { useremail: email };

  const result = await Artifactcollacetion.find(query).toArray();

  res.send(result);
});

app.delete("/arifact/:id", async (req, res) => {
  const id = req.params.id;

  const qurey = { _id: new ObjectId(id) };

  const result = await Artifactcollacetion.deleteOne(qurey);

  res.send(result);
});

app.get("/artifact/:id", async (req, res) => {
  const id = req.params.id;
  const qurey = { _id: new ObjectId(id) };
  const result = await Artifactcollacetion.findOne(qurey);
  res.send(result);
});
app.put("/artifact/:id", async (req, res) => {
  const id = req.params.id;
  const artifact = req.body;
  const update = {
    $set: artifact,
  };
  const qurey = { _id: new ObjectId(id) };
  const option = { upsert: true };
  const result = await Artifactcollacetion.updateOne(qurey, update, option);

  res.send(result);
});

app.post("/likecount", async (req, res) => {
  try {
    const artifacts = req.body.artifacts;
    console.log(req.body);

    const query = {
      useremail: artifacts.useremail,
      artifact_id: artifacts._id,
    };

    const alreadyLiked = await LikeCountcollacetion.findOne(query);

    if (alreadyLiked) {
      return res
        .status(400)
        .send("You have already placed a like on this Artifact");
    }

    const likeData = {
      useremail: artifacts.useremail,
      artifact_id: artifacts._id,
      likedAt: new Date(),
    };

    const result = await LikeCountcollacetion.insertOne(likeData);

    const filter = { _id: new ObjectId(artifacts._id) };
    const update = { $inc: { likeCount: 1 } };

    const updateData = await Artifactcollacetion.updateOne(filter, update);

    res.send({ success: true, message: "Like added successfully!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/likecount/:email", async (req, res) => {
  const email = req.params.email;
  const query = { useremail: email };
  const result = await LikeCountcollacetion.find(query).toArray();

  res.send(result);
});
app.get("/allartifact", async (req, res) => {
  try {
    const flter = req.query.flter;
    const search = req.query.search;
    const sort = req.query.sort;
    let options = {};
    if (sort) {
      options.sort = { likeCount: sort === "Ascending" ? 1 : -1 };
    }
    let query = {};
    if (search) {
      query.artifactname = {
        $regex: search,
        $options: "i",
      };
    }
    console.log(query);

    if (flter) query.artifacttype = flter;
    const result = await Artifactcollacetion.find(query, options).toArray();

    res.send(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log("server is running");
});
