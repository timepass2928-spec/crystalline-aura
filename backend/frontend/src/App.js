import React, { useEffect, useState } from "react";
import { LogoMark } from "@/components/Logo";

const STORAGE_KEY = "crystalline_aura_products_v1";

const DEFAULT_PRODUCTS = [];

export default function App() {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return DEFAULT_PRODUCTS;
  });

  const [view, setView] = useState("boutique"); // "boutique" | "login" | "atelier"
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL"); // "ALL" | "CLOTHES" | "JEWELLERY"

  // Atelier login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [bannerMsg, setBannerMsg] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Atelier manager state
  const [filterAtelier, setFilterAtelier] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    category: "CLOTHES",
    subtitle: "",
    specs: "",
    image: "",
    url: "",
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (_) {}
  }, [products]);

  const showToast = (msg) => {
    setBannerMsg(msg);
    setTimeout(() => {
      setBannerMsg((prev) => (prev === msg ? "" : prev));
    }, 3500);
  };

  const filteredBoutique = products.filter((item) => {
    const matchesCat = category === "ALL" || item.category === category;
    const q = search.trim().toLowerCase();
    const matchesQuery =
      !q ||
      (item.title || "").toLowerCase().includes(q) ||
      (item.subtitle || "").toLowerCase().includes(q) ||
      (item.specs || "").toLowerCase().includes(q) ||
      (item.category || "").toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setLoginError("Please enter both email and password.");
      return;
    }
    setLoginError("");
    setIsLoggedIn(true);
    setView("atelier");
    showToast("Welcome back to the atelier");
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm({
      title: "",
      category: "CLOTHES",
      subtitle: "",
      specs: "",
      image: "",
      url: "",
    });
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      category: item.category || "CLOTHES",
      subtitle: item.subtitle || "",
      specs: item.specs || "",
      image: item.image || "",
      url: item.url || "",
    });
    setShowForm(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const cleanItem = {
      id: editingId || `item-${Date.now()}`,
      title: form.title.trim(),
      category: form.category === "JEWELLERY" ? "JEWELLERY" : "CLOTHES",
      subtitle: form.subtitle.trim(),
      specs: form.specs.trim(),
      image: form.image.trim(),
      url: form.url.trim(),
    };

    if (editingId) {
      setProducts((prev) => prev.map((p) => (p.id === editingId ? cleanItem : p)));
      showToast("Product updated");
    } else {
      setProducts((prev) => [cleanItem, ...prev]);
      showToast("Product added to collection");
    }

    setShowForm(false);
    setEditingId(null);
  };

  const handleDeleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast("Product removed");
  };

  const totalCount = products.length;
  const clothesCount = products.filter((p) => p.category === "CLOTHES").length;
  const jewelleryCount = products.filter((p) => p.category === "JEWELLERY").length;

  const filteredAtelier = products.filter((p) => {
    const q = filterAtelier.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.title || "").toLowerCase().includes(q) ||
      (p.subtitle || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      (p.url || "").toLowerCase().includes(q)
    );
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF8F2",
        color: "#1E1B18",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        position: "relative",
      }}
    >
      {/* Floating Green Toast Banner */}
      {bannerMsg && (
        <div
          style={{
            position: "fixed",
            top: "18px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 80,
            background: "#163826",
            color: "#E8F5EC",
            padding: "12px 20px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: "14px",
            minWidth: "280px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "#2EA05C",
                color: "#FFFFFF",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              ✓
            </span>
            <span>{bannerMsg}</span>
          </div>
          <button
            onClick={() => setBannerMsg("")}
            style={{
              background: "none",
              border: "none",
              color: "#A7C7B4",
              cursor: "pointer",
              fontSize: "15px",
              lineHeight: 1,
            }}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* BOUTIQUE VIEW */}
      {view === "boutique" && (
        <>
          {/* Top Brand & Search Header */}
          <header
            style={{
              background: "#FAF8F2",
              padding: "20px 20px 16px",
              borderBottom: "1px solid #ECE6DA",
            }}
          >
            <div style={{ maxWidth: "1120px", margin: "0 auto" }}>
              <div
                onClick={() => {
                  setCategory("ALL");
                  setSearch("");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  marginBottom: "18px",
                }}
              >
                <div style={{ color: "#C5A059" }}>
                  <LogoMark className="w-8 h-8" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "15px",
                      letterSpacing: "0.24em",
                      textTransform: "uppercase",
                      color: "#1E1B18",
                    }}
                  >
                    CRYSTALLINE AURA
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#8E8273",
                      fontFamily: "system-ui, sans-serif",
                      marginTop: "2px",
                    }}
                  >
                    CURATED ATELIER
                  </div>
                </div>
              </div>

              {/* Search Pill */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#FFFFFF",
                  border: "1px solid #E5DEC9",
                  borderRadius: "999px",
                  padding: "10px 18px",
                  marginBottom: "14px",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                  <span style={{ color: "#9A8F80", fontSize: "15px" }}>⌕</span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search dresses, earrings, keywords..."
                    style={{
                      width: "100%",
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontSize: "14px",
                      color: "#1E1B18",
                      fontFamily: "system-ui, sans-serif",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#8E8273",
                    whiteSpace: "nowrap",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {filteredBoutique.length} {filteredBoutique.length === 1 ? "curated find" : "curated finds"}
                </span>
              </div>

              {/* Category Pills */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {["ALL", "CLOTHES", "JEWELLERY"].map((cat) => {
                  const active = category === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      style={{
                        padding: "9px 22px",
                        borderRadius: "999px",
                        border: active ? "1px solid #1C1917" : "1px solid #E2DACB",
                        background: active ? "#1C1917" : "#FFFFFF",
                        color: active ? "#FAF8F2" : "#7A7064",
                        fontSize: "11px",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        fontFamily: "system-ui, sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <section
            style={{
              padding: "36px 20px 28px",
              position: "relative",
              overflow: "hidden",
              borderBottom: "1px solid #ECE6DA",
            }}
          >
            <div style={{ maxWidth: "1120px", margin: "0 auto", position: "relative" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "999px",
                  background: "#F5EFE3",
                  border: "1px solid #EAE0CE",
                  color: "#9B7B3E",
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontFamily: "system-ui, sans-serif",
                  marginBottom: "20px",
                }}
              >
                <span>✦</span>
                <span>AFFILIATE LOOKBOOK · HAND-PICKED AMAZON FINDS</span>
              </div>

              <h1
                style={{
                  fontSize: "clamp(36px, 7vw, 56px)",
                  fontWeight: 400,
                  lineHeight: 1.1,
                  margin: "0 0 18px",
                  color: "#1E1B18",
                  maxWidth: "680px",
                }}
              >
                Effortless <span style={{ fontStyle: "italic", color: "#B8924A" }}>elegance,</span>
                <br />
                curated daily.
              </h1>

              <p
                style={{
                  fontSize: "16px",
                  lineHeight: 1.6,
                  color: "#766C60",
                  maxWidth: "540px",
                  margin: 0,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                Sculpted dresses &amp; radiant heirloom jewellery — every piece hand-picked, one tap away on Amazon.
              </p>
            </div>
          </section>

          {/* Marquee / Trend Strip */}
          <div
            style={{
              background: "#F7F3EA",
              borderBottom: "1px solid #ECE6DA",
              padding: "13px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "28px",
              flexWrap: "wrap",
              fontSize: "11px",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#8E8273",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            <span>CURATED SILHOUETTES</span>
            <span style={{ color: "#C5A059", fontSize: "9px" }}>◆</span>
            <span>18K VERMEIL EARRINGS</span>
            <span style={{ color: "#C5A059", fontSize: "9px" }}>◆</span>
            <span>EVENING COUTURE</span>
          </div>

          {/* Product Grid */}
          <main style={{ maxWidth: "1120px", margin: "0 auto", padding: "32px 20px 56px" }}>
            {filteredBoutique.length === 0 ? (
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #EAE3D5",
                  borderRadius: "16px",
                  padding: "44px 24px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "18px", margin: "0 0 8px" }}>No curated pieces yet</p>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#7E7468",
                    margin: "0 0 20px",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  Open Atelier Login in the footer to add your own hand-picked products.
                </p>
                <button
                  onClick={() => setView(isLoggedIn ? "atelier" : "login")}
                  style={{
                    padding: "11px 22px",
                    borderRadius: "999px",
                    border: "1px solid #1C1917",
                    background: "#1C1917",
                    color: "#FAF8F2",
                    fontSize: "11px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  Open Atelier
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "28px",
                }}
              >
                {filteredBoutique.map((item) => (
                  <article
                    key={item.id}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #EAE3D5",
                      borderRadius: "16px",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          position: "relative",
                          background: "#F4F0E8",
                          minHeight: "230px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "14px",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: "12px",
                            left: "12px",
                            background: "rgba(255,255,255,0.92)",
                            color: "#4A433B",
                            padding: "5px 10px",
                            borderRadius: "999px",
                            fontSize: "10px",
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            fontFamily: "system-ui, sans-serif",
                          }}
                        >
                          {item.category}
                        </span>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            style={{
                              maxHeight: "240px",
                              width: "100%",
                              objectFit: "contain",
                              borderRadius: "8px",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              color: "#9A8F80",
                              fontSize: "12px",
                              fontFamily: "system-ui, sans-serif",
                            }}
                          >
                            No image provided
                          </div>
                        )}
                      </div>

                      {item.specs && (
                        <div
                          style={{
                            margin: "12px 14px 0",
                            padding: "12px",
                            background: "#F3F1EC",
                            borderRadius: "10px",
                            fontSize: "13px",
                            lineHeight: 1.5,
                            color: "#2C2723",
                            fontFamily: "system-ui, sans-serif",
                            whiteSpace: "pre-line",
                          }}
                        >
                          {item.specs}
                        </div>
                      )}

                      <div style={{ padding: "14px 16px 8px" }}>
                        <h2
                          style={{
                            fontSize: "19px",
                            fontWeight: 400,
                            lineHeight: 1.3,
                            margin: 0,
                            color: "#1E1B18",
                          }}
                        >
                          {item.title}
                        </h2>
                        {item.subtitle && (
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#8E8273",
                              margin: "6px 0 0",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              fontFamily: "system-ui, sans-serif",
                            }}
                          >
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ padding: "8px 16px 18px" }}>
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            width: "100%",
                            padding: "13px 16px",
                            borderRadius: "999px",
                            border: "1px solid #E4DDD0",
                            background: "#FAF8F3",
                            color: "#1E1B18",
                            textDecoration: "none",
                            fontSize: "11px",
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            fontFamily: "system-ui, sans-serif",
                            boxSizing: "border-box",
                          }}
                        >
                          <span>BUY ON AMAZON</span>
                          <span>↗</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setView(isLoggedIn ? "atelier" : "login")}
                          style={{
                            width: "100%",
                            padding: "13px 16px",
                            borderRadius: "999px",
                            border: "1px solid #E4DDD0",
                            background: "#FAF8F3",
                            color: "#7A7064",
                            fontSize: "11px",
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            fontFamily: "system-ui, sans-serif",
                            cursor: "pointer",
                          }}
                        >
                          ADD LINK IN ATELIER
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>

          {/* Boutique Footer */}
          <footer
            style={{
              background: "#F5F1E8",
              borderTop: "1px solid #EAE2D3",
              padding: "44px 20px 36px",
              textAlign: "center",
            }}
          >
            <div style={{ color: "#C5A059", display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <LogoMark className="w-7 h-7" />
            </div>
            <div
              style={{
                fontSize: "14px",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "#1E1B18",
                marginBottom: "12px",
              }}
            >
              CRYSTALLINE AURA
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "#8E8273",
                maxWidth: "420px",
                margin: "0 auto 24px",
                lineHeight: 1.6,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              As an Amazon Associate, Crystalline Aura earns from qualifying purchases.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                fontSize: "11px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#8E8273",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              <span>© 2026 CRYSTALLINE AURA</span>
              <span>|</span>
              <button
                onClick={() => setView(isLoggedIn ? "atelier" : "login")}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "#766C60",
                  fontSize: "11px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                ATELIER LOGIN
              </button>
            </div>
          </footer>
        </>
      )}

      {/* ATELIER LOGIN VIEW */}
      {view === "login" && (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px" }}>
            <button
              onClick={() => setView("boutique")}
              style={{
                background: "none",
                border: "none",
                color: "#7A7064",
                fontSize: "11px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              ← BACK TO BOUTIQUE
            </button>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px 24px 60px",
              maxWidth: "440px",
              width: "100%",
              margin: "0 auto",
            }}
          >
            <div style={{ color: "#C5A059", marginBottom: "14px" }}>
              <LogoMark className="w-9 h-9" />
            </div>
            <h1 style={{ fontSize: "34px", fontWeight: 400, margin: "0 0 8px", color: "#1E1B18" }}>
              The Atelier
            </h1>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "#9A8F80",
                marginBottom: "32px",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              PRIVATE MANAGEMENT ACCESS
            </div>

            <form onSubmit={handleLogin} style={{ width: "100%" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#766C60",
                  marginBottom: "8px",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: "1px solid #E2DACB",
                  background: "#FFFFFF",
                  fontSize: "15px",
                  marginBottom: "18px",
                  boxSizing: "border-box",
                  fontFamily: "system-ui, sans-serif",
                }}
              />

              <label
                style={{
                  display: "block",
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#766C60",
                  marginBottom: "8px",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: "1px solid #E2DACB",
                  background: "#FFFFFF",
                  fontSize: "15px",
                  marginBottom: "16px",
                  boxSizing: "border-box",
                  fontFamily: "system-ui, sans-serif",
                }}
              />

              {loginError && (
                <p
                  style={{
                    color: "#9E2A2B",
                    fontSize: "13px",
                    margin: "0 0 14px",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "15px 18px",
                  borderRadius: "999px",
                  border: "none",
                  background: "#231F1C",
                  color: "#FAF8F2",
                  fontSize: "11px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                🔒 ENTER THE ATELIER
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ATELIER MANAGER VIEW */}
      {view === "atelier" && (
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "20px 20px 64px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ color: "#C5A059" }}>
                <LogoMark className="w-8 h-8" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#1E1B18",
                  }}
                >
                  ATELIER MANAGER
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#8E8273",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {email || "atelier@crystallineaura.com"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setView("boutique")}
                style={{
                  padding: "9px 16px",
                  borderRadius: "999px",
                  border: "1px solid #E2DACB",
                  background: "#FFFFFF",
                  color: "#4A433B",
                  fontSize: "11px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                VIEW BOUTIQUE
              </button>
              <button
                onClick={() => {
                  setIsLoggedIn(false);
                  setPassword("");
                  setView("boutique");
                }}
                style={{
                  padding: "9px 16px",
                  borderRadius: "999px",
                  border: "1px solid #E2DACB",
                  background: "#FFFFFF",
                  color: "#4A433B",
                  fontSize: "11px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                ↪ LOGOUT
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginBottom: "28px",
            }}
          >
            {[
              { label: "TOTAL ITEMS", value: totalCount },
              { label: "CLOTHES", value: clothesCount },
              { label: "JEWELLERY", value: jewelleryCount },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #EAE3D5",
                  borderRadius: "14px",
                  padding: "18px 16px",
                }}
              >
                <div style={{ fontSize: "24px", color: "#1E1B18", marginBottom: "6px" }}>{stat.value}</div>
                <div
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#8E8273",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Collection Header + Add Button */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
              flexWrap: "wrap",
            }}
          >
            <h2 style={{ fontSize: "28px", fontWeight: 400, margin: 0 }}>Collection</h2>
            <button
              onClick={openAddForm}
              style={{
                padding: "11px 20px",
                borderRadius: "999px",
                border: "none",
                background: "#231F1C",
                color: "#FAF8F2",
                fontSize: "11px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              + ADD PRODUCT
            </button>
          </div>

          {/* Add / Edit Form */}
          {showForm && (
            <form
              onSubmit={handleSaveProduct}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2DACB",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "18px",
                display: "grid",
                gap: "14px",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              <div style={{ fontSize: "15px", fontWeight: 600 }}>
                {editingId ? "Edit Product" : "Add New Product"}
              </div>
              <input
                required
                placeholder="Product title (e.g., 18k Gold Vermeil Hoop Earrings)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={{ padding: "11px 14px", borderRadius: "10px", border: "1px solid #E2DACB" }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{ padding: "11px 14px", borderRadius: "10px", border: "1px solid #E2DACB", background: "#FFFFFF" }}
                >
                  <option value="CLOTHES">CLOTHES</option>
                  <option value="JEWELLERY">JEWELLERY</option>
                </select>
                <input
                  placeholder="Sub-label (e.g., BLACK HIGH RISE JEANS)"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  style={{ padding: "11px 14px", borderRadius: "10px", border: "1px solid #E2DACB" }}
                />
              </div>
              <textarea
                rows={2}
                placeholder="Size / fit / material details (optional)"
                value={form.specs}
                onChange={(e) => setForm({ ...form, specs: e.target.value })}
                style={{ padding: "11px 14px", borderRadius: "10px", border: "1px solid #E2DACB" }}
              />
              <input
                placeholder="Image URL (optional)"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                style={{ padding: "11px 14px", borderRadius: "10px", border: "1px solid #E2DACB" }}
              />
              <input
                placeholder="Amazon product URL (optional)"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                style={{ padding: "11px 14px", borderRadius: "10px", border: "1px solid #E2DACB" }}
              />
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "999px",
                    border: "1px solid #E2DACB",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    borderRadius: "999px",
                    border: "none",
                    background: "#231F1C",
                    color: "#FAF8F2",
                    cursor: "pointer",
                  }}
                >
                  {editingId ? "Save Changes" : "Save Product"}
                </button>
              </div>
            </form>
          )}

          {/* Filter Input */}
          <input
            type="text"
            value={filterAtelier}
            onChange={(e) => setFilterAtelier(e.target.value)}
            placeholder="Filter your collection..."
            style={{
              width: "100%",
              padding: "13px 16px",
              borderRadius: "12px",
              border: "1px solid #E2DACB",
              background: "#FFFFFF",
              fontSize: "14px",
              marginBottom: "18px",
              boxSizing: "border-box",
              fontFamily: "system-ui, sans-serif",
            }}
          />

          {/* Atelier Item List */}
          {filteredAtelier.length === 0 ? (
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #EAE3D5",
                borderRadius: "14px",
                padding: "28px",
                textAlign: "center",
                color: "#7E7468",
                fontFamily: "system-ui, sans-serif",
                fontSize: "14px",
              }}
            >
              No items in your collection yet. Click <strong>+ ADD PRODUCT</strong> above to add one.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredAtelier.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #EAE3D5",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{
                          width: "54px",
                          height: "66px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "17px", color: "#1E1B18", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "#8E8273",
                          fontFamily: "system-ui, sans-serif",
                          marginTop: "3px",
                        }}
                      >
                        {item.category}
                        {item.subtitle ? ` · ${item.subtitle}` : ""}
                      </div>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-block",
                            marginTop: "6px",
                            fontSize: "12px",
                            color: "#9B7B3E",
                            fontFamily: "system-ui, sans-serif",
                            wordBreak: "break-all",
                          }}
                        >
                          {item.url} ↗
                        </a>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button
                      onClick={() => openEditForm(item)}
                      title="Edit item"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        border: "1px solid #EAE3D5",
                        background: "#FAF8F2",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(item.id)}
                      title="Delete item"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        border: "1px solid #EAE3D5",
                        background: "#FAF8F2",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
