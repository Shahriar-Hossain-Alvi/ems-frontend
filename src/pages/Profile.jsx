import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../hooks/queryKeys';
import { LockKeyhole } from 'lucide-react';
import { useAuth } from '../auth';
import { employeesApi, authApi } from '../api';
import { getErrorMessage } from '../api/client';
import { Button, Card, ErrorState, Field, Notice, PageTitle } from '../components/UI';
export default function Profile() {
    const { user, refresh } = useAuth();
    const queryClient = useQueryClient();
    const employee = user?.employee;
    const [fullName, setFullName] = useState(employee?.fullName || '');
    const [phone, setPhone] = useState(employee?.phone || '');
    const [designation, setDesignation] = useState(employee?.designation || '');
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
    const [pwMessage, setPwMessage] = useState('');
    const [pwError, setPwError] = useState('');
    useEffect(() => { setFullName(employee?.fullName || ''); setPhone(employee?.phone || ''); setDesignation(employee?.designation || ''); }, [employee]);
    const save = async (e) => { e.preventDefault(); setBusy(true); setMessage(''); setError(''); try {
        await employeesApi.updateMe({ fullName, phone, designation });
        await queryClient.invalidateQueries({ queryKey: queryKeys.me });
        await refresh();
        setMessage('Profile updated successfully.');
    }
    catch (e) {
        setError(getErrorMessage(e));
    }
    finally {
        setBusy(false);
    } };
    const changePassword = async (e) => { e.preventDefault(); setPwMessage(''); setPwError(''); try {
        const r = await authApi.changePassword(pw);
        setPwMessage(r.message);
        setPw({ currentPassword: '', newPassword: '' });
    }
    catch (e) {
        setPwError(getErrorMessage(e));
    } };
    if (!employee)
        return <ErrorState message="No employee profile is attached to this account."/>;
    return <div className="page narrow-page"><PageTitle title="My Profile" subtitle="Manage your personal information and account security."/>
    <Notice>Department, join date, employee ID, and payroll structure are managed by your administrator.</Notice>
    <Card><div className="profile-hero"><div className="avatar avatar-xl">{fullName.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()}</div><div><h2>{employee.fullName}</h2><p>{employee.empCode || 'Employee ID pending'}</p></div><span className="status status-active"><i />Active</span></div>
      <form onSubmit={save} className="form-grid"><div className="form-section-title"><h3>Personal Information</h3><p>Update your personal employee records</p></div>
        <Field label="Full Name"><input value={fullName} onChange={e => setFullName(e.target.value)} required/></Field>
        <Field label="Email"><div className="input-icon readonly"><input value={user?.email || ''} readOnly/><LockKeyhole size={16}/></div></Field>
        <Field label="Phone Number"><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number"/></Field>
        <Field label="Designation"><input value={designation} onChange={e => setDesignation(e.target.value)} placeholder="Designation"/></Field>
        <Field label="Department"><input value={employee.department?.name || 'Not assigned'} readOnly/></Field>
        <Field label="Join Date"><input value={employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : 'Not assigned'} readOnly/></Field>
        <Field label="Employee ID"><input value={employee.empCode || 'Pending approval'} readOnly/></Field>
        <Field label="Payroll Structure"><input value={employee.structure?.name || 'Not assigned'} readOnly/></Field>
        {message && <div className="span-2"><Notice tone="success">{message}</Notice></div>}{error && <div className="span-2"><Notice tone="danger">{error}</Notice></div>}
        <div className="form-actions span-2"><Button type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save Changes'}</Button></div>
      </form>
    </Card>
    <Card><h3>Change Password</h3><p className="muted">Use a strong password with at least 8 characters.</p><form className="form-grid" onSubmit={changePassword}><Field label="Current Password"><input type="password" value={pw.currentPassword} onChange={e => setPw({ ...pw, currentPassword: e.target.value })} required/></Field><Field label="New Password"><input type="password" minLength={8} maxLength={72} value={pw.newPassword} onChange={e => setPw({ ...pw, newPassword: e.target.value })} required/></Field>{pwMessage && <div className="span-2"><Notice tone="success">{pwMessage}</Notice></div>}{pwError && <div className="span-2"><Notice tone="danger">{pwError}</Notice></div>}<div className="form-actions span-2"><Button type="submit">Update Password</Button></div></form></Card>
  </div>;
}
