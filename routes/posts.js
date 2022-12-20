const express = require("express");
const postsRouter = new express.Router();
const commentsRouter = require("./comment");
const Joi = require("joi");
const uuid = require("uuid");
const server =require('../server')

postsRouter
  .route("/")
  .get(async(req, res) => {
    var dbPosts = server.getInstance();
    await dbPosts.find({}).toArray(function(err, result) {
      if (err) throw err;
      res.send(result);
    });
    return;
  })
  .post(checkSchema,async (req, res) => {
    const id = uuid.v4();
    const data = {
      Id: id,
      post: req.body.post,
      comments: [],
    };
    var dbPosts = req.dbPosts;
    await dbPosts.insertOne(data, function(err, result) {
      if (err) throw err;
    });
    await dbPosts.find({}).toArray(function(err, result) {
      if (err) throw err;
      res.send(result);
      return;
    });
  });

postsRouter
  .route("/:id")
  .get(getPostIfExistsById, async (req, res) => {
    await res.send(req.post);
  })


  .put(checkSchema, async(req, res) => {
  var dbPosts = req.dbPosts;
  await dbPosts.updateOne(
    { Id: req.params.id },
    {
      $set: { post: req.body.post },
    }
  );
  res.send({message:"Post updated."})
  })


  .delete(async(req, res) => {
    var dbPosts = req.dbPosts;
    await dbPosts.deleteMany({ Id: req.params.id }, function(err, obj) {
      if (err) throw err;
      res.send({message:"Post deleted"});
      return;
    });
  });

 function checkSchema(req, res, next) {
  const schema = Joi.object({
    post: Joi.string().required(),
  });
  const result = schema.validate(req.body);
  const err = result.error;
  if (err) {
    res.status(400).send(err);
    return;
  }
  next();
}

async function getPostIfExistsById(req, res, next) {
  var dbPosts = req.dbPosts;
  await dbPosts.find({Id:req.params.id}).toArray(function(err, result) {
    if (err) {
      throw err;
    }
    if (!result) {
    res.status(404).send({message :"Post not found."});
    return;
  }
  req.post = result;
  next();
  });
}

postsRouter.use("/:id/comments", commentsRouter);

postsRouter.use(
  "/:id/comments",
  function (req, res, next) {
    req.dbPosts = posts;
    next();
  },
  commentsRouter
);
module.exports = postsRouter;
