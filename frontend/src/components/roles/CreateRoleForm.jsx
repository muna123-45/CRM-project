
import { useEffect, useState } from "react";
import api from "../../services/api";

function CreateRoleForm({ onRoleCreated, onCancel }) {
  const [step, setStep] = useState(1);

  // Role details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Permissions
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch permissions from backend
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/roles/permissions");

        setPermissions(response.data.permissions || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load permissions."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  // Step 1 -> Step 2
  const handleNext = () => {
    if (name.trim().length < 2) {
      setError("Role name must contain at least 2 characters.");
      return;
    }

    if (loading) {
      return;
    }

    setError("");
    setStep(2);
  };

  // Step 2 -> Step 1
  const handleBack = () => {
    setError("");
    setStep(1);
  };

  // Select or deselect permissions
  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions((previous) => {
      if (previous.includes(permissionId)) {
        return previous.filter((id) => id !== permissionId);
      }

      return [...previous, permissionId];
    });
  };

  // Group permissions by module
  const groupedPermissions = permissions.reduce((groups, permission) => {
    const moduleName = permission.module || "Other";

    if (!groups[moduleName]) {
      groups[moduleName] = [];
    }

    groups[moduleName].push(permission);

    return groups;
  }, {});

  // Create role only when Finish is clicked
  const handleFinish = async () => {
    if (step !== 2 || saving) {
      return;
    }

    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter a valid role name.");
      setStep(1);
      return;
    }

    if (selectedPermissions.length === 0) {
      setError("Please select at least one permission.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await api.post("/roles", {
        name: name.trim(),
        description: description.trim(),
        permissions: selectedPermissions,
      });

      alert(response.data.message || "Role created successfully!");

      onRoleCreated();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create role."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* Popup */}
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Create New Role
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create a role and assign its permissions.
              </p>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          {/* Step progress */}
          <div className="mt-6 flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                step === 1
                  ? "bg-blue-600 text-white"
                  : "bg-green-100 text-green-700"
              }`}
            >
              1
            </div>

            <div
              className={`h-1 flex-1 rounded ${
                step === 2 ? "bg-blue-600" : "bg-slate-200"
              }`}
            />

            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                step === 2
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              2
            </div>
          </div>

          <div className="mt-2 flex justify-between text-xs font-medium">
            <span className={step === 1 ? "text-blue-600" : "text-green-600"}>
              Role Details
            </span>

            <span className={step === 2 ? "text-blue-600" : "text-slate-400"}>
              Assign Permissions
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Role Name *
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError("");
                  }}
                  placeholder="Example: Sales Executive"
                  minLength={2}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the responsibilities of this role"
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <p className="text-sm text-slate-500">
                Enter the role details and click Next to assign permissions.
              </p>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div>
                <h3 className="text-base font-semibold text-slate-800">
                  Assign Permissions
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Select the permissions this role should have.
                </p>
              </div>

              {loading ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  Loading permissions...
                </p>
              ) : permissions.length === 0 ? (
                <p className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700">
                  No active permissions available. Please check the permissions
                  API.
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(
                    ([moduleName, modulePermissions]) => (
                      <div
                        key={moduleName}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <h4 className="mb-3 text-sm font-semibold capitalize text-slate-800">
                          {moduleName}
                        </h4>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {modulePermissions.map((permission) => (
                            <label
                              key={permission._id}
                              className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm text-slate-600 hover:bg-slate-50"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(
                                  permission._id
                                )}
                                onChange={() =>
                                  handlePermissionChange(permission._id)
                                }
                                className="h-4 w-4 accent-blue-600"
                              />

                              <span>{permission.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-sm font-medium text-blue-700">
                  Selected permissions: {selectedPermissions.length}
                </p>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-3 border-t border-slate-200 bg-slate-50 p-5">

          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next →
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-50"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleFinish}
                disabled={loading || saving || permissions.length === 0}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Creating..." : "Finish"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateRoleForm;
