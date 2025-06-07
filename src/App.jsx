import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import EmployeeLayout from './components/EmployeeLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import HRLoginPage from './pages/HRLoginPage';
import Dashboard from './pages/Dashboard';
import PayrollPage from './pages/PayrollPage';
import EmployeesPage from './pages/EmployeesPage';
import AddNewEmployeePage from './pages/AddNewEmployeePage';
import EmployeeLoginPage from './pages/EmployeeLoginPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import FAQsPage from './pages/FAQsPage';
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
import PerformancePage from './pages/PerformancePage';
import HiringPage from './pages/HiringPage';
import LeaveRequestsPage from './pages/LeaveRequestsPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/hr-login" element={<HRLoginPage />} />
      <Route path="/employee-login" element={<EmployeeLoginPage />} />
      
      {/* HR Routes with Sidebar */}
      <Route element={
        <ProtectedRoute requiredRole="hr">
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/faqs" element={<FAQsPage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/payrolls" element={<PayrollPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/add-employee" element={<AddNewEmployeePage />} />
        <Route path="/hiring" element={<HiringPage />} />
        <Route path="/leave-requests" element={<LeaveRequestsPage />} />
      </Route>

      {/* Employee Routes with Employee Layout */}
      <Route element={
        <ProtectedRoute requiredRole="employee">
          <EmployeeLayout />
        </ProtectedRoute>
      }>
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;