
const Project = require("../models/Project");
const User = require("../models/User");

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required"
      });
    }

    const project = await Project.create({
      name,
      description,
      owner: req.userId,
      members: [req.userId]
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.userId
    })
      .populate("owner", "name email")
      .populate("members", "name email");

    res.status(200).json({
      success: true,
      projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      members: req.userId
    }).populate("members", "name email role");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.status(200).json({
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

// Get all registered developers
const getDevelopers = async (req, res) => {
  try {
    const developers = await User.find({
      _id: { $ne: req.userId }
    }).select("name email");

    res.status(200).json({
      success: true,
      developers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add developers to a project
const addProjectMembers = async (req, res) => {
  try {
    const { userIds } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you are not the owner"
      });
    }

    const users = await User.find({
      _id: { $in: userIds }
    }).select("_id");

    if (users.length !== userIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more users do not exist"
      });
    }

    const newMembers = userIds.filter(
      id => !project.members.some(
        member => member.toString() === id
      )
    );

    project.members.push(...newMembers);

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("owner", "name email")
      .populate("members", "name email");

    res.status(200).json({
      success: true,
      message: "Developers added successfully",
      project: updatedProject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getDevelopers,
  addProjectMembers,
  getProjectMembers
};
