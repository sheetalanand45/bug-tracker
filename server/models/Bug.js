const mongoose = require("mongoose");

const bugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium"
    },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Done"],
      default: "To Do"
    },
    type: {
      type: String,
      enum: ["Bug", "Feature", "Improvement"],
      default: "Bug"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bug", bugSchema);