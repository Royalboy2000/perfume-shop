"use client";
import { useEffect, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import api from "@/lib/api";

type Stock = {
  id: string;
  product_id: string;
  product_name: string;
  current_stock: number;
  reorder_level: number;
};

function stockStatus(row: Stock) {
  if (row.current_stock <= row.reorder_level) return "low";
  if (row.current_stock <= row.reorder_level + 2) return "warning";
  return "ok";
}

export default function EmployeeStockPage() {
  const [stock, setStock] = useState<Stock[]>([]);
  const [newStock, setNewStock] = useState({
    product_id: "",
    quantity: 0,
  });

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await api.get("/employee/stock");
        setStock(response.data);
      } catch (error) {
        console.error("Error fetching stock:", error);
      }
    };
    fetchStock();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewStock({ ...newStock, [e.target.name]: e.target.value });
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/employee/stock-in", newStock);
      // Refresh stock list
      const response = await api.get("/employee/stock");
      setStock(response.data);
      // Clear form
      setNewStock({
        product_id: "",
        quantity: 0,
      });
    } catch (error) {
      console.error("Error adding stock:", error);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Stock</h1>
        <p className="mt-1 text-xs text-slate-400">
          See current stock for your shop and register incoming deliveries.
        </p>
      </div>

      <SectionCard
        title="Current stock"
        description="Inventory for your shop only."
      >
        <div className="space-y-2 text-xs">
          {stock.map((row) => {
            const status = stockStatus(row);
            return (
              <div
                key={row.id}
                className="rounded-2xl border border-slate-800/80 bg-slate-950/80 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-slate-50">
                    {row.product_name}
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
                <div className="mt-1 flex justify-between text-[11px] text-slate-300">
                  <span>Current: {row.current_stock}</span>
                  <span>Reorder: {row.reorder_level}</span>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        title="Record stock in"
        description="When you receive new units in this shop, register them here."
      >
        <form className="grid gap-3 text-xs sm:grid-cols-2" onSubmit={handleAddStock}>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] text-slate-300">Product</label>
            <input
              name="product_id"
              placeholder="Enter Product ID"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newStock.product_id}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Quantity received</label>
            <input
              name="quantity"
              type="number"
              placeholder="e.g. 5"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newStock.quantity}
              onChange={handleInputChange}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-brand-500 px-4 py-2 text-[11px] font-semibold text-white shadow-md shadow-brand-900/60 hover:bg-brand-600"
            >
              Save stock in
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
