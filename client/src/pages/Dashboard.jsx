
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Bug,
  CheckCircle2,
  Clock,
  Plus,
  LogOut,
  User,
  Bell,
  MessageSquare,
  UserPlus,
  Activity,
  X
} from "lucide-react";

import api from "../services/api";
import toast from "react-hot-toast";

function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const [projectResponse, bugResponse] = await Promise.all([
        api.get("/projects"),
        api.get("/bugs")
      ]);

      setProjects(projectResponse.data.projects || []);
      setBugs(bugResponse.data.bugs || []);

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");

      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Unable to load notifications:", error);
    }
  };

  // Unread notification count
  const unreadCount = notifications.filter(
    notification => !notification.isRead
  ).length;

  // Mark one notification as read
  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);

      setNotifications(prev =>
        prev.map(notification =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );

    } catch (error) {
      toast.error("Unable to mark notification as read");
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");

      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          isRead: true
        }))
      );

      toast.success("All notifications marked as read");

    } catch (error) {
      toast.error("Unable to update notifications");
    }
  };

  // Notification icons
  const getNotificationIcon = (type) => {
    switch (type) {
      case "assigned":
        return <UserPlus size={18} className="text-blue-400" />;

      case "comment":
        return <MessageSquare size={18} className="text-purple-400" />;

      case "status":
        return <Activity size={18} className="text-green-400" />;

      default:
        return <Bell size={18} />;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Dashboard statistics
  const stats = [
    {
      title: "Total Projects",
      value: projects.length,
      icon: FolderKanban,
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      title: "Total Bugs",
      value: bugs.length,
      icon: Bug,
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    },
    {
      title: "In Progress",
      value: bugs.filter(b => b.status === "In Progress").length,
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10"
    },
    {
      title: "Completed",
      value: bugs.filter(b => b.status === "Done").length,
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-500/10"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900 p-6 hidden md:flex flex-col">

        <h1 className="text-2xl font-bold text-blue-400 mb-10">
          BugTracker
        </h1>

        <nav className="space-y-3">

          <button className="flex items-center gap-3 w-full rounded-lg bg-blue-600/20 text-blue-400 p-3">
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          <button
            onClick={() => navigate("/projects")}
            className="flex items-center gap-3 w-full rounded-lg p-3 text-slate-400 hover:bg-slate-800"
          >
            <FolderKanban size={20} />
            Projects
          </button>

          <button
            onClick={() => navigate("/bugs")}
            className="flex items-center gap-3 w-full rounded-lg p-3 text-slate-400 hover:bg-slate-800"
          >
            <Bug size={20} />
            Bugs
          </button>

          <button
            onClick={() => navigate("/kanban")}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
          >
            <FolderKanban size={20} />
            Kanban Board
          </button>

        </nav>

        <div className="mt-auto">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full rounded-lg p-3 text-red-400 hover:bg-slate-800"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto">

        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-10">

          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>

            <p className="text-slate-400 mt-2">
              Welcome back, {user.name || "User"}!
            </p>
          </div>

          <div className="flex items-center gap-4">

            {/* Notification Bell */}
            <div className="relative">

              <button
                onClick={() => {
                  const opening = !showNotifications;
                  setShowNotifications(opening);

                  if (opening) {
                    fetchNotifications();
                  }
                }}
                className="relative rounded-full bg-slate-800 p-3 hover:bg-slate-700 transition"
              >
                <Bell size={21} />

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-14 z-50 w-80 sm:w-96 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">

                  <div className="flex items-center justify-between border-b border-slate-800 p-4">

                    <h3 className="font-semibold text-white">
                      Notifications
                    </h3>

                    <div className="flex items-center gap-3">

                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Mark all read
                        </button>
                      )}

                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X size={18} />
                      </button>

                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">

                    {notifications.length === 0 ? (

                      <div className="p-8 text-center text-slate-400">
                        <Bell size={30} className="mx-auto mb-3 opacity-50" />
                        <p>No notifications yet</p>
                      </div>

                    ) : (

                      notifications.map(notification => (

                        <div
                          key={notification._id}
                          className={`flex gap-3 border-b border-slate-800 p-4 transition ${
                            notification.isRead
                              ? "bg-slate-900"
                              : "bg-blue-500/5"
                          }`}
                        >

                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>

                          <div className="flex-1 min-w-0">

                            <p className="text-sm text-slate-200">
                              {notification.message}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>

                            <div className="mt-2 flex items-center gap-3">

                              <button
                                onClick={async () => {
                                  if (!notification.isRead) {
                                    await markAsRead(notification._id);
                                  }

                                  setShowNotifications(false);
                                  navigate("/bugs");
                                }}
                                className="text-xs text-blue-400 hover:text-blue-300"
                              >
                                View bugs
                              </button>

                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification._id)}
                                  className="text-xs text-slate-400 hover:text-white"
                                >
                                  Mark as read
                                </button>
                              )}

                            </div>
                          </div>

                          {!notification.isRead && (
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                          )}

                        </div>

                      ))

                    )}

                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3">

              <div className="rounded-full bg-slate-800 p-3">
                <User size={20} />
              </div>

              <span className="text-slate-300">
                {user.name}
              </span>

            </div>

          </div>
        </header>

        {/* Statistics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">

          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6"
              >

                <div className="flex items-center justify-between">

                  <p className="text-slate-400">
                    {stat.title}
                  </p>

                  <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                    <Icon size={22} />
                  </div>

                </div>

                <h3 className="text-3xl font-bold mt-5">
                  {stat.value}
                </h3>

              </div>
            );
          })}

        </section>

        {/* Projects */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 mb-8">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h3 className="text-xl font-semibold">My Projects</h3>

              <p className="text-sm text-slate-400 mt-1">
                Your project overview
              </p>
            </div>

            <button
              onClick={() => navigate("/projects")}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700"
            >
              <Plus size={18} />
              Manage Projects
            </button>

          </div>

          {projects.length === 0 ? (

            <p className="text-slate-400 py-8 text-center">
              No projects found. Create your first project.
            </p>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {projects.map(project => (

                <div
                  key={project._id}
                  className="rounded-lg border border-slate-800 p-5"
                >

                  <div className="flex items-center gap-3">

                    <FolderKanban className="text-blue-400" />

                    <h4 className="font-semibold">
                      {project.name}
                    </h4>

                  </div>

                  <p className="text-sm text-slate-400 mt-3">
                    {project.description || "No description available"}
                  </p>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* Recent Bugs */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h3 className="text-xl font-semibold mb-6">
            Recent Bugs
          </h3>

          {bugs.length === 0 ? (

            <p className="text-center text-slate-400 py-8">
              No bugs reported yet.
            </p>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-sm">
                    <th className="py-3">Bug Title</th>
                    <th className="py-3">Project</th>
                    <th className="py-3">Priority</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>

                <tbody>

                  {bugs.slice(0, 5).map(bug => (

                    <tr key={bug._id} className="border-b border-slate-800">

                      <td className="py-4">
                        {bug.title}
                      </td>

                      <td className="py-4 text-slate-400">
                        {bug.project?.name || "—"}
                      </td>

                      <td className="py-4">
                        {bug.priority}
                      </td>

                      <td className="py-4">
                        {bug.status}
                      </td>

                    </tr>

                  ))}

                </tbody>
              </table>

            </div>

          )}

        </section>

      </main>
    </div>
  );
}

export default Dashboard;
