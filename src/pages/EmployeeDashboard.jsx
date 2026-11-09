import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useEmployeeDashboardQuery } from '../hooks/useEMSQueries';
import { queryKeys } from '../hooks/queryKeys';
import { Clock3, CalendarCheck, Timer, ArrowUpRight, Pencil, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { attendanceApi } from '../api';
import { getErrorMessage } from '../api/client';
import { Card, Loading, ErrorState, Status, Button } from '../components/UI';
import { useAuth } from '../auth';
export default function EmployeeDashboard() {
    const { user, refresh } = useAuth();
    const queryClient = useQueryClient();
    const dashboardQuery = useEmployeeDashboardQuery();
    const data = dashboardQuery.data;
    const error = dashboardQuery.error ? getErrorMessage(dashboardQuery.error) : '';
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState('');
    const load = () => dashboardQuery.refetch();
    const today = data?.today;
    const record = today?.attendance;
    const doClock = async () => {
        setBusy(true);
        setActionError('');
        try {
            if (today?.status === 'CLOCKED_IN')
                await attendanceApi.clockOut();
            else
                await attendanceApi.clockIn();
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.employeeDashboard }),
                queryClient.invalidateQueries({ queryKey: queryKeys.attendanceToday }),
                queryClient.invalidateQueries({ queryKey: ['attendance', 'mine'] }),
                refresh(),
            ]);
        }
        catch (e) {
            setActionError(getErrorMessage(e));
        }
        finally {
            setBusy(false);
        }
    };
    if (error && !data)
        return <ErrorState message={error} retry={load}/>;
    if (!data)
        return <Loading label="Loading your dashboard..."/>;
    const employee = data.employee;
    const payslip = data.recentPayslips?.[0];
    const monthly = data.monthlyAttendance;
    const mins = monthly?.totalOvertimeMinutes || 0;
    return <div className="page">
    <div className="welcome-banner"><div><h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {employee.fullName.split(' ')[0]}</h1><p>Here's your overview for today</p></div><span className="live-pill"><i /> Live shift overview</span></div>
    <div className="employee-grid">
      <div className="employee-main">
        <div className="stat-grid three">
          <Card className="stat-card"><div className="stat-top"><span>Today's Status</span><span className="stat-icon"><Clock3 size={17}/></span></div><h2><Status value={today.status}/></h2><small>{record?.clockIn ? `Logged at ${new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'No clock-in recorded yet'}</small></Card>
          <Card className="stat-card"><div className="stat-top"><span>This Month's Attendance</span><span className="stat-icon"><CalendarCheck size={17}/></span></div><h2>{monthly.daysPresent} days</h2><div className="progress"><i style={{ width: `${Math.min(100, monthly.daysPresent / 22 * 100)}%` }}/></div><small>{monthly.lateDays} late days · {monthly.totalWorkMinutes ? `${Math.round(monthly.totalWorkMinutes / 60)} work hrs` : 'No work hours yet'}</small></Card>
          <Card className="stat-card"><div className="stat-top"><span>Overtime This Month</span><span className="stat-icon"><Timer size={17}/></span></div><h2>{(mins / 60).toFixed(1)} hrs</h2><small>Total recorded overtime</small></Card>
        </div>
        <Card className="clock-card"><div><h3>Clock In / Clock Out</h3><p>{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div><div className="clock-action"><Button variant={today.status === 'CLOCKED_IN' ? 'danger' : 'primary'} onClick={doClock} disabled={busy || today.status === 'CLOCKED_OUT'}>{busy ? 'Saving...' : today.status === 'CLOCKED_IN' ? '↪ Clock Out' : today.status === 'CLOCKED_OUT' ? '✓ Completed' : '↪ Clock In'}</Button><p>{record?.clockIn ? `First entry ${new Date(record.clockIn).toLocaleTimeString()}` : `Scheduled ${data.today?.policy?.shiftStart || '09:00'} – ${data.today?.policy?.shiftEnd || '18:00'}`}</p>{actionError && <small className="error-text">{actionError}</small>}</div></Card>
        <Card><div className="section-heading"><div><h3>Recent Attendance</h3><p>Log entries from your current billing cycle</p></div><Link to="/attendance" className="text-link">View all attendance history <ArrowUpRight size={15}/></Link></div>
          <div className="table-wrap"><table><thead><tr><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Work Hours</th><th>Status</th></tr></thead><tbody>{record ? <tr><td>{new Date(record.workDate).toLocaleDateString()}</td><td>{new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td><td>{record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td><td>{(record.workMinutes / 60).toFixed(1)} hrs</td><td><Status value={record.isLate ? 'LATE' : record.clockOut ? 'COMPLETED' : 'IN_PROGRESS'}/></td></tr> : <tr><td colSpan={5} className="table-empty">No attendance record for today.</td></tr>}</tbody></table></div>
        </Card>
      </div>
      <div className="employee-side">
        <Card><div className="section-heading"><h3>Profile Summary</h3><Link to="/profile"><Pencil size={16}/></Link></div><div className="profile-summary"><div className="avatar avatar-large">{employee.fullName.split(' ').map((s) => s[0]).slice(0, 2).join('')}</div><div><b>{employee.fullName}</b><small>{employee.designation || 'Employee'}</small></div></div><div className="summary-pairs"><span>Employee ID</span><b>{employee.empCode || 'Pending'}</b><span>Department</span><b>{employee.department?.name || 'Not assigned'}</b></div></Card>
        <Card><div className="section-heading"><h3>Latest Payslip</h3><Wallet size={18}/></div>{payslip ? <><p className="muted">{new Date(payslip.year, payslip.month - 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })} payroll</p><h2 className="money">৳{Number(payslip.netPay).toLocaleString()}</h2><div className="summary-strip"><span>Net pay</span><Link to={`/payslips/${payslip.id}`}>View Payslip →</Link></div></> : <p className="muted">No published payslip yet.</p>}</Card>
        <Card><h3>Payroll Structure</h3><p className="muted">{employee.structure?.name || 'Not assigned yet'}</p><div className="summary-pairs"><span>Designation</span><b>{employee.designation || '—'}</b><span>Joined</span><b>{employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : '—'}</b></div></Card>
      </div>
    </div>
  </div>;
}
