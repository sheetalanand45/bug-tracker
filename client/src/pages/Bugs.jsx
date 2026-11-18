
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import {
  Plus,
  ArrowLeft,
  Bug as BugIcon,
  Trash2,
  MessageCircle,
  X,
  LoaderCircle
} from "lucide-react";

export default function Bugs() {
  const navigate = useNavigate();

  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [membersByProject, setMembersByProject] = useState({});

  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);

  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [updatingAssigneeId, setUpdatingAssigneeId] = useState(null);
  const [deletingBugId, setDeletingBugId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [selectedBug, setSelectedBug] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    priority: "Medium",
    type: "Bug",
    status: "To Do"
  });

  // Fetch bugs, projects and project members
  const fetchData = async (showLoader = false) => {
    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const [bugResponse, projectResponse] = await Promise.all([
        api.get("/bugs"),
        api.get("/projects")
      ]);

      const fetchedProjects = projectResponse.data.projects || [];

      setBugs(bugResponse.data.bugs || []);
      setProjects(fetchedProjects);

      const membersData = await Promise.all(
        fetchedProjects.map(async (project) => {
          try {
            const response = await api.get(
              `/projects/${project._id}/members`
            );

            return [project._id, response.data.members || []];
          } catch {
            return [project._id, []];
          }
        })
      );

      setMembersByProject(Object.fromEntries(membersData));
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Unable to load bugs or projects"
      );
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  // Fetch members whenever a project is selected
  const handleProjectChange = async (projectId) => {
    setFormData((prev) => ({
      ...prev,
      project: projectId,
      assignedTo: ""
    }));

    setProjectMembers([]);

    if (!projectId) return;

    setIsLoadingMembers(true);

    try {
      const response = await api.get(
        `/projects/${projectId}/members`
      );

      setProjectMembers(response.data.members || []);
    } catch (error) {
      toast.error("Unable to load project members");
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Create bug
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isCreating) return;

    setIsCreating(true);

    try {
      await api.post("/bugs", formData);

      toast.success("Bug created successfully!");

      setFormData({
        title: "",
        description: "",
        project: "",
        assignedTo: "",
        priority: "Medium",
        type: "Bug",
        status: "To Do"
      });

      setProjectMembers([]);
      setShowForm(false);

      await fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create bug"
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Update bug status
  const updateStatus = async (id, status) => {
    if (updatingStatusId) return;

    setUpdatingStatusId(id);

    try {
      await api.put(`/bugs/${id}`, { status });

      toast.success("Status updated successfully!");

      await fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to update status"
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Update bug assignee
  const updateAssignee = async (id, assignedTo) => {
    if (updatingAssigneeId) return;

    setUpdatingAssigneeId(id);

    try {
      await api.put(`/bugs/${id}`, {
        assignedTo: assignedTo || null
      });

      toast.success("Developer assignment updated!");

      await fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Unable to update assignment"
      );
    } finally {
      setUpdatingAssigneeId(null);
    }
  };

  // Delete bug
  const deleteBug = async (id) => {
    if (deletingBugId) return;

    if (!window.confirm("Are you sure you want to delete this bug?")) {
      return;
    }

    setDeletingBugId(id);

    try {
      await api.delete(`/bugs/${id}`);

      toast.success("Bug deleted successfully!");

      await fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to delete bug"
      );
    } finally {
      setDeletingBugId(null);
    }
  };

  // Open comments
  const openComments = async (bug) => {
    setSelectedBug(bug);
    setShowComments(true);
    setComments([]);
    setLoadingComments(true);

    try {
      const response = await api.get(`/comments/${bug._id}`);

      setComments(response.data.comments || []);
    } catch (error) {
      toast.error("Unable to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  // Add comment
  const addComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    if (isAddingComment) return;

    setIsAddingComment(true);

    try {
      const response = await api.post(
        `/comments/${selectedBug._id}`,
        { text: newComment }
      );

      setComments((prev) => [
        ...prev,
        response.data.comment
      ]);

      setNewComment("");

      toast.success("Comment added successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to add comment"
      );
    } finally {
      setIsAddingComment(false);
    }
  };

  const priorityColors = {
    Low: "text-green-400",
    Medium: "text-yellow-400",
    High: "text-orange-400",
    Critical: "text-red-400"
  };

  // Search and filter bugs
  const filteredBugs = bugs.filter((bug) => {
    const matchesSearch = bug.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesProject =
      filterProject === "All" ||
      bug.project?._id === filterProject ||
      bug.project === filterProject;

    const matchesPriority =
      filterPriority === "All" ||
      bug.priority === filterPriority;

    const matchesStatus =
      filterStatus === "All" ||
      bug.status === filterStatus;

    return (
      matchesSearch &&
      matchesProject &&
      matchesPriority &&
      matchesStatus
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-7xl">

        {/* Back button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Bug Tracker</h1>
            <p className="mt-2 text-slate-400">
              Report, track and manage project issues.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 hover:bg-indigo-500"
          >
            <Plus size={18} />
            Create Bug
          </button>
        </div>

        {/* Create bug form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 max-w-2xl space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6"
          >
            <h2 className="text-xl font-semibold">
              Report New Issue
            </h2>

            <input
              required
              placeholder="Bug title"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value
                })
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 outline-none focus:border-indigo-500"
            />

            <textarea
              required
              placeholder="Describe the issue..."
              rows="3"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value
                })
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 outline-none focus:border-indigo-500"
            />

            {/* Project selection */}
            <select
              required
              value={formData.project}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
            >
              <option value="">Select Project</option>

              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>

            {/* Developer assignment */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Assign Developer
              </label>

              <select
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assignedTo: e.target.value
                  })
                }
                disabled={!formData.project || isLoadingMembers}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 disabled:opacity-50"
              >
                <option value="">
                  {isLoadingMembers
                    ? "Loading developers..."
                    : "Unassigned"}
                </option>

                {projectMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>

              {isLoadingMembers && (
                <p className="mt-2 flex items-center gap-2 text-xs text-indigo-400">
                  <LoaderCircle size={14} className="animate-spin" />
                  Loading project members...
                </p>
              )}

              {formData.project &&
                !isLoadingMembers &&
                projectMembers.length === 0 && (
                  <p className="mt-2 text-xs text-slate-500">
                    No project members found.
                  </p>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value
                  })
                }
                className="rounded-lg border border-slate-700 bg-slate-950 p-3"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>

              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value
                  })
                }
                className="rounded-lg border border-slate-700 bg-slate-950 p-3"
              >
                <option>Bug</option>
                <option>Feature</option>
                <option>Improvement</option>
              </select>
            </div>

            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value
                })
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
            >
              <option>To Do</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isCreating}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating && (
                  <LoaderCircle size={16} className="animate-spin" />
                )}
                {isCreating ? "Creating..." : "Save Bug"}
              </button>

              <button
                type="button"
                disabled={isCreating}
                onClick={() => setShowForm(false)}
                className="rounded-lg bg-slate-700 px-5 py-2 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Search and filters */}
        <div className="mb-6 grid gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-2 lg:grid-cols-4">

          <input
            type="text"
            placeholder="Search bugs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 p-3 outline-none focus:border-indigo-500"
          />

          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 p-3"
          >
            <option value="All">All Projects</option>

            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 p-3"
          >
            <option value="All">All Priorities</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 p-3"
          >
            <option value="All">All Statuses</option>
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
        </div>

        {/* Bugs list */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900 py-20">
            <LoaderCircle
              size={36}
              className="animate-spin text-indigo-500"
            />
            <p className="mt-4 text-slate-400">
              Loading bugs and projects...
            </p>
          </div>
        ) : filteredBugs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 py-16 text-center">
            <BugIcon
              className="mx-auto mb-4 text-slate-500"
              size={42}
            />

            <h2 className="text-xl font-semibold">
              No issues found
            </h2>

            <p className="mt-2 text-slate-400">
              Try changing your filters or create a new bug.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-900 text-sm text-slate-400">
                <tr>
                  <th className="p-4">Issue</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Assignee</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredBugs.map((bug) => (
                  <tr
                    key={bug._id}
                    className="border-t border-slate-800"
                  >
                    <td className="p-4">
                      <p className="font-medium">{bug.title}</p>
                      <p className="text-xs text-slate-500">
                        {bug.type}
                      </p>
                    </td>

                    <td className="p-4 text-slate-300">
                      {bug.project?.name || "Project"}
                    </td>

                    {/* Assignee */}
                    <td className="p-4">
                      <select
                        value={bug.assignedTo?._id || ""}
                        disabled={updatingAssigneeId === bug._id}
                        onChange={(e) =>
                          updateAssignee(bug._id, e.target.value)
                        }
                        className="rounded-lg border border-slate-700 bg-slate-900 p-2 disabled:opacity-50"
                      >
                        <option value="">Unassigned</option>

                        {(membersByProject[
                          bug.project?._id || bug.project
                        ] || []).map((member) => (
                          <option
                            key={member._id}
                            value={member._id}
                          >
                            {member.name}
                          </option>
                        ))}
                      </select>

                      {updatingAssigneeId === bug._id && (
                        <LoaderCircle
                          size={14}
                          className="ml-2 inline animate-spin text-indigo-400"
                        />
                      )}
                    </td>

                    {/* Priority */}
                    <td
                      className={`p-4 font-medium ${
                        priorityColors[bug.priority]
                      }`}
                    >
                      {bug.priority}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <select
                        value={bug.status}
                        disabled={updatingStatusId === bug._id}
                        onChange={(e) =>
                          updateStatus(bug._id, e.target.value)
                        }
                        className="rounded-lg border border-slate-700 bg-slate-900 p-2 disabled:opacity-50"
                      >
                        <option>To Do</option>
                        <option>In Progress</option>
                        <option>Done</option>
                      </select>

                      {updatingStatusId === bug._id && (
                        <LoaderCircle
                          size={14}
                          className="ml-2 inline animate-spin text-indigo-400"
                        />
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <button
                        onClick={() => openComments(bug)}
                        className="mr-3 text-indigo-400 hover:text-indigo-300"
                        title="View comments"
                      >
                        <MessageCircle size={18} />
                      </button>

                      <button
                        onClick={() => deleteBug(bug._id)}
                        disabled={deletingBugId === bug._id}
                        className="text-red-400 hover:text-red-300 disabled:opacity-50"
                        title="Delete bug"
                      >
                        {deletingBugId === bug._id ? (
                          <LoaderCircle
                            size={18}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Comments modal */}
        {showComments && selectedBug && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6">

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    Bug Comments
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    {selectedBug.title}
                  </p>
                </div>

                <button
                  onClick={() => setShowComments(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Comments list */}
              <div className="mb-5 max-h-72 space-y-4 overflow-y-auto">
                {loadingComments ? (
                  <div className="flex flex-col items-center py-8">
                    <LoaderCircle
                      size={28}
                      className="animate-spin text-indigo-500"
                    />
                    <p className="mt-3 text-sm text-slate-400">
                      Loading comments...
                    </p>
                  </div>
                ) : comments.length === 0 ? (
                  <p className="py-8 text-center text-slate-400">
                    No comments yet. Start the discussion!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="rounded-lg bg-slate-800 p-4"
                    >
                      <p className="font-medium text-indigo-300">
                        {comment.user?.name || "User"}
                      </p>

                      <p className="mt-2 text-sm text-slate-200">
                        {comment.text}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {new Date(
                          comment.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add comment form */}
              <form onSubmit={addComment} className="space-y-3">
                <textarea
                  required
                  rows="3"
                  placeholder="Write your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={isAddingComment}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-indigo-500 disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={isAddingComment || loadingComments}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 font-medium hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAddingComment && (
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                  )}

                  {isAddingComment
                    ? "Adding Comment..."
                    : "Add Comment"}
                </button>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
