const router = require("express").Router();
const comments = require("../controllers/commentController");
const protect = require("../middleware/authMiddleware");
router.post("/:postId", protect, comments.addComment);
router.delete("/:id", protect, comments.deleteComment);
module.exports = router;