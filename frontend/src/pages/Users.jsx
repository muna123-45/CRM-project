import { useState } from "react";

import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";

import UserTable from "../components/users/UserTable";
import AddUserForm from "../components/users/AddUserForm";
import EditUserForm from "../components/users/EditUserForm";

import RoleTable from "../components/roles/RoleTable";
import CreateRoleForm from "../components/roles/CreateRoleForm";

import { useAuth } from "../context/AuthContext";

function Users() {
  const { user } = useAuth();

  // Active tab
  const [activeTab, setActiveTab] = useState("users");

  // Form visibility
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showEditUserForm, setShowEditUserForm] = useState(false);
  const [showCreateRoleForm, setShowCreateRoleForm] = useState(false);

  // Selected user for editing
  const [selectedUser, setSelectedUser] = useState(null);

  // Table refresh keys
  const [userRefreshKey, setUserRefreshKey] = useState(0);
  const [roleRefreshKey, setRoleRefreshKey] = useState(0);

  // Permission checks
  const canViewRoles = user?.permissions?.includes("roles.view");
  const canCreateRole = user?.permissions?.includes("roles.create");
  const canUpdateUser = user?.permissions?.includes("users.update");
  const canDeleteUser = user?.permissions?.includes("users.delete");

  // After user creation
  const handleUserCreated = () => {
    setShowAddUserForm(false);
    setUserRefreshKey((previousKey) => previousKey + 1);
  };

  // Open Edit User form
  const handleEditUser = (selectedUser) => {
    setSelectedUser(selectedUser);
    setShowEditUserForm(true);
    setShowAddUserForm(false);
  };

  // After user update
  const handleUserUpdated = () => {
    setShowEditUserForm(false);
    setSelectedUser(null);
    setUserRefreshKey((previousKey) => previousKey + 1);
  };

  // After role creation
  const handleRoleCreated = () => {
    setShowCreateRoleForm(false);
    setRoleRefreshKey((previousKey) => previousKey + 1);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <Topbar />

        <div className="space-y-7 p-4 sm:p-8">
          {/* Page Header */}
          <section>
            <h1 className="text-2xl font-bold text-slate-900">
              User Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your team members, roles and permissions.
            </p>
          </section>

          {/* Navigation Tabs */}
          <section className="flex gap-6 border-b border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab("users");
                setShowAddUserForm(false);
                setShowEditUserForm(false);
                setShowCreateRoleForm(false);
                setSelectedUser(null);
              }}
              className={`border-b-2 px-2 py-3 text-sm font-semibold transition ${
                activeTab === "users"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Users
            </button>

            {canViewRoles && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("roles");
                  setShowAddUserForm(false);
                  setShowEditUserForm(false);
                  setShowCreateRoleForm(false);
                  setSelectedUser(null);
                }}
                className={`border-b-2 px-2 py-3 text-sm font-semibold transition ${
                  activeTab === "roles"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Roles & Permissions
              </button>
            )}
          </section>

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-7">
              {/* Add User Button */}
              {!showAddUserForm && !showEditUserForm && (
                <section className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddUserForm(true)}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    + Add User
                  </button>
                </section>
              )}

              {/* Add User Form */}
              {showAddUserForm && (
                <section>
                  <AddUserForm
                    onUserCreated={handleUserCreated}
                    onCancel={() => setShowAddUserForm(false)}
                  />
                </section>
              )}

              {/* Edit User Form */}
              {showEditUserForm && selectedUser && (
                <section>
                  <EditUserForm
                    user={selectedUser}
                    onUserUpdated={handleUserUpdated}
                    onCancel={() => {
                      setShowEditUserForm(false);
                      setSelectedUser(null);
                    }}
                  />
                </section>
              )}

              {/* Users Table */}
              <section>
                <UserTable
                  refreshKey={userRefreshKey}
                  onEditUser={handleEditUser}
                  canUpdateUser={canUpdateUser}
                  canDeleteUser={canDeleteUser}
                  onUserDeleted={handleUserUpdated}
                />
              </section>
            </div>
          )}

          {/* Roles & Permissions Tab */}
          {activeTab === "roles" && canViewRoles && (
            <div className="space-y-7">
              {/* Create Role Button */}
              {canCreateRole && !showCreateRoleForm && (
                <section className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateRoleForm(true)}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    + Create Role
                  </button>
                </section>
              )}

              {/* Create Role Form */}
              {showCreateRoleForm && (
                <section>
                  <CreateRoleForm
                    onRoleCreated={handleRoleCreated}
                    onCancel={() => setShowCreateRoleForm(false)}
                  />
                </section>
              )}

              {/* Roles Table */}
              <section>
                <RoleTable refreshKey={roleRefreshKey} />
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Users;
