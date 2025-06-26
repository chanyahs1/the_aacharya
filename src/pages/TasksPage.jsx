import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PlusIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import Button from "../components/ui/Button";
import TaskModal from "../components/TaskModal";
import TaskRatingModal from "../components/TaskRatingModal";

const ITEMS_PER_PAGE = 8;

export default function TasksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all"); // all, Pending, In Progress, Completed
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [taskNameSearch, setTaskNameSearch] = useState("");
  const [assigneeNameSearch, setAssigneeNameSearch] = useState("");
  const [creatorNameSearch, setCreatorNameSearch] = useState("");
  const [employees, setEmployees] = useState([]);
  const [activeTasksPage, setActiveTasksPage] = useState(1);
  const [ratedTasksPage, setRatedTasksPage] = useState(1);
  const [dueDateFilter, setDueDateFilter] = useState("");
  const [completedDateFilter, setCompletedDateFilter] = useState("");
  const [ratedAssigneeSearch, setRatedAssigneeSearch] = useState("");

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("https://the-aacharya.onrender.com/api/employees");
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(
        "https://the-aacharya.onrender.com/api/employees/hr/tasks"
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch tasks: ${response.status} ${errorText}`
        );
      }
      const data = await response.json();
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

    if (!currentUser || !currentUser.id) {
      alert("Current user not found. Please log in again.");
      return;
    }

    try {
      const response = await fetch(
        "https://the-aacharya.onrender.com/api/employees/tasks",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...taskData,
            assigneeId: parseInt(taskData.assigneeId, 10),
            createdBy: currentUser.id,
            status: "Pending",
          }),
        }
      );

      if (response.ok) {
        await fetchTasks();
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
    await fetchTasks();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter !== "all" && task.status !== filter) {
      return false;
    }
    if (priorityFilter !== "all" && task.priority !== priorityFilter) {
      return false;
    }
    if (
      taskNameSearch &&
      !task.title.toLowerCase().includes(taskNameSearch.toLowerCase())
    ) {
      return false;
    }
    const assigneeName = `${task.assignee_name || ""} ${
      task.assignee_surname || ""
    }`.trim();
    if (
      assigneeNameSearch &&
      !assigneeName.toLowerCase().includes(assigneeNameSearch.toLowerCase())
    ) {
      return false;
    }
    const creatorName = `${task.creator_name || ""} ${
      task.creator_surname || ""
    }`.trim();
    if (
      creatorNameSearch &&
      !creatorName.toLowerCase().includes(creatorNameSearch.toLowerCase())
    ) {
      return false;
    }
    if (
      dueDateFilter &&
      (!task.due_date || !task.due_date.startsWith(dueDateFilter))
    ) {
      return false;
    }
    return true;
  });

  const activeTasks = filteredTasks.filter((task) => !task.productivity_rating);
  const ratedTasks = tasks.filter(
    (task) => task.status === "Completed" && task.productivity_rating !== null
  );

  const filteredRatedTasks = ratedTasks.filter((task) => {
    if (
      completedDateFilter &&
      (!task.rated_at || !task.rated_at.startsWith(completedDateFilter))
    ) {
      return false;
    }
    const assigneeName = `${task.assignee_name || ""} ${
      task.assignee_surname || ""
    }`.trim();
    if (
      ratedAssigneeSearch &&
      !assigneeName.toLowerCase().includes(ratedAssigneeSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const paginatedActiveTasks = activeTasks.slice(
    (activeTasksPage - 1) * ITEMS_PER_PAGE,
    activeTasksPage * ITEMS_PER_PAGE
  );

  const paginatedRatedTasks = filteredRatedTasks.slice(
    (ratedTasksPage - 1) * ITEMS_PER_PAGE,
    ratedTasksPage * ITEMS_PER_PAGE
  );

  const pendingCount = tasks.filter((t) => t.status === "Pending").length;
  const inProgressCount = tasks.filter(
    (t) => t.status === "In Progress"
  ).length;
  const completedUnratedCount = tasks.filter(
    (t) => t.status === "Completed" && !t.productivity_rating
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br p-6"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Task Management
            </h1>
            <p className="text-gray-600 mt-1">
              Assign, track, and rate employee tasks.
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            icon={<PlusIcon className="w-5 h-5" />}
            onClick={() => setIsModalOpen(true)}
          >
            New Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<ClipboardDocumentListIcon />}
            title="Pending"
            value={pendingCount}
            color="yellow"
          />
          <StatCard
            icon={<ClockIcon />}
            title="In Progress"
            value={inProgressCount}
            color="blue"
          />
          <StatCard
            icon={<CheckCircleIcon />}
            title="Completed"
            value={completedUnratedCount}
            color="green"
          />
          <StatCard
            icon={<StarIcon />}
            title="Rated"
            value={ratedTasks.length}
            color="purple"
          />
        </div>

        {/* Active Tasks Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Active Tasks
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Tasks that are ongoing or pending completion.
                </p>
              </div>
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition"
                >
                  <option value="all">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search by task..."
                value={taskNameSearch}
                onChange={(e) => setTaskNameSearch(e.target.value)}
                className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition w-full"
              />
              <input
                type="text"
                placeholder="Search by assignee..."
                value={assigneeNameSearch}
                onChange={(e) => setAssigneeNameSearch(e.target.value)}
                className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition w-full"
              />
              <input
                type="text"
                placeholder="Search by creator..."
                value={creatorNameSearch}
                onChange={(e) => setCreatorNameSearch(e.target.value)}
                className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition w-full"
              />
              <input
                type="date"
                value={dueDateFilter}
                onChange={(e) => setDueDateFilter(e.target.value)}
                className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition w-full"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Creator
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Remarks
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedActiveTasks.length > 0 ? (
                  paginatedActiveTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          {task.title}
                        </div>
                        <p className="text-sm text-gray-500">
                          {task.description}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {formatDate(task.due_date)}
                      </td>
                      <td className="py-4 px-6">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-gray-900">
                          {task.assignee_name} {task.assignee_surname}
                        </div>
                        <div className="text-xs text-gray-500">
                          {task.assignee_empID} 
                        </div>
                        <div className="text-xs text-gray-500">
                          {task.assignee_department} {task.assignee_role}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-gray-900">
                          {task.creator_name} {task.creator_surname}
                        </div>
                        <div className="text-xs text-gray-500">
                          {task.creator_department} {task.creator_role}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600 italic">
                          <p>
                            <b>Assignee:</b> {task.assignee_remarks || "N/A"}
                          </p>
                          <p>
                            <b>Creator:</b> {task.creator_remarks || "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {task.status === "Completed" &&
                          !task.productivity_rating && (
                            <button
                              className="text-xs px-3 py-1 rounded-full font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                              onClick={() => {
                                setSelectedTask(task);
                                setIsRatingModalOpen(true);
                              }}
                            >
                              Rate
                            </button>
                          )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-12 px-6 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <ClipboardDocumentListIcon className="h-12 w-12 text-gray-300" />
                        <h3 className="text-lg font-medium mt-2">
                          No active tasks found
                        </h3>
                        <p className="text-sm text-gray-400">
                          Try changing the filter or creating a new task.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {activeTasks.length > ITEMS_PER_PAGE && (
            <div className="p-4 border-t border-gray-200">
              <Pagination
                currentPage={activeTasksPage}
                totalItems={activeTasks.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setActiveTasksPage}
              />
            </div>
          )}
        </div>

        {/* Past Tasks Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Rated Tasks</h2>
            <p className="text-sm text-gray-500 mt-1">
              Tasks that have been completed and rated.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Search by assignee..."
                value={ratedAssigneeSearch}
                onChange={(e) => setRatedAssigneeSearch(e.target.value)}
                className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition w-full"
              />
              <input
                type="date"
                value={completedDateFilter}
                onChange={(e) => setCompletedDateFilter(e.target.value)}
                className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition w-full"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Completed Date
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Productivity
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Quality
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Teamwork
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedRatedTasks.length > 0 ? (
                  paginatedRatedTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          {task.title}
                        </div>
                        <p className="text-sm text-gray-500">
                          {task.description}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {formatDate(task.rated_at)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-gray-900">
                          {task.assignee_name} {task.assignee_surname}
                        </div>
                        <div className="text-xs text-gray-500">
                          {task.assignee_role || "N/A"}
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
                      className="py-12 px-6 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <StarIcon className="h-12 w-12 text-gray-300" />
                        <h3 className="text-lg font-medium mt-2">
                          No rated tasks found
                        </h3>
                        <p className="text-sm text-gray-400">
                          Completed tasks will appear here once they are rated.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredRatedTasks.length > ITEMS_PER_PAGE && (
            <div className="p-4 border-t border-gray-200">
              <Pagination
                currentPage={ratedTasksPage}
                totalItems={filteredRatedTasks.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setRatedTasksPage}
              />
            </div>
          )}
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

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    onPageChange((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    onPageChange((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => {
  const colors = {
    yellow: "bg-yellow-100 text-yellow-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {React.cloneElement(icon, { className: "h-6 w-6" })}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

const PriorityBadge = ({ priority }) => {
  const colors = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-green-100 text-green-800",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        colors[priority] || "bg-gray-100 text-gray-800"
      }`}
    >
      {priority}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const colors = {
    Completed: "bg-green-100 text-green-800",
    "In Progress": "bg-blue-100 text-blue-800",
    Pending: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        colors[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
};

const RatingBadge = ({ value }) => {
  const getBgColor = (rating) => {
    if (rating >= 8) return "bg-green-100 text-green-800";
    if (rating >= 5) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getBgColor(
        value
      )}`}
    >
      {value}/10
    </span>
  );
};
