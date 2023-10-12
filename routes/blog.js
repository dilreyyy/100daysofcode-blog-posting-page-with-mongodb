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

//VIEW FETCH DATA
router.get("/view-post/:post_id", async function (req, res) {
  const postId = req.params.post_id;

  const post = await db
    .getDb()
    .collection("blog_posts")
    .findOne({ _id: new ObjectId(postId) }, { summary: 0 });

  post.humanReadableDate = post.date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  post.date = post.date.toISOString();

  res.render("post-detail", { post: post });
});

router.get("/edit/:post_id", async function (req, res) {
  const postId = req.params.post_id;

  const post = await db
    .getDb()
    .collection("blog_posts")
    .findOne(
      { _id: new ObjectId(postId) },
      { _id: 1, title: 1, summary: 1, content: 1 }
    );

  // console.log(post);
  res.render("update-post", { post: post });
});

router.post("/edit/:post_id", async function (req, res) {
  const post_id = req.params.post_id;

  await db
    .getDb()
    .collection("blog_posts")
    .updateOne(
      { _id: new ObjectId(post_id) },
      {
        $set: {
          title: req.body.title,
          summary: req.body.summary,
          content: req.body.content,
        },
      }
    );

  res.redirect("/posts");
});

router.post("/delete/:post_id", async function(req, res){
  const post_id = new ObjectId(req.params.post_id);
  await db.getDb().collection('blog_posts').deleteOne({_id: post_id});
  res.redirect('/posts');
});

router.get("/");

module.exports = router;
