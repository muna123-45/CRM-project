import { Search, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Topbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8">

      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Dashboard
        </h2>

        <p className="hidden text-xs text-slate-500 sm:block">
          Welcome back, {user?.name || "User"}
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 sm:gap-5">

        {/* Search */}
        <div className="hidden items-center rounded-lg border border-slate-200 px-3 py-2 md:flex">
          <Search size={17} className="text-slate-400" />

          <input
            type="text"
            placeholder="Search..."
            className="w-36 bg-transparent pl-2 text-sm outline-none"
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
        >
          <Bell size={20} />

          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User Avatar */}
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700"
          title={user?.name || "User"}
        >
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>

      </div>

    </header>
  );
}

export default Topbar;
