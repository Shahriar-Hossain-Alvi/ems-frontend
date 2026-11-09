import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth';
import Layout from './components/Layout';
import { Loading } from './components/UI';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Profile from './pages/Profile';
import AttendancePage from './pages/Attendance';
import Payslips from './pages/Payslips';
import AdminDashboard from './pages/AdminDashboard';
import Employees from './pages/Employees';
import PayrollStructures from './pages/PayrollStructures';
import RunPayroll from './pages/RunPayroll';
import AdminAttendance from './pages/AdminAttendance';
import SettingsPage from './pages/Settings';
import PayslipDetail from './pages/PayslipDetail';
function Guard({ children, admin = false }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading)
        return <Loading label="Checking your session..."/>;
    if (!user)
        return <Navigate to="/login" replace state={{ from: location.pathname }}/>;
    if (user.status !== 'ACTIVE')
        return <Navigate to="/login" replace/>;
    if (admin && user.role === 'EMPLOYEE')
        return <Navigate to="/dashboard" replace/>;
    if (!admin && user.role !== 'EMPLOYEE')
        return <Navigate to="/admin" replace/>;
    return children;
}
function HomeRedirect() {
    const { user, loading } = useAuth();
    if (loading)
        return <Loading />;
    return <Navigate to={user ? (user.role === 'EMPLOYEE' ? '/dashboard' : '/admin') : '/login'} replace/>;
}
export default function App() {
    return <Routes>
    <Route path="/login" element={<Login />}/>
    <Route path="/" element={<HomeRedirect />}/>
    <Route element={<Guard><Layout /></Guard>}>
      <Route path="/dashboard" element={<EmployeeDashboard />}/>
      <Route path="/attendance" element={<AttendancePage />}/>
      <Route path="/payslips" element={<Payslips />}/>
      <Route path="/payslips/:id" element={<PayslipDetail />}/>
      <Route path="/profile" element={<Profile />}/>
    </Route>
    <Route element={<Guard admin><Layout /></Guard>}>
      <Route path="/admin" element={<AdminDashboard />}/>
      <Route path="/admin/employees" element={<Employees />}/>
      <Route path="/admin/attendance" element={<AdminAttendance />}/>
      <Route path="/admin/payroll-structures" element={<PayrollStructures />}/>
      <Route path="/admin/run-payroll" element={<RunPayroll />}/>
      <Route path="/admin/settings" element={<SettingsPage />}/>
    </Route>
    <Route path="*" element={<HomeRedirect />}/>
  </Routes>;
}
