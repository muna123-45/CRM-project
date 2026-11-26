import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import StatCard from "../components/dashboard/StatCard";
import LeadPipeline from "../components/dashboard/LeadPipeline";
import RecentActivities from "../components/dashboard/RecentActivities";
import UpcomingTasks from "../components/dashboard/UpcomingTasks";

import { Users, Target, CheckSquare } from "lucide-react";

function Dashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "48",
      change: "+12.5%",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Leads",
      value: "856",
      change: "+8.2%",
      icon: Target,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Completed Tasks",
      value: "324",
      change: "+5.4%",
      icon: CheckSquare,
      color: "bg-green-100 text-green-600",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <Topbar />

        <div className="space-y-7 p-4 sm:p-8">
          {/* Dashboard Welcome */}
          <section>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome to CRM Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Here's what's happening with your CRM today.
            </p>
          </section>

          {/* Statistics Cards */}
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </section>

          {/* Lead Pipeline */}
          <section>
            <LeadPipeline />
          </section>

          {/* Recent Activities */}
          <section>
            <RecentActivities />
          </section>

          {/* Upcoming Tasks */}
          <section>
            <UpcomingTasks />
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
