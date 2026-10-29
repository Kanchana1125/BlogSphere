const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  content: { type: String, required: true, trim: true },
  excerpt: { type: String, default: "", maxlength: 300 },
  coverImage: { type: String, default: "" },
  tags: [{ type: String, trim: true, lowercase: true }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

postSchema.index({ title: "text", content: "text", tags: "text" });
module.exports = mongoose.model("Post", postSchema);