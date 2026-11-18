
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  FolderKanban,
  ArrowLeft,
  LoaderCircle,
  Users,
  UserPlus
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [selectedDeveloperIds, setSelectedDeveloperIds] = useState([]);

  const [isLoadingDevelopers, setIsLoadingDevelopers] = useState(false);
  const [isAddingMembers, setIsAddingMembers] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  // Fetch projects
  const fetchProjects = async (showLoader = false) => {
    try {
      if (showLoader) setIsLoading(true);

      const response = await api.get("/projects");
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Fetch projects error:", error);
      toast.error("Unable to load projects");
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(true);
  }, []);

  // Create project
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    try {
      setIsCreating(true);

      await api.post("/projects", {
        name: formData.name.trim(),
        description: formData.description.trim()
      });

      toast.success("Project created successfully!");

      setFormData({ name: "", description: "" });
      setShowForm(false);

      await fetchProjects();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create project"
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Open member management
  const handleManageMembers = async (project) => {
    if (expandedProjectId === project._id) {
      setExpandedProjectId(null);
      setSelectedDeveloperIds([]);
      return;
    }

    setExpandedProjectId(project._id);
    setSelectedDeveloperIds([]);
    setDevelopers([]);

    try {
      setIsLoadingDevelopers(true);

      const response = await api.get("/projects/developers");
      setDevelopers(response.data.developers || []);
    } catch (error) {
      console.error("Fetch developers error:", error);
      toast.error("Unable to load developers");
    } finally {
      setIsLoadingDevelopers(false);
    }
  };

  // Select or unselect developer
  const handleDeveloperSelection = (developerId) => {
    setSelectedDeveloperIds((previous) =>
      previous.includes(developerId)
        ? previous.filter((id) => id !== developerId)
        : [...previous, developerId]
    );
  };

  // Add selected developers to project
  const handleAddMembers = async (projectId) => {
    if (selectedDeveloperIds.length === 0) {
      toast.error("Please select at least one developer");
      return;
    }

    try {
      setIsAddingMembers(true);

      const response = await api.post(
        `/projects/${projectId}/members`,
        {
          userIds: selectedDeveloperIds
        }
      );

      // Update project with latest member information
      setProjects((previous) =>
        previous.map((project) =>
          project._id === projectId
            ? response.data.project
            : project
        )
      );

      setSelectedDeveloperIds([]);

      toast.success("Developers added successfully!");
    } catch (error) {
      console.error("Add members error:", error);

      toast.error(
        error.response?.data?.message ||
        "Failed to add developers"
      );
    } finally {
      setIsAddingMembers(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">

        {/* Back Button */}
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
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="mt-2 text-slate-400">
              Manage and organize your projects.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-medium hover:bg-indigo-500"
          >
            <Plus size={18} />
            Create Project
          </button>
        </div>

        {/* Create Project Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 max-w-xl space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6"
          >
            <h2 className="text-xl font-semibold">New Project</h2>

            <input
              type="text"
              placeholder="Project name"
              required
              value={formData.name}
              disabled={isCreating}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 outline-none focus:border-indigo-500"
            />

            <textarea
              placeholder="Project description"
              rows="3"
              value={formData.description}
              disabled={isCreating}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 outline-none focus:border-indigo-500"
            />

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isCreating}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 hover:bg-indigo-500 disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Save Project"
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={isCreating}
                className="rounded-lg bg-slate-700 px-5 py-2 hover:bg-slate-600"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Loading Projects */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900 py-16">
            <LoaderCircle
              size={36}
              className="animate-spin text-indigo-400"
            />
            <p className="mt-4 text-slate-400">
              Loading projects...
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 py-16 text-center">
            <FolderKanban
              className="mx-auto mb-4 text-slate-500"
              size={42}
            />
            <h2 className="text-xl font-semibold">No projects yet</h2>
            <p className="mt-2 text-slate-400">
              Create your first project to get started.
            </p>
          </div>
        ) : (

          /* Projects List */
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project._id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                <FolderKanban
                  className="mb-4 text-indigo-400"
                  size={28}
                />

                <h2 className="text-xl font-semibold">
                  {project.name}
                </h2>

                <p className="mt-2 min-h-12 text-sm text-slate-400">
                  {project.description || "No description provided."}
                </p>

                <p className="mt-5 text-xs text-slate-500">
                  Created{" "}
                  {project.createdAt
                    ? new Date(project.createdAt).toLocaleDateString()
                    : "Recently"}
                </p>

                <div className="my-5 border-t border-slate-800" />

                {/* Current Members */}
                <div className="mb-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Users size={18} className="text-indigo-400" />
                    <h3 className="font-semibold">Project Members</h3>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs">
                      {project.members?.length || 0}
                    </span>
                  </div>

                  {project.members?.length > 0 ? (
                    <div className="space-y-2">
                      {project.members.map((member) => (
                        <div
                          key={member._id}
                          className="rounded-lg bg-slate-950 px-3 py-2"
                        >
                          <p className="text-sm font-medium">
                            {member.name || "Unnamed developer"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {member.email}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No members found.
                    </p>
                  )}
                </div>

                {/* Manage Members Button */}
                <button
                  onClick={() => handleManageMembers(project)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-300 hover:bg-indigo-500/20"
                >
                  <UserPlus size={17} />
                  {expandedProjectId === project._id
                    ? "Close Member Management"
                    : "Manage Members"}
                </button>

                {/* Add Developers Section */}
                {expandedProjectId === project._id && (
                  <div className="mt-4 rounded-lg border border-slate-700 bg-slate-950 p-4">
                    <h3 className="mb-3 font-semibold">
                      Add Developers
                    </h3>

                    {isLoadingDevelopers ? (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />
                        Loading developers...
                      </div>
                    ) : (
                      <>
                        {developers.filter(
                          (developer) =>
                            !project.members?.some(
                              (member) => member._id === developer._id
                            )
                        ).length === 0 ? (
                          <p className="text-sm text-slate-500">
                            No new developers available.
                          </p>
                        ) : (
                          <div className="max-h-48 space-y-3 overflow-y-auto">
                            {developers
                              .filter(
                                (developer) =>
                                  !project.members?.some(
                                    (member) =>
                                      member._id === developer._id
                                  )
                              )
                              .map((developer) => (
                                <label
                                  key={developer._id}
                                  className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-slate-900"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedDeveloperIds.includes(
                                      developer._id
                                    )}
                                    onChange={() =>
                                      handleDeveloperSelection(
                                        developer._id
                                      )
                                    }
                                    disabled={isAddingMembers}
                                    className="h-4 w-4 accent-indigo-500"
                                  />

                                  <div>
                                    <p className="text-sm font-medium">
                                      {developer.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {developer.email}
                                    </p>
                                  </div>
                                </label>
                              ))}
                          </div>
                        )}

                        <button
                          onClick={() =>
                            handleAddMembers(project._id)
                          }
                          disabled={
                            isAddingMembers ||
                            selectedDeveloperIds.length === 0
                          }
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isAddingMembers ? (
                            <>
                              <LoaderCircle
                                size={16}
                                className="animate-spin"
                              />
                              Adding...
                            </>
                          ) : (
                            <>
                              <UserPlus size={16} />
                              Add Selected Developers
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
