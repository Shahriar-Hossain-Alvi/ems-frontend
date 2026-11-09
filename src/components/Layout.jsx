import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  CalendarDays,
  Wallet,
  UserRound,
  Layers3,
  PlayCircle,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../auth";
const employeeLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/attendance", label: "Attendance", icon: CalendarDays },
  { to: "/payslips", label: "Payslips", icon: Wallet },
  { to: "/profile", label: "My Profile", icon: UserRound },
];
const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/attendance", label: "Attendance Records", icon: CalendarDays },
  { to: "/admin/employees", label: "Employees", icon: Users },
  {
    to: "/admin/payroll-structures",
    label: "Payroll Structures",
    icon: Layers3,
  },
  { to: "/admin/run-payroll", label: "Run Payroll", icon: PlayCircle },
  { to: "/admin/settings", label: "Work Policy", icon: Settings },
];
export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const admin = user?.role !== "EMPLOYEE";
  const links = admin ? adminLinks : employeeLinks;
  const name = user?.employee?.fullName || user?.email || "User";
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const signOut = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className={`app-shell ${admin ? "admin-shell" : "employee-shell"}`}>
      {admin && (
        <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
          <div className="brand">
            <span className="brand-mark">E</span>
            <span>EMS Admin</span>
            <button
              className="mobile-close"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
          <nav>
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/admin"}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="avatar avatar-small">{initials}</div>
            <div className="user-meta">
              <b>{name}</b>
              <small>{user?.role?.replaceAll("_", " ")}</small>
            </div>
            <button className="icon-button" title="Sign out" onClick={signOut}>
              <LogOut size={17} />
            </button>
          </div>
        </aside>
      )}
      <div className="main-column">
        <header className="topbar">
          {!admin && (
            <div className="brand">
              <span className="brand-mark">E</span>
              <b>EMS</b>
            </div>
          )}
          {admin && (
            <button className="mobile-menu" onClick={() => setMobileOpen(true)}>
              <Menu size={20} />
            </button>
          )}
          {!admin && (
            <nav className="employee-nav">
              {links.map(({ to, label }) => (
                <NavLink key={to} to={to}>
                  {label}
                </NavLink>
              ))}
            </nav>
          )}
          {admin && (
            <div className="top-search">
              <span>⌕</span>
              <input
                placeholder="Search employees..."
                onKeyDown={(e) =>
                  e.key === "Enter" && navigate("/admin/employees")
                }
              />
            </div>
          )}
          <div className="top-actions">
            {/* <button className="icon-button" title="Notifications">
              <Bell size={18} />
              <i className="notification-dot" />
            </button> */}
            <div className="profile-menu">
              <div className="avatar">{initials}</div>
              <span>{name}</span>
              <ChevronDown size={15} />
              <div className="profile-dropdown">
                <button
                  onClick={() =>
                    navigate(admin ? "/admin/settings" : "/profile")
                  }
                >
                  My account
                </button>
                <button onClick={signOut}>Sign out</button>
              </div>
            </div>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
        <footer className="footer">
          <span>© 2026 EMS — Internal Enterprise System</span>
          <span>{user?.email}</span>
        </footer>
      </div>
    </div>
  );
}
