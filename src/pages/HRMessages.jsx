import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { MessageCircle } from "lucide-react";

export default function Messages({ employeeId }) {
  const [messages, setMessages] = useState([]);
  const [broadcastMessages, setBroadcastMessages] = useState([]);
  const [departmentEmployees, setDepartmentEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScheduleMeetOpen, setIsScheduleMeetOpen] = useState(false);
  const [unreadMap, setUnreadMap] = useState({});
  const currentEmployee = JSON.parse(
    localStorage.getItem("currentHR") ||
      sessionStorage.getItem("currentHR")
  );
// fetch department employees
useEffect(() => {
  if (currentEmployee?.department) {
    fetchDepartmentEmployees();
  } else {
    setError("Department information not available");
    setIsLoading(false);
  }
}, [currentEmployee?.department]);

// fetch unread map separately
useEffect(() => {
  fetchUnreadMap();
  const interval = setInterval(fetchUnreadMap, 5000);
  return () => clearInterval(interval);
}, []);



  useEffect(() => {
    if (selectedEmployee && !isBroadcast) {
      fetchMessages();
    }
  }, [selectedEmployee, isBroadcast]);

  useEffect(() => {
    if (isBroadcast && currentEmployee?.department) {
      fetchBroadcastMessages();
    }
    // Optionally, poll for new broadcast messages
    let interval;
    if (isBroadcast && currentEmployee?.department) {
      interval = setInterval(fetchBroadcastMessages, 5000);
    }
    return () => interval && clearInterval(interval);
  }, [isBroadcast, currentEmployee?.department]);

  const fetchUnreadMap = async () => {
    try {
      const res = await fetch(
        `https://the-aacharya.onrender.com/api/messages/unread/${currentEmployee.id}`
      );
      const data = await res.json();
      const map = {};
      data.forEach((entry) => {
        map[entry.sender_id.toString()] = entry.unreadCount;
      });
      setUnreadMap(map);
    } catch (err) {
      console.error("Failed to fetch unread counts", err);
    }
  };

  const fetchDepartmentEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `https://the-aacharya.onrender.com/api/employees/department-messages/${currentEmployee.department}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch department employees"
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format");
      }

      const filteredEmployees = data.filter(
        (emp) => emp.id !== currentEmployee.id
      );
      setDepartmentEmployees(filteredEmployees);
    } catch (error) {
      console.error("Error fetching department employees:", error);
      setError(error.message || "Failed to load department employees");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedEmployee) return;

    try {
      const response = await fetch(
        `https://the-aacharya.onrender.com/api/messages/${currentEmployee.id}/${selectedEmployee.id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load messages");
    }
  };

  const fetchBroadcastMessages = async () => {
    try {
      const res = await fetch(
        `https://the-aacharya.onrender.com/api/messages/broadcast/${currentEmployee.department}`
      );
      if (!res.ok) throw new Error('Failed to fetch broadcast messages');
      const data = await res.json();
      setBroadcastMessages(data);
    } catch (err) {
      setError('Failed to load broadcast messages');
    }
  };

  const handleSelectBroadcast = () => {
    setIsBroadcast(true);
    setSelectedEmployee(null);
    setError(null);
  };

  const handleSelectEmployee = async (employee) => {
    setSelectedEmployee(employee);
    setIsBroadcast(false);
    setUnreadMap((prev) => ({ ...prev, [employee.id]: 0 }));

    // Mark messages as read in DB
    try {
      await fetch(
        `https://the-aacharya.onrender.com/api/messages/mark-read/${employee.id}/${currentEmployee.id}`,
        {
          method: "PUT",
        }
      );
    } catch (err) {
      console.error("Failed to mark messages as read");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || (!selectedEmployee && !isBroadcast)) return;

    if (isBroadcast) {
      // Send broadcast message
      try {
        const response = await fetch("https://the-aacharya.onrender.com/api/messages/broadcast", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender_id: currentEmployee.id,
            department: currentEmployee.department,
            message: newMessage.trim(),
          }),
        });
        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error("Invalid response from server");
        }
        if (!response.ok) {
          throw new Error(data.error || "Failed to send broadcast message");
        }
        setBroadcastMessages((prev) => [...prev, data]);
        setNewMessage("");
        setError(null);
      } catch (error) {
        setError(error.message || "Failed to send broadcast message");
        setTimeout(() => setError(null), 3000);
      }
      return;
    }

    try {
      const response = await fetch("https://the-aacharya.onrender.com/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender_id: currentEmployee.id,
          receiver_id: selectedEmployee.id,
          message: newMessage.trim(),
        }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setMessages((prevMessages) => [...prevMessages, data]);
      setNewMessage("");
      setError(null);
    } catch (error) {
      console.error("Error sending message:", error);
      setError(error.message || "Failed to send message");
      setTimeout(() => setError(null), 3000);
    }
  };

  if (!currentEmployee?.department) {
    return (
      <div className="text-center py-4 text-red-500">
        Department information not available. Please contact HR.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-4">Loading department members...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 mb-2">{error}</p>
        <button
          onClick={fetchDepartmentEmployees}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Retry
        </button>
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
          <div className="bg-purple-100 p-3 rounded-full">
            <MessageCircle className="w-9 h-9 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              {currentEmployee?.full_name || currentEmployee?.name} | {currentEmployee?.empID} | {currentEmployee?.department}
            </p>
          </div>
        </div>
        {/* Main Chat Layout */}
        <div className="flex gap-6">
          {/* Employee List */}
          <div className="w-1/4 bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-800">Department Members</h2>
              <p className="text-sm text-neutral-500 mt-1">{currentEmployee.department}</p>
            </div>
            <div className="overflow-y-auto flex-1">
              {/* Broadcast Option */}
              <button
                onClick={handleSelectBroadcast}
                className={`w-full p-4 text-left hover:bg-neutral-50 transition-colors duration-200 font-semibold border-b border-neutral-100 flex items-center gap-2 ${isBroadcast ? "bg-primary-50" : ""}`}
              >
                <span className="inline-block w-8 h-8 bg-primary-200 text-primary-700 rounded-full flex items-center justify-center mr-2">#</span>
                Broadcast Channel
              </button>
              {/* Employee List */}
              {departmentEmployees.length === 0 ? (
                <div className="p-4 text-center text-neutral-500">
                  No other employees in your department
                </div>
              ) : (
                departmentEmployees.map((employee) => (
                  <button
                    key={employee.id}
                    onClick={() => handleSelectEmployee(employee)}
                    className={`w-full p-4 text-left hover:bg-neutral-50 transition-colors duration-200 ${selectedEmployee?.id === employee.id && !isBroadcast ? "bg-primary-50" : ""}`}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {employee.name.charAt(0)}
                          {employee.surname.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3 relative">
                        <p className="text-sm font-medium text-neutral-900">
                          {employee.name} {employee.surname}
                        </p>
                        {/* 🔴 Red dot */}
                        {unreadMap[employee.id.toString()] > 0 && (
                          <span className="absolute -top-1 -right-3 w-2 h-2 rounded-full bg-red-600" />
                        )}
                        <p className="text-xs text-neutral-500">{employee.role}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-white rounded-xl shadow-md overflow-hidden">
            {isBroadcast ? (
              <>
                {/* Broadcast Header */}
                <div className="p-6 border-b border-neutral-200 bg-primary-50 flex items-center gap-2">
                  <span className="inline-block w-10 h-10 bg-primary-200 text-primary-700 rounded-full flex items-center justify-center text-2xl font-bold">#</span>
                  <div>
                    <p className="text-lg font-semibold text-primary-800">Broadcast Channel</p>
                    <p className="text-xs text-primary-700">Messages visible to all department members</p>
                  </div>
                </div>
                {/* Error Message */}
                {error && (
                  <div className="p-2 bg-red-50 border-b border-red-200">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                )}
                {/* Broadcast Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {broadcastMessages.length === 0 ? (
                    <div className="text-center text-neutral-400">THE PAGE IS UNDER MAINTAINANCE</div>
                  ) : (
                    broadcastMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === currentEmployee.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${message.sender_id === currentEmployee.id ? "bg-primary-600 text-white" : "bg-neutral-100 text-neutral-900"}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">
                              {message.sender_name || "Employee"}
                            </span>
                            <span className="text-xs opacity-60">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {/* Message Input */}
                <form
                  onSubmit={sendMessage}
                  className="p-6 border-t border-neutral-200 bg-white"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a broadcast message..."
                      className="flex-1 px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : selectedEmployee ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {selectedEmployee.name.charAt(0)}
                          {selectedEmployee.surname.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-neutral-900">
                          {selectedEmployee.name} {selectedEmployee.surname}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {selectedEmployee.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-2 bg-red-50 border-b border-red-200">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === currentEmployee.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${message.sender_id === currentEmployee.id ? "bg-primary-600 text-white" : "bg-neutral-100 text-neutral-900"}`}
                      >
                        <p className="text-sm">{message.message}</p>
                        {message.meet_link && (
                          <div className="mt-2 pt-2 border-t border-opacity-20">
                            <a
                              href={message.meet_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm underline hover:opacity-80"
                            >
                              Join Meeting
                            </a>
                            {message.meet_remarks && (
                              <p className="text-xs mt-1 opacity-80">
                                {message.meet_remarks}
                              </p>
                            )}
                          </div>
                        )}
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form
                  onSubmit={sendMessage}
                  className="p-6 border-t border-neutral-200 bg-white"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-neutral-500">
                Select an employee to start chatting
              </div>
            )}
          </div>
        </div>

        {/* Optional modal (not used if you're not scheduling meets now) */}
        {isScheduleMeetOpen && (
          <EmployeeScheduleMeet
            employeeId={currentEmployee.id}
            onClose={() => setIsScheduleMeetOpen(false)}
          />
        )}
      </div>
    </motion.div>
  );
}
