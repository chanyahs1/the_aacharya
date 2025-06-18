import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState({
    current: [],
    upcoming: [],
    previous: [],
  });
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const currentEmployee = JSON.parse(
    localStorage.getItem("currentEmployee") ||
      sessionStorage.getItem("currentEmployee")
  );

  // Function to handle task status updates
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/employees/tasks/${taskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      // Force fetch tasks to update the UI
      await fetchTasks(true);
    } catch (error) {
      console.error("Error updating task status:", error);
      setError("Failed to update task status. Please try again.");
    }
  };

  // Function to fetch tasks with debouncing
  const fetchTasks = async (force = false) => {
    const now = Date.now();
    // Don't fetch if less than 5 seconds have passed since last fetch, unless forced
    if (!force && now - lastFetchTime < 5000) {
      return;
    }

    try {
      setError(null);
      console.log("Fetching tasks for employee:", currentEmployee.id);

      const response = await fetch(
        `http://localhost:5000/api/employees/${currentEmployee.id}/tasks`
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to fetch tasks: ${response.status} ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Tasks fetched successfully");

      // Sort tasks by due date and status
      const sortedTasks = data.sort((a, b) => {
        // First sort by status (Pending first)
        if (a.status === "Pending" && b.status !== "Pending") return -1;
        if (a.status !== "Pending" && b.status === "Pending") return 1;
        // Then sort by due date
        return new Date(a.due_date) - new Date(b.due_date);
      });

      // Separate tasks into current, upcoming, and previous
      const currentDate = new Date();
      const currentTasks = sortedTasks.filter(
        (task) =>
          // Show tasks that are either:
          // 1. Due today or overdue AND not completed
          // 2. In Progress (regardless of due date)
          ((new Date(task.due_date) <= currentDate &&
            task.status !== "Completed") ||
            task.status === "In Progress") &&
          task.status !== "Completed"
      );

      const upcomingTasks = sortedTasks.filter(
        (task) =>
          // Show tasks that are:
          // 1. Due in the future
          // 2. Not in progress or completed
          new Date(task.due_date) > currentDate &&
          task.status !== "In Progress" &&
          task.status !== "Completed"
      );

      const previousTasks = sortedTasks.filter(
        (task) =>
          // Show all completed tasks
          task.status === "Completed"
      );

      setTasks({
        current: currentTasks,
        upcoming: upcomingTasks,
        previous: previousTasks,
      });
      setLastFetchTime(now);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError(error.message);
      setTasks({ current: [], upcoming: [], previous: [] });
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    if (!currentEmployee) {
      navigate("/employee-login");
      return;
    }

    console.log("Current employee in dashboard:", currentEmployee);

    // Initial fetch
    fetchTasks(true);

    // Remove periodic fetch
  }, [currentEmployee, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      {error && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
          <p className="text-error-800">{error}</p>
        </div>
      )}

      {/* Add Employee Name Header with Onboarding Form Button */}
      <div className=" flex items-start justify-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">
            Welcome, {currentEmployee.name} {currentEmployee.surname}
          </h1>
          <p>{currentEmployee.empID}</p>
          <p className="mt-2 text-neutral-600">
            {currentEmployee.department} {currentEmployee.role}
          </p>
          <p>{currentEmployee.email}</p>
        </div>
        <button
          onClick={() => navigate("/onboarding-form")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <DocumentTextIcon className="w-5 h-5" />
          Onboarding Form
        </button>
        {currentEmployee.department === "Sales" && (
          <button
            onClick={() => navigate("/sales-punch-form")}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <DocumentTextIcon className="w-5 h-5" />
            Sales Punch Form
          </button>
        )}
         {currentEmployee.department === "Sales" && (
          <button
            onClick={() => navigate("/ds-form")}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <DocumentTextIcon className="w-5 h-5" />
            Direct Session Form
          </button>
        )}
      </div>
    </motion.div>
  );
}
