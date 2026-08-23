const Post = require("../models/Post");

const createPost = async (req, res) => {

  try {

    const post = await Post.create(req.body);

    res.status(201).json(post);

  } catch (error) {

    res.status(500).json({
      message: "Post creation failed",
    });
  }
};

const getPosts = async (req, res) => {

  try {

    const posts = await Post.find();

    res.json(posts);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch posts",
    });
  }
};

const likePost = async (req, res) => {

  try {

    const post = await Post.findById(req.params.id);

    post.likes += 1;

    await post.save();

    res.json(post);

  } catch (error) {

    res.status(500).json({
      message: "Like failed",
    });
  }
};

const addComment = async (req, res) => {

  try {

    const post = await Post.findById(req.params.id);

    post.comments.push({
      text: req.body.text,
      user: req.body.user,
    });

    await post.save();

    res.json(post);

  } catch (error) {

    res.status(500).json({
      message: "Comment failed",
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  likePost,
  addComment,
};