import { useEffect, useState } from "react";
import { AlertCircle, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { api } from "../../api/client";
import type { Medicine } from "../../types";

const money = (cents: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

export function InventoryPage({ isAdmin }: { isAdmin: boolean }) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", barcode: "", purchasePrice: "", sellingPrice: "", stock: "", threshold: "10", expiryDate: "", location: "" });

  async function loadMedicines() {
    try {
      const { data } = await api.get<{ items: Medicine[] }>("/medicines", { params: { search } });
      setMedicines(data.items);
      setError("");
    } catch {
      setError("Impossible de charger l'inventaire.");
    }
  }

  useEffect(() => { void loadMedicines(); }, [search]);

  async function addMedicine(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        barcode: form.barcode || undefined,
        purchasePriceCents: Math.round(Number(form.purchasePrice) * 100),
        sellingPriceCents: Math.round(Number(form.sellingPrice) * 100),
        stock: Number(form.stock),
        lowStockThreshold: Number(form.threshold),
        expiryDate: form.expiryDate || undefined,
        location: form.location || undefined,
      };
      if (editingId) await api.patch(`/medicines/${editingId}`, payload);
      else await api.post("/medicines", payload);
      setForm({ name: "", barcode: "", purchasePrice: "", sellingPrice: "", stock: "", threshold: "10", expiryDate: "", location: "" });
      setEditingId(null);
      setShowForm(false);
      await loadMedicines();
    } catch {
      setError("Enregistrement impossible. Vérifiez les champs ou le code-barres.");
    } finally {
      setSaving(false);
    }
  }

  function editMedicine(medicine: Medicine) {
    setEditingId(medicine._id);
    setForm({
      name: medicine.name,
      barcode: medicine.barcode ?? "",
      purchasePrice: "",
      sellingPrice: (medicine.sellingPriceCents / 100).toFixed(2),
      stock: String(medicine.stock),
      threshold: String(medicine.lowStockThreshold),
      expiryDate: medicine.expiryDate ? medicine.expiryDate.slice(0, 10) : "",
      location: medicine.location ?? "",
    });
    setShowForm(true);
  }

  async function archiveMedicine(medicine: Medicine) {
    if (!window.confirm(`Archiver « ${medicine.name} » ?`)) return;
    try {
      await api.delete(`/medicines/${medicine._id}`);
      await loadMedicines();
    } catch {
      setError("Impossible d'archiver ce médicament.");
    }
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", barcode: "", purchasePrice: "", sellingPrice: "", stock: "", threshold: "10", expiryDate: "", location: "" });
  }

  return (
    <main className="page-content">
      <div className="page-heading"><div><p className="eyebrow">CATALOGUE & APPROVISIONNEMENT</p><h1>Gestion du stock</h1><p className="muted">Consultez les quantités et repérez rapidement les seuils bas.</p></div><button className="primary-button" onClick={() => { closeForm(); setShowForm(true); }}><Plus size={18} /> Ajouter un produit</button></div>
      <section className="inventory-toolbar"><div className="search-field"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un produit ou scanner un code-barres…" /></div><span className="result-count">{medicines.length} produit{medicines.length === 1 ? "" : "s"}</span></section>
      {error && <p className="inline-error"><AlertCircle size={17} />{error}</p>}
      <section className="table-card">
        <div className="table-wrap"><table><thead><tr><th>PRODUIT</th><th>CODE-BARRES</th><th>EMPLACEMENT</th><th>STOCK</th><th>PRIX DE VENTE</th><th>PÉREMPTION</th><th>ACTIONS</th></tr></thead><tbody>
          {medicines.map((medicine) => {
            const lowStock = medicine.stock <= medicine.lowStockThreshold;
            const expired = medicine.expiryDate && new Date(medicine.expiryDate) < new Date();
            return <tr key={medicine._id}><td><strong className="medicine-name">{medicine.name}</strong>{medicine.category && <span className="medicine-category">{medicine.category}</span>}</td><td className="mono">{medicine.barcode || "—"}</td><td>{medicine.location || "—"}</td><td><span className={`stock-badge ${lowStock ? "low" : "normal"}`}><span />{medicine.stock} {lowStock && "· Stock bas"}</span></td><td className="price-cell">{money(medicine.sellingPriceCents)}</td><td className={expired ? "expired-text" : ""}>{medicine.expiryDate ? new Intl.DateTimeFormat("fr-FR").format(new Date(medicine.expiryDate)) : "—"}</td><td><div className="row-actions"><button className="icon-button" aria-label={`Modifier ${medicine.name}`} onClick={() => editMedicine(medicine)}><Pencil size={15} /></button>{isAdmin && <button className="icon-button danger-icon" aria-label={`Archiver ${medicine.name}`} onClick={() => void archiveMedicine(medicine)}><Trash2 size={15} /></button>}</div></td></tr>;
          })}
        </tbody></table>
        {!medicines.length && <div className="empty-state"><Search size={25} /><p>{search ? "Aucun produit ne correspond à cette recherche." : "Votre inventaire est vide. Ajoutez votre premier produit."}</p></div>}</div>
      </section>
      {showForm && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}><section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="medicine-form-title"><div className="modal-heading"><div><p className="eyebrow">{editingId ? "MISE À JOUR DU CATALOGUE" : "NOUVELLE RÉFÉRENCE"}</p><h2 id="medicine-form-title">{editingId ? "Modifier un produit" : "Ajouter un produit"}</h2></div><button className="icon-button" aria-label="Fermer" onClick={closeForm}><X size={20} /></button></div><form onSubmit={addMedicine}><div className="form-grid"><label className="form-span">Nom du médicament<input required maxLength={160} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Code-barres<input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} /></label><label>Emplacement<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Ex. Rayon A3" /></label>{!editingId && <label>Prix d'achat (€)<input required type="number" min="0" step="0.01" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} /></label>}<label>Prix de vente (€)<input required type="number" min="0" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} /></label><label>Quantité<input required type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></label><label>Seuil d'alerte<input required type="number" min="0" step="1" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} /></label><label className="form-span">Date de péremption<input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></label></div>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={closeForm}>Annuler</button><button className="primary-button" disabled={saving}>{saving ? "Enregistrement…" : editingId ? "Enregistrer les modifications" : "Enregistrer le produit"}</button></div></form></section></div>}
    </main>
  );
}
