import { CalendarDays, Clock3, CheckCircle2 } from "lucide-react";

const upcomingTasks = [
  {
    id: 1,
    title: "Follow-up call with Rahul Sharma",
    description: "Discuss the product requirements.",
    dueDate: "Today",
    dueTime: "10:30 AM",
    priority: "High",
    status: "Pending",
  },
  {
    id: 2,
    title: "Prepare client proposal",
    description: "Prepare and send the pricing proposal.",
    dueDate: "Today",
    dueTime: "02:00 PM",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: 3,
    title: "Meeting with Priya Verma",
    description: "Discuss the project requirements.",
    dueDate: "Tomorrow",
    dueTime: "11:00 AM",
    priority: "High",
    status: "Pending",
  },
  {
    id: 4,
    title: "Review new leads",
    description: "Check and assign newly created leads.",
    dueDate: "Nov 20",
    dueTime: "04:00 PM",
    priority: "Low",
    status: "Pending",
  },
];

function UpcomingTasks() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900">
          Upcoming Tasks
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Tasks that need your attention
        </p>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {upcomingTasks.map((task) => (
          <div
            key={task.id}
            className="rounded-lg border border-slate-100 p-4"
          >
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              {/* Task Information */}
              <div className="flex min-w-0 gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <CheckCircle2 size={20} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-800">
                    {task.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {task.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={14} />
                      {task.dueDate}
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock3 size={14} />
                      {task.dueTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Priority */}
              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                  task.priority === "High"
                    ? "bg-red-100 text-red-600"
                    : task.priority === "Medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {task.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UpcomingTasks;
