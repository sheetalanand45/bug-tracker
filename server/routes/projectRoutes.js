
const express = require("express");
const router = express.Router();

const {
  createProject,
  getProjects,
  getDevelopers,
  addProjectMembers,
  getProjectMembers
} = require("../controllers/projectController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createProject);
router.get("/", authMiddleware, getProjects);

router.get("/developers", authMiddleware, getDevelopers);
router.post("/:id/members", authMiddleware, addProjectMembers);
router.get("/:id/members", authMiddleware, getProjectMembers);

module.exports = router;
