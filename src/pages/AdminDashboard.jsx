import { useAdminDashboardQuery, useEmployeesQuery } from '../hooks/useEMSQueries';
import { getErrorMessage } from '../api/client';
import { Users, UserCheck, Clock3, Wallet, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, ErrorState, Loading, PageTitle, Status } from '../components/UI';
export default function AdminDashboard() {
    const dashboardQuery = useAdminDashboardQuery();
    const employeesQuery = useEmployeesQuery({ page: 1, limit: 6 });
    const data = dashboardQuery.data;
    const employees = employeesQuery.data?.data || [];
    const error = dashboardQuery.error || employeesQuery.error;
    if (error && !data) return <ErrorState message={getErrorMessage(error)} retry={() => { dashboardQuery.refetch(); employeesQuery.refetch(); }}/>;
    if (!data) return <Loading label="Loading admin dashboard..."/>;
    return <div className="page"><PageTitle title="Dashboard" subtitle="Overview of your workforce and payroll operations." action={<span className="date-chip">{new Date(data.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>}/>
    <div className="stat-grid four"><Card className="admin-stat"><span className="stat-icon purple"><Users size={19}/></span><small>Total Employees</small><h2>{data.employees.total}</h2><p>{data.employees.active} active employees</p></Card><Card className="admin-stat"><span className="stat-icon green"><UserCheck size={19}/></span><small>Present Today</small><h2>{data.attendanceToday.clockedIn}</h2><p>{data.attendanceToday.notClockedOut} still on shift</p></Card><Card className="admin-stat"><span className="stat-icon orange"><Clock3 size={19}/></span><small>Late Today</small><h2>{data.attendanceToday.late}</h2><p>Late arrivals recorded</p></Card><Card className="admin-stat"><span className="stat-icon red"><Wallet size={19}/></span><small>Published Payslips</small><h2>{data.payroll.publishedPayslips}</h2><p>{new Date(data.payroll.year, data.payroll.month - 1).toLocaleString(undefined, { month: 'long' })} payroll</p></Card></div>
    <div className="stat-grid three compact-stats"><Card><small>Pending approvals</small><h2>{data.employees.pendingApprovals}</h2><Link to="/admin/employees?status=PENDING" className="text-link">Review employees <ArrowUpRight size={14}/></Link></Card><Card><small>Rejected registrations</small><h2>{data.employees.rejected}</h2></Card><Card><small>Clocked out today</small><h2>{data.attendanceToday.clockedOut}</h2></Card></div>
    <Card><div className="section-heading"><div><h3>Employee Directory</h3><p>Recently added employee records</p></div><Link to="/admin/employees" className="text-link">View all employees <ArrowUpRight size={15}/></Link></div>
      <div className="table-wrap"><table><thead><tr><th>Employee</th><th>Employee ID</th><th>Department</th><th>Payroll Structure</th><th>Status</th><th /></tr></thead><tbody>{employees.map(e => <tr key={e.id}><td><b>{e.fullName}</b><small className="table-sub">{e.user.email}</small></td><td>{e.empCode || '—'}</td><td>{e.department?.name || '—'}</td><td>{e.structure?.name || 'Not assigned'}</td><td><Status value={e.user.status}/></td><td><Link to={`/admin/employees?id=${e.id}`} className="text-link">View →</Link></td></tr>)}</tbody></table></div>
    </Card>
  </div>;
}
