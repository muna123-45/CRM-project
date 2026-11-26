import { useEffect, useState } from "react";
import api from "../../services/api";

function TaskTable({
  refreshKey,
  onEditTask,
  canUpdateTask,
  canDeleteTask,
  onTaskDeleted,
}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/tasks");

      setTasks(response.data.tasks || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load tasks. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshKey]);

  // Delete task
  const handleDelete = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      setDeletingTaskId(taskId);

      await api.delete(`/tasks/${taskId}`);

      onTaskDeleted?.();
      await fetchTasks();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to delete task."
      );
    } finally {
      setDeletingTaskId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not set";

    return new Date(date).toLocaleDateString();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Low":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  if (loading) {
    return <p className="p-6 text-gray-500">Loading tasks...</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchTasks}
          className="mt-3 rounded bg-red-600 px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="w-full min-w-212.5 text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="p-4">Task</th>
            <th className="p-4">Assigned To</th>
            <th className="p-4">Priority</th>
            <th className="p-4">Status</th>
            <th className="p-4">Due Date</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {tasks.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-8 text-center text-gray-500">
                No tasks found. Create your first task.
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <tr key={task._id} className="hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-medium text-gray-800">
                    {task.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {task.description || "No description"}
                  </p>
                </td>

                <td className="p-4">
                  {task.assignedTo?.name || "Unknown user"}
                </td>

                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityStyle(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </td>

                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </td>

                <td className="p-4 text-gray-600">
                  {formatDate(task.dueDate)}
                </td>

                <td className="p-4">
                  <div className="flex gap-2">
                    {canUpdateTask && (
                      <button
                        onClick={() => onEditTask?.(task)}
                        className="rounded bg-blue-50 px-3 py-1.5 text-blue-600 hover:bg-blue-100"
                      >
                        Edit
                      </button>
                    )}

                    {canDeleteTask && (
                      <button
                        onClick={() => handleDelete(task._id)}
                        disabled={deletingTaskId === task._id}
                        className="rounded bg-red-50 px-3 py-1.5 text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        {deletingTaskId === task._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TaskTable;
