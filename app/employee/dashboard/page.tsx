"use client";
import { useEffect, useState } from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { SectionCard } from "@/components/ui/SectionCard";
import api from "@/lib/api";

export default function EmployeeDashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    total_sales: 0,
    low_stock_count: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/employee/dashboard");
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">My shop today</h1>
        <p className="mt-1 text-xs text-slate-400">
          See today&apos;s sales and stock status for your assigned shop. All
          data is scoped to you and your shop only.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="My sales today"
          value={`KSh ${dashboardData.total_sales}`}
          subtitle="+4 tickets"
          trend="up"
        />
        <KpiCard
          title="Low stock"
          value={`${dashboardData.low_stock_count} items`}
          subtitle="Need attention"
          trend="down"
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Quick actions"
          description="Mobile-first layout so you can register sales and stock directly from the shop floor."
        >
          <div className="grid gap-2 text-xs sm:grid-cols-2">
            <button className="flex items-center justify-between rounded-2xl border border-brand-500/60 bg-brand-500/20 px-3 py-2.5 text-left font-medium text-slate-50 shadow-md shadow-brand-900/70 transition hover:bg-brand-500/30">
              <span>New sale</span>
              <span className="rounded-full bg-slate-950/40 px-2 py-0.5 text-[10px]">
                POS mode
              </span>
            </button>
            <button className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-left font-medium text-slate-100 transition hover:bg-slate-900">
              <span>Record stock in</span>
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-400">
                Delivery
              </span>
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
