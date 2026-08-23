const express = require("express");

const router = express.Router();

const {
  createBlog,
  getBlogs,
  deleteBlog,
  likeBlog,
  addComment,
} = require("../controllers/blogController");

/* CREATE BLOG */

router.post("/", createBlog);

/* GET BLOGS */

router.get("/", getBlogs);

/* DELETE BLOG */

router.delete("/:id", deleteBlog);

/* LIKE BLOG */

router.put("/like/:id", likeBlog);

/* COMMENT */

router.post("/comment/:id", addComment);

module.exports = router;