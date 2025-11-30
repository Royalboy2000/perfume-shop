"use client";
import { useEffect, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import api from "@/lib/api";

type Inventory = {
  id: string;
  shop_id: string;
  product_id: string;
  current_stock: number;
  shop: {
    shop_id: string;
    name: string;
  };
  product: {
    name: string;
    reorder_level: number;
  };
};

function stockStatus(row: Inventory) {
  if (row.current_stock <= row.product.reorder_level) return "low";
  if (row.current_stock <= row.product.reorder_level + 2) return "warning";
  return "ok";
};

type Shop = {
  id: string;
  shop_id: string;
  name: string;
  manager: string;
}

export default function OwnerInventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [filters, setFilters] = useState({
    shop_id: "",
    view: "all",
    product_name: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const inventoryResponse = await api.get("/owner/inventory", { params: filters });
        setInventory(inventoryResponse.data);

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
        <h1 className="text-xl font-semibold text-slate-50">Inventory</h1>
        <p className="mt-1 text-xs text-slate-400">
          Overview of stock across all shops. This follows the INVENTORY SHEET
          structure: total stock in, total sales and current stock.
        </p>
      </div>

      <SectionCard
        title="Filters"
        description="Focus on a specific shop or only items that are low on stock."
      >
        <form className="grid gap-3 text-xs sm:grid-cols-3">
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
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">View</label>
            <select
              name="view"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none focus:border-brand-500"
              value={filters.view}
              onChange={handleFilterChange}
            >
              <option value="all">All items</option>
              <option value="low">Low stock only</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Search product</label>
            <input
              name="product_name"
              placeholder="Type product name"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={filters.product_name}
              onChange={handleFilterChange}
            />
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Inventory by shop (demo)"
        description="Cards on mobile, table on desktop. Connect this to your INVENTORY SHEET later."
      >
        {/* Desktop */}
        <div className="hidden overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 md:block">
          <table className="min-w-full border-collapse text-xs">
            <thead className="bg-slate-950/90 text-[11px] uppercase tracking-[0.12em] text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left">Shop</th>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-right">Current</th>
                <th className="px-3 py-2 text-right">Reorder level</th>
                <th className="px-3 py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((row) => {
                const status = stockStatus(row);
                return (
                  <tr
                    key={row.id}
                    className="border-t border-slate-800/80 hover:bg-slate-900/60"
                  >
                    <td className="px-3 py-2 text-slate-100">
                      {row.shop.shop_id} • {row.shop.name}
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      {row.product.name}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-100">
                      {row.current_stock}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-300">
                      {row.product.reorder_level}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          status === "ok"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : status === "warning"
                            ? "bg-amber-500/15 text-amber-300"
                            : "bg-rose-500/15 text-rose-300"
                        }`}
                      >
                        {status === "ok"
                          ? "OK"
                          : status === "warning"
                          ? "Near reorder"
                          : "Low"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-2 md:hidden">
          {inventory.map((row) => {
            const status = stockStatus(row);
            return (
              <div
                key={row.id}
                className="rounded-2xl border border-slate-800/80 bg-slate-950/80 px-3 py-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-50">
                    {row.product.name}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      status === "ok"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : status === "warning"
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-rose-500/15 text-rose-300"
                    }`}
                  >
                    {status === "ok"
                      ? "OK"
                      : status === "warning"
                      ? "Near reorder"
                      : "Low"}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {row.shop.shop_id} • {row.shop.name}
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-slate-300">
                  <span>Current: {row.current_stock}</span>
                  <span>Reorder: {row.product.reorder_level}</span>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
