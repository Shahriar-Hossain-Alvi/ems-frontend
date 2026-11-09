import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAttendanceListQuery, useDepartmentsQuery } from '../hooks/useEMSQueries';
import { queryKeys } from '../hooks/queryKeys';
import { attendanceApi } from '../api';
import { getErrorMessage } from '../api/client';
import { Button, Card, ErrorState, Field, Loading, Modal, Notice, PageTitle, Status } from '../components/UI';
import { useAuth } from '../auth';
export default function AdminAttendance() {
    const { user } = useAuth();
    const canEdit = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const [date, setDate] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [late, setLate] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [selected, setSelected] = useState(null);
    const [clockIn, setClockIn] = useState('');
    const [clockOut, setClockOut] = useState('');
    const [isLate, setIsLate] = useState(false);
    const [notice, setNotice] = useState('');
    const queryClient = useQueryClient();
    const queryParams = { date: date || undefined, month: month || undefined, year: !date && month ? year : undefined, isLate: late === '' ? undefined : late === 'true', departmentId: departmentId || undefined, page: 1, limit: 50 };
    const attendanceQuery = useAttendanceListQuery(queryParams);
    const departmentsQuery = useDepartmentsQuery();
    const data = attendanceQuery.data;
    const departments = departmentsQuery.data || [];
    const error = attendanceQuery.error || departmentsQuery.error;
    const load = () => Promise.all([attendanceQuery.refetch(), departmentsQuery.refetch()]);
    const open = (r) => { setSelected(r); setClockIn(new Date(r.clockIn).toISOString().slice(0, 16)); setClockOut(r.clockOut ? new Date(r.clockOut).toISOString().slice(0, 16) : ''); setIsLate(r.isLate); };
    const save = async (e) => { e.preventDefault(); if (!selected)
        return; try {
        await attendanceApi.correct(selected.id, { clockIn: new Date(clockIn).toISOString(), clockOut: clockOut ? new Date(clockOut).toISOString() : null, isLate });
        setSelected(null);
        setNotice('Attendance record corrected.');
        await queryClient.invalidateQueries({ queryKey: ['attendance', 'list'] });
        await queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    }
    catch (e) {
        setNotice(getErrorMessage(e));
    } };
    if (error && !data)
        return <ErrorState message={getErrorMessage(error)} retry={load}/>;
    if (!data)
        return <Loading label="Loading attendance records..."/>;
    return <div className="page"><PageTitle title="Attendance Records" subtitle="Monitor attendance and correct employee records."/>
    {notice && <Notice tone="info">{notice}</Notice>}
    <Card><div className="toolbar"><div className="filters"><input type="date" value={date} onChange={e => { setDate(e.target.value); setMonth(''); }}/><select value={month} onChange={e => { setMonth(e.target.value); setDate(''); }}><option value="">Any month</option>{Array.from({ length: 12 }, (_, i) => <option value={i + 1} key={i + 1}>{new Date(2000, i, 1).toLocaleString(undefined, { month: 'long' })}</option>)}</select><select value={year} onChange={e => setYear(Number(e.target.value))}>{[year - 1, year, year + 1].map(y => <option key={y}>{y}</option>)}</select><select value={departmentId} onChange={e => setDepartmentId(e.target.value)}><option value="">All departments</option>{departments.map(d => <option value={d.id} key={d.id}>{d.name}</option>)}</select><select value={late} onChange={e => setLate(e.target.value)}><option value="">All statuses</option><option value="true">Late only</option><option value="false">On time only</option></select></div></div>
      <div className="section-heading"><h3>Attendance Log</h3><span className="muted">{data.meta.total} records</span></div><div className="table-wrap"><table><thead><tr><th>Employee</th><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Work Hours</th><th>Overtime</th><th>Status</th><th /></tr></thead><tbody>{data.data.map((r) => <tr key={r.id}><td><b>{r.employee?.fullName}</b><small className="table-sub">{r.employee?.empCode || r.employee?.user?.email}</small></td><td>{new Date(r.workDate).toLocaleDateString()}</td><td>{new Date(r.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td><td>{r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td><td>{(r.workMinutes / 60).toFixed(1)}</td><td>{(r.overtimeMinutes / 60).toFixed(1)}</td><td><Status value={r.isLate ? 'LATE' : r.clockOut ? 'COMPLETED' : 'IN_PROGRESS'}/></td><td>{canEdit && <button className="text-link" onClick={() => open(r)}>Correct</button>}</td></tr>)}</tbody></table></div></Card>
    {selected && <Modal title={`Correct Attendance — ${selected.employee?.fullName || 'Employee'}`} onClose={() => setSelected(null)}><form onSubmit={save} className="modal-form"><Field label="Clock In"><input type="datetime-local" value={clockIn} onChange={e => setClockIn(e.target.value)} required/></Field><Field label="Clock Out"><input type="datetime-local" value={clockOut} onChange={e => setClockOut(e.target.value)}/></Field><label className="checkbox-field"><input type="checkbox" checked={isLate} onChange={e => setIsLate(e.target.checked)}/> Mark as late</label><Notice>Work duration and overtime are recalculated by the backend using the current work policy.</Notice><Button type="submit">Save Correction</Button></form></Modal>}
  </div>;
}
