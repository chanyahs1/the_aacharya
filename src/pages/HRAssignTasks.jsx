import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardPlus } from "lucide-react";
import { PlusIcon } from "@heroicons/react/24/outline";
import Button from "../components/ui/Button";
import TaskModal from "../components/TaskModal";

export default function AssignTaskPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedRemarks, setUpdatedRemarks] = useState({});

  const fetchTasks = async (employee) => {
    try {
      const response = await fetch(
        `https://the-aacharya.onrender.com/api/employees/tasks/creator/${employee.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedEmployee = JSON.parse(
      localStorage.getItem("currentHR") ||
        sessionStorage.getItem("currentHR")
    );
    setCurrentEmployee(storedEmployee);

    if (storedEmployee) {
      fetchTasks(storedEmployee);
      fetchEmployees(storedEmployee);
    }
  }, []);

  const fetchEmployees = async (employee) => {
    try {
      const url = `https://the-aacharya.onrender.com/api/employees/hierarchy/${encodeURIComponent(
        employee.role
      )}?department=${encodeURIComponent(employee.department)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      setError("Failed to load employees");
    }
  };

  const handleCreateTask = async (taskData) => {
    const currentEmployee = JSON.parse(
      localStorage.getItem("currentHR") ||
        sessionStorage.getItem("currentHR")
    );
    const createdBy = currentEmployee?.id;
    if (!createdBy) {
      alert("Employee not logged in.");
      return;
    }

    try {
      const response = await fetch(
        "https://the-aacharya.onrender.com/api/employees/tasks",
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
            createdBy,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create task");
      }

      await fetchTasks(currentEmployee);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
      setError(error.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleCreatorRemarkChange = (taskId, value) => {
    setUpdatedRemarks((prev) => ({
      ...prev,
      [taskId]: value,
    }));
  };

  const saveCreatorRemark = async (taskId) => {
    const remark = updatedRemarks[taskId];
    if (!remark || !remark.trim()) return;

    try {
      const response = await fetch(
        `https://the-aacharya.onrender.com/api/employees/tasks/creator-remark/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ creator_remarks: remark }),
        }
      );

      if (!response.ok) throw new Error("Failed to update remark");

      if (currentEmployee) fetchTasks(currentEmployee);
    } catch (error) {
      console.error("Error updating creator remark:", error);
      setError("Failed to update creator remark");
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-neutral-600">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 min-h-screen p-4 sm:p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <ClipboardPlus className="w-9 h-9 text-blue-600" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Assign Tasks</h1>
            <Button
              variant="primary"
              icon={<PlusIcon className="w-5 h-5" />}
              onClick={() => setIsModalOpen(true)}
            >
              New Task
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
                    Creator Remark
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
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
                              ? "bg-red-100 text-red-800"
                              : task.priority === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
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
                              ? "bg-green-100 text-green-800"
                              : task.status === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
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
                        <div className="text-sm text-neutral-900">
                          {task.assignee_remarks}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {task.status === "Completed" ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              value={
                                updatedRemarks[task.id] ??
                                task.creator_remarks ??
                                ""
                              }
                              onChange={(e) =>
                                handleCreatorRemarkChange(task.id, e.target.value)
                              }
                              className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                              rows={2}
                              placeholder="Add remark"
                            />
                            {updatedRemarks[task.id] !== undefined &&
                              updatedRemarks[task.id] !==
                                task.creator_remarks && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => saveCreatorRemark(task.id)}
                                >
                                  Update Remark
                                </Button>
                              )}
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-4 px-6 text-center text-neutral-500"
                    >
                      No tasks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateTask}
          employees={employees}
        />
      </div>
    </motion.div>
  );
}
