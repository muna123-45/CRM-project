import { useState } from "react";

import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";

import TaskTable from "../components/tasks/TaskTable";
import AddTaskForm from "../components/tasks/AddTaskForm";
import EditTaskForm from "../components/tasks/EditTaskForm";

import { useAuth } from "../context/AuthContext";

function Tasks() {
  const { user } = useAuth();

  // Form visibility
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [showEditTaskForm, setShowEditTaskForm] = useState(false);

  // Selected task for editing
  const [selectedTask, setSelectedTask] = useState(null);

  // Refresh task table
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);

  // Permission checks
  const canCreateTask = user?.permissions?.includes("tasks.create");
  const canUpdateTask = user?.permissions?.includes("tasks.update");
  const canDeleteTask = user?.permissions?.includes("tasks.delete");

  // After task creation
  const handleTaskCreated = () => {
    setShowAddTaskForm(false);
    setTaskRefreshKey((previousKey) => previousKey + 1);
  };

  // Open edit form
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowEditTaskForm(true);
    setShowAddTaskForm(false);
  };

  // After task update
  const handleTaskUpdated = () => {
    setShowEditTaskForm(false);
    setSelectedTask(null);
    setTaskRefreshKey((previousKey) => previousKey + 1);
  };

  // After task deletion
  const handleTaskDeleted = () => {
    setTaskRefreshKey((previousKey) => previousKey + 1);
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
              Task Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create, assign and manage your team's tasks.
            </p>
          </section>

          {/* Add Task Button */}
          {canCreateTask &&
            !showAddTaskForm &&
            !showEditTaskForm && (
              <section className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddTaskForm(true)}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  + Create Task
                </button>
              </section>
            )}

          {/* Add Task Form */}
          {showAddTaskForm && (
            <section>
              <AddTaskForm
                onTaskCreated={handleTaskCreated}
                onCancel={() => setShowAddTaskForm(false)}
              />
            </section>
          )}

          {/* Edit Task Form */}
          {showEditTaskForm && selectedTask && (
            <section>
              <EditTaskForm
                task={selectedTask}
                onTaskUpdated={handleTaskUpdated}
                onCancel={() => {
                  setShowEditTaskForm(false);
                  setSelectedTask(null);
                }}
              />
            </section>
          )}

          {/* Task Table */}
          <section>
            <TaskTable
              refreshKey={taskRefreshKey}
              onEditTask={handleEditTask}
              canUpdateTask={canUpdateTask}
              canDeleteTask={canDeleteTask}
              onTaskDeleted={handleTaskDeleted}
            />
          </section>
        </div>
      </main>
    </div>
  );
}

export default Tasks;
