import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { useMyPayslipsQuery } from '../hooks/useEMSQueries';
import { getErrorMessage } from '../api/client';
import { Card, ErrorState, Loading, PageTitle, Status } from '../components/UI';

export default function Payslips() {
  const query = useMyPayslipsQuery({ page: 1, limit: 50 });
  const data = query.data;
  if (query.isError && !data) return <ErrorState message={getErrorMessage(query.error)} retry={() => query.refetch()} />;
  if (!data) return <Loading label="Loading payslips..." />;
  return <div className="page"><PageTitle title="Payslips" subtitle="Your published monthly payroll statements." />
    <Card><div className="section-heading"><div><h3>Payment History</h3><p>Only published payslips are shown here.</p></div><span className="muted">{data.meta.total} payslips</span></div>
      <div className="table-wrap"><table><thead><tr><th>Pay Period</th><th>Days Present</th><th>Gross Pay</th><th>Deductions</th><th>Net Pay</th><th>Status</th><th /></tr></thead><tbody>{data.data.length ? data.data.map(p => <tr key={p.id}><td><b>{new Date(p.year, p.month - 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })}</b></td><td>{p.daysPresent}/{p.workingDays}</td><td>৳{Number(p.gross).toLocaleString()}</td><td className="negative">৳{Number(p.deductions).toLocaleString()}</td><td><b>৳{Number(p.netPay).toLocaleString()}</b></td><td><Status value={p.status} /></td><td><Link className="icon-link" to={`/payslips/${p.id}`}><Eye size={16} /> View</Link></td></tr>) : <tr><td colSpan={7} className="table-empty">No published payslips available yet.</td></tr>}</tbody></table></div>
    </Card>
  </div>;
}
