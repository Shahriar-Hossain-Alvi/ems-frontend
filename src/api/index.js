import { api, publicApi } from './client';
export const authApi = {
    login: (data) => publicApi.post('/auth/login', data).then(r => r.data),
    me: () => api.get('/auth/me').then(r => r.data),
    register: (data) => publicApi.post('/auth/register', data).then(r => r.data),
    changePassword: (data) => api.patch('/auth/change-password', data).then(r => r.data),
};
export const departmentsApi = {
    list: (search) => api.get('/departments', { params: search ? { search } : {} }).then(r => r.data),
    create: (name) => api.post('/departments', { name }).then(r => r.data),
    update: (id, name) => api.patch(`/departments/${id}`, { name }).then(r => r.data),
    remove: (id) => api.delete(`/departments/${id}`).then(r => r.data),
};
export const employeesApi = {
    list: (params) => api.get('/employees', { params }).then(r => r.data),
    one: (id) => api.get(`/employees/${id}`).then(r => r.data),
    update: (id, data) => api.patch(`/employees/${id}`, data).then(r => r.data),
    updateStatus: (id, status) => api.patch(`/employees/${id}/status`, { status }).then(r => r.data),
    updateMe: (data) => api.patch('/employees/me', data).then(r => r.data),
};
export const attendanceApi = {
    today: () => api.get('/attendance/today').then(r => r.data),
    clockIn: () => api.post('/attendance/clock-in').then(r => r.data),
    clockOut: () => api.post('/attendance/clock-out').then(r => r.data),
    mine: (params) => api.get('/attendance/me', { params }).then(r => r.data),
    list: (params) => api.get('/attendance', { params }).then(r => r.data),
    correct: (id, data) => api.patch(`/attendance/${id}`, data).then(r => r.data),
};
export const payrollApi = {
    structures: () => api.get('/payroll-structures').then(r => r.data),
    structure: (id) => api.get(`/payroll-structures/${id}`).then(r => r.data),
    createStructure: (data) => api.post('/payroll-structures', data).then(r => r.data),
    updateStructure: (id, data) => api.patch(`/payroll-structures/${id}`, data).then(r => r.data),
    deleteStructure: (id) => api.delete(`/payroll-structures/${id}`).then(r => r.data),
    heads: () => api.get('/payroll-heads').then(r => r.data),
    createHead: (data) => api.post('/payroll-heads', data).then(r => r.data),
    deleteHead: (id) => api.delete(`/payroll-heads/${id}`).then(r => r.data),
    addHead: (structureId, headId, value) => api.post(`/payroll-structures/${structureId}/heads/${headId}`, { value }).then(r => r.data),
    updateStructureHead: (structureId, headId, value) => api.patch(`/payroll-structures/${structureId}/heads/${headId}`, { value }).then(r => r.data),
    removeHead: (structureId, headId) => api.delete(`/payroll-structures/${structureId}/heads/${headId}`).then(r => r.data),
    preview: (month, year) => api.get('/payslips', { params: { month, year } }).then(r => r.data),
    generate: (month, year) => api.post('/payslips/generate', { month, year }).then(r => r.data),
    publish: (month, year) => api.post('/payslips/publish', { month, year }).then(r => r.data),
    mine: (params) => api.get('/payslips/me', { params }).then(r => r.data),
    one: (id) => api.get(`/payslips/${id}`).then(r => r.data),
};
export const dashboardApi = {
    employee: () => api.get('/dashboard/employee').then(r => r.data),
    admin: () => api.get('/dashboard/admin').then(r => r.data),
};
export const workPolicyApi = {
    get: () => api.get('/work-policy').then(r => r.data),
    update: (data) => api.patch('/work-policy', data).then(r => r.data),
};
