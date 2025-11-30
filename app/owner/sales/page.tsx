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
  employee: {
    name: string;
  };
  shop: {
    shop_id: string;
    name: string;
  };
};

type Shop = {
  id: string;
  shop_id: string;
  name: string;
  manager: string;
};

export default function OwnerSalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    shop_id: "",
    employee_name: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salesResponse = await api.get("/owner/sales", { params: filters });
        setSales(salesResponse.data);

        const shopsResponse = await api.get("/owner/shops");
        setShops(shopsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Sales</h1>
        <p className="mt-1 text-xs text-slate-400">
          Review and filter sales across every shop and employee. This screen
          mirrors your SALES SHEET structure.
        </p>
      </div>

      <SectionCard
        title="Filters"
        description="Use shop, date range and employee filters to focus on specific sales."
        actionSlot={
          <button className="rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-300 hover:bg-slate-900">
            Clear
          </button>
        }
      >
        <form className="grid gap-3 text-xs sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Date from</label>
            <input
              name="date_from"
              type="date"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={filters.date_from}
              onChange={handleFilterChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Date to</label>
            <input
              name="date_to"
              type="date"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={filters.date_to}
              onChange={handleFilterChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Shop</label>
            <select
              name="shop_id"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none focus:border-brand-500"
              value={filters.shop_id}
              onChange={handleFilterChange}
            >
              <option value="">All shops</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.shop_id} • {shop.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] text-slate-300">Employee</label>
            <input
              name="employee_name"
              placeholder="Search employee by name"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={filters.employee_name}
              onChange={handleFilterChange}
            />
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Sales list (demo)"
        description="On phones, sales are shown as stacked cards. On desktop you get a full table."
      >
        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 md:block">
          <table className="min-w-full border-collapse text-xs">
            <thead className="bg-slate-950/90 text-[11px] uppercase tracking-[0.12em] text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Shop</th>
                <th className="px-3 py-2 text-left">Employee</th>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr
                  key={sale.id}
                  className="border-t border-slate-800/80 hover:bg-slate-900/60"
                >
                  <td className="px-3 py-2 text-slate-100">{sale.ticket_id}</td>
                  <td className="px-3 py-2 text-slate-300">{sale.time}</td>
                  <td className="px-3 py-2 text-slate-300">{sale.shop.shop_id} • {sale.shop.name}</td>
                  <td className="px-3 py-2 text-slate-300">
                    {sale.employee.name}
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    {sale.product.name}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-100">
                    {sale.quantity}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-100">
                    KSh {sale.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-2 md:hidden">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="rounded-2xl border border-slate-800/80 bg-slate-950/80 px-3 py-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-50">{sale.ticket_id}</div>
                <div className="text-[11px] text-slate-400">{sale.time}</div>
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                {sale.shop.shop_id} • {sale.shop.name}
              </div>
              <div className="mt-1 flex justify-between">
                <div>
                  <div className="text-[11px] text-slate-500">Employee</div>
                  <div className="text-slate-200">{sale.employee.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-500">Total</div>
                  <div className="font-semibold text-slate-50">
                    KSh {sale.total.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                {sale.quantity} × {sale.product.name}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
