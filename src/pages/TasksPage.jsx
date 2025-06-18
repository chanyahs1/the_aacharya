import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlusIcon } from "@heroicons/react/24/outline";
import Button from "../components/ui/Button";
import TaskModal from "../components/TaskModal";
import TaskRatingModal from "../components/TaskRatingModal";

export default function TasksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all"); // all, Pending, In Progress, Completed
const [employees, setEmployees] = useState([]);



  useEffect(() => {  fetchTasks();
  fetchEmployees();
}, []);

const fetchEmployees = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/employees");
    const data = await res.json();
    setEmployees(data);
  } catch (error) {
    console.error("Failed to fetch employees:", error);
  }
};

  const fetchTasks = async () => {
    try {
      const currentEmployee = JSON.parse(sessionStorage.getItem("currentHR"));

      if (!currentEmployee) {
        throw new Error("No HR data found");
      }

      const url = "http://localhost:5000/api/employees/hr/tasks";

      const response = await fetch(url);
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to fetch tasks: ${response.status} ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Tasks fetched:", data);
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    }
  };

  const handleCreateTask = async (taskData) => {
    const currentUser =
      JSON.parse(localStorage.getItem("currentEmployee")) ||
      JSON.parse(sessionStorage.getItem("currentEmployee")) ||
      JSON.parse(localStorage.getItem("currentHR")) ||
      JSON.parse(sessionStorage.getItem("currentHR"));
    // Try to get current user (either employee or HR) from localStorage/sessionStorage

    if (!currentUser || !currentUser.id) {
      alert("Current user not found. Please log in again.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/employees/tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: taskData.title,
            description: taskData.description,
            dueDate: taskData.dueDate,
            priority: taskData.priority,
            assigneeId: parseInt(taskData.assigneeId, 10),
            createdBy: currentUser.id, // 🔑 ID of current user
            status: "Pending",
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Task created:", result);
        await fetchTasks(); // Refresh the task list after creation
        setIsModalOpen(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task: " + error.message);
    }
  };

  const handleRatingSubmit = async (ratings) => {
    console.log("Ratings submitted:", ratings);
    await fetchTasks(); // Refresh the task list
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const ratedTasks = tasks.filter(
    (task) => task.status === "Completed" && task.productivity_rating !== null
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Active Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-neutral-800">
            Active Tasks
          </h1>
          <div className="flex gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Tasks</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <Button
              variant="primary"
              icon={<PlusIcon className="w-5 h-5" />}
              onClick={() => setIsModalOpen(true)}
            >
              New Task
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50 border-y border-neutral-200">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Assignee Remark
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredTasks.filter((task) => !task.productivity_rating)
                  .length > 0 ? (
                  filteredTasks
                    .filter((task) => !task.productivity_rating)
                    .map((task) => (
                      <tr key={task.id} className="hover:bg-neutral-50">
                        <td className="py-4 px-6">
                          <div>
                            <span className="text-sm font-medium text-neutral-900">
                              {task.title}
                            </span>
                            {task.description && (
                              <p className="text-sm text-neutral-500 mt-1">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-neutral-600">
                            {formatDate(task.due_date)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${
                            task.priority === "High"
                              ? "bg-error-100 text-error-800"
                              : task.priority === "Medium"
                              ? "bg-warning-100 text-warning-800"
                              : "bg-success-100 text-success-800"
                          }`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${
                            task.status === "Completed"
                              ? "bg-success-100 text-success-800"
                              : task.status === "In Progress"
                              ? "bg-primary-100 text-primary-800"
                              : "bg-warning-100 text-warning-800"
                          }`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-neutral-900">
                              {task.assignee_name} {task.assignee_surname}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {task.assignee_department} {task.assignee_role}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-neutral-900">
                              {task.assignee_remarks || (
                                <span className="text-neutral-400 italic">
                                  No remarks
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {task.status === "Completed" &&
                            !task.productivity_rating && (
                              <button
                                className="text-xs px-2 py-1 rounded bg-primary-100 text-primary-800 hover:bg-primary-200"
                                onClick={() => {
                                  setSelectedTask(task);
                                  setIsRatingModalOpen(true);
                                }}
                              >
                                Rate Task
                              </button>
                            )}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-4 px-6 text-center text-neutral-500"
                    >
                      No active tasks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Past Tasks Section */}
      <div>
        <h2 className="text-2xl font-semibold text-neutral-800 mb-6">
          Past Tasks
        </h2>
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50 border-y border-neutral-200">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Completed Date
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Productivity
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Quality
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Teamwork
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {ratedTasks.length > 0 ? (
                  ratedTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-neutral-50">
                      <td className="py-4 px-6">
                        <div>
                          <span className="text-sm font-medium text-neutral-900">
                            {task.title}
                          </span>
                          {task.description && (
                            <p className="text-sm text-neutral-500 mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-neutral-600">
                          {formatDate(task.rated_at)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-neutral-900">
                            {task.assignee_name} {task.assignee_surname}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {task.assignee_role || "No role assigned"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <RatingBadge value={task.productivity_rating} />
                      </td>
                      <td className="py-4 px-6">
                        <RatingBadge value={task.quality_rating} />
                      </td>
                      <td className="py-4 px-6">
                        <RatingBadge value={task.teamwork_rating} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-4 px-6 text-center text-neutral-500"
                    >
                      No rated tasks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
          employees={employees}

      />

      {selectedTask && (
        <TaskRatingModal
          isOpen={isRatingModalOpen}
          onClose={() => {
            setIsRatingModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onSubmit={handleRatingSubmit}
        />
      )}
    </motion.div>
  );
}

// Helper component for rating badges
const RatingBadge = ({ value }) => {
  const getBgColor = (rating) => {
    if (rating >= 8) return "bg-success-100 text-success-800";
    if (rating >= 5) return "bg-warning-100 text-warning-800";
    return "bg-error-100 text-error-800";
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBgColor(
        value
      )}`}
    >
      {value}/10
    </span>
  );
};
