import { useState, type FormEvent } from "react";
import { Activity } from "lucide-react";
import { api } from "../../api/client";
import type { User } from "../../types";

export function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post<{ user: User }>("/auth/login", { email, password });
      onLogin(data.user);
    } catch {
      setError("Connexion impossible. Vérifiez vos identifiants et réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-brand"><span className="brand-icon"><Activity size={21} /></span><span>Pharma<span className="brand-light">Gestion</span></span></div>
        <h1>Bon retour</h1>
        <p className="muted">Connectez-vous à votre espace officine.</p>
        <label>Adresse e-mail<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nom@pharmacie.fr" /></label>
        <label>Mot de passe<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Votre mot de passe" /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button login-submit" disabled={busy}>{busy ? "Connexion…" : "Se connecter"}</button>
      </form>
    </main>
  );
}
