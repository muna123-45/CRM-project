import {
  UserPlus,
  RefreshCw,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

const activities = [
  {
    id: 1,
    title: "New lead created",
    description: "Rahul Sharma was added as a new lead.",
    time: "10 minutes ago",
    icon: UserPlus,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    title: "Lead status updated",
    description: "Priya Verma moved to Qualified.",
    time: "30 minutes ago",
    icon: RefreshCw,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: 3,
    title: "Meeting scheduled",
    description: "A meeting was scheduled with Amit Kumar.",
    time: "1 hour ago",
    icon: CalendarDays,
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: 4,
    title: "Task completed",
    description: "Follow-up call task was completed.",
    time: "2 hours ago",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-600",
  },
];

function RecentActivities() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900">
          Recent Activities
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Latest updates from your CRM
        </p>
      </div>

      <div className="space-y-5">
        {activities.map((activity) => {
          const Icon = activity.icon;

          return (
            <div key={activity.id} className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activity.color}`}
              >
                <Icon size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-800">
                  {activity.title}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {activity.description}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecentActivities;
