import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import EmployeeLayout from './components/EmployeeLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import HRLoginPage from './pages/HRLoginPage';
import Dashboard from './pages/Dashboard';
import EmployeesPage from './pages/EmployeesPage';
import AddNewEmployeePage from './pages/AddNewEmployeePage';
import EmployeeLoginPage from './pages/EmployeeLoginPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
import PerformancePage from './pages/PerformancePage';
import HiringPage from './pages/HiringPage';
import LeaveRequestsPage from './pages/LeaveRequestsPage';
import AttendancePage from './pages/AttendancePage';
import SalaryManagementPage from './pages/SalaryManagementPage';
import EmployeeCalendar from './pages/employee/EmployeeCalendar';
import EmployeeNotifications from './pages/employee/EmployeeNotifications';
import EmployeeInterviews from './pages/employee/EmployeeInterviews';
import EmployeeCurrentTasks from './pages/employee/EmployeeCurrentTasks';
import EmployeePreviousTasks from './pages/employee/EmployeePreviousTasks';
import EmployeeUpcomingTasks from './pages/employee/EmployeeUpcomingTasks';
import EmployeeLeaveRequest from './pages/employee/EmployeeLeaveRequest';
import EmployeePersonalDetails from './pages/employee/EmployeePersonalDetails';
import Messages from './components/Messages';
import OnboardingFormPage from './pages/employee/OnboardingFormPage';
import AssignTaskPage from './pages/employee/AssignTaskPage';
import EmployeeSalesPunchForm from './pages/employee/EmployeeSalesPunchForm';
import AllEmployees from './pages/employee/AllEmployees';
import Mapping from './pages/employee/Mapping';
import EmployeeHierarchy from './pages/employee/EmployeeHierarchy';
import EmployeeMyAssignees from './pages/employee/EmployeeMyAssignees';
import EmployeeMySupervisor from './pages/employee/EmployeeMySupervisor';
import EmployeeSalesReport from './pages/employee/EmployeeSalesReport';
import EmplyeeDSform from './pages/employee/EmployeeDSform';
import SalesPunchApproval from './pages/employee/SalesPunchApproval';
import MySales from './pages/employee/MySales';
import MySessions from './pages/employee/MySessions';
import DirectSession from './pages/employee/DirectSession';
import OnboardingApprovals from  './pages/OnboardingApprovals';
import HODattendance from './pages/employee/HODattendance';
import HRPersonalDetails from './pages/HRPersonalDetails';
import HRNotification from './pages/HRNotification';
import HRMessages from './pages/HRMessages';
import HRLeaveReq from './pages/HRLeaveReq';
import HRCurrentTasks from './pages/HRCurrentTasks';
import HRPreviousTasks from './pages/HRPreviousTasks';
import HRUpcomingTasks from './pages/HRUpcomingTasks';
import HRMyAssignees from './pages/HRMyAssignees';
import HRMySupervisor from './pages/HRMySupervisor';
import HRInterviews from './pages/HRInterviews';
import HRMapping from './pages/HRMapping';
import HRCompanyHierarchy from './pages/HRCompanyHierarchy';
import HRAllEmployees from './pages/HRAllEmployees';
import HRAssignTasks from './pages/HRAssignTasks';

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
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/add-employee" element={<AddNewEmployeePage />} />
        <Route path="/hiring" element={<HiringPage />} />
        <Route path="/leave-requests" element={<LeaveRequestsPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/salary-management" element={<SalaryManagementPage />} />
        <Route path="/onboarding-approvals" element={<OnboardingApprovals />} />
        <Route path="/personal-details" element={<HRPersonalDetails />} />
        <Route path="/notifications" element={<HRNotification />} />
        <Route path="/messages" element={<HRMessages />} />
        <Route path="/my-leave-requests" element={<HRLeaveReq />} />
        <Route path="/my-current-tasks" element={<HRCurrentTasks />} />
        <Route path="/my-previous-tasks" element={<HRPreviousTasks />} />
        <Route path="/my-upcoming-tasks" element={<HRUpcomingTasks />} />
        <Route path="/my-assignees" element={<HRMyAssignees />} />
        <Route path="/my-supervisor" element={<HRMySupervisor />} />
        <Route path="/my-interviews" element={<HRInterviews />} />
        <Route path="/my-mapping" element={<HRMapping />} />
        <Route path="/my-company-hierarchy" element={<HRCompanyHierarchy />} />
        <Route path="/my-all-employees" element={<HRAllEmployees />} />
        <Route path="/assign-tasks" element={<HRAssignTasks />} />

      </Route>

      {/* Employee Routes with Employee Layout */}
      <Route element={
        <ProtectedRoute requiredRole={'employee'}>
          <EmployeeLayout />
        </ProtectedRoute>
      }>
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee-personal-details" element={<EmployeePersonalDetails />} />
        <Route path="/employee-calendar" element={<EmployeeCalendar />} />
        <Route path="/employee-notifications" element={<EmployeeNotifications />} />
        <Route path="/employee-interviews" element={<EmployeeInterviews />} />
        <Route path="/employee-current-tasks" element={<EmployeeCurrentTasks />} />
        <Route path="/employee-previous-tasks" element={<EmployeePreviousTasks />} />
        <Route path="/employee-upcoming-tasks" element={<EmployeeUpcomingTasks />} />
        <Route path="/employee-leave-request" element={<EmployeeLeaveRequest />} />
        <Route path="/employee-messages" element={<Messages />} />
        <Route path="/onboarding-form" element={<OnboardingFormPage />} />
        <Route path="/assign-task" element={<AssignTaskPage />} />
        <Route path="/sales-punch-form" element={<EmployeeSalesPunchForm />} />
        <Route path="/all-employees" element={<AllEmployees />} />
        <Route path="/mapping" element={<Mapping />} />
        <Route path="/company-hierarchy" element={<EmployeeHierarchy />} />
        <Route path="/employee-my-assignees" element={<EmployeeMyAssignees />} />
        <Route path="/employee-my-supervisor" element={<EmployeeMySupervisor />} />
        <Route path="/sales-report" element={<EmployeeSalesReport />} />
        <Route path="/ds-form" element={<EmplyeeDSform />} />
        <Route path="/sales-punch-approval" element={<SalesPunchApproval />} />
        <Route path="/my-sales" element={<MySales />} />
        <Route path="/my-sessions" element={<MySessions />} />
        <Route path="/direct-session" element={<DirectSession />} />
        <Route path="/hod-attendance" element={<HODattendance />} />

      </Route>
    </Routes>
  );
}

export default App;