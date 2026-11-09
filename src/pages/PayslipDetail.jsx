import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { usePayslipQuery } from '../hooks/useEMSQueries';
import { getErrorMessage } from '../api/client';
import { Button, Card, ErrorState, Loading, Status } from '../components/UI';

export default function PayslipDetail() {
  const { id } = useParams();
  const query = usePayslipQuery(id);
  const p = query.data;
  if (query.isError && !p) return <ErrorState message={getErrorMessage(query.error)} retry={() => query.refetch()} />;
  if (!p) return <Loading />;
  return <div className="page payslip-page"><div className="section-heading"><Link to="/payslips" className="text-link"><ArrowLeft size={16} /> Back to Payslips</Link><Button variant="secondary" onClick={() => window.print()}><Printer size={16} /> Print / Save PDF</Button></div>
    <Card className="payslip-sheet"><div className="payslip-top"><div><div className="brand"><span className="brand-mark">E</span><b>EMS</b></div><p className="muted">Employee Payroll Statement</p></div><div className="right"><h2>{p.employee?.fullName}</h2><p>{p.employee?.empCode || '—'}</p><Status value={p.status} /></div></div>
      <h1>{new Date(p.year, p.month - 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })} Payslip</h1>
      <div className="payslip-metrics"><div><small>Working Days</small><b>{p.workingDays}</b></div><div><small>Days Present</small><b>{p.daysPresent}</b></div><div><small>Late Check-ins</small><b>{p.lateDays}</b></div><div><small>Overtime Tracked</small><b>{Number(p.overtimeHours).toFixed(1)} hrs</b></div></div>
      <h3>Earnings & Deductions</h3><div className="table-wrap"><table><thead><tr><th>Description</th><th>Type</th><th>Calculation</th><th className="right">Amount (BDT)</th></tr></thead><tbody>{p.items?.map((item, i) => <tr key={i}><td><b>{item.headName}</b></td><td>{item.type}</td><td>{item.note || '—'}</td><td className="right">৳{Number(item.amount).toLocaleString()}</td></tr>)}</tbody></table></div>
      <div className="payslip-total"><span>Gross Earnings</span><b>৳{Number(p.gross).toLocaleString()}</b></div><div className="payslip-total deduction"><span>Total Deductions</span><b>− ৳{Number(p.deductions).toLocaleString()}</b></div><div className="net-total"><span>Net Payable Amount</span><strong>৳{Number(p.netPay).toLocaleString()}</strong></div><p className="print-note">Generated automatically from attendance and payroll records.</p>
    </Card>
  </div>;
}
