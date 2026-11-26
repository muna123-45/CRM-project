import { useEffect, useState } from "react";
import api from "../../services/api";

function UserTable({
  refreshKey,
  onEditUser,
  canUpdateUser,
  canDeleteUser,
  onUserDeleted,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingUserId, setDeletingUserId] = useState(null);

  // FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users");

        setUsers(response.data.users || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to fetch users. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [refreshKey]);

  // DELETE USER
  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) return;

    try {
      setDeletingUserId(user._id);

      await api.delete(`/users/${user._id}`);

      alert("User deleted successfully!");

      if (onUserDeleted) {
        onUserDeleted();
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete user. Please try again."
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">
          Loading team members...
        </p>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-600">{error}</p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  const canShowActions = canUpdateUser || canDeleteUser;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Team Members
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage your CRM team members and their roles.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Name
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Email
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Role
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Joined
              </th>

              {canShowActions && (
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {user.name}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {user.email}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium capitalize text-blue-700">
                      {typeof user.role === "object"
                        ? user.role?.name
                        : user.role}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  {canShowActions && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {canUpdateUser && (
                          <button
                            type="button"
                            onClick={() => onEditUser(user)}
                            className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
                          >
                            Edit
                          </button>
                        )}

                        {canDeleteUser && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            disabled={deletingUserId === user._id}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingUserId === user._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={canShowActions ? 5 : 4}
                  className="px-6 py-8 text-center text-sm text-slate-500"
                >
                  No team members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserTable;
