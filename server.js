require("dotenv").config();
const express = require("express");
const router = require("./routes/posts");
const postsData = require("./data.json");
const app = express();
app.use(express.json());
app.listen(3000);
var MongoClient = require("mongodb").MongoClient;
var url = process.env.DATABASE_URL;
var dbo, posts;

MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  dbo = db.db("mydb");
  try {
    posts = dbo.collection("posts");
    if (!posts || posts.length == 0) {
      dbo.collection("posts").insertMany(postsData, function (err, res) {
        if (err) throw err;
      });
    }
    posts = dbr.collection("posts");
  } catch (e) {}
});

app.post("/", function (req, res) {
  var data = req.body.data;
  var img = Buffer.from(data, "base64");
  res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-Length": img.length,
  });
  res.end(img);
});

app.use(
  "/posts",
  function (req, res, next) {
    req.dbPosts = posts;
    var instance1 = Singleton.getInstance();

    next();
  },
  router
);

 var Singleton = (function () {
  var instance;

  function createInstance() {
      var object = posts;
      return object;
  }

  return {
      getInstance: function () {
          if (!instance) {
              instance = createInstance();
          }
          return instance;
      }
  };
})();
module.exports = Singleton;

