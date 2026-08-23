const Blog = require("../models/Blog");

/* ================= CREATE BLOG ================= */

exports.createBlog = async (req, res) => {

  try {

    const {
      title,
      content,
      image,
      author,
    } = req.body;

    const blog = await Blog.create({

      title,

      content,

      image,

      author,

      likes: 0,

      comments: [],

    });

    res.status(201).json(blog);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};

/* ================= GET BLOGS ================= */

exports.getBlogs = async (req, res) => {

  try {

    const blogs = await Blog.find()
      .sort({ createdAt: -1 });

    res.status(200).json(blogs);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};

/* ================= DELETE BLOG ================= */

exports.deleteBlog = async (req, res) => {

  try {

    await Blog.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      message: "Blog Deleted",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};

/* ================= LIKE BLOG ================= */

exports.likeBlog = async (req, res) => {

  try {

    const blog = await Blog.findById(
      req.params.id
    );

    blog.likes += 1;

    await blog.save();

    res.status(200).json(blog);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};

/* ================= COMMENT ================= */

exports.addComment = async (req, res) => {

  try {

    const { user, text } = req.body;

    const blog = await Blog.findById(
      req.params.id
    );

    blog.comments.push({
      user,
      text,
    });

    await blog.save();

    res.status(200).json(blog);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};