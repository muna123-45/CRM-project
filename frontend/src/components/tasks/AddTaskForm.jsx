
import { useEffect, useState } from "react";
import api from "../../services/api";

function AddTaskForm({ onTaskCreated, onCancel }) {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "Medium",
    status: "Pending",
    dueDate: "",
  });

  // Load users for the assignment dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);

        // OLD API (kept for reference)
        // const response = await api.get("/users");

        // NEW API
        const response = await api.get("/tasks/assignees");

        setUsers(response.data.users || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load users."
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit task
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    if (!formData.assignedTo) {
      setError("Please select a team member.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate || null,
      };

      await api.post("/tasks", payload);

      onTaskCreated?.();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create task."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-semibold text-gray-800">
        Create New Task
      </h2>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Task Title *
          </label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Description
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description"
            rows="3"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        {/* Assign User */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Assign To *
          </label>

          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
            required
            disabled={loadingUsers}
          >
            <option value="">
              {loadingUsers
                ? "Loading users..."
                : "Select team member"}
            </option>

            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>

          {!loadingUsers && users.length === 0 && (
            <p className="mt-1 text-sm text-gray-500">
              No users available.
            </p>
          )}
        </div>

        {/* Priority and Status */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Priority
            </label>

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Due Date
          </label>

          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border px-5 py-2 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting || loadingUsers}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddTaskForm;
