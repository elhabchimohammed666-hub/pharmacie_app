import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, Minus, Plus, Printer, Search, ShoppingCart, Trash2 } from "lucide-react";
import { api } from "../../api/client";
import type { Medicine } from "../../types";

type CartLine = { medicine: Medicine; quantity: number };
type Receipt = {
  saleNumber: string;
  createdAt: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  amountPaidCents: number;
  changeCents: number;
  items: Array<{ name: string; quantity: number; unitPriceCents: number; lineTotalCents: number }>;
};
const money = (cents: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

export function PointOfSalePage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Medicine[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [discount, setDiscount] = useState("0");
  const [paid, setPaid] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    api.get<{ items: Medicine[] }>("/medicines", { params: { search: query, limit: 30 } })
      .then(({ data }) => setProducts(data.items))
      .catch(() => setError("Impossible de charger le catalogue."));
  }, [query]);

  const subtotalCents = useMemo(
    () => cart.reduce((sum, line) => sum + line.medicine.sellingPriceCents * line.quantity, 0),
    [cart]
  );
  const discountCents = Math.max(0, Math.round((Number(discount) || 0) * 100));
  const totalCents = Math.max(0, subtotalCents - discountCents);

  function addToCart(medicine: Medicine) {
    if (medicine.stock < 1) return;
    setReceipt(null);
    setCart((current) => {
      const line = current.find((item) => item.medicine._id === medicine._id);
      if (line) {
        return current.map((item) => item.medicine._id === medicine._id
          ? { ...item, quantity: Math.min(item.quantity + 1, medicine.stock) }
          : item);
      }
      return [...current, { medicine, quantity: 1 }];
    });
  }

  function changeQuantity(id: string, quantity: number) {
    setCart((current) => quantity < 1
      ? current.filter((line) => line.medicine._id !== id)
      : current.map((line) => line.medicine._id === id
        ? { ...line, quantity: Math.min(quantity, line.medicine.stock) }
        : line));
  }

  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const amountPaidCents = Math.round((Number(paid) || 0) * 100);
    if (!cart.length || discountCents > subtotalCents || amountPaidCents < totalCents) {
      setError("Vérifiez les articles, la remise et le montant reçu.");
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.post<{ sale: Receipt }>("/sales", {
        items: cart.map(({ medicine, quantity }) => ({ medicineId: medicine._id, quantity })),
        discountCents,
        amountPaidCents,
        paymentMethod: "cash",
      });
      setReceipt(data.sale);
      setCart([]);
      setDiscount("0");
      setPaid("");
      try {
        const { data: inventory } = await api.get<{ items: Medicine[] }>("/medicines", { params: { search: query, limit: 30 } });
        setProducts(inventory.items);
      } catch {
        setError("Vente enregistrée, mais l'inventaire n'a pas pu être actualisé.");
      }
    } catch {
      setError("Vente non enregistrée. Vérifiez le stock disponible puis réessayez.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page-content pos-page">
      <div className="page-heading"><div><p className="eyebrow">ENCAISSEMENT</p><h1>Point de vente</h1><p className="muted">Recherchez les produits et composez le panier.</p></div></div>
      <div className="pos-layout">
        <section className="pos-catalog">
          <div className="search-field pos-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom du médicament ou code-barres…" /></div>
          {error && <p className="inline-error">{error}</p>}
          <div className="pos-product-grid">
            {products.map((product) => <button key={product._id} className="pos-product" disabled={product.stock < 1} onClick={() => addToCart(product)}><span className="pos-product-top"><span className="product-pill">{product.category || "Médicament"}</span><Plus size={17} /></span><strong>{product.name}</strong><span className="pos-product-bottom"><span>{product.stock} en stock</span><b>{money(product.sellingPriceCents)}</b></span></button>)}
            {!products.length && <div className="empty-state pos-empty"><ShoppingCart size={25} /><p>Aucun produit trouvé.</p></div>}
          </div>
        </section>
        <form className="cart-panel" onSubmit={checkout}>
          <div className="cart-title"><div><h2>Panier</h2><p className="muted">{cart.length} référence{cart.length === 1 ? "" : "s"}</p></div><ShoppingCart size={20} /></div>
          <div className="cart-lines">
            {!cart.length && <div className="empty-state"><ShoppingCart size={24} /><p>Le panier est vide.</p></div>}
            {cart.map(({ medicine, quantity }) => <div className="cart-line" key={medicine._id}><div className="cart-line-name"><strong>{medicine.name}</strong><span>{money(medicine.sellingPriceCents)} / unité</span></div><div className="quantity-control"><button type="button" aria-label="Retirer une unité" onClick={() => changeQuantity(medicine._id, quantity - 1)}><Minus size={13} /></button><span>{quantity}</span><button type="button" aria-label="Ajouter une unité" onClick={() => changeQuantity(medicine._id, quantity + 1)}><Plus size={13} /></button></div><strong className="line-total">{money(medicine.sellingPriceCents * quantity)}</strong><button type="button" className="remove-line" aria-label="Retirer l'article" onClick={() => changeQuantity(medicine._id, 0)}><Trash2 size={15} /></button></div>)}
          </div>
          <div className="cart-summary">
            <div><span>Sous-total</span><strong>{money(subtotalCents)}</strong></div>
            <label><span>Remise (€)</span><input type="number" min="0" max={subtotalCents / 100} step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} /></label>
            <div className="cart-total"><span>Total à payer</span><strong>{money(totalCents)}</strong></div>
            <label><span>Montant reçu (€)</span><input required type="number" min={totalCents / 100} step="0.01" value={paid} onChange={(event) => setPaid(event.target.value)} placeholder="0,00" /></label>
            <div><span>Monnaie à rendre</span><strong>{money(Math.max(0, (Number(paid) || 0) * 100 - totalCents))}</strong></div>
            <button type="submit" className="primary-button checkout-button" disabled={saving || !cart.length}><Check size={17} />{saving ? "Encaissement…" : "Encaisser la vente"}</button>
          </div>
          {receipt && <>
            <div className="receipt-notice"><div><strong>Vente enregistrée</strong><span>N° {receipt.saleNumber.slice(0, 12)}</span></div><button type="button" className="secondary-button" onClick={() => window.print()}><Printer size={15} /> Ticket</button></div>
            <section className="receipt-print"><h2>Pharmacie · Ticket de caisse</h2><p>Vente n° {receipt.saleNumber}</p><p>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(receipt.createdAt))}</p><hr />{receipt.items.map((item, index) => <div className="receipt-row" key={`${item.name}-${index}`}><span>{item.name} × {item.quantity}</span><span>{money(item.lineTotalCents)}</span></div>)}<hr /><div className="receipt-row"><span>Sous-total</span><span>{money(receipt.subtotalCents)}</span></div><div className="receipt-row"><span>Remise</span><span>-{money(receipt.discountCents)}</span></div><div className="receipt-row"><strong>Total</strong><strong>{money(receipt.totalCents)}</strong></div><div className="receipt-row"><span>Reçu</span><span>{money(receipt.amountPaidCents)}</span></div><div className="receipt-row"><span>Monnaie rendue</span><span>{money(receipt.changeCents)}</span></div><p className="receipt-thanks">Merci de votre visite</p></section>
          </>}
        </form>
      </div>
    </main>
  );
}
