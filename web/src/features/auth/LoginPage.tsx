import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import logo from "@/assets/logo.svg";
import { login } from "@/api/client";

/**
 * Yunto — Super Admin login. Authenticates against POST /api/auth/login,
 * stores the JWT, and routes to the dashboard. On-brand with the app shell
 * (Outfit type, soft gradient backdrop, glassy white card).
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@yunto.com");
  const [password, setPassword] = useState("password123");
  const [agencyCode, setAgencyCode] = useState("55678");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center px-4 font-sans"
      style={{ background: "linear-gradient(135deg, #EAEAEA 0%, #EDF9FF 45%, #A4C5D9 100%)" }}
    >
      <div className="w-full max-w-[420px] rounded-[28px] border border-white/50 bg-white/70 p-[36px] shadow-[0_24px_70px_rgba(60,60,110,0.18)] backdrop-blur-xl">
        <img src={logo} alt="Yunto" className="mb-[26px] h-[38px] w-auto" />
        <h1 className="text-[26px] font-medium leading-tight text-ink">Welcome back</h1>
        <p className="mt-[6px] text-[14px] font-light text-ink/60">Sign in to your Yunto admin workspace.</p>

        <form onSubmit={onSubmit} className="mt-[26px] space-y-[16px]">
          <label className="block">
            <span className="mb-[6px] block text-[13px] font-normal text-ink/70">Email</span>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="h-[46px] w-full rounded-[14px] border border-ink/10 bg-white px-[14px] text-[14px] text-ink outline-none transition focus:border-ink/40"
              placeholder="you@agency.com"
            />
          </label>

          <label className="block">
            <span className="mb-[6px] block text-[13px] font-normal text-ink/70">Password</span>
            <div className="relative">
              <input
                type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                className="h-[46px] w-full rounded-[14px] border border-ink/10 bg-white px-[14px] pr-[44px] text-[14px] text-ink outline-none transition focus:border-ink/40"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/70" aria-label="Toggle password">
                {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="mb-[6px] block text-[13px] font-normal text-ink/70">Agency code</span>
            <input
              value={agencyCode} onChange={(e) => setAgencyCode(e.target.value)}
              className="h-[46px] w-full rounded-[14px] border border-ink/10 bg-white px-[14px] text-[14px] text-ink outline-none transition focus:border-ink/40"
              placeholder="e.g. 55678"
            />
          </label>

          {error && <p className="rounded-[10px] bg-[#FDECEC] px-[12px] py-[8px] text-[13px] text-[#D64545]">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="flex h-[48px] w-full items-center justify-center gap-[8px] rounded-[14px] bg-ink text-[15px] font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-[16px] w-[16px] animate-spin" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-[20px] text-center text-[12px] text-ink/45">
          Demo: admin@yunto.com · password123
        </p>
      </div>
    </div>
  );
}
