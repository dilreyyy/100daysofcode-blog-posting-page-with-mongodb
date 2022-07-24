const express = require("express");
const db = require("../database/database");
const router = express.Router();
const ObjectId = require("mongodb").ObjectId;

router.get("/", function (req, res) {
  res.redirect("/posts");
});

router.get("/posts", async function (req, res) {
  const posts = await db
    .getDb()
    .collection("blog_posts")
    .find({}, { title: 1, summary: 1, "author.author_name": 1 })
    .toArray();

  // console.log(post);
  res.render("posts-list", { posts: posts });
});

router.get("/view-post/:post_id", async function (req, res) {
  const postId = req.params.post_id;

  const post = await db
    .getDb()
    .collection("blog_posts")
    .findOne({ _id: new ObjectId(postId) }, { summary: 0 });

  if(!post){
    return res.render("404");
  }
  // console.log(post);
  res.render("post-detail", { post: post });
});

router.get("/new-post", async function (req, res) {
  const authors = await db.getDb().collection("blog_authors").find().toArray();
  // console.log(authors);
  res.render("create-post", { authors: authors });
});

//INSERT DATA
router.post("/posts", async function (req, res) {
  const authorId = new ObjectId(req.body.author);
  const result = await db.getDb().collection("blog_authors").findOne(authorId);
  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    content: req.body.content,
    date: new Date(),
    author: {
      authorId: authorId,
      author_name: result.author_name,
      author_email: result.author_email,
    },
  };

  await db.getDb().collection("blog_posts").insertOne(newPost);
  res.redirect("/posts");
});

module.exports = router;
