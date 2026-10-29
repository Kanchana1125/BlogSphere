const Post = require("../models/Post");
const Comment = require("../models/Comment");

const populateAuthor = { path: "author", select: "name avatar bio" };

exports.listPosts = async (req, res) => {
  try {
    const { q, tag } = req.query;
    const filter = {};
    if (q?.trim()) filter.$text = { $search: q.trim() };
    if (tag?.trim()) filter.tags = tag.trim().toLowerCase();
    const posts = await Post.find(filter).populate(populateAuthor).sort({ createdAt: -1 }).limit(100);
    res.json({ posts });
  } catch { res.status(500).json({ message: "Could not load posts." }); }
};

exports.getPost = async (req, res) => {
  const post = await Post.findById(req.params.id).populate(populateAuthor);
  if (!post) return res.status(404).json({ message: "Post not found." });
  const comments = await Comment.find({ post: post._id }).populate("author", "name avatar").sort({ createdAt: 1 });
  res.json({ post, comments });
};

exports.createPost = async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, tags } = req.body;
    if (!title?.trim() || !content?.trim()) return res.status(400).json({ message: "Title and content are required." });
    const cleanTags = Array.isArray(tags) ? tags : String(tags || "").split(",");
    const post = await Post.create({
      title: title.trim(), content: content.trim(),
      excerpt: (excerpt || content).trim().slice(0, 300),
      coverImage: coverImage || "",
      tags: cleanTags.map(t => String(t).trim().toLowerCase()).filter(Boolean).slice(0, 8),
      author: req.user._id
    });
    await post.populate(populateAuthor);
    res.status(201).json({ post });
  } catch { res.status(500).json({ message: "Could not create post." }); }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (String(post.author) !== String(req.user._id)) return res.status(403).json({ message: "You can only edit your own posts." });
    for (const field of ["title", "content", "excerpt", "coverImage"]) if (req.body[field] !== undefined) post[field] = req.body[field];
    if (req.body.tags !== undefined) {
      const tags = Array.isArray(req.body.tags) ? req.body.tags : String(req.body.tags).split(",");
      post.tags = tags.map(t => String(t).trim().toLowerCase()).filter(Boolean).slice(0, 8);
    }
    await post.save();
    await post.populate(populateAuthor);
    res.json({ post });
  } catch { res.status(500).json({ message: "Could not update post." }); }
};

exports.deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found." });
  if (String(post.author) !== String(req.user._id)) return res.status(403).json({ message: "You can only delete your own posts." });
  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();
  res.json({ message: "Post deleted." });
};

exports.toggleLike = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found." });
  const exists = post.likes.some(id => String(id) === String(req.user._id));
  if (exists) post.likes.pull(req.user._id); else post.likes.push(req.user._id);
  await post.save();
  res.json({ likes: post.likes.length, liked: !exists });
};