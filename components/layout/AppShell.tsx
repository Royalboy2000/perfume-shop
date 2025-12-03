"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  History,
  Store,
  Users,
  Boxes
} from "lucide-react";

type Role = "owner" | "employee";

interface AppShellProps {
  role: Role;
  children: ReactNode;
}

const ownerNav = [
  { href: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/owner/sales", label: "Sales", icon: ShoppingBag },
  { href: "/owner/inventory", label: "Inventory", icon: Package },
  { href: "/owner/products", label: "Products", icon: Package },
  { href: "/owner/shops", label: "Shops", icon: Store },
  { href: "/owner/employees", label: "Employees", icon: Users }
];

const employeeNav = [
  { href: "/employee/dashboard", label: "My Shop", icon: Store },
  { href: "/employee/sales", label: "New Sale", icon: ShoppingBag },
  { href: "/employee/stock", label: "Stock", icon: Boxes },
  { href: "/employee/history", label: "History", icon: History }
];

export function AppShell({ role, children }: AppShellProps) {
  const pathname = usePathname();
  const navItems = role === "owner" ? ownerNav : employeeNav;

  // Extract user name from stored JWT token in localStorage.
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to decode the JWT token stored in localStorage. Tokens are usually in format header.payload.signature
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      try {
        const parts = token.split(".");
        if (parts.length > 1) {
          const payloadPart = parts[1];
          // Base64 decode with URL-safe replacements
          const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
          const decoded = atob(base64);
          // Decode URI components to handle UTF-8
          const jsonPayload = decodeURIComponent(
            decoded
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
          const payload = JSON.parse(jsonPayload);
          // The payload should include the user's name or username
          setUserName(payload.name || payload.username || payload.user || null);
        }
      } catch (err) {
        console.error("Failed to decode token", err);
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col text-slate-50 md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 flex-col border-r border-slate-800/80 bg-slate-950/80 px-4 py-6 backdrop-blur-md md:flex">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/80 px-2 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
              Perfume Manager
            </span>
          </div>
          <div className="mt-3 text-[11px] uppercase tracking-[0.24em] text-slate-500">
            {role === "owner" ? "Owner Panel" : "Employee Panel"}
          </div>
          <h1 className="mt-1 text-lg font-semibold text-slate-50">
            {role === "owner" ? "Control all shops" : "Today&apos;s work"}
          </h1>
        </div>

        <nav className="space-y-1 text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2 transition
                  ${
                    isActive
                      ? "bg-gradient-to-r from-brand-600/90 to-brand-500/80 text-white shadow-md shadow-brand-900/60"
                      : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-50"
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/70 px-4 py-3 backdrop-blur-md">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
              {role === "owner" ? "Owner dashboard" : "Shop dashboard"}
            </div>
            <div className="text-sm font-semibold text-slate-100">
              {role === "owner"
                ? "Overview, shops, employees and inventory."
                : "Sales, stock and daily activity for your shop."}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-xs text-slate-400 sm:block">
              <div className="font-medium text-slate-100">{userName ?? ""}</div>
              <div>{role === "owner" ? "Owner" : "Employee"}</div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-sky-500 text-xs font-semibold shadow-lg shadow-brand-900/60">
              {/* Use the first letter of the userName or fall back to role letter */}
              {userName && userName.length > 0
                ? userName.charAt(0).toUpperCase()
                : role === "owner"
                ? "O"
                : "E"}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 pb-20 pt-4 md:pb-6 md:pt-5">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        {/* Bottom nav (mobile only) */}
        <nav className="fixed inset-x-3 bottom-3 z-20 flex justify-around rounded-2xl border border-slate-800/80 bg-slate-950/95 px-2 py-1.5 shadow-xl shadow-slate-900/80 backdrop-blur md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center text-[11px]"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-2xl border text-slate-200 transition
                    ${
                      isActive ? "border-brand-500 bg-brand-500/20" : "border-transparent bg-slate-900/90"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={`mt-0.5 ${
                    isActive ? "font-medium text-slate-100" : "text-slate-400"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
