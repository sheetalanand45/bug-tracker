const express = require("express");
const router = express.Router();

const {
  createBug,
  getBugs,
  updateBug,
  deleteBug
} = require("../controllers/bugController");

const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.post("/", createBug);
router.get("/", getBugs);
router.put("/:id", updateBug);
router.delete("/:id", deleteBug);

module.exports = router;