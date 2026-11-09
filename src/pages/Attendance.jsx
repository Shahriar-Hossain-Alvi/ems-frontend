import { useState } from 'react';
import { useMyAttendanceQuery } from '../hooks/useEMSQueries';
import { getErrorMessage } from '../api/client';
import { Card, ErrorState, Loading, PageTitle, Status } from '../components/UI';

export default function AttendancePage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const query = useMyAttendanceQuery({ month, year, page: 1, limit: 50 });
  const data = query.data;
  if (query.isError && !data) return <ErrorState message={getErrorMessage(query.error)} retry={() => query.refetch()} />;
  if (!data) return <Loading label="Loading attendance history..." />;
  const s = data.summary;
  return <div className="page">
    <PageTitle title="Attendance" subtitle="Review your attendance records and monthly summary." />
    <div className="toolbar"><div className="filters">
      <select value={month} onChange={e => setMonth(Number(e.target.value))}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2000, i, 1).toLocaleString(undefined, { month: 'long' })}</option>)}</select>
      <select value={year} onChange={e => setYear(Number(e.target.value))}>{[year - 1, year, year + 1].map(y => <option key={y}>{y}</option>)}</select>
    </div></div>
    <div className="stat-grid four"><Card className="stat-card"><span>Attendance Days</span><h2>{s.attendanceDays}</h2></Card><Card className="stat-card"><span>Late Days</span><h2>{s.lateDays}</h2></Card><Card className="stat-card"><span>Total Work Hours</span><h2>{(s.totalWorkMinutes / 60).toFixed(1)}</h2></Card><Card className="stat-card"><span>Overtime Hours</span><h2>{(s.totalOvertimeMinutes / 60).toFixed(1)}</h2></Card></div>
    <Card><div className="section-heading"><h3>Attendance History</h3><span className="muted">{data.meta.total} records</span></div><div className="table-wrap"><table><thead><tr><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Work Duration</th><th>Overtime</th><th>Status</th></tr></thead><tbody>{data.data.length ? data.data.map(r => <tr key={r.id}><td>{new Date(r.workDate).toLocaleDateString()}</td><td>{new Date(r.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td><td>{r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td><td>{(r.workMinutes / 60).toFixed(2)} hrs</td><td>{(r.overtimeMinutes / 60).toFixed(2)} hrs</td><td><Status value={r.isLate ? 'LATE' : r.clockOut ? 'COMPLETED' : 'IN_PROGRESS'} /></td></tr>) : <tr><td colSpan={6} className="table-empty">No attendance records for this month.</td></tr>}</tbody></table></div></Card>
  </div>;
}
