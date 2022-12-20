const commentsRouter = require("express").Router({ mergeParams: true });
const postsData = require("../data.json");
const Joi = require("joi");
const uuid = require('uuid');


commentsRouter.use(async function (req, res, next) {
  var dbPosts = req.dbPosts;
  await dbPosts.find({Id:req.params.id}).toArray(function(err, result) {
    if (err) {
      throw err;
    }
    if (!result) {
    res.status(404).send({message:"Post not found."});
    return;
  }
  req.post = result[0];
  next();
  });
});

commentsRouter
  .route("/")
  .get(function (req, res) {
    res.send(req.post.comments);
  })
  // .delete((req, res) => {
  //   const post = req.post;
  //   post.comments = [];
  //   res.send({message:"Comment deleted"});
  // })
  .post(checkSchema,async (req, res) => {
    const id = uuid.v4();
    const data  ={
        "Id": id,
        "comment":req.body.comment
      }
      req.dbPosts.updateOne(
        { Id: req.params.id },
        { $push: { comments: data } }
     )
     await req.dbPosts.find({Id:req.params.id}).toArray(function(err, result) {
      if (err) {
        throw err;
      }
      res.send(result);
    }
    );
  })

commentsRouter
  .route("/:cid")
  .get(getCommentIfExistsById, function (req, res) {
    const comment = req.comment;
    res.send(comment);
  })
  .delete(async(req, res) => {
    await req.dbPosts.updateOne( { Id: req.params.id }, { $pull: { comments: { "Id": req.params.cid } } } )
    res.send({message:"Comment deleted"});
  })
  .put(checkSchema, async (req, res) => {
    await req.dbPosts.updateOne(
      { Id: req.params.id, "comments.Id": req.params.cid },
      { $set: { "comments.$.comment" : req.body.comment } }
   )
   await req.dbPosts.find({Id:req.params.id}).toArray(function(err, result) {
    if (err) {
      throw err;
    }
    res.send(result);
  })
  });

function getCommentIfExistsById(req, res, next) {
  const comment = req.post.comments.find((c) => c.Id == req.params.cid);
  if(!comment){
    res.status(404).send({message:"Comment id does not exists."});
    return;
  }
  req.comment = comment;
  next();
}
function checkSchema(req, res, next) {
  const schema = Joi.object({
    comment: Joi.string().required(),
  });
  const result = schema.validate(req.body);
  const err = result.error;
  if (err) {
    res.send(err);
    return;
  }
  next();
}
module.exports = commentsRouter;
