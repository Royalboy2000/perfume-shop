"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SectionCard } from "@/components/ui/SectionCard";
import api from "@/lib/api";

type StockIn = {
  id: string;
  stock_in_id: string;
  date: string;
  shop: {
    shop_id: string;
    name: string;
  };
  product: {
    name: string;
  };
  quantity: number;
  supplier: string;
};

type Shop = {
  id: string;
  shop_id: string;
  name: string;
  manager: string;
};

type Product = {
  id: string;
  product_id: string;
  name: string;
};

export default function OwnerStockInPage() {
  const [stockIns, setStockIns] = useState<StockIn[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newStockIn, setNewStockIn] = useState({
    stock_in_id: "",
    date: "",
    shop_id: "",
    product_id: "",
    quantity: 0,
    supplier: "",
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stockInsResponse = await api.get("/owner/stock-in");
        setStockIns(stockInsResponse.data);

        const shopsResponse = await api.get("/owner/shops");
        setShops(shopsResponse.data);

        const productsResponse = await api.get("/owner/products");
        setProducts(productsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data.");
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setNewStockIn({ ...newStockIn, [e.target.name]: e.target.value });
  };

  const handleCreateStockIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/owner/stock-in", newStockIn);
      // Refresh stock-in list
      const response = await api.get("/owner/stock-in");
      setStockIns(response.data);
      // Clear form
      setNewStockIn({
        stock_in_id: "",
        date: "",
        shop_id: "",
        product_id: "",
        quantity: 0,
        supplier: "",
        notes: "",
      });
      toast.success("Stock-in record created successfully.");
    } catch (error) {
      console.error("Error creating stock-in record:", error);
      toast.error("Failed to create stock-in record.");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Stock In</h1>
        <p className="mt-1 text-xs text-slate-400">
          Record incoming stock per shop and product. This reflects the Stock In
          sheet: timestamp, date, shop, product, quantity and supplier.
        </p>
      </div>

      <SectionCard
        title="Record new stock in"
        description="When a delivery arrives, register which shop received which products."
      >
        <form className="grid gap-3 text-xs sm:grid-cols-3" onSubmit={handleCreateStockIn}>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Date</label>
            <input
              name="date"
              type="date"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none focus:border-brand-500"
              value={newStockIn.date}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Shop</label>
            <select
              name="shop_id"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none focus:border-brand-500"
              value={newStockIn.shop_id}
              onChange={handleInputChange}
            >
              <option>Select shop</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.shop_id} • {shop.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] text-slate-300">Product</label>
            <select
              name="product_id"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none focus:border-brand-500"
              value={newStockIn.product_id}
              onChange={handleInputChange}
            >
              <option>Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.product_id} • {product.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Quantity received</label>
            <input
              name="quantity"
              type="number"
              placeholder="e.g. 10"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newStockIn.quantity}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] text-slate-300">Supplier</label>
            <input
              name="supplier"
              placeholder="Supplier name"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newStockIn.supplier}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1 sm:col-span-3">
            <label className="text-[11px] text-slate-300">Notes</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Optional notes about the delivery"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newStockIn.notes}
              onChange={handleInputChange}
            />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-brand-500 px-4 py-2 text-[11px] font-semibold text-white shadow-md shadow-brand-900/60 hover:bg-brand-600"
            >
              Save stock-in record
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Recent stock in"
        description="Overview of your recent stock-in records."
      >
        <div className="space-y-2 text-xs">
          {stockIns.map((row) => (
            <div
              key={row.id}
              className="rounded-2xl border border-slate-800/80 bg-slate-950/80 px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-50">{row.stock_in_id}</div>
                <div className="text-[11px] text-slate-400">{row.date}</div>
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                {row.shop.shop_id} • {row.shop.name}
              </div>
              <div className="mt-1 text-[11px] text-slate-300">
                {row.quantity} × {row.product.name}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                Supplier: {row.supplier}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
