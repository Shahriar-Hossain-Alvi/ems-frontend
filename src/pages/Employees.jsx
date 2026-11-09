import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useEmployeesQuery, useDepartmentsQuery, usePayrollStructuresQuery, useEmployeeQuery } from '../hooks/useEMSQueries';
import { queryKeys } from '../hooks/queryKeys';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Eye, Check, X, Save } from 'lucide-react';
import { employeesApi } from '../api';
import { getErrorMessage } from '../api/client';
import { Button, Card, ErrorState, Field, Loading, Modal, Notice, PageTitle, Status } from '../components/UI';
import { useAuth } from '../auth';
export default function Employees() {
    const [params] = useSearchParams();
    const { user } = useAuth();
    const canEdit = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState(params.get('status') || '');
    const [departmentId, setDepartmentId] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const [notice, setNotice] = useState('');
    const [busy, setBusy] = useState(false);
    const [edit, setEdit] = useState({ fullName: '', phone: '', designation: '', departmentId: '', structureId: '', joinDate: '' });
    const queryClient = useQueryClient();
    const employeeParams = { search: search || undefined, status: status || undefined, departmentId: departmentId || undefined, page, limit: 10 };
    const employeesQuery = useEmployeesQuery(employeeParams);
    const departmentsQuery = useDepartmentsQuery();
    const structuresQuery = usePayrollStructuresQuery();
    const detailQuery = useEmployeeQuery(selected?.id, Boolean(selected));
    const data = employeesQuery.data;
    const departments = departmentsQuery.data || [];
    const structures = structuresQuery.data || [];
    const detail = detailQuery.data;
    const error = employeesQuery.error || departmentsQuery.error || structuresQuery.error;
    const load = () => Promise.all([employeesQuery.refetch(), departmentsQuery.refetch(), structuresQuery.refetch()]);
    useEffect(() => {
        if (!detail) return;
        setEdit({ fullName: detail.fullName, phone: detail.phone || '', designation: detail.designation || '', departmentId: detail.department?.id?.toString() || '', structureId: detail.structure?.id?.toString() || '', joinDate: detail.joinDate ? detail.joinDate.slice(0, 10) : '' });
    }, [detail]);
    const open = (employee) => { setSelected(employee); setNotice(''); };
    const changeStatus = async (status) => { if (!selected)
        return; setBusy(true); setNotice(''); try {
        await employeesApi.updateStatus(selected.id, status);
        setNotice(`Employee status changed to ${status}.`);
        await queryClient.invalidateQueries({ queryKey: ['employees'] });
        await queryClient.invalidateQueries({ queryKey: queryKeys.employee(selected.id) });
        await queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    }
    catch (e) {
        setNotice(getErrorMessage(e));
    }
    finally {
        setBusy(false);
    } };
    const save = async (e) => { e.preventDefault(); if (!selected)
        return; setBusy(true); setNotice(''); try {
        await employeesApi.update(selected.id, { fullName: edit.fullName, phone: edit.phone || null, designation: edit.designation || null, departmentId: edit.departmentId ? Number(edit.departmentId) : null, structureId: edit.structureId ? Number(edit.structureId) : null, joinDate: edit.joinDate || null });
        setNotice('Employee updated.');
        await queryClient.invalidateQueries({ queryKey: ['employees'] });
        await queryClient.invalidateQueries({ queryKey: queryKeys.employee(selected.id) });
        await queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
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
        return <Loading label="Loading employee directory..."/>;
    return <div className="page"><PageTitle title="Employee Directory" subtitle="Manage employee records, account approvals, and payroll assignments."/>
    <Card><div className="toolbar"><div className="search-field"><Search size={17}/><input placeholder="Search by name, email, ID, phone..." value={search} onChange={e => { setPage(1); setSearch(e.target.value); }}/></div><select value={status} onChange={e => { setPage(1); setStatus(e.target.value); }}><option value="">All statuses</option>{['PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED'].map(s => <option key={s}>{s}</option>)}</select><select value={departmentId} onChange={e => { setPage(1); setDepartmentId(e.target.value); }}><option value="">All departments</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select><SlidersHorizontal size={18} className="muted"/></div>
      <div className="section-heading"><h3>Employees <span className="count-badge">{data.meta.total}</span></h3><span className="muted">Page {data.meta.page} of {Math.max(1, data.meta.totalPages)}</span></div>
      <div className="table-wrap"><table><thead><tr><th>Employee</th><th>Employee ID</th><th>Department & Role</th><th>Payroll Structure</th><th>Status</th><th>Action</th></tr></thead><tbody>{data.data.map((e) => <tr key={e.id}><td><b>{e.fullName}</b><small className="table-sub">{e.user.email}</small></td><td>{e.empCode || 'Pending'}</td><td>{e.designation || '—'}<small className="table-sub">{e.department?.name || 'Unassigned'}</small></td><td>{e.structure?.name || 'Not assigned'}</td><td><Status value={e.user.status}/></td><td><button className="text-link" onClick={() => open(e)}><Eye size={15}/> View</button></td></tr>)}</tbody></table></div>
      <div className="pagination"><span>Showing {data.data.length ? ((page - 1) * 10 + 1) : 0}–{Math.min(page * 10, data.meta.total)} of {data.meta.total}</span><div><Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><span className="page-number">{page}</span><Button variant="secondary" disabled={page >= data.meta.totalPages} onClick={() => setPage(page + 1)}>Next</Button></div></div>
    </Card>
    {selected && !detail && detailQuery.isLoading && <Loading label="Loading employee details..."/>}
    {selected && detailQuery.isError && <Notice tone="danger">{getErrorMessage(detailQuery.error)}</Notice>}
    {selected && detail && <Modal title="Employee Details" onClose={() => { setSelected(null); setNotice(''); }}><div className="detail-head"><div className="avatar avatar-large">{detail.fullName.split(' ').map((s) => s[0]).slice(0, 2).join('')}</div><div><h3>{detail.fullName}</h3><p>{detail.user.email}</p><Status value={detail.user.status}/></div></div>{notice && <Notice tone={notice.includes('success') || notice.includes('updated') ? 'success' : 'warning'}>{notice}</Notice>}
      {canEdit && <form className="form-grid modal-form" onSubmit={save}><Field label="Full Name"><input value={edit.fullName} onChange={e => setEdit({ ...edit, fullName: e.target.value })}/></Field><Field label="Phone"><input value={edit.phone} onChange={e => setEdit({ ...edit, phone: e.target.value })}/></Field><Field label="Designation"><input value={edit.designation} onChange={e => setEdit({ ...edit, designation: e.target.value })}/></Field><Field label="Join Date"><input type="date" value={edit.joinDate} onChange={e => setEdit({ ...edit, joinDate: e.target.value })}/></Field><Field label="Department"><select value={edit.departmentId} onChange={e => setEdit({ ...edit, departmentId: e.target.value })}><option value="">Unassigned</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field><Field label="Payroll Structure"><select value={edit.structureId} onChange={e => setEdit({ ...edit, structureId: e.target.value })}><option value="">Not assigned</option>{structures.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field><div className="span-2"><Button type="submit" disabled={busy}><Save size={15}/> Save employee</Button></div></form>}
      <div className="modal-actions">{detail.user.status === 'PENDING' && canEdit && <><Button disabled={busy} onClick={() => changeStatus('ACTIVE')}><Check size={15}/> Approve</Button><Button variant="danger" disabled={busy} onClick={() => changeStatus('REJECTED')}><X size={15}/> Reject</Button></>}{detail.user.status === 'ACTIVE' && canEdit && <Button variant="danger" disabled={busy} onClick={() => changeStatus('INACTIVE')}>Deactivate</Button>}{detail.user.status === 'INACTIVE' && canEdit && <Button disabled={busy} onClick={() => changeStatus('ACTIVE')}>Reactivate</Button>}</div>
      {!canEdit && <Notice>Read-only access. Your role can view employee records but cannot change them.</Notice>}
    </Modal>}
  </div>;
}
