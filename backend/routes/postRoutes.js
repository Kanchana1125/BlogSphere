const express = require("express");

const router = express.Router();

const {
  createPost,
  getPosts,
  likePost,
  addComment,
} = require("../controllers/postController");

router.post("/create", createPost);

router.get("/", getPosts);

router.put("/like/:id", likePost);

router.post("/comment/:id", addComment);

module.exports = router;