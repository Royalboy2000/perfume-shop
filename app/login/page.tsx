"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      const token = response.data.access_token;
      localStorage.setItem("token", token);

      // Decode the token to get the user's role
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const role = decodedToken.role;

      if (role === "owner") {
        router.push("/owner/dashboard");
      } else {
        router.push("/employee/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid username or password");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.95)] backdrop-blur">
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-slate-950/80 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-300">
              Perfume Manager
            </span>
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-50">
            Welcome back
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Sign in with your owner or employee account to manage shops,
            inventory and sales.
          </p>
        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-200">
              Email / Username
            </label>
            <div className="flex items-center rounded-2xl border border-slate-800 bg-slate-950/70 px-3">
              <input
                className="h-10 w-full bg-transparent text-sm text-slate-50 outline-none placeholder:text-slate-500"
                placeholder="omar@shop.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-200">
              Password
            </label>
            <div className="flex items-center rounded-2xl border border-slate-800 bg-slate-950/70 px-3">
              <input
                type="password"
                className="h-10 w-full bg-transparent text-sm text-slate-50 outline-none placeholder:text-slate-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-700/40 transition hover:bg-brand-600 active:scale-[0.99]"
          >
            Sign in
          </button>
        </form>

        <div className="mt-5 flex items-center gap-2 text-[11px] text-slate-500">
          <div className="h-px flex-1 bg-slate-800" />
          <span>Dev shortcuts</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="mt-3 flex justify-between text-[11px] text-slate-400">
          <Link href="/owner/dashboard" className="hover:text-slate-200">
            Go to Owner dashboard
          </Link>
          <Link href="/employee/dashboard" className="hover:text-slate-200">
            Go to Employee dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
