
import { useEffect, useState } from "react";
import api from "../../services/api";

function EditUserForm({ user, onUserUpdated, onCancel }) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role?._id || "",
  });

  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch available roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        setRolesError("");

        const response = await api.get("/roles");
        const activeRoles = response.data.roles || [];

        setRoles(activeRoles);

        // Keep the user's current role selected
        const currentRoleId =
          typeof user.role === "object"
            ? user.role?._id
            : user.role;

        setFormData((prev) => ({
          ...prev,
          role: activeRoles.some(
            (role) => role._id === currentRoleId
          )
            ? currentRoleId
            : "",
        }));
      } catch (err) {
        setRolesError(
          err.response?.data?.message ||
            "Failed to load roles."
        );
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit updated user details
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.role) {
      setError("Please select a role.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.patch(`/users/${user._id}`, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
      });

      if (onUserUpdated) {
        onUserUpdated();
      }

      alert(
        response.data.message || "User updated successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Edit Team Member
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Update team member details and assigned role.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Full Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            minLength={2}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Email Address
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        {/* Dynamic Role */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Assign Role
          </label>

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            disabled={rolesLoading || roles.length === 0}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 disabled:bg-slate-100"
          >
            <option value="">
              {rolesLoading ? "Loading roles..." : "Select a role"}
            </option>

            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))}
          </select>

          {rolesError && (
            <p className="mt-1 text-sm text-red-600">
              {rolesError}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              loading ||
              rolesLoading ||
              roles.length === 0 ||
              !formData.role
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update User"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditUserForm;
