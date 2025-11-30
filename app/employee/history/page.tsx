"use client";
import { useEffect, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import api from "@/lib/api";

type Sale = {
  id: string;
  ticket_id: string;
  time: string;
  product: {
    name: string;
  };
  quantity: number;
  total: number;
};

export default function EmployeeHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    product_name: "",
  });

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await api.get("/employee/sales", { params: filters });
        setSales(response.data);
      } catch (error) {
        console.error("Error fetching sales:", error);
      }
    };
    fetchSales();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">History</h1>
        <p className="mt-1 text-xs text-slate-400">
          Review your previous sales. This view is limited to your account and
          shop only.
        </p>
      </div>

      <SectionCard
        title="Filters"
        description="Search by date and product to quickly find a ticket."
      >
        <form className="grid gap-3 text-xs sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Date from</label>
            <input
              name="date_from"
              type="date"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none focus:border-brand-500"
              value={filters.date_from}
              onChange={handleFilterChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Date to</label>
            <input
              name="date_to"
              type="date"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none focus:border-brand-500"
              value={filters.date_to}
              onChange={handleFilterChange}
            />
          </div>
          <div className="space-y-1 sm:col-span-1">
            <label className="text-[11px] text-slate-300">Product</label>
            <input
              name="product_name"
              placeholder="Search product"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={filters.product_name}
              onChange={handleFilterChange}
            />
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="My sales history"
        description="Overview of your previous sales."
      >
        <div className="space-y-2 text-xs">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="rounded-2xl border border-slate-800/80 bg-slate-950/80 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold text-slate-200">
                    {sale.ticket_id}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {sale.time}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-500">Total</div>
                  <div className="text-sm font-semibold text-slate-50">
                    KSh {sale.total.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="mt-1 text-[11px] text-slate-300">
                {sale.quantity} × {sale.product.name}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
