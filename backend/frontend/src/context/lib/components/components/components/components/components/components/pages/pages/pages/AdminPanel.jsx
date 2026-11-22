import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  LogOut,
  ExternalLink,
  Upload,
  X,
  Check,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LogoMark, Wordmark } from "@/components/Logo";
import { resolveImageUrl } from "@/components/ProductCard";

const EMPTY_FORM = {
  name: "",
  category: "Clothes",
  amazon_url: "",
  image_url: "",
};

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products");
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      amazon_url: product.amazon_url,
      image_url: product.image_url,
    });
    setError("");
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, image_url: data.url }));
    } catch (err) {
      setError(err.response?.data?.detail || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.image_url.trim()) {
      setError("Please upload an image or provide an image URL.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, form);
      } else {
        await api.post("/products", form);
      }
      setModalOpen(false);
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save piece.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from the catalog?`)) return;
    try {
      await api.delete(`/products/${id}`);
      await fetchProducts();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete piece.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Bar */}
      <header className="border-b border-border bg-card">
        <div className="max-w-[1380px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoMark className="w-7 h-7 text-aura-gold" />
            <Wordmark className="text-xs font-medium" />
            <span className="hidden sm:inline-block text-[10px] tracking-[0.2em] uppercase px-2 py-0.5 border border-border text-muted-foreground">
              Curator Studio
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-xs text-muted-foreground">
              {user?.email}
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs tracking-[0.16em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              data-testid="admin-logout-btn"
              className="inline-flex items-center gap-1.5 text-xs tracking-[0.16em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1380px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase text-aura-gold mb-1">
              Catalog Management
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal">
              Curated Pieces ({products.length})
            </h1>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            data-testid="add-product-btn"
            className="inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background text-xs tracking-[0.18em] uppercase hover:opacity-90 transition-opacity self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Piece</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-muted/60 animate-pulse border border-border/50"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border">
            <p className="font-serif text-2xl">Your catalog is empty</p>
            <p className="mt-2 text-xs tracking-[0.18em] uppercase text-muted-foreground">
              Click "Add New Piece" to publish your first item
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                data-testid={`admin-product-${product.id}`}
                className="border border-border bg-card flex flex-col"
              >
                <div className="aspect-[3/4] bg-muted overflow-hidden relative">
                  <img
                    src={resolveImageUrl(product.image_url)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-background/90 backdrop-blur-sm text-[10px] tracking-[0.2em] uppercase">
                    {product.category}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-lg leading-snug line-clamp-2">
                      {product.name}
                    </h3>
                    <a
                      href={product.amazon_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-aura-gold truncate max-w-full"
                    >
                      <span className="truncate">{product.amazon_url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-border">
                    <button
                      type="button"
                      onClick={() => openEditModal(product)}
                      data-testid={`edit-product-${product.id}`}
                      className="flex-1 py-2 px-3 border border-border hover:border-foreground text-xs tracking-[0.15em] uppercase inline-flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id, product.name)}
                      data-testid={`delete-product-${product.id}`}
                      className="py-2 px-3 border border-border hover:border-red-600 hover:text-red-600 text-xs transition-colors"
                      aria-label={`Delete ${product.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-normal">
                {editingId ? "Edit Piece" : "Add New Piece"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {error && (
                <div className="p-3 border border-red-300 bg-red-50 text-red-700 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-2">
                  Piece Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Silk Bias Slip Dress"
                  data-testid="product-name-input"
                  className="w-full px-3.5 py-2.5 text-sm bg-background border border-border focus:border-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-2">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  data-testid="product-category-select"
                  className="w-full px-3.5 py-2.5 text-sm bg-background border border-border focus:border-foreground focus:outline-none"
                >
                  <option value="Clothes">Clothes</option>
                  <option value="Jewellery">Jewellery</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-2">
                  Amazon Affiliate URL
                </label>
                <input
                  type="url"
                  required
                  value={form.amazon_url}
                  onChange={(e) =>
                    setForm({ ...form, amazon_url: e.target.value })
                  }
                  placeholder="https://www.amazon.com/dp/..."
                  data-testid="product-url-input"
                  className="w-full px-3.5 py-2.5 text-sm bg-background border border-border focus:border-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-2">
                  Product Image
                </label>
                <div className="space-y-3">
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-border hover:border-foreground cursor-pointer text-xs tracking-[0.16em] uppercase transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>
                      {uploading ? "Uploading..." : "Upload Image File"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={form.image_url}
                    onChange={(e) =>
                      setForm({ ...form, image_url: e.target.value })
                    }
                    placeholder="Or paste direct image URL (https://...)"
                    data-testid="product-image-input"
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border focus:border-foreground focus:outline-none"
                  />

                  {form.image_url && (
                    <div className="w-24 aspect-[3/4] border border-border overflow-hidden bg-muted">
                      <img
                        src={resolveImageUrl(form.image_url)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 border border-border text-xs tracking-[0.18em] uppercase hover:border-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  data-testid="save-product-submit"
                  className="px-5 py-2.5 bg-foreground text-background text-xs tracking-[0.18em] uppercase hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save Piece"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
