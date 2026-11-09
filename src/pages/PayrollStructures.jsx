import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, Layers3, Settings2 } from "lucide-react";
import { payrollApi } from "../api";
import { getErrorMessage } from "../api/client";
import {
  usePayrollStructuresQuery,
  usePayrollHeadsQuery,
  usePayrollStructureQuery,
} from "../hooks/useEMSQueries";
import { queryKeys } from "../hooks/queryKeys";
import {
  Button,
  Card,
  Empty,
  ErrorState,
  Field,
  Loading,
  Modal,
  Notice,
  PageTitle,
  Status,
} from "../components/UI";
import { useAuth } from "../auth";

const emptyHeadForm = {
  name: "",
  type: "EARNING",
  calcType: "FIXED",
  unitSource: "OVERTIME_HOURS",
  isBasic: false,
};

export default function PayrollStructures() {
  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const queryClient = useQueryClient();
  const structuresQuery = usePayrollStructuresQuery();
  const headsQuery = usePayrollHeadsQuery();
  const structures = structuresQuery.data || [];
  const heads = headsQuery.data || [];
  const [selectedId, setSelectedId] = useState(null);
  const selectedQuery = usePayrollStructureQuery(selectedId);
  const selected = selectedQuery.data;
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [structureForm, setStructureForm] = useState({ name: "", description: "" });
  const [headForm, setHeadForm] = useState(emptyHeadForm);
  const [assignment, setAssignment] = useState({ headId: "", value: "0" });
  const [editingValue, setEditingValue] = useState(null);
  const [editingStructureId, setEditingStructureId] = useState(null);

  useEffect(() => {
    if (!selectedId && structures.length) setSelectedId(structures[0].id);
  }, [selectedId, structures]);

  const availableHeads = useMemo(() => {
    const assignedIds = new Set((selected?.heads || []).map((item) => Number(item.headId)));
    return heads.filter((head) => !assignedIds.has(Number(head.id)));
  }, [heads, selected]);

  const refreshStructures = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.payrollStructures });
  };
  const refreshHeads = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.payrollHeads });
  };
  const refreshSelected = async (id = selectedId) => {
    if (id) await queryClient.invalidateQueries({ queryKey: queryKeys.payrollStructure(id) });
  };
  const closeModal = () => {
    if (busy) return;
    setModal(null);
    setNotice("");
  };

  const openCreateStructure = () => {
    setStructureForm({ name: "", description: "" });
    setEditingStructureId(null);
    setNotice("");
    setModal("create-structure");
  };
  const openEditStructure = () => {
    if (!selected) return;
    setStructureForm({ name: selected.name || "", description: selected.description || "" });
    setEditingStructureId(selected.id);
    setNotice("");
    setModal("edit-structure");
  };

  const saveStructure = async (event) => {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      if (editingStructureId) {
        await payrollApi.updateStructure(editingStructureId, structureForm);
        await refreshSelected(editingStructureId);
      } else {
        const created = await payrollApi.createStructure(structureForm);
        if (created?.id) setSelectedId(created.id);
      }
      await refreshStructures();
      setModal(null);
    } catch (error) {
      setNotice(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const createHead = async (event) => {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      await payrollApi.createHead({
        name: headForm.name.trim(),
        type: headForm.type,
        calcType: headForm.calcType,
        ...(headForm.calcType === "PER_UNIT" ? { unitSource: headForm.unitSource } : {}),
        isBasic: headForm.isBasic,
      });
      setHeadForm(emptyHeadForm);
      await refreshHeads();
      setNotice("Payroll head created successfully.");
    } catch (error) {
      setNotice(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const assignHead = async (event) => {
    event.preventDefault();
    if (!selected || !assignment.headId) return;
    setBusy(true);
    setNotice("");
    try {
      await payrollApi.addHead(selected.id, Number(assignment.headId), Number(assignment.value));
      setAssignment({ headId: "", value: "0" });
      await Promise.all([refreshSelected(), refreshHeads()]);
      setModal(null);
    } catch (error) {
      setNotice(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const removeHeadFromStructure = async (item) => {
    if (!selected || !window.confirm(`Remove ${item.head.name} from this structure?`)) return;
    setNotice("");
    try {
      await payrollApi.removeHead(selected.id, item.headId);
      await refreshSelected();
    } catch (error) {
      setNotice(getErrorMessage(error));
    }
  };

  const deleteGlobalHead = async (head) => {
    if (!window.confirm(`Delete payroll head “${head.name}”? This may fail if the head is already used in a structure.`)) return;
    setNotice("");
    try {
      await payrollApi.deleteHead(head.id);
      await Promise.all([refreshHeads(), refreshStructures(), refreshSelected()]);
      setNotice(`“${head.name}” deleted.`);
    } catch (error) {
      setNotice(getErrorMessage(error));
    }
  };

  const saveHeadValue = async () => {
    if (!selected || !editingValue) return;
    setBusy(true);
    setNotice("");
    try {
      await payrollApi.updateStructureHead(selected.id, editingValue.headId, Number(editingValue.value));
      setEditingValue(null);
      await refreshSelected();
    } catch (error) {
      setNotice(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const deleteStructure = async () => {
    if (!selected || !window.confirm(`Delete payroll structure “${selected.name}”?`)) return;
    setNotice("");
    try {
      await payrollApi.deleteStructure(selected.id);
      setSelectedId(null);
      await refreshStructures();
    } catch (error) {
      setNotice(getErrorMessage(error));
    }
  };

  const pageError = structuresQuery.error || headsQuery.error;
  if (pageError && !structuresQuery.data && !headsQuery.data) {
    return <ErrorState message={getErrorMessage(pageError)} retry={() => Promise.all([structuresQuery.refetch(), headsQuery.refetch()])} />;
  }

  return (
    <div className="page">
      <PageTitle
        title="Payroll Structures"
        subtitle="Manage compensation models and reusable payroll heads."
        action={canEdit && <div className="toolbar-actions">
          <Button variant="secondary" onClick={() => { setNotice(""); setModal("manage-heads"); }}><Settings2 size={16} /> Manage Payroll Heads</Button>
          <Button onClick={openCreateStructure}><Plus size={16} /> New Structure</Button>
        </div>}
      />
      {notice && <Notice tone="warning">{notice}</Notice>}

      {structures.length === 0 ? (
        <Card>
          <Empty label="No payroll structures created yet. Create a structure to start configuring payroll." />
          {canEdit && <div className="form-actions"><Button onClick={openCreateStructure}><Plus size={16} /> Create First Structure</Button></div>}
        </Card>
      ) : (
        <div className="structure-layout">
          <Card className="structure-list">
            <div className="section-heading">
              <div><h3>Structures Directory</h3><p>Available compensation models</p></div>
              <Layers3 size={18} />
            </div>
            {structures.map((structure) => (
              <button key={structure.id} className={`structure-option ${selected?.id === structure.id ? "selected" : ""}`} onClick={() => { setSelectedId(structure.id); setEditingValue(null); }}>
                <span className="structure-icon"><Layers3 size={18} /></span>
                <span><b>{structure.name}</b><small>{structure.description || "Payroll structure"}</small></span>
              </button>
            ))}
          </Card>
          <Card className="structure-detail">
            {selectedQuery.isLoading ? <Loading label="Loading structure..." /> : selectedQuery.isError ? <Notice tone="danger">{getErrorMessage(selectedQuery.error)}</Notice> : selected ? <>
              <div className="section-heading">
                <div><h2>{selected.name}</h2><p>{selected.description || "Compensation model"} · {selected.heads?.length || 0} payroll heads</p></div>
                <div className="table-actions">
                  {canEdit && <Button variant="secondary" onClick={openEditStructure}><Pencil size={14} /> Edit</Button>}
                </div>
              </div>
              <div className="section-heading subheading">
                <div><h3>Payroll Heads in this Structure</h3><p>Assign existing payroll heads and configure their values.</p></div>
                {canEdit && <Button onClick={() => { setAssignment({ headId: "", value: "0" }); setNotice(""); setModal("assign-head"); }}><Plus size={15} /> Add Head</Button>}
              </div>
              <div className="table-wrap">
                <table><thead><tr><th>Head Name</th><th>Type</th><th>Calculation</th><th>Value / Expression</th><th /></tr></thead>
                  <tbody>{selected.heads?.map((item) => <tr key={item.headId}>
                    <td><b>{item.head.name}</b>{item.head.isBasic && <small className="table-sub">Basic salary</small>}</td>
                    <td><Status value={item.head.type} /></td>
                    <td>{item.head.calcType?.replaceAll("_", " ")}</td>
                    <td>{editingValue?.headId === item.headId ? <div className="inline-edit"><input type="number" min="0" step="0.01" value={editingValue.value} onChange={(event) => setEditingValue({ ...editingValue, value: event.target.value })} /><button onClick={saveHeadValue} disabled={busy}>Save</button><button onClick={() => setEditingValue(null)}>Cancel</button></div> : <b>{item.head.calcType === "PERCENT_OF_BASIC" ? `${item.value}% of basic` : item.head.calcType === "PER_UNIT" ? `৳${item.value} / ${item.head.unitSource?.replaceAll("_", " ").toLowerCase()}` : `৳${Number(item.value).toLocaleString()}`}</b>}</td>
                    <td>{canEdit && <div className="table-actions"><button className="icon-button" title="Edit assigned value" onClick={() => setEditingValue({ headId: item.headId, value: String(item.value) })}><Pencil size={15} /></button><button className="icon-button danger-icon" title="Remove from structure" onClick={() => removeHeadFromStructure(item)}><Trash2 size={15} /></button></div>}</td>
                  </tr>)}</tbody>
                </table>
              </div>
              {(!selected.heads || selected.heads.length === 0) && <Empty label="No heads assigned to this structure." />}
              <div className="estimate-card"><div><b>Payroll calculation preview</b><p>Actual amounts are calculated from attendance when payroll is previewed.</p></div><span>BDT</span></div>
              {canEdit && <div className="form-actions"><Button variant="danger" onClick={deleteStructure}><Trash2 size={15} /> Delete Structure</Button></div>}
            </> : <Loading />}
          </Card>
        </div>
      )}

      {modal === "create-structure" || modal === "edit-structure" ? <Modal title={modal === "edit-structure" ? "Edit Payroll Structure" : "Create Payroll Structure"} onClose={closeModal}>
        <form onSubmit={saveStructure} className="modal-form">
          <Field label="Structure Name"><input value={structureForm.name} onChange={(event) => setStructureForm({ ...structureForm, name: event.target.value })} required maxLength={100} /></Field>
          <Field label="Description"><textarea value={structureForm.description} onChange={(event) => setStructureForm({ ...structureForm, description: event.target.value })} maxLength={500} /></Field>
          {notice && <Notice tone="danger">{notice}</Notice>}
          <div className="modal-actions"><Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? "Saving..." : modal === "edit-structure" ? "Save Changes" : "Create Structure"}</Button></div>
        </form>
      </Modal> : null}

      {modal === "manage-heads" ? <Modal title="Manage Payroll Heads" onClose={closeModal}>
        <div className="modal-form">
          <p className="form-hint">Payroll heads are reusable earning or deduction definitions. Create them here, then assign them to one or more structures.</p>
          <form onSubmit={createHead} className="modal-form">
            <Field label="Head Name"><input value={headForm.name} onChange={(event) => setHeadForm({ ...headForm, name: event.target.value })} placeholder="e.g. Medical Allowance" required maxLength={100} /></Field>
            <div className="form-grid">
              <Field label="Type"><select value={headForm.type} onChange={(event) => setHeadForm({ ...headForm, type: event.target.value, isBasic: event.target.value === "DEDUCTION" ? false : headForm.isBasic })}><option value="EARNING">Earning</option><option value="DEDUCTION">Deduction</option></select></Field>
              <Field label="Calculation Type"><select value={headForm.calcType} onChange={(event) => setHeadForm({ ...headForm, calcType: event.target.value })}><option value="FIXED">Fixed amount</option><option value="PERCENT_OF_BASIC">Percentage of basic</option><option value="PER_UNIT">Per unit</option></select></Field>
            </div>
            {headForm.calcType === "PER_UNIT" && <Field label="Unit Source"><select value={headForm.unitSource} onChange={(event) => setHeadForm({ ...headForm, unitSource: event.target.value })}><option value="OVERTIME_HOURS">Overtime hours</option><option value="LATE_DAYS">Late days</option><option value="ABSENT_DAYS">Absent days</option></select></Field>}
            <label className="checkbox-field"><input type="checkbox" checked={headForm.isBasic} disabled={headForm.type !== "EARNING" || headForm.calcType !== "FIXED"} onChange={(event) => setHeadForm({ ...headForm, isBasic: event.target.checked })} /> Mark as basic salary</label>
            <p className="form-hint">A basic salary head must be an EARNING with FIXED calculation.</p>
            {notice && <Notice tone={notice.includes("successfully") ? "success" : "danger"}>{notice}</Notice>}
            <Button type="submit" disabled={busy}>{busy ? "Creating..." : "Create Payroll Head"}</Button>
          </form>
          <div className="section-heading subheading"><div><h3>Existing Payroll Heads ({heads.length})</h3><p>Global definitions available for structures</p></div></div>
          {heads.length ? <div className="table-wrap"><table><thead><tr><th>Name</th><th>Type</th><th>Calculation</th><th>Basic</th><th /></tr></thead><tbody>{heads.map((head) => <tr key={head.id}><td><b>{head.name}</b></td><td><Status value={head.type} /></td><td>{head.calcType?.replaceAll("_", " ")}</td><td>{head.isBasic ? "Yes" : "—"}</td><td><button className="icon-button danger-icon" title="Delete payroll head" onClick={() => deleteGlobalHead(head)}><Trash2 size={15} /></button></td></tr>)}</tbody></table></div> : <Empty label="No payroll heads created yet." />}
          <p className="form-hint">Editing a global payroll head is not currently supported by the backend API available to this frontend. You can create and delete heads here; assigned values can be edited within each structure.</p>
        </div>
      </Modal> : null}

      {modal === "assign-head" ? <Modal title="Assign Payroll Head" onClose={closeModal}>
        <form onSubmit={assignHead} className="modal-form">
          <Field label="Payroll Head"><select value={assignment.headId} onChange={(event) => setAssignment({ ...assignment, headId: event.target.value })} required><option value="">Select a payroll head</option>{availableHeads.map((head) => <option key={head.id} value={head.id}>{head.name} · {head.type}</option>)}</select></Field>
          {availableHeads.length === 0 && <Notice tone="warning">All existing payroll heads are already assigned. Create a new head from Manage Payroll Heads first.</Notice>}
          <Field label={availableHeads.find((head) => String(head.id) === assignment.headId)?.calcType === "PERCENT_OF_BASIC" ? "Percentage" : "Value / Amount"}><input type="number" min="0" step="0.01" value={assignment.value} onChange={(event) => setAssignment({ ...assignment, value: event.target.value })} required /></Field>
          {notice && <Notice tone="danger">{notice}</Notice>}
          <div className="modal-actions"><Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button><Button type="submit" disabled={busy || !availableHeads.length}>{busy ? "Adding..." : "Assign Head"}</Button></div>
        </form>
      </Modal> : null}
    </div>
  );
}
