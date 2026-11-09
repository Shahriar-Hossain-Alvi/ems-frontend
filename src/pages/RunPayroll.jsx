import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePayrollPreviewQuery } from '../hooks/useEMSQueries';
import { queryKeys } from '../hooks/queryKeys';
import { Zap, UploadCloud, RefreshCw } from 'lucide-react';
import { payrollApi } from '../api';
import { getErrorMessage } from '../api/client';
import { Button, Card, ErrorState, Loading, Notice, PageTitle, Status } from '../components/UI';
import { useAuth } from '../auth';
export default function RunPayroll() {
    const { user } = useAuth();
    const canWrite = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const queryClient = useQueryClient();
    const previewQuery = usePayrollPreviewQuery(month, year);
    const data = previewQuery.data;
    const error = previewQuery.error;
    const [notice, setNotice] = useState('');
    const [busy, setBusy] = useState(false);
    const load = () => previewQuery.refetch();
    const action = async (kind) => { setBusy(true); setNotice(''); try {
        const r = kind === 'generate' ? await payrollApi.generate(month, year) : await payrollApi.publish(month, year);
        setNotice(r.message || `${kind === 'generate' ? 'Draft payroll generated' : 'Draft payslips published'}.`);
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.payrollPreview(month, year) }),
            queryClient.invalidateQueries({ queryKey: ['payslips'] }),
            queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard }),
            queryClient.invalidateQueries({ queryKey: queryKeys.employeeDashboard }),
        ]);
    }
    catch (e) {
        setNotice(getErrorMessage(e));
    }
    finally {
        setBusy(false);
    } };
    if (error && !data)
        return <ErrorState message={getErrorMessage(error)} retry={load}/>;
    if (!data)
        return <Loading label="Calculating payroll preview..."/>;
    return <div className="page"><PageTitle title="Run Payroll" subtitle="Generate payslips from attendance records for a selected month."/>
    <Card><div className="toolbar payroll-toolbar"><div className="filters"><label>Month <select value={month} onChange={e => setMonth(Number(e.target.value))}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2000, i, 1).toLocaleString(undefined, { month: 'long' })}</option>)}</select></label><label>Year <select value={year} onChange={e => setYear(Number(e.target.value))}>{Array.from({ length: 5 }, (_, i) => <option key={year - 2 + i}>{year - 2 + i}</option>)}</select></label></div><div className="toolbar-actions"><Button variant="secondary" disabled={!canWrite || busy} onClick={() => action('publish')}><UploadCloud size={16}/> Publish All Drafts</Button><Button disabled={!canWrite || busy} onClick={() => action('generate')}><Zap size={16}/> Generate Payroll</Button></div></div></Card>
    {notice && <Notice tone="info">{notice}</Notice>}{!canWrite && <Notice>Demo administrators can preview payroll but cannot generate or publish it.</Notice>}
    {data.issues > 0 && <Notice tone="warning">{data.issues} employee(s) have payroll issues, such as no assigned structure or missing basic salary. They will be skipped.</Notice>}
    <div className="stat-grid four"><Card className="stat-card"><small>Employees</small><h2>{data.totalEmployees}</h2></Card><Card className="stat-card"><small>Ready</small><h2>{data.ready}</h2></Card><Card className="stat-card"><small>Issues</small><h2>{data.issues}</h2></Card><Card className="stat-card"><small>Payroll Period</small><h2 className="period-stat">{new Date(year, month - 1).toLocaleString(undefined, { month: 'short', year: 'numeric' })}</h2></Card></div>
    <Card><div className="section-heading"><div><h3>Payroll Preview</h3><p>Cycle: {new Date(year, month - 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })}</p></div><Button variant="secondary" onClick={load}><RefreshCw size={15}/> Refresh</Button></div><div className="table-wrap"><table><thead><tr><th>Employee</th><th>Structure</th><th>Days Present</th><th>Late Days</th><th>OT Hours</th><th>Gross</th><th>Deductions</th><th>Net Pay</th><th>Status</th></tr></thead><tbody>{data.employees.map((e) => <tr key={e.employeeId}><td><b>{e.fullName}</b><small className="table-sub">{e.empCode || '—'}</small></td><td>{e.structureName || '—'}</td><td>{e.daysPresent}/{e.workingDays}</td><td>{e.lateDays}</td><td>{Number(e.overtimeHours).toFixed(1)}</td><td>৳{Number(e.gross).toLocaleString()}</td><td className="negative">৳{Number(e.deductions).toLocaleString()}</td><td><b>৳{Number(e.netPay).toLocaleString()}</b></td><td><Status value={e.status}/>{e.message && <small className="table-sub">{e.message}</small>}</td></tr>)}</tbody></table></div></Card>
  </div>;
}
