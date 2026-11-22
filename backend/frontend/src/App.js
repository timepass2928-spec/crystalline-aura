import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

const COL = "products";
const MAX_CHARS = 700000;
const emptyForm = { title: "", category: "CLOTHES", subLabel: "", details: "", imageUrl: "", productUrl: "" };

function compressFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image."));
      img.onload = () => {
        const max = 850;
        let w = img.width;
        let h = img.height;
        if (w > max || h > max) {
          if (w >= h) { h = Math.round((h * max) / w); w = max; }
          else { w = Math.round((w * max) / h); h = max; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        let q = 0.78;
        let out = canvas.toDataURL("image/jpeg", q);
        while (out.length > MAX_CHARS && q > 0.35) {
          q -= 0.1;
          out = canvas.toDataURL("image/jpeg", q);
        }
        if (out.length > MAX_CHARS) reject(new Error("Photo too large. Pick a smaller one."));
        else resolve(out);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

const css = {
  page: { minHeight: "100vh", background: "#faf8f5", color: "#1c1917", fontFamily: "system-ui, sans-serif", padding: "16px", boxSizing: "border-box" },
  wrap: { maxWidth: "820px", margin: "0 auto", width: "100%", boxSizing: "border-box" },
  row: { display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" },
  between: { display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" },
  primary: { background: "#1c1917", color: "#fff", border: "none", borderRadius: "999px", padding: "10px 16px", fontSize: "14px", fontWeight: 600, cursor: "pointer", boxSizing: "border-box" },
  secondary: { background: "#fff", color: "#1c1917", border: "1px solid #d6d3d1", borderRadius: "999px", padding: "10px 16px", fontSize: "14px", cursor: "pointer", boxSizing: "border-box" },
  card: { background: "#fff", border: "1px solid #e7e5e4", borderRadius: "16px", padding: "16px", marginBottom: "16px", width: "100%", boxSizing: "border-box", overflow: "hidden" },
  stack: { display: "flex", flexDirection: "column", gap: "12px", width: "100%", boxSizing: "border-box" },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "10px", width: "100%" },
  field: { display: "block", width: "100%", maxWidth: "100%", minWidth: 0, padding: "10px 12px", borderRadius: "10px", border: "1px solid #d6d3d1", background: "#fff", color: "#1c1917", fontSize: "14px", boxSizing: "border-box" },
  area: { display: "block", width: "100%", maxWidth: "100%", minWidth: 0, minHeight: "72px", padding: "10px 12px", borderRadius: "10px", border: "1px solid #d6d3d1", background: "#fff", color: "#1c1917", fontSize: "14px", resize: "vertical", boxSizing: "border-box" },
  uploadBox: { display: "flex", flexDirection: "column", gap: "8px", padding: "12px", borderRadius: "10px", border: "1px dashed #a8a29e", background: "#fafaf9", width: "100%", boxSizing: "border-box" },
  preview: { width: "100%", maxWidth: "200px", borderRadius: "10px", objectFit: "cover" },
  stats: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px", marginBottom: "16px" },
  stat: { background: "#fff", border: "1px solid #e7e5e4", borderRadius: "14px", padding: "12px", minWidth: 0, boxSizing: "border-box" },
  cards: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" },
  itemCard: { background: "#fff", border: "1px solid #e7e5e4", borderRadius: "14px", padding: "12px", minWidth: 0, boxSizing: "border-box" },
  thumb: { width: "100%", height: "180px", objectFit: "cover", borderRadius: "10px", marginBottom: "10px", background: "#f5f5f4" },
};

export default function App() {
  const [products, setProducts] = useState([]);
  const [view, setView] = useState("boutique");
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("ALL");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [busyImg, setBusyImg] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const q = query(collection(db, COL), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), () => notify("Could not load items."));
  }, []);

  function notify(text) {
    setMsg(text);
    setTimeout(() => setMsg((prev) => (prev === text ? "" : prev)), 3000);
  }

  function onLogin(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setUserEmail(email.trim());
    setView("atelier");
  }

  function startAdd() {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEdit(item) {
    setEditId(item.id);
    setForm({ title: item.title || "", category: item.category || "CLOTHES", subLabel: item.subLabel || "", details: item.details || "", imageUrl: item.imageUrl || "", productUrl: item.productUrl || "" });
    setShowForm(true);
  }

  async function onPickFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusyImg(true);
    try {
      const dataUrl = await compressFile(file);
      setForm((prev) => ({ ...prev, imageUrl: dataUrl }));
      notify("Photo ready.");
    } catch (err) {
      notify(err.message || "Photo error.");
    } finally {
      setBusyImg(false);
    }
  }

  async function onSave(e) {
    e.preventDefault();
    if (!form.title.trim()) return notify("Enter a product title.");
    if (busyImg) return notify("Wait for photo processing.");
    setSaving(true);
    try {
      const data = { title: form.title.trim(), category: form.category, subLabel: form.subLabel.trim(), details: form.details.trim(), imageUrl: form.imageUrl.trim(), productUrl: form.productUrl.trim() };
      if (editId) {
        await updateDoc(doc(db, COL, editId), data);
        notify("Updated.");
      } else {
        await addDoc(collection(db, COL), { ...data, createdAt: Date.now() });
        notify("Added.");
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
    } catch {
      notify("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    try {
      await deleteDoc(doc(db, COL, id));
      notify("Deleted.");
    } catch {
      notify("Delete failed.");
    }
  }

  const visible = products.filter((p) => {
    const okCat = cat === "ALL" || p.category === cat;
    const s = search.trim().toLowerCase();
    const okSearch = !s || (p.title || "").toLowerCase().includes(s) || (p.subLabel || "").toLowerCase().includes(s);
    return okCat && okSearch;
  });

  return (
    <div style={css.page}>
      <div style={css.wrap}>
        {msg && <div style={{ ...css.card, background: "#ecfdf5", padding: "10px 14px" }}>{msg}</div>}

        <div style={css.between}>
          <strong>CRYSTALLINE AURA</strong>
          <div style={css.row}>
            <button type="button" style={css.secondary} onClick={() => setView("boutique")}>Boutique</button>
            <button type="button" style={css.primary} onClick={() => setView(userEmail ? "atelier" : "login")}>
              {userEmail ? "Atelier" : "Atelier Login"}
            </button>
          </div>
        </div>

        {view === "boutique" && (
          <>
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "13px", color: "#57534e", marginBottom: "10px" }}>{visible.length} curated finds</div>
              <div style={{ ...css.row, marginBottom: "10px" }}>
                {["ALL", "CLOTHES", "JEWELLERY"].map((c) => (
                  <button key={c} type="button" style={cat === c ? css.primary : css.secondary} onClick={() => setCat(c)}>{c}</button>
                ))}
              </div>
              <input type="text" placeholder="Search pieces..." value={search} onChange={(e) => setSearch(e.target.value)} style={css.field} />
            </div>

            {visible.length === 0 ? (
              <div style={{ ...css.card, textAlign: "center", padding: "24px" }}>
                <p style={{ margin: "0 0 12px 0", color: "#57534e" }}>No pieces found.</p>
                <button type="button" style={css.primary} onClick={() => setView("login")}>Open Atelier</button>
              </div>
            ) : (
              <div style={css.cards}>
                {visible.map((item) => (
                  <div key={item.id} style={css.itemCard}>
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.title} style={css.thumb} /> : <div style={{ ...css.thumb, display: "flex", alignItems: "center", justifyContent: "center", color: "#78716c", fontSize: "12px" }}>No image</div>}
                    <div style={{ fontSize: "11px", color: "#78716c" }}>{item.category} {item.subLabel ? `• ${item.subLabel}` : ""}</div>
                    <div style={{ fontWeight: 600, margin: "4px 0" }}>{item.title}</div>
                    {item.details && <div style={{ fontSize: "13px", color: "#57534e", marginBottom: "8px" }}>{item.details}</div>}
                    {item.productUrl && <a href={item.productUrl} target="_blank" rel="noreferrer" style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>View Link</a>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === "login" && (
          <form onSubmit={onLogin} style={css.card}>
            <h2 style={{ marginTop: 0, marginBottom: "12px", fontSize: "19px" }}>The Atelier</h2>
            <div style={css.stack}>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={css.field} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={css.field} />
              <button type="submit" style={css.primary}>Sign In</button>
            </div>
          </form>
        )}

        {view === "atelier" && (
          <>
            <div style={css.card}>
              <div style={{ ...css.between, marginBottom: 0 }}>
                <div>
                  <h2 style={{ margin: "0 0 4px 0", fontSize: "19px" }}>ATELIER MANAGER</h2>
                  <div style={{ fontSize: "13px", color: "#57534e", wordBreak: "break-all" }}>{userEmail}</div>
                </div>
                <div style={css.row}>
                  <button type="button" style={css.secondary} onClick={() => setView("boutique")}>Boutique</button>
                  <button type="button" style={css.secondary} onClick={() => { setUserEmail(""); setShowForm(false); setView("boutique"); }}>Logout</button>
                </div>
              </div>
            </div>

            <div style={css.stats}>
              <div style={css.stat}><div style={{ fontSize: "20px", fontWeight: 700 }}>{products.length}</div><div style={{ fontSize: "11px", color: "#78716c" }}>TOTAL</div></div>
              <div style={css.stat}><div style={{ fontSize: "20px", fontWeight: 700 }}>{products.filter((p) => p.category === "CLOTHES").length}</div><div style={{ fontSize: "11px", color: "#78716c" }}>CLOTHES</div></div>
              <div style={css.stat}><div style={{ fontSize: "20px", fontWeight: 700 }}>{products.filter((p) => p.category === "JEWELLERY").length}</div><div style={{ fontSize: "11px", color: "#78716c" }}>JEWELLERY</div></div>
            </div>

            <div style={css.between}>
              <h3 style={{ margin: 0, fontSize: "17px" }}>Collection</h3>
              <button type="button" style={css.primary} onClick={startAdd}>+ ADD PRODUCT</button>
            </div>

            {showForm && (
              <form onSubmit={onSave} style={css.card}>
                <h4 style={{ marginTop: 0, marginBottom: "12px" }}>{editId ? "Edit Product" : "Add Product"}</h4>
                <div style={css.stack}>
                  <input type="text" placeholder="Product title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={css.field} />
                  <div style={css.grid2}>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={css.field}>
                      <option value="CLOTHES">CLOTHES</option>
                      <option value="JEWELLERY">JEWELLERY</option>
                    </select>
                    <input type="text" placeholder="Sub-label (optional)" value={form.subLabel} onChange={(e) => setForm({ ...form, subLabel: e.target.value })} style={css.field} />
                  </div>
                  <textarea placeholder="Details (optional)" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} style={css.area} />

                  <div style={css.uploadBox}>
                    <label style={{ fontSize: "13px", fontWeight: 600 }}>Upload File / Photo</label>
                    <input type="file" accept="image/*" onChange={onPickFile} style={{ width: "100%", maxWidth: "100%", fontSize: "13px" }} />
                    {busyImg && <div style={{ fontSize: "12px", color: "#57534e" }}>Processing...</div>}
                    {form.imageUrl && (
                      <div style={css.stack}>
                        <img src={form.imageUrl} alt="Preview" style={css.preview} />
                        <button type="button" style={{ ...css.secondary, alignSelf: "flex-start", padding: "6px 12px", fontSize: "12px" }} onClick={() => setForm({ ...form, imageUrl: "" })}>Remove Photo</button>
                      </div>
                    )}
                  </div>

                  <input type="text" placeholder="Product link (optional)" value={form.productUrl} onChange={(e) => setForm({ ...form, productUrl: e.target.value })} style={css.field} />
                  <div style={{ ...css.row, justifyContent: "flex-end" }}>
                    <button type="button" style={css.secondary} onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }}>Cancel</button>
                    <button type="submit" style={css.primary} disabled={saving || busyImg}>{saving ? "Saving..." : "Save"}</button>
                  </div>
                </div>
              </form>
            )}

            <div style={css.cards}>
              {products.map((item) => (
                <div key={item.id} style={css.itemCard}>
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.title} style={css.thumb} /> : <div style={{ ...css.thumb, display: "flex", alignItems: "center", justifyContent: "center", color: "#78716c", fontSize: "12px" }}>No image</div>}
                  <div style={{ fontWeight: 600, marginBottom: "4px" }}>{item.title}</div>
                  <div style={{ fontSize: "12px", color: "#78716c", marginBottom: "10px" }}>{item.category}</div>
                  <div style={css.row}>
                    <button type="button" style={{ ...css.secondary, padding: "6px 12px", fontSize: "12px" }} onClick={() => startEdit(item)}>Edit</button>
                    <button type="button" style={{ ...css.secondary, padding: "6px 12px", fontSize: "12px" }} onClick={() => onDelete(item.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
