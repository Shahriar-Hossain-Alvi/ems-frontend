import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from './useAxiosSecure';
import { queryKeys } from './queryKeys';

const options = { staleTime: 30_000, refetchOnWindowFocus: true, refetchOnReconnect: true };
const get = (client, path, params) => client.get(path, { params }).then(response => response.data);

export const useCurrentUserQuery = (enabled = true) => {
  const axios = useAxiosSecure();
  return useQuery({ queryKey: queryKeys.me, queryFn: () => get(axios, '/auth/me'), enabled, ...options });
};
export const useEmployeeDashboardQuery = () => {
  const axios = useAxiosSecure();
  return useQuery({ queryKey: queryKeys.employeeDashboard, queryFn: () => get(axios, '/dashboard/employee'), ...options });
};
export const useAdminDashboardQuery = () => {
  const axios = useAxiosSecure();
  return useQuery({ queryKey: queryKeys.adminDashboard, queryFn: () => get(axios, '/dashboard/admin'), ...options });
};
export const useEmployeesQuery = (params) => {
  const axios = useAxiosSecure();
  return useQuery({ queryKey: queryKeys.employees(params), queryFn: () => get(axios, '/employees', params), ...options });
};
export const useEmployeeQuery = (id, enabled = true) => {
  const axios = useAxiosSecure();
  return useQuery({ queryKey: queryKeys.employee(id), queryFn: () => get(axios, `/employees/${id}`), enabled: enabled && Boolean(id), ...options });
};
export const useDepartmentsQuery = (params = {}) => {
  const axios = useAxiosSecure();
  return useQuery({ queryKey: queryKeys.departments(params), queryFn: () => get(axios, '/departments', params), ...options });
};
export const useAttendanceTodayQuery = () => {
  const axios = useAxiosSecure();
  return useQuery({ queryKey: queryKeys.attendanceToday, queryFn: () => get(axios, '/attendance/today'), ...options });
};
export const useMyAttendanceQuery = (params) => {
  const axios = useAxiosSecure();
  return useQuery({ queryKey: queryKeys.attendanceMine(params), queryFn: () => get(axios, '/attendance/me', params), ...options });
};
export const useAttendanceListQuery = (params) => {
  const axios = useAxiosSecure();
  return useQuery({ queryKey: queryKeys.attendanceList(params), queryFn: () => get(axios, '/attendance', params), ...options });
};
export const usePayrollStructuresQuery = () => {
  const axios = useAxiosSecure();
  return useQuery({ queryKey: queryKeys.payrollStructures, queryFn: () => get(axios, '/payroll-structures'), ...options });
};
export const usePayrollStructureQuery = (id, enabled = true) => {
  const axios = useAxiosSecure();
  return useQuery({ queryKey: queryKeys.payrollStructure(id), queryFn: () => get(axios, `/payroll-structures/${id}`), enabled: enabled && Boolean(id), ...options });
};
export const usePayrollHeadsQuery = () => {
  const axios = useAxiosSecure();
  return useQuery({ queryKey: queryKeys.payrollHeads, queryFn: () => get(axios, '/payroll-heads'), ...options });
};
export const usePayrollPreviewQuery = (month, year) => {
  const axios = useAxiosSecure();
  return useQuery({ queryKey: queryKeys.payrollPreview(month, year), queryFn: () => get(axios, '/payslips', { month, year }), ...options });
};
export const useMyPayslipsQuery = (params = { page: 1, limit: 50 }) => {
  const axios = useAxiosSecure();
  return useQuery({ queryKey: queryKeys.payslipsMine(params), queryFn: () => get(axios, '/payslips/me', params), ...options });
};
export const usePayslipQuery = (id) => {
  const axios = useAxiosSecure();
  return useQuery({ queryKey: queryKeys.payslip(id), queryFn: () => get(axios, `/payslips/${id}`), enabled: Boolean(id), ...options });
};
export const useWorkPolicyQuery = () => {
  const axios = useAxiosSecure();
  return useQuery({ queryKey: queryKeys.workPolicy, queryFn: () => get(axios, '/work-policy'), ...options });
};
