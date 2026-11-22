import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LogoMark, Wordmark } from "@/components/Logo";

export default function AdminLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/admin", { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.detail || "Invalid credentials. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground px-5 py-8">
      <div className="max-w-md w-full mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Boutique</span>
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto border border-border bg-card p-8 sm:p-10">
        <div className="flex flex-col items-center text-center mb-8">
          <LogoMark className="w-9 h-9 text-aura-gold mb-3" />
          <Wordmark className="text-xs font-medium mb-2" />
          <h1 className="font-serif text-2xl sm:text-3xl font-normal">
            Curator Access
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Sign in to manage the Crystalline Aura catalog
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 border border-red-300 bg-red-50 text-red-700 text-xs">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="admin-email"
              className="block text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-2"
            >
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="curator@crystallineaura.com"
              data-testid="admin-email-input"
              className="w-full px-3.5 py-2.5 text-sm bg-background border border-border focus:border-foreground focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-2"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              data-testid="admin-password-input"
              className="w-full px-3.5 py-2.5 text-sm bg-background border border-border focus:border-foreground focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            data-testid="admin-login-submit"
            className="w-full py-3 px-4 bg-foreground text-background text-xs tracking-[0.2em] uppercase hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{submitting ? "Signing In..." : "Sign In"}</span>
          </button>
        </form>
      </div>

      <div className="text-center text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
        Crystalline Aura Administration
      </div>
    </div>
  );
}
