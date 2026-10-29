const Post = require("../models/Post");
const Comment = require("../models/Comment");

exports.addComment = async (req, res) => {
  const text = req.body.text?.trim();
  if (!text) return res.status(400).json({ message: "Comment cannot be empty." });
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: "Post not found." });
  const comment = await Comment.create({ post: post._id, author: req.user._id, text });
  await comment.populate("author", "name avatar");
  res.status(201).json({ comment });
};

exports.deleteComment = async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ message: "Comment not found." });
  if (String(comment.author) !== String(req.user._id)) return res.status(403).json({ message: "You can only delete your own comments." });
  await comment.deleteOne();
  res.json({ message: "Comment deleted." });
};