
const Comment = require("../models/Comment");
const Bug = require("../models/Bug");
const Project = require("../models/Project");
const Notification = require("../models/Notification");

// Add a comment to a bug
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { bugId } = req.params;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty"
      });
    }

    const bug = await Bug.findById(bugId);

    if (!bug) {
      return res.status(404).json({
        success: false,
        message: "Bug not found"
      });
    }

    const project = await Project.findOne({
      _id: bug.project,
      members: req.userId
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Create comment
    const comment = await Comment.create({
      bug: bugId,
      user: req.userId,
      text: text.trim()
    });

    // Get reporter and assigned developer
    const reporterId = bug.reportedBy.toString();
    const assigneeId = bug.assignedTo?.toString();

    // Prepare notification recipients
    const recipients = [
      reporterId,
      assigneeId
    ].filter((id, index, array) =>
      id &&
      id !== req.userId.toString() &&
      array.indexOf(id) === index
    );

    // Create notifications
    for (const recipient of recipients) {
      await Notification.create({
        recipient,
        message: `New comment on bug: ${bug.title}`,
        type: "comment",
        relatedBug: bug._id
      });
    }

    await comment.populate("user", "name email");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Get all comments for a bug
const getComments = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.bugId);

    if (!bug) {
      return res.status(404).json({
        success: false,
        message: "Bug not found"
      });
    }

    const project = await Project.findOne({
      _id: bug.project,
      members: req.userId
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const comments = await Comment.find({
      bug: req.params.bugId
    })
      .populate("user", "name email")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: comments.length,
      comments
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  addComment,
  getComments
};
