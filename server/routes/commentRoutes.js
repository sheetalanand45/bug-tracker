
const express = require("express");
const router = express.Router();

const {
  addComment,
  getComments
} = require("../controllers/commentController");

const authMiddleware = require("../middleware/authMiddleware");

// Add comment
router.post("/:bugId", authMiddleware, addComment);

// Get comments
router.get("/:bugId", authMiddleware, getComments);

module.exports = router;
