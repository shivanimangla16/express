const express = require("express");
const postsRouter = new express.Router();
const commentsRouter = require("./comment");
const postsData = require("../data.json");
const Joi = require("joi");
const uuid = require("uuid");
const { Router } = require("express");

postsRouter
  .route("/")
  .get((req, res) => {
    // var db = req.db;

    // try {
    //   db
    //     .collection("posts")
    //     .find({})
    //     .toArray(function (err, result) {
    //       if (err) throw err;
    //       console.log(result);
    //       db.close();
    //       res.send(result);
    //     });
    // } catch (e) {
    //   console.log("Collection already created!");
    //   db.close();
    // }
    res.send(db);
  })
  .post(checkSchema, (req, res) => {
    const id = uuid.v4();
    const data = {
      Id: id,
      post: req.body.post,
      comments: [],
    };
    postsData.push(data);
    res.send(postsData);
  });

postsRouter
  .route("/:id")
  .get(getPostIfExistsById, (req, res) => {
    res.send(req.post);
  })
  .put(checkSchema, getPostIfExistsById, (req, res) => {
    const currentPost = req.post;
    currentPost.post = req.body.post;
    res.send(currentPost);
  })
  .delete(getPostIfExistsById, (req, res) => {
    const currentPost = req.post;
    const index = postsData.indexOf(currentPost);
    postsData.splice(index, 1);
    res.send(postsData);
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

function getPostIfExistsById(req, res, next) {
  const post = postsData.find((c) => c.Id == req.params.id);
  if (!post) {
    res.status(404).send("Post not found.");
    return;
  }
  req.post = post;
  next();
}

postsRouter.use("/:id/comments", commentsRouter);
module.exports = postsRouter;
