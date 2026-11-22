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

const PRODUCTS_COLLECTION = "products";
const MAX_IMAGE_CHARS = 750000;

const emptyForm = {
  title: "",
  category: "CLOTHES",
  subLabel: "",
  details: "",
  imageUrl: "",
  productUrl: "",
};

function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Please select a valid image file."));
      img.onload = () => {
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

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.8;
        let result = canvas.toDataURL("image/jpeg", quality);

        while (result.length > MAX_IMAGE_CHARS && quality > 0.35) {
          quality -= 0.1;
          result = canvas.toDataURL("image/jpeg", quality);
        }

        if (result.length > MAX_IMAGE_CHARS) {
          reject(new Error("Image is still too large after compression. Try a smaller photo."));
          return;
        }

        resolve(result);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function HexEmblem({ size = 34 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <polygon
        points="24,3 42,13.5 42,34.5 24,45 6,34.5 6,13.5"
        stroke="#C5A267"
        strokeWidth="1.4"
        fill="#FFFDF9"
      />
      <polygon
        points="24,9 36.8,16.5 36.8,31.5 24,39 11.2,31.5 11.2,16.5"
        stroke="#DFC79A"
        strokeWidth="1"
        fill="none"
      />
      <circle cx="24" cy="24" r="5" stroke="#C5A267" strokeWidth="1.2" />
      <circle cx="24" cy="24" r="1.8" fill="#C5A267" />
    </svg>
  );
}

const css = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#FAF7F2",
    color: "#1C1917",
    fontFamily: "Georgia, 'Times New Roman', serif",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: "100vw",
    overflowX: "hidden",
    boxSizing: "border-box",
  },
  sans: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottom: "1px solid #EFECE6",
    padding: "16px 16px 14px",
    width: "100%",
    boxSizing: "border-box",
  },
  headerInner: {
    maxWidth: "960px",
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
  },
  brandTitle: {
    margin: 0,
    fontSize: "17px",
    letterSpacing: "0.22em",
    fontWeight: 500,
    color: "#1C1917",
    textTransform: "uppercase",
  },
  brandSub: {
    margin: "2px 0 0",
    fontSize: "10px",
    letterSpacing: "0.26em",
    color: "#8C8275",
    textTransform: "uppercase",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  searchBarBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E6E1D8",
    borderRadius: "999px",
    padding: "10px 16px",
    marginBottom: "12px",
    width: "100%",
    boxSizing: "border-box",
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    width: "100%",
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    color: "#1C1917",
    fontSize: "14px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    boxSizing: "border-box",
  },
  countText: {
    fontSize: "12px",
    color: "#8C8275",
    whiteSpace: "nowrap",
    flexShrink: 0,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  pillRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    width: "100%",
  },
  pillActive: {
    backgroundColor: "#1F1D1B",
    color: "#FFFFFF",
    border: "1px solid #1F1D1B",
    borderRadius: "999px",
    padding: "8px 18px",
    fontSize: "11px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    boxSizing: "border-box",
  },
  pillIdle: {
    backgroundColor: "#FFFFFF",
    color: "#57534E",
    border: "1px solid #E5E0D5",
    borderRadius: "999px",
    padding: "8px 18px",
    fontSize: "11px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    boxSizing: "border-box",
  },
  ribbon: {
    backgroundColor: "#FBF9F5",
    borderBottom: "1px solid #EFECE6",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    flexWrap: "wrap",
    fontSize: "10px",
    letterSpacing: "0.24em",
    color: "#8C8275",
    textTransform: "uppercase",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  main: {
    flex: 1,
    maxWidth: "960px",
    width: "100%",
    margin: "0 auto",
    padding: "20px 16px 36px",
    boxSizing: "border-box",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "20px",
    width: "100%",
    boxSizing: "border-box",
  },
  productCard: {
    backgroundColor: "transparent",
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
  },
  photoFrame: {
    position: "relative",
    backgroundColor: "#EFECE6",
    borderRadius: "14px",
    overflow: "hidden",
    aspectRatio: "4 / 4.3",
    width: "100%",
    marginBottom: "12px",
    boxSizing: "border-box",
  },
  productImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  catBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    color: "#292524",
    padding: "5px 11px",
    borderRadius: "999px",
    fontSize: "10px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  productTitle: {
    margin: "0 0 10px",
    fontSize: "16px",
    lineHeight: 1.35,
    fontWeight: 400,
    color: "#1C1917",
    wordBreak: "break-word",
  },
  productDetails: {
    margin: "0 0 12px",
    fontSize: "13px",
    lineHeight: 1.5,
    color: "#57534E",
    whiteSpace: "pre-line",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  buyBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: "#FFFFFF",
    color: "#292524",
    border: "1px solid #DFD9CE",
    borderRadius: "999px",
    padding: "10px 20px",
    fontSize: "11px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    textDecoration: "none",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #ECE7DE",
    borderRadius: "18px",
    padding: "18px",
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },
  label: {
    fontSize: "11px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "#78716C",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  input: {
    display: "block",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #E5E0D5",
    backgroundColor: "#FFFFFF",
    color: "#1C1917",
    fontSize: "14px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    display: "block",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    minHeight: "86px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #E5E0D5",
    backgroundColor: "#FFFFFF",
    color: "#1C1917",
    fontSize: "14px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },
  uploadZone: {
    border: "1px dashed #D6CFC2",
    backgroundColor: "#FAF7F2",
    borderRadius: "12px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },
  darkPillBtn: {
    backgroundColor: "#1F1D1B",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "999px",
    padding: "11px 20px",
    fontSize: "11px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    boxSizing: "border-box",
  },
  lightPillBtn: {
    backgroundColor: "#FFFFFF",
    color: "#44403C",
    border: "1px solid #E5E0D5",
    borderRadius: "999px",
    padding: "10px 16px",
    fontSize: "11px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    boxSizing: "border-box",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px",
    marginTop: "16px",
    marginBottom: "22px",
    width: "100%",
    boxSizing: "border-box",
  },
  statBox: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #ECE7DE",
    borderRadius: "14px",
    padding: "14px 10px",
    minWidth: 0,
    boxSizing: "border-box",
  },
  footer: {
    backgroundColor: "#FFFFFF",
    borderTop: "1px solid #EFECE6",
    padding: "28px 16px 22px",
    textAlign: "center",
    width: "100%",
    boxSizing: "border-box",
  },
};

export default function App() {
  const [products, setProducts] = useState([]);
  const [view, setView] = useState("boutique");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [collectionFilter, setCollectionFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState("");

  useEffect(() => {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts(list);
      },
      () => {
        showBanner("Unable to sync products right now.");
      }
    );
    return () => unsub();
  }, []);

  function showBanner(text) {
    setBanner(text);
    setTimeout(() => {
      setBanner((prev) => (prev === text ? "" : prev));
    }, 3200);
  }

  function handleLogin(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setUserEmail(email.trim());
    setView("atelier");
    showBanner("Welcome back to the atelier");
  }

  function handleOpenAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function handleOpenEdit(item) {
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

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const compressed = await compressImageFile(file);
      setForm((prev) => ({ ...prev, imageUrl: compressed }));
      showBanner("Photo attached from device");
    } catch (err) {
      showBanner(err.message || "Could not process image.");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  }

  async function handleSaveProduct(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      showBanner("Please enter a product title.");
      return;
    }
    if (uploadingPhoto) {
      showBanner("Please wait for the photo upload to finish.");
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
        showBanner("Product updated");
      } else {
        await addDoc(collection(db, PRODUCTS_COLLECTION), {
          ...payload,
          createdAt: Date.now(),
        });
        showBanner("Product added to collection");
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch {
      showBanner("Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct(id) {
    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
      showBanner("Product removed");
    } catch {
      showBanner("Could not remove product.");
    }
  }

  const boutiqueProducts = products.filter((item) => {
    const matchesCat = category === "ALL" || item.category === category;
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      (item.title || "").toLowerCase().includes(term) ||
      (item.subLabel || "").toLowerCase().includes(term) ||
      (item.details || "").toLowerCase().includes(term);
    return matchesCat && matchesSearch;
  });

  const atelierProducts = products.filter((item) => {
    const term = collectionFilter.trim().toLowerCase();
    if (!term) return true;
    return (
      (item.title || "").toLowerCase().includes(term) ||
      (item.subLabel || "").toLowerCase().includes(term) ||
      (item.category || "").toLowerCase().includes(term)
    );
  });

  const clothesCount = products.filter((p) => p.category === "CLOTHES").length;
  const jewelleryCount = products.filter((p) => p.category === "JEWELLERY").length;

  return (
    <div style={css.page}>
      {banner && (
        <div
          style={{
            position: "fixed",
            top: "14px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#143326",
            color: "#ECFDF5",
            padding: "10px 18px",
            borderRadius: "999px",
            fontSize: "13px",
            zIndex: 50,
            maxWidth: "90vw",
            textAlign: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
            ...css.sans,
          }}
        >
          ✓ {banner}
        </div>
      )}

      {view === "boutique" && (
        <>
          <header style={css.header}>
            <div style={css.headerInner}>
              <div style={css.brandRow}>
                <HexEmblem size={36} />
                <div>
                  <h1 style={css.brandTitle}>CRYSTALLINE AURA</h1>
                  <p style={css.brandSub}>CURATED ATELIER</p>
                </div>
              </div>

              <div style={css.searchBarBox}>
                <span style={{ color: "#9C9488", fontSize: "15px" }}>⌕</span>
                <input
                  type="text"
                  placeholder="Search dresses, earrings, keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={css.searchInput}
                />
                <span style={css.countText}>
                  {boutiqueProducts.length} {boutiqueProducts.length === 1 ? "curated find" : "curated finds"}
                </span>
              </div>

              <div style={css.pillRow}>
                {["ALL", "CLOTHES", "JEWELLERY"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    style={category === tab ? css.pillActive : css.pillIdle}
                    onClick={() => setCategory(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div style={css.ribbon}>
            <span>18K VERMEIL EARRINGS</span>
            <span style={{ color: "#C5A267" }}>◆</span>
            <span>EVENING COUTURE</span>
          </div>

          <main style={css.main}>
            {boutiqueProducts.length === 0 ? (
              <div style={{ ...css.card, textAlign: "center", padding: "36px 20px" }}>
                <p style={{ margin: "0 0 14px", color: "#57534E", fontSize: "15px" }}>
                  No curated pieces yet.
                </p>
                <button
                  type="button"
                  style={css.darkPillBtn}
                  onClick={() => setView(userEmail ? "atelier" : "login")}
                >
                  Open The Atelier
                </button>
              </div>
            ) : (
              <div style={css.productGrid}>
                {boutiqueProducts.map((item) => (
                  <article key={item.id} style={css.productCard}>
                    <div style={css.photoFrame}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} style={css.productImg} />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#8C8275",
                            fontSize: "12px",
                            ...css.sans,
                          }}
                        >
                          No image provided
                        </div>
                      )}
                      <span style={css.catBadge}>{item.category || "CLOTHES"}</span>
                    </div>

                    <h2 style={css.productTitle}>{item.title}</h2>

                    {item.details && <p style={css.productDetails}>{item.details}</p>}

                    {item.productUrl && (
                      <a
                        href={item.productUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={css.buyBtn}
                      >
                        <span>BUY ON AMAZON</span>
                        <span>↗</span>
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </main>

          <footer style={css.footer}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
              <HexEmblem size={26} />
            </div>
            <div
              style={{
                fontSize: "13px",
                letterSpacing: "0.24em",
                color: "#6B635B",
                marginBottom: "10px",
                textTransform: "uppercase",
              }}
            >
              CRYSTALLINE AURA
            </div>
            <p
              style={{
                margin: "0 auto 18px",
                maxWidth: "460px",
                fontSize: "12px",
                lineHeight: 1.6,
                color: "#8C8275",
                ...css.sans,
              }}
            >
              As an Amazon Associate, Crystalline Aura earns from qualifying purchases.
            </p>
            <div
              style={{
                maxWidth: "960px",
                margin: "0 auto",
                paddingTop: "14px",
                borderTop: "1px solid #F2EFE9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                fontSize: "10px",
                letterSpacing: "0.22em",
                color: "#9C9488",
                textTransform: "uppercase",
                ...css.sans,
              }}
            >
              <span>© 2026 CRYSTALLINE AURA</span>
              <button
                type="button"
                onClick={() => setView(userEmail ? "atelier" : "login")}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "#8C8275",
                  fontSize: "10px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                ATELIER LOGIN
              </button>
            </div>
          </footer>
        </>
      )}

      {view === "login" && (
        <>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderBottom: "1px solid #EFECE6",
              padding: "14px 16px",
            }}
          >
            <div style={{ maxWidth: "480px", margin: "0 auto" }}>
              <button
                type="button"
                onClick={() => setView("boutique")}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "#78716C",
                  fontSize: "11px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  ...css.sans,
                }}
              >
                ← BACK TO BOUTIQUE
              </button>
            </div>
          </div>

          <main style={{ ...css.main, maxWidth: "480px", paddingTop: "36px" }}>
            <div style={{ textAlign: "center", marginBottom: "22px" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
                <HexEmblem size={44} />
              </div>
              <h2 style={{ margin: "0 0 6px", fontSize: "28px", fontWeight: 400 }}>
                The Atelier
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "10px",
                  letterSpacing: "0.24em",
                  color: "#8C8275",
                  textTransform: "uppercase",
                  ...css.sans,
                }}
              >
                PRIVATE MANAGEMENT ACCESS
              </p>
            </div>

            <form onSubmit={handleLogin} style={css.card}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={css.fieldGroup}>
                  <label style={css.label}>EMAIL</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={css.input}
                  />
                </div>

                <div style={css.fieldGroup}>
                  <label style={css.label}>PASSWORD</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={css.input}
                  />
                </div>

                <button
                  type="submit"
                  style={{ ...css.darkPillBtn, width: "100%", padding: "14px 20px" }}
                >
                  🔒 ENTER THE ATELIER
                </button>
              </div>
            </form>
          </main>
        </>
      )}

      {view === "atelier" && (
        <>
          <header style={css.header}>
            <div
              style={{
                ...css.headerInner,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                <HexEmblem size={34} />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "#1C1917",
                    }}
                  >
                    ATELIER MANAGER
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#8C8275",
                      wordBreak: "break-all",
                      ...css.sans,
                    }}
                  >
                    {userEmail}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button type="button" style={css.lightPillBtn} onClick={() => setView("boutique")}>
                  Boutique
                </button>
                <button
                  type="button"
                  style={css.lightPillBtn}
                  onClick={() => {
                    setUserEmail("");
                    setShowForm(false);
                    setEditingId(null);
                    setView("boutique");
                  }}
                >
                  ↪ LOGOUT
                </button>
              </div>
            </div>
          </header>

          <main style={css.main}>
            <div style={css.statsGrid}>
              <div style={css.statBox}>
                <div style={{ fontSize: "24px", color: "#1C1917" }}>{products.length}</div>
                <div style={{ ...css.label, fontSize: "10px", marginTop: "4px" }}>TOTAL ITEMS</div>
              </div>
              <div style={css.statBox}>
                <div style={{ fontSize: "24px", color: "#1C1917" }}>{clothesCount}</div>
                <div style={{ ...css.label, fontSize: "10px", marginTop: "4px" }}>CLOTHES</div>
              </div>
              <div style={css.statBox}>
                <div style={{ fontSize: "24px", color: "#1C1917" }}>{jewelleryCount}</div>
                <div style={{ ...css.label, fontSize: "10px", marginTop: "4px" }}>JEWELLERY</div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "14px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 400 }}>Collection</h2>
              <button type="button" style={css.darkPillBtn} onClick={handleOpenAdd}>
                + ADD PRODUCT
              </button>
            </div>

            {showForm && (
              <form
                onSubmit={handleSaveProduct}
                style={{ ...css.card, marginBottom: "18px" }}
              >
                <h3 style={{ margin: "0 0 14px", fontSize: "18px", fontWeight: 500 }}>
                  {editingId ? "Edit Product" : "Add New Product"}
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                  <div style={css.fieldGroup}>
                    <label style={css.label}>PRODUCT TITLE</label>
                    <input
                      type="text"
                      placeholder="e.g., 18k Gold Vermeil Hoop Earrings"
                      value={form.title}
                      onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                      style={css.input}
                    />
                  </div>

                  <div style={css.row2}>
                    <div style={css.fieldGroup}>
                      <label style={css.label}>CATEGORY</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                        style={css.input}
                      >
                        <option value="CLOTHES">CLOTHES</option>
                        <option value="JEWELLERY">JEWELLERY</option>
                      </select>
                    </div>

                    <div style={css.fieldGroup}>
                      <label style={css.label}>SUB-LABEL</label>
                      <input
                        type="text"
                        placeholder="e.g., BLACK HIGH RISE"
                        value={form.subLabel}
                        onChange={(e) => setForm((prev) => ({ ...prev, subLabel: e.target.value }))}
                        style={css.input}
                      />
                    </div>
                  </div>

                  <div style={css.fieldGroup}>
                    <label style={css.label}>DETAILS / SIZING</label>
                    <textarea
                      placeholder="Size / fit / material details (optional)"
                      value={form.details}
                      onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
                      style={css.textarea}
                    />
                  </div>

                  <div style={css.uploadZone}>
                    <label style={css.label}>UPLOAD PHOTO FROM DEVICE</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{
                        width: "100%",
                        maxWidth: "100%",
                        minWidth: 0,
                        fontSize: "13px",
                        boxSizing: "border-box",
                        ...css.sans,
                      }}
                    />
                    {uploadingPhoto && (
                      <div style={{ fontSize: "12px", color: "#78716C", ...css.sans }}>
                        Compressing photo for Firestore...
                      </div>
                    )}
                    {form.imageUrl && (
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginTop: "4px" }}>
                        <img
                          src={form.imageUrl}
                          alt="Preview"
                          style={{
                            width: "76px",
                            height: "76px",
                            borderRadius: "10px",
                            objectFit: "cover",
                            border: "1px solid #E5E0D5",
                          }}
                        />
                        <button
                          type="button"
                          style={css.lightPillBtn}
                          onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                        >
                          Remove Photo
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={css.fieldGroup}>
                    <label style={css.label}>IMAGE URL (OPTIONAL)</label>
                    <input
                      type="text"
                      placeholder="https://... (or upload from device above)"
                      value={form.imageUrl}
                      onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                      style={css.input}
                    />
                  </div>

                  <div style={css.fieldGroup}>
                    <label style={css.label}>AMAZON / PRODUCT URL (OPTIONAL)</label>
                    <input
                      type="text"
                      placeholder="https://link.amazon.com/..."
                      value={form.productUrl}
                      onChange={(e) => setForm((prev) => ({ ...prev, productUrl: e.target.value }))}
                      style={css.input}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginTop: "4px",
                    }}
                  >
                    <button
                      type="button"
                      style={css.lightPillBtn}
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setForm(emptyForm);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={css.darkPillBtn}
                      disabled={saving || uploadingPhoto}
                    >
                      {saving ? "Saving..." : editingId ? "Save Changes" : "Save Product"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div style={{ marginBottom: "14px", width: "100%" }}>
              <input
                type="text"
                placeholder="Filter your collection..."
                value={collectionFilter}
                onChange={(e) => setCollectionFilter(e.target.value)}
                style={css.input}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {atelierProducts.map((item) => (
                <div
                  key={item.id}
                  style={{
                    ...css.card,
                    padding: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "10px",
                        backgroundColor: "#EFECE6",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : null}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: "15px",
                          color: "#1C1917",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.14em",
                          color: "#8C8275",
                          textTransform: "uppercase",
                          marginTop: "3px",
                          ...css.sans,
                        }}
                      >
                        {item.category}
                        {item.subLabel ? ` · ${item.subLabel}` : ""}
                      </div>
                      {item.productUrl && (
                        <a
                          href={item.productUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-block",
                            marginTop: "4px",
                            fontSize: "12px",
                            color: "#8C8275",
                            textDecoration: "underline",
                            maxWidth: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            ...css.sans,
                          }}
                        >
                          {item.productUrl}
                        </a>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button
                      type="button"
                      aria-label="Edit product"
                      onClick={() => handleOpenEdit(item)}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "999px",
                        border: "1px solid #EAE5DC",
                        backgroundColor: "#FFFFFF",
                        color: "#57534E",
                        cursor: "pointer",
                      }}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      aria-label="Delete product"
                      onClick={() => handleDeleteProduct(item.id)}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "999px",
                        border: "1px solid #EAE5DC",
                        backgroundColor: "#FFFFFF",
                        color: "#78716C",
                        cursor: "pointer",
                      }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </>
      )}
    </div>
  );
}
