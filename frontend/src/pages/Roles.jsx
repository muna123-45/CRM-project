
import { useState } from "react";

import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import RoleTable from "../components/roles/RoleTable";
import CreateRoleForm from "../components/roles/CreateRoleForm";
import { useAuth } from "../context/AuthContext";

function Roles() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { user } = useAuth();

  // Check whether the logged-in user can create roles
  const canCreateRole = user?.permissions?.includes("roles.create");

  // Called after a role is successfully created
  const handleRoleCreated = () => {
    setShowCreateForm(false);
    setRefreshKey((previousKey) => previousKey + 1);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <Topbar />

        <div className="space-y-7 p-4 sm:p-8">
          {/* Page Header */}
          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Role Management
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage roles and their permissions in your CRM.
              </p>
            </div>

            {/* Show button only if user has permission */}
            {canCreateRole && !showCreateForm && (
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                + Create Role
              </button>
            )}
          </section>

          {/* Create Role Form */}
          {showCreateForm && (
            <section>
              <CreateRoleForm
                onRoleCreated={handleRoleCreated}
                onCancel={() => setShowCreateForm(false)}
              />
            </section>
          )}

          {/* Roles Table */}
          <section>
            <RoleTable refreshKey={refreshKey} />
          </section>
        </div>
      </main>
    </div>
  );
}

export default Roles;
