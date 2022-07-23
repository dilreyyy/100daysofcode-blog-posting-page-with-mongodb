const express = require('express');
const db = require('../database/database');
const router = express.Router();
const ObjectId = require('mongodb').ObjectId;

router.get('/', function(req, res) {
  res.redirect('/posts');
});

router.get('/posts', function(req, res) {
  res.render('posts-list');
});

router.get('/new-post', async function(req, res) {
  const authors = await db.getDb().collection('blog_authors').find().toArray();
  // console.log(authors);
  res.render('create-post', {authors: authors});
});

//INSERT DATA
router.post('/posts', async function(req, res){
  const authorId = new ObjectId(req.body.author);
  const result = await db.getDb().collection('blog_authors').findOne(authorId);
  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    content: req.body.content,
    date: new Date(),
    author: {
      authorId: authorId,
      author_name: result.author_name,
      author_email: result.author_email
    }
  }

  await db.getDb().collection('blog_posts').insertOne(newPost);
  res.redirect('/posts');
});

module.exports = router;