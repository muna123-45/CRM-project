import { useEffect, useState } from "react";
import api from "../../services/api";

function RoleTable({ refreshKey }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/roles");

      setRoles(response.data.roles || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to fetch roles"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [refreshKey]);

  if (loading) {
    return <p className="p-5 text-slate-500">Loading roles...</p>;
  }

  if (error) {
    return <p className="p-5 text-red-600">{error}</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Available Roles
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Roles and their assigned permissions.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3">Role Name</th>
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3">Permissions</th>
              <th className="px-5 py-3">Type</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {roles.map((role) => (
              <tr key={role._id}>
                <td className="px-5 py-4 font-medium text-slate-900">
                  {role.name}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {role.description || "No description"}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {role.permissions?.length || 0}
                </td>

                <td className="px-5 py-4">
                  {role.isSystemRole ? "System Role" : "Custom Role"}
                </td>
              </tr>
            ))}

            {roles.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="px-5 py-8 text-center text-slate-500"
                >
                  No roles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RoleTable;
