import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useWorkPolicyQuery,
  useDepartmentsQuery,
} from "../hooks/useEMSQueries";
import { queryKeys } from "../hooks/queryKeys";
import { workPolicyApi, departmentsApi } from "../api";
import { getErrorMessage } from "../api/client";
import {
  Button,
  Card,
  ErrorState,
  Field,
  Loading,
  Notice,
  PageTitle,
} from "../components/UI";
import { useAuth } from "../auth";
export default function SettingsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const queryClient = useQueryClient();
  const policyQuery = useWorkPolicyQuery();
  const departmentsQuery = useDepartmentsQuery();
  const [policy, setPolicy] = useState(null);
  const departments = departmentsQuery.data || [];
  const [newDepartment, setNewDepartment] = useState("");
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState("info");
  const load = () =>
    Promise.all([policyQuery.refetch(), departmentsQuery.refetch()]);
  useEffect(() => {
    if (policyQuery.data) setPolicy(policyQuery.data);
  }, [policyQuery.data]);
  const error = policyQuery.error || departmentsQuery.error;
  const savePolicy = async (e) => {
    e.preventDefault();

    try {
      // Send only the fields accepted by UpdateWorkPolicyDto.
      await workPolicyApi.update({
        shiftStart: policy.shiftStart,
        shiftEnd: policy.shiftEnd,
        graceMinutes: Number(policy.graceMinutes),
        breakMinutes: Number(policy.breakMinutes),
        standardHours: Number(policy.standardHours),
        workingDays: Number(policy.workingDays),
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.workPolicy,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.employeeDashboard,
        }),
      ]);

      setNotice("Work policy saved.");
      setNoticeTone("success");
    } catch (error) {
      setNotice(getErrorMessage(error));
      setNoticeTone("danger");
    }
  };
  const addDepartment = async (e) => {
    e.preventDefault();
    try {
      await departmentsApi.create(newDepartment);
      setNewDepartment("");
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
      setNotice("Department created.");
    } catch (e) {
      setNotice(getErrorMessage(e));
    }
  };
  const saveDepartment = async (id) => {
    try {
      await departmentsApi.update(id, editName);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
    } catch (e) {
      setNotice(getErrorMessage(e));
    }
  };
  const removeDepartment = async (id) => {
    if (!confirm("Delete this department?")) return;
    try {
      await departmentsApi.remove(id);
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
    } catch (e) {
      setNotice(getErrorMessage(e));
    }
  };
  if (error && !policy)
    return <ErrorState message={getErrorMessage(error)} retry={load} />;
  if (!policy) return <Loading />;
  return (
    <div className="page">
      <PageTitle
        title="Work Policy & Settings"
        subtitle="Configure attendance rules and manage company departments."
      />
      {notice && <Notice tone={noticeTone}>{notice}</Notice>}
      <Card>
        <div className="section-heading">
          <div>
            <h3>Attendance & Work Policy</h3>
            <p>
              These settings are used to calculate lateness, work duration, and
              overtime.
            </p>
          </div>
        </div>
        <form className="form-grid" onSubmit={savePolicy}>
          <Field label="Shift Start">
            <input
              type="time"
              value={policy.shiftStart}
              onChange={(e) =>
                setPolicy({ ...policy, shiftStart: e.target.value })
              }
              readOnly={!canEdit}
            />
          </Field>
          <Field label="Shift End">
            <input
              type="time"
              value={policy.shiftEnd}
              onChange={(e) =>
                setPolicy({ ...policy, shiftEnd: e.target.value })
              }
              readOnly={!canEdit}
            />
          </Field>
          <Field label="Grace Period (minutes)">
            <input
              type="number"
              min="0"
              value={policy.graceMinutes}
              onChange={(e) =>
                setPolicy({ ...policy, graceMinutes: e.target.value })
              }
              readOnly={!canEdit}
            />
          </Field>
          <Field label="Break Duration (minutes)">
            <input
              type="number"
              min="0"
              value={policy.breakMinutes}
              onChange={(e) =>
                setPolicy({ ...policy, breakMinutes: e.target.value })
              }
              readOnly={!canEdit}
            />
          </Field>
          <Field label="Standard Work Hours">
            <input
              type="number"
              min="1"
              value={policy.standardHours}
              onChange={(e) =>
                setPolicy({ ...policy, standardHours: e.target.value })
              }
              readOnly={!canEdit}
            />
          </Field>
          <Field label="Working Days per Month">
            <input
              type="number"
              min="1"
              value={policy.workingDays}
              onChange={(e) =>
                setPolicy({ ...policy, workingDays: e.target.value })
              }
              readOnly={!canEdit}
            />
          </Field>
          {canEdit && (
            <div className="span-2 form-actions">
              <Button type="submit">Save Work Policy</Button>
            </div>
          )}
        </form>
        {!canEdit && (
          <Notice>
            Demo administrator access is read-only for work policy settings.
          </Notice>
        )}
      </Card>
      <Card>
        <div className="section-heading">
          <div>
            <h3>Departments</h3>
            <p>Departments are selectable in employee administration.</p>
          </div>
        </div>
        {canEdit && (
          <form className="inline-form" onSubmit={addDepartment}>
            <input
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              placeholder="New department name"
              required
            />
            <Button type="submit">Add Department</Button>
          </form>
        )}
        <div className="department-list">
          {departments.map((d) => (
            <div className="department-row" key={d.id}>
              {editing === d.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              ) : (
                <b>{d.name}</b>
              )}
              <span>{d._count?.employees ?? 0} employees</span>
              {canEdit && (
                <div>
                  {editing === d.id ? (
                    <>
                      <button
                        className="text-link"
                        onClick={() => saveDepartment(d.id)}
                      >
                        Save
                      </button>
                      <button
                        className="text-link"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="text-link"
                        onClick={() => {
                          setEditing(d.id);
                          setEditName(d.name);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-link danger-text"
                        onClick={() => removeDepartment(d.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
