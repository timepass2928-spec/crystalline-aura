import React, { useEffect, useState } from "react";
import { Logmark } from "./components/Logo";
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

const PRODUCTS_COLLECTION = "products";
const MAX_STORED_IMAGE_CHARS = 750000;

function readAndCompressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image file."));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSide = 900;
        let { width, height } = img;

        if (width > maxSide || height > maxSide) {
          if (width >= height) {
            height = Math.round((height * maxSide) / width);
            width = maxSide;
          } else {
            width = Math.round((width * maxSide) / height);
            height = maxSide;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.8;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);

        while (dataUrl.length > MAX_STORED_IMAGE_CHARS && quality > 0.35) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        if (dataUrl.length > MAX_STORED_IMAGE_CHARS) {
          reject(new Error("Image is still too large. Please pick a smaller photo."));
          return;
        }

        resolve(dataUrl);
      };
      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#faf8f5",
    color: "#1c1917",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: "16px",
    boxSizing: "border-box",
  },
  container: {
    maxWidth: "820px",
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  },
  topBar: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  btnPrimary: {
    backgroundColor: "#1c1917",
    color: "#ffffff",
    border: "none",
    borderRadius: "999px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    boxSizing: "border-box",
  },
  btnSecondary: {
    backgroundColor: "#ffffff",
    color: "#1c1917",
    border: "1px solid #d6d3d1",
    borderRadius: "999px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e7e5e4",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "18px",
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  formStack: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%",
    boxSizing: "border-box",
  },
  twoColRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
    width: "100%",
    boxSizing: "border-box",
  },
  input: {
    display: "block",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    padding: "11px 12px",
    borderRadius: "10px",
    border: "1px solid #d6d3d1",
    backgroundColor: "#ffffff",
    color: "#1c1917",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  textarea: {
    display: "block",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    minHeight: "76px",
    padding: "11px 12px",
    borderRadius: "10px",
    border: "1px solid #d6d3d1",
    backgroundColor: "#ffffff",
    color: "#1c1917",
    fontSize: "14px",
    resize: "vertical",
    boxSizing: "border-box",
  },
  fileBox: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px dashed #a8a29e",
    backgroundColor: "#fafaf9",
    width: "100%",
    boxSizing: "border-box",
  },
  previewImg: {
    width: "100%",
    maxWidth: "220px",
    height: "auto",
    borderRadius: "10px",
    objectFit: "cover",
    border: "1px solid #e7e5e4",
  },
  formActions: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "6px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px",
    marginBottom: "18px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e7e5e4",
    borderRadius: "14px",
    padding: "12px",
    minWidth: 0,
    boxSizing: "border-box",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "14px",
  },
  productCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e7e5e4",
    borderRadius: "14px",
    padding: "12px",
    minWidth: 0,
    boxSizing: "border-box",
  },
  productImg: {
    width: "100%",
    height: "190px",
    objectFit: "cover",
    borderRadius: "10px",
    marginBottom: "10px",
    backgroundColor: "#f5f5f4",
  },
};

const emptyForm = {
  title: "",
  category: "CLOTHES",
  subLabel: "",
  details: "",
  imageUrl: "",
  productUrl: "",
};

export default function App() {
  const [products, setProducts] = useState([]);
  const [view, setView] = useState("boutique");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts(items);
      },
      (err) => {
        console.error(err);
        setToast("Could not load products.");
      }
    );
    return () => unsubscribe();
  }, []);

  function showMessage(msg) {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? "" : prev));
    }, 3500);
  }

  function handleLogin(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoggedInEmail(email.trim());
    setView("atelier");
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(item) {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      category: item.category || "CLOTHES",
      subLabel: item.subLabel || "",
      details: item.details || "",
      imageUrl: item.imageUrl || "",
      productUrl: item.productUrl || "",
    });
    setShowForm(true);
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const compressedDataUrl = await readAndCompressImage(file);
      setForm((prev) => ({ ...prev, imageUrl: compressedDataUrl }));
      showMessage("Photo attached.");
    } catch (err) {
      console.error(err);
      showMessage(err.message || "Could not attach photo.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSaveProduct(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      showMessage("Please enter a product title.");
      return;
    }
    if (uploadingImage) {
      showMessage("Please wait for the photo to finish processing.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        subLabel: form.subLabel.trim(),
        details: form.details.trim(),
        imageUrl: form.imageUrl.trim(),
        productUrl: form.productUrl.trim(),
      };

      if (editingId) {
        await updateDoc(doc(db, PRODUCTS_COLLECTION, editingId), payload);
        showMessage("Product updated.");
      } else {
        await addDoc(collection(db, PRODUCTS_COLLECTION), {
          ...payload,
          createdAt: Date.now(),
        });
        showMessage("Product added to collection.");
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      showMessage("Failed to save product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
      showMessage("Product deleted.");
    } catch (err) {
      console.error(err);
      showMessage("Could not delete product.");
    }
  }

  const filteredProducts = products.filter((item) => {
    const matchesCategory = category === "ALL" || item.category === category;
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      (item.title || "").toLowerCase().includes(term) ||
      (item.subLabel || "").toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  const clothesCount = products.filter((p) => p.category === "CLOTHES").length;
  const jewelleryCount = products.filter((p) => p.category === "JEWELLERY").length;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {toast && (
          <div style={{ ...styles.card, backgroundColor: "#ecfdf5", borderColor: "#a7f3d0", padding: "10px 14px" }}>
            {toast}
          </div>
        )}

        <div style={styles.topBar}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {Logmark ? <Logmark /> : null}
            <strong>CRYSTALLINE AURA</strong>
          </div>

          <div style={styles.buttonRow}>
            <button type="button" style={styles.btnSecondary} onClick={() => setView("boutique")}>
              Boutique
            </button>
            <button
              type="button"
              style={styles.btnPrimary}
              onClick={() => setView(loggedInEmail ? "atelier" : "login")}
            >
              {loggedInEmail ? "Atelier" : "Atelier Login"}
            </button>
          </div>
        </div>

        {view === "boutique" && (
          <>
            <div style={{ marginBottom: "16px" }}>
              <p style={{ margin: "0 0 10px 0", color: "#57534e", fontSize: "14px" }}>
                {filteredProducts.length} curated finds
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                {["ALL", "CLOTHES", "JEWELLERY"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    style={category === cat ? styles.btnPrimary : styles.btnSecondary}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Search pieces..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.input}
              />
            </div>

            {filteredProducts.length === 0 ? (
              <div style={{ ...styles.card, textAlign: "center", padding: "28px 16px" }}>
                <p style={{ margin: "0 0 12px 0", color: "#57534e" }}>No pieces found.</p>
                <button type="button" style={styles.btnPrimary} onClick={() => setView("login")}>
                  Open Atelier
                </button>
              </div>
            ) : (
              <div style={styles.productGrid}>
                {filteredProducts.map((item) => (
                  <div key={item.id} style={styles.productCard}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} style={styles.productImg} />
                    ) : (
                      <div
                        style={{
                          ...styles.productImg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#78716c",
                          fontSize: "13px",
                        }}
                      >
                        No image provided
                      </div>
                    )}
                    <div style={{ fontSize: "11px", color: "#78716c", marginBottom: "4px" }}>
                      {item.category} {item.subLabel ? `• ${item.subLabel}` : ""}
                    </div>
                    <div style={{ fontWeight: 600, marginBottom: "6px" }}>{item.title}</div>
                    {item.details && (
                      <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#57534e" }}>
                        {item.details}
                      </p>
                    )}
                    {item.productUrl && (
                      <a
                        href={item.productUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: "13px", color: "#1c1917", fontWeight: 600 }}
                      >
                        View Link
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === "login" && (
          <form onSubmit={handleLogin} style={styles.card}>
            <h2 style={{ marginTop: 0, marginBottom: "14px", fontSize: "20px" }}>The Atelier</h2>
            <div style={styles.formStack}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
              <button type="submit" style={styles.btnPrimary}>
                Sign In
              </button>
            </div>
          </form>
        )}

        {view === "atelier" && (
          <>
            <div style={styles.card}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "10px" }}>
                <div>
                  <h2 style={{ margin: "0 0 4px 0", fontSize: "20px" }}>ATELIER MANAGER</h2>
                  <div style={{ fontSize: "13px", color: "#57534e", wordBreak: "break-all" }}>
                    {loggedInEmail}
                  </div>
                </div>
                <div style={styles.buttonRow}>
                  <button type="button" style={styles.btnSecondary} onClick={() => setView("boutique")}>
                    View Boutique
                  </button>
                  <button
                    type="button"
                    style={styles.btnSecondary}
                    onClick={() => {
                      setLoggedInEmail("");
                      setShowForm(false);
                      setView("boutique");
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={{ fontSize: "20px", fontWeight: 700 }}>{products.length}</div>
                <div style={{ fontSize: "11px", color: "#78716c" }}>TOTAL ITEMS</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: "20px", fontWeight: 700 }}>{clothesCount}</div>
                <div style={{ fontSize: "11px", color: "#78716c" }}>CLOTHES</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: "20px", fontWeight: 700 }}>{jewelleryCount}</div>
                <div style={{ fontSize: "11px", color: "#78716c" }}>JEWELLERY</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "18px" }}>Collection</h3>
              <button type="button" style={styles.btnPrimary} onClick={openAddForm}>
                + ADD PRODUCT
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSaveProduct} style={styles.card}>
                <h4 style={{ marginTop: 0, marginBottom: "12px", fontSize: "16px" }}>
                  {editingId ? "Edit Product" : "Add New Product"}
                </h4>

                <div style={styles.formStack}>
                  <input
                    type="text"
                    placeholder="Product title (e.g., 18k Gold Vermeil Hoop Earrings)"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    style={styles.input}
                  />

                  <div style={styles.twoColRow}>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                      style={styles.input}
                    >
                      <option value="CLOTHES">CLOTHES</option>
                      <option value="JEWELLERY">JEWELLERY</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Sub-label (e.g., BLACK HIGH RISE)"
                      value={form.subLabel}
                      onChange={(e) => setForm((prev) => ({ ...prev, subLabel: e.target.value }))}
                      style={styles.input}
                    />
                  </div>

                  <textarea
                    placeholder="Size / fit / material details (optional)"
                    value={form.details}
                    onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
                    style={styles.textarea}
                  />

                  <div style={styles.fileBox}>
                    <label style={{ fontSize: "13px", fontWeight: 600 }}>
                      Upload Photo from Device
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ width: "100%", maxWidth: "100%", fontSize: "13px" }}
                    />
                    {uploadingImage && (
                      <div style={{ fontSize: "12px", color: "#57534e" }}>Processing photo...</div>
                    )}
                    {form.imageUrl && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <img src={form.imageUrl} alt="Preview" style={styles.previewImg} />
                        <button
                          type="button"
                          style={{ ...styles.btnSecondary, alignSelf: "flex-start", padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                        >
                          Remove Photo
                        </button>
                      </div>
                    )}
                  </div>

                  <input
                    type="text
