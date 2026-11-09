import { LoaderCircle, AlertCircle, CheckCircle2, Inbox } from "lucide-react";
export function Button({ children, variant = "primary", ...props }) {
  return (
    <button
      className={`btn btn-${variant} ${props.className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
export function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}
export function PageTitle({ title, subtitle, action }) {
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
export function Loading({ label = "Loading..." }) {
  return (
    <div className="state">
      <LoaderCircle className="spin" size={22} />
      <span>{label}</span>
    </div>
  );
}
export function ErrorState({ message, retry }) {
  return (
    <div className="state error-state">
      <AlertCircle size={20} />
      <span>{message}</span>
      {retry && (
        <button className="text-button" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function Empty({ label = "Nothing to show yet" }) {
  return (
    <div className="empty">
      <Inbox size={26} />
      <span>{label}</span>
    </div>
  );
}
export function Notice({ children, tone = "info" }) {
  return (
    <div className={`notice notice-${tone}`}>
      {tone === "success" ? (
        <CheckCircle2 size={17} />
      ) : (
        <AlertCircle size={17} />
      )}
      <span>{children}</span>
    </div>
  );
}
export function Status({ value }) {
  const v = value || "UNKNOWN";
  return (
    <span className={`status status-${v.toLowerCase().replaceAll("_", "-")}`}>
      <i />
      {v.replaceAll("_", " ")}
    </span>
  );
}
export function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Modal({ title, children, onClose }) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
