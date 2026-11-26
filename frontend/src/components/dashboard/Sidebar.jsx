import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Target,
  CheckSquare,
  CalendarDays,
  BarChart3,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function Sidebar() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  // console.log("Logged-in user data:", user);
  // console.log("User permissions:", user?.permissions);

  // Navigation menu items with allowed roles

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      requiredPermission: "dashboard.view",
    },
    {
      name: "User Management",
      path: "/users",
      icon: Users,
      requiredPermission: "users.view",
    },
    {
      name: "Leads",
      path: "/leads",
      icon: Target,
      requiredPermission: "leads.view",
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: CheckSquare,
      requiredPermission: "tasks.view",
    },
    {
      name: "Activities",
      path: "/activities",
      icon: CalendarDays,
      requiredPermission: "activities.view",
    },
    {
      name: "Reports",
      path: "/reports",
      icon: BarChart3,
      requiredPermission: "reports.view",
    },
  ];

  // Get permissions from logged-in user
  const userPermissions = user?.permissions || [];

  // Check which menu items the user can access
  const filteredMenuItems = menuItems.filter((item) =>
    userPermissions.includes(item.requiredPermission),
  );

  

  // Handle logout
  const handleLogout = async () => {
    const result = await logout();

    if (result.success) {
      navigate("/login", { replace: true });
    } else {
      alert(result.message);
    }
  };

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-slate-950 text-white">
      {/* Logo */}
      <div className="border-b border-slate-800 px-6 py-6">
        <h1 className="text-2xl font-bold">
          CRM<span className="text-blue-500">Pro</span>
        </h1>

        <p className="mt-1 text-xs text-slate-400">Management System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Main Menu
        </p>

        {filteredMenuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile and Logout */}
      <div className="border-t border-slate-800 p-5">
        <div className="mb-4">
          <p className="text-sm font-semibold">{user?.name || "CRM User"}</p>

          <p className="mt-1 text-xs capitalize text-slate-400">
            {user?.role || "Employee"}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-400 transition hover:bg-slate-800"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
