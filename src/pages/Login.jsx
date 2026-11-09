import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import useAxiosPublic from "../hooks/useAxiosPublic";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound, Phone } from "lucide-react";
import { useAuth } from "../auth";
import { authApi } from "../api";
import { getErrorMessage } from "../api/client";
import { Button, Field, Notice } from "../components/UI";
export default function Login() {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login } = useAuth();
  const axiosPublic = useAxiosPublic();
  const registerMutation = useMutation({
    mutationFn: (payload) =>
      axiosPublic
        .post("/auth/register", payload)
        .then((response) => response.data),
  });
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const submitLogin = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(email, password);
      navigate(from || (user.role === "EMPLOYEE" ? "/dashboard" : "/admin"), {
        replace: true,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  const submitSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const result = await registerMutation.mutateAsync({
        email,
        password,
        fullName,
        phone: phone || undefined,
        designation: designation || undefined,
      });
      setSuccess(
        result.message ||
          "Registration submitted. Your account is awaiting admin approval.",
      );
      setTab("login");
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">E</span>
          <b>EMS</b>
        </div>
        <div className="auth-tabs">
          <button
            className={tab === "login" ? "active" : ""}
            onClick={() => {
              setTab("login");
              setError("");
              setSuccess("");
            }}
          >
            Log In
          </button>
          <button
            className={tab === "signup" ? "active" : ""}
            onClick={() => {
              setTab("signup");
              setError("");
              setSuccess("");
            }}
          >
            Sign Up
          </button>
        </div>
        {tab === "login" ? (
          <form onSubmit={submitLogin}>
            <h1>Welcome back</h1>
            <p className="muted">
              Log in to manage your attendance and payroll
            </p>
            {success && <Notice tone="success">{success}</Notice>}
            {error && <Notice tone="danger">{error}</Notice>}
            <Field label="Work Email">
              <div className="input-icon">
                <Mail size={17} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoComplete="username"
                />
              </div>
            </Field>
            <Field label="Password">
              <div className="input-icon">
                <LockKeyhole size={17} />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={8}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Field>
            <div className="forgot-row">
              <span />
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  setError(
                    "Password reset is not available in the supplied backend. Please contact an administrator.",
                  )
                }
              >
                Forgot password?
              </button>
            </div>
            <Button type="submit" disabled={busy} className="full-button">
              {busy ? "Signing in..." : "Log In"} <span>→</span>
            </Button>
          </form>
        ) : (
          <form onSubmit={submitSignup}>
            <h1>Create your employee profile</h1>
            <p className="muted">
              Register for company attendance and payroll access
            </p>
            {error && <Notice tone="danger">{error}</Notice>}
            <Field label="Full Name">
              <div className="input-icon">
                <UserRound size={16} />
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                  minLength={2}
                />
              </div>
            </Field>
            <Field label="Work Email">
              <div className="input-icon">
                <Mail size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>
            </Field>
            <Field label="Phone Number">
              <div className="input-icon">
                <Phone size={16} />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                />
              </div>
            </Field>
            <Field label="Designation (optional)">
              <input
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Software Engineer"
              />
            </Field>
            <Field label="Password">
              <div className="input-icon">
                <LockKeyhole size={16} />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  maxLength={72}
                  required
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Field>
            <Field label="Confirm Password">
              <div className="input-icon">
                <LockKeyhole size={16} />
                <input
                  type={show ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  minLength={8}
                  maxLength={72}
                  required
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Field>
            <p className="form-hint">
              Department and payroll structure are assigned by an administrator
              after registration.
            </p>
            <Button type="submit" disabled={busy} className="full-button">
              {busy ? "Creating account..." : "Create Account"} <span>↗</span>
            </Button>
          </form>
        )}
        <div className="auth-foot">© 2026 EMS — Internal Use Only</div>
      </div>
    </div>
  );
}
