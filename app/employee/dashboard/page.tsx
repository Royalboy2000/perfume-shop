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
          subtitle=""
          trend="up"
        />
        <KpiCard
          title="Low stock"
          value={`${dashboardData.low_stock_count} items`}
          subtitle="Need attention"
          trend="down"
        />
      </section>
    </div>
  );
}
