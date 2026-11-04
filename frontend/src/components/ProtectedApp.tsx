import { useEffect, useState } from "react";
import { Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { Activity, LayoutDashboard, LogOut, PackageSearch, ShoppingCart } from "lucide-react";
import { api } from "../api/client";
import type { User } from "../types";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { InventoryPage } from "../features/inventory/InventoryPage";
import { LoginPage } from "../features/auth/LoginPage";
import { PointOfSalePage } from "../features/sales/PointOfSalePage";

function Shell({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-icon"><Activity size={20} /></span><span>Pharma<span className="brand-light">Gestion</span></span></div>
        <p className="nav-label">ESPACE DE TRAVAIL</p>
        <nav className="nav-list">
          {user.role === "admin" && <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}><LayoutDashboard size={18} /> Tableau de bord</NavLink>}
          <NavLink to="/stock" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}><PackageSearch size={18} /> Gestion du stock</NavLink>
          <NavLink to="/sales/new" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}><ShoppingCart size={18} /> Point de vente</NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="user-card"><div className="avatar">{user.name.charAt(0).toUpperCase()}</div><div className="user-meta"><strong>{user.name}</strong><span>{user.role === "admin" ? "Administrateur" : "Pharmacien"}</span></div></div>
          <button className="logout-button" onClick={onLogout}><LogOut size={17} /> Déconnexion</button>
        </div>
      </aside>
      <section className="main-panel">
        <header className="topbar"><span>Officine / <strong>{user.name}</strong></span><span className="status-dot">Connecté</span></header>
        <Routes>
          {user.role === "admin" && <Route path="/" element={<DashboardPage />} />}
          <Route path="/stock" element={<InventoryPage isAdmin={user.role === "admin"} />} />
          <Route path="/sales/new" element={<PointOfSalePage />} />
          <Route path="*" element={<Navigate to={user.role === "admin" ? "/" : "/stock"} replace />} />
        </Routes>
      </section>
    </div>
  );
}

export function ProtectedApp() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<{ user: User }>("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
    navigate("/login");
  }

  if (loading) return <div className="loading-screen">Chargement de votre espace…</div>;
  if (!user) {
    return <Routes><Route path="/login" element={<LoginPage onLogin={setUser} />} /><Route path="*" element={<Navigate to="/login" replace />} /></Routes>;
  }
  if (window.location.pathname === "/login") return <Navigate to={user.role === "admin" ? "/" : "/stock"} replace />;
  return <Shell user={user} onLogout={logout} />;
}
