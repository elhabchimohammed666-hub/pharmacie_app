import { useEffect, useState } from "react";
import { Activity, AlertTriangle, ArrowUpRight, Boxes, CalendarClock, ShoppingBag } from "lucide-react";
import { api } from "../../api/client";
import type { DashboardSummary } from "../../types";

const money = (cents: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<DashboardSummary>("/dashboard/summary")
      .then(({ data }) => setSummary(data))
      .catch(() => setError("Le tableau de bord n'a pas pu être chargé."));
  }, []);

  if (error) return <main className="page-content"><p className="form-error">{error}</p></main>;
  if (!summary) return <div className="loading-screen">Chargement des statistiques…</div>;

  const cards = [
    { title: "Chiffre d'affaires aujourd'hui", value: money(summary.todayRevenueCents), icon: Activity, tone: "mint", note: "Total encaissé aujourd'hui" },
    { title: "Chiffre d'affaires du mois", value: money(summary.monthRevenueCents), icon: Activity, tone: "blue", note: "Total encaissé ce mois-ci" },
    { title: "Ventes aujourd'hui", value: String(summary.todaySalesCount), icon: ShoppingBag, tone: "blue", note: "Transactions enregistrées" },
    { title: "Stock critique", value: String(summary.lowStockCount), icon: Boxes, tone: "amber", note: "Articles sous le seuil" },
    { title: "Péremption proche", value: String(summary.expiringSoonCount), icon: CalendarClock, tone: "rose", note: "Dans les 90 prochains jours" },
    { title: "Produits périmés", value: String(summary.expiredCount), icon: AlertTriangle, tone: "rose", note: "À retirer de la vente" },
  ];

  return (
    <main className="page-content">
      <div className="page-heading"><div><p className="eyebrow">VOTRE OFFICINE EN UN COUP D'ŒIL</p><h1>Tableau de bord</h1><p className="muted">Suivez l'activité et les indicateurs importants.</p></div><span className="date-chip">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date())}</span></div>
      <section className="stats-grid">
        {cards.map(({ title, value, icon: Icon, tone, note }) => (
          <article className="stat-card" key={title}><div className={`stat-icon ${tone}`}><Icon size={20} /></div><p className="stat-title">{title}</p><p className="stat-value">{value}</p><p className="stat-note">{note}</p></article>
        ))}
      </section>
      <section className="dashboard-lower">
        <article className="panel-card">
          <div className="panel-heading"><div><h2>Produits les plus vendus</h2><p className="muted">Aujourd'hui</p></div><span className="heading-icon"><ArrowUpRight size={18} /></span></div>
          {summary.topProducts.length ? <div className="product-list">{summary.topProducts.map((product, index) => <div className="product-row" key={product._id}><span className="rank">{String(index + 1).padStart(2, "0")}</span><span className="product-name">{product.name}</span><span className="product-quantity">{product.quantity} unités</span></div>)}</div> : <div className="empty-state"><ShoppingBag size={25} /><p>Aucune vente enregistrée aujourd'hui.</p></div>}
        </article>
        <article className="panel-card alert-panel"><div className="panel-heading"><div><h2>À surveiller</h2><p className="muted">Alertes de l'officine</p></div><span className="heading-icon alert"><AlertTriangle size={18} /></span></div><div className="alert-row"><span className="alert-bullet amber-bullet" /><span>Articles en stock critique</span><strong>{summary.lowStockCount}</strong></div><div className="alert-row"><span className="alert-bullet rose-bullet" /><span>Produits bientôt périmés</span><strong>{summary.expiringSoonCount}</strong></div><div className="alert-row"><span className="alert-bullet rose-bullet" /><span>Produits déjà périmés</span><strong>{summary.expiredCount}</strong></div></article>
      </section>
    </main>
  );
}
