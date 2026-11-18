
const Bug = require("../models/Bug");
const Project = require("../models/Project");
const Notification = require("../models/Notification");

// CREATE BUG
const createBug = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      priority,
      type
    } = req.body;

    if (!title || !description || !project) {
      return res.status(400).json({
        success: false,
        message: "Title, description and project are required"
      });
    }

    const existingProject = await Project.findOne({
      _id: project,
      members: req.userId
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you are not a member"
      });
    }

    if (
      assignedTo &&
      !existingProject.members.some(
        member => member.toString() === assignedTo
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Assignee must be a project member"
      });
    }

    const bug = await Bug.create({
      title,
      description,
      project,
      reportedBy: req.userId,
      assignedTo: assignedTo || null,
      priority,
      type
    });

    // Notify assigned developer
    if (
      assignedTo &&
      assignedTo.toString() !== req.userId.toString()
    ) {
      await Notification.create({
        recipient: assignedTo,
        message: `You have been assigned a new bug: ${title}`,
        type: "assigned",
        relatedBug: bug._id
      });
    }

    res.status(201).json({
      success: true,
      message: "Bug created successfully",
      bug
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET ALL BUGS
const getBugs = async (req, res) => {
  try {
    const { project, status, priority } = req.query;

    const projects = await Project.find({
      members: req.userId
    }).select("_id");

    const projectIds = projects.map(p => p._id);

    const filter = {
      project: { $in: projectIds }
    };

    if (project) filter.project = project;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const bugs = await Bug.find(filter)
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email")
      .populate("project", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bugs.length,
      bugs
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// UPDATE BUG
const updateBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({
        success: false,
        message: "Bug not found"
      });
    }

    // Store previous values before updating
    const previousAssignee = bug.assignedTo?.toString();
    const previousStatus = bug.status;

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

    // Update allowed fields
    const allowedFields = [
      "title",
      "description",
      "status",
      "priority",
      "type"
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        bug[field] = req.body[field];
      }
    });

    // Validate developer assignment
    if (req.body.assignedTo !== undefined) {
      const assignedTo = req.body.assignedTo;

      if (assignedTo === null || assignedTo === "") {
        bug.assignedTo = null;
      } else {
        const isMember = project.members.some(
          member => member.toString() === assignedTo
        );

        if (!isMember) {
          return res.status(400).json({
            success: false,
            message: "Assignee must be a member of this project"
          });
        }

        bug.assignedTo = assignedTo;
      }
    }

    // Save updated bug
    await bug.save();

    const newAssignee = bug.assignedTo?.toString();

    // Assignment notification
    if (
      newAssignee &&
      newAssignee !== previousAssignee &&
      newAssignee !== req.userId.toString()
    ) {
      await Notification.create({
        recipient: bug.assignedTo,
        message: `A bug has been assigned to you: ${bug.title}`,
        type: "assigned",
        relatedBug: bug._id
      });

      console.log("Assignment notification created");
    }

    // Status change notification
    if (
    previousStatus !== bug.status &&
    bug.reportedBy.toString() !== req.userId.toString()
    ) {
    const notification = await Notification.create({
        recipient: bug.reportedBy,
        message: `Bug status changed to ${bug.status}: ${bug.title}`,
        type: "status",
        relatedBug: bug._id
    });

    console.log(
        "Reporter notification created:",
        notification._id
    );
    }
    
    await bug.populate("assignedTo", "name email role");
    await bug.populate("reportedBy", "name email");

    res.json({
      success: true,
      message: "Bug updated successfully",
      bug
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// DELETE BUG
const deleteBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);

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

    await bug.deleteOne();

    res.json({
      success: true,
      message: "Bug deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET PROJECT MEMBERS
const getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      members: req.userId
    }).populate("members", "name email role");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied"
      });
    }

    res.json({
      success: true,
      members: project.members
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  createBug,
  getBugs,
  updateBug,
  deleteBug,
  getProjectMembers
};
