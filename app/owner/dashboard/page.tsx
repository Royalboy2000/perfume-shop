"use client";
import { useEffect, useState } from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { SectionCard } from "@/components/ui/SectionCard";
import api from "@/lib/api";

export default function OwnerDashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    total_sales: 0,
    low_stock_count: 0,
    total_shops: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardResponse = await api.get("/owner/dashboard");
        const shopsResponse = await api.get("/owner/shops");
        setDashboardData({
          ...dashboardResponse.data,
          total_shops: shopsResponse.data.length,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">
          All shops overview
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Track total sales, inventory health and employee performance across
          every shop.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Sales This Month"
          value={`KSh ${dashboardData.total_sales}`}
          subtitle="+8% vs last month"
          trend="up"
        />
        <KpiCard
          title="Total Shops"
          value={dashboardData.total_shops.toString()}
          subtitle="All active locations"
          trend="neutral"
        />
        <KpiCard
          title="Low Stock Items"
          value={dashboardData.low_stock_count.toString()}
          subtitle="< reorder level"
          trend="down"
        />
      </section>
    </div>
  );
}
