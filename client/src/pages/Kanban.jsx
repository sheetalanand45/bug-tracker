
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCorners,
  useDroppable,
  useDraggable
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, Bug } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const statuses = ["To Do", "In Progress", "Done"];

function BugCard({ bug }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({ id: bug._id });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1
  };

  const priorityColors = {
    Low: "text-green-400",
    Medium: "text-yellow-400",
    High: "text-orange-400",
    Critical: "text-red-400"
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="mb-4 cursor-grab rounded-xl border border-slate-700 bg-slate-800 p-4 active:cursor-grabbing"
    >
      <h3 className="font-semibold">{bug.title}</h3>

      <p className="mt-2 text-sm text-slate-400">
        {bug.description || "No description"}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded bg-slate-700 px-2 py-1 text-xs">
          {bug.type}
        </span>

        <span className={`text-xs font-semibold ${priorityColors[bug.priority]}`}>
          {bug.priority}
        </span>
      </div>
    </div>
  );
}

function KanbanColumn({ status, bugs }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[400px] rounded-xl border p-4 ${
        isOver
          ? "border-indigo-500 bg-indigo-950/20"
          : "border-slate-800 bg-slate-900"
      }`}
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-semibold">{status}</h2>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm">
          {bugs.length}
        </span>
      </div>

      {bugs.map((bug) => (
        <BugCard key={bug._id} bug={bug} />
      ))}

      {bugs.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-500">
          Drop issues here
        </p>
      )}
    </div>
  );
}

export default function Kanban() {
  const navigate = useNavigate();
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBugs = async () => {
    try {
      const response = await api.get("/bugs");
      setBugs(response.data.bugs || []);
    } catch (error) {
      toast.error("Unable to load bugs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugs();
  }, []);

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;

    const bug = bugs.find((item) => item._id === active.id);
    const newStatus = over.id;

    if (!bug || !statuses.includes(newStatus)) return;
    if (bug.status === newStatus) return;

    const oldStatus = bug.status;

    setBugs((current) =>
      current.map((item) =>
        item._id === active.id
          ? { ...item, status: newStatus }
          : item
      )
    );

    try {
      await api.put(`/bugs/${active.id}`, {
        status: newStatus
      });
      toast.success("Bug status updated");
    } catch (error) {
      setBugs((current) =>
        current.map((item) =>
          item._id === active.id
            ? { ...item, status: oldStatus }
            : item
        )
      );
      toast.error("Unable to update bug status");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-7xl">

        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Bug className="text-indigo-400" size={30} />
            <h1 className="text-3xl font-bold">Kanban Board</h1>
          </div>

          <p className="mt-2 text-slate-400">
            Drag and drop issues to update their progress.
          </p>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading issues...</p>
        ) : (
          <DndContext
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <div className="grid gap-5 md:grid-cols-3">
              {statuses.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  bugs={bugs.filter((bug) => bug.status === status)}
                />
              ))}
            </div>
          </DndContext>
        )}
      </div>
    </div>
  );
}
