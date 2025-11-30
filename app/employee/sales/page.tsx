"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SectionCard } from "@/components/ui/SectionCard";
import api from "@/lib/api";

type Sale = {
  id: string;
  ticket_id: string;
  time: string;
  product_id: string;
  quantity: number;
  total: number;
  notes: string;
  product: {
    name: string;
  };
};

type TicketItem = {
  product_id: string;
  quantity: number;
  total: number;
};

type Product = {
  id: string;
  product_id: string;
  name: string;
};

type Shop = {
  id: string;
  shop_id: string;
  name: string;
};

export default function EmployeeSalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [ticketItems, setTicketItems] = useState<TicketItem[]>([]);
  const [newSale, setNewSale] = useState({
    product_id: "",
    quantity: 0,
    total: 0,
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salesResponse = await api.get("/employee/sales");
        setSales(salesResponse.data);

        const productsResponse = await api.get("/owner/products");
        setProducts(productsResponse.data);

        const profileResponse = await api.get("/employee/profile");
        setShop(profileResponse.data.shop);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data.");
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setNewSale({ ...newSale, [e.target.name]: e.target.value });
  };

  const handleAddToTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketItems([...ticketItems, newSale]);
    setNewSale({
      product_id: "",
      quantity: 0,
      total: 0,
      notes: "",
    });
  };

  const handleCompleteSale = async () => {
    try {
      await api.post("/employee/sales", {
        time: new Date().toISOString(),
        items: ticketItems,
      });
      // Refresh sales list
      const response = await api.get("/employee/sales");
      setSales(response.data);
      // Clear ticket
      setTicketItems([]);
      toast.success("Sale completed successfully.");
    } catch (error) {
      console.error("Error creating sale:", error);
      toast.error("Failed to complete sale.");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">New sale</h1>
        <p className="mt-1 text-xs text-slate-400">
          Register a new sale quickly. Your shop and employee details are fixed
          by your login, so you only choose products and quantities.
        </p>
      </div>

      <SectionCard
        title="Sale form"
        description="Optimized for phones: large tap areas and stacked fields."
      >
        <form className="grid gap-3 text-xs sm:grid-cols-2" onSubmit={handleAddToTicket}>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] text-slate-300">Shop</label>
            <div className="flex h-10 items-center rounded-xl border border-slate-800 bg-slate-950/70 px-3 text-[11px] text-slate-300">
              {shop ? `${shop.shop_id} • ${shop.name}` : "Loading..."} (locked to
              your account)
            </div>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] text-slate-300">Product</label>
            <select
              name="product_id"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none focus:border-brand-500"
              value={newSale.product_id}
              onChange={handleInputChange}
            >
              <option>Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Quantity</label>
            <input
              name="quantity"
              type="number"
              placeholder="1"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newSale.quantity}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Price per unit</label>
            <input
              name="total"
              type="number"
              placeholder="55"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newSale.total}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] text-slate-300">Notes</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Optional notes (discount, customer request, etc.)"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newSale.notes}
              onChange={handleInputChange}
            />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-brand-500 px-4 py-2 text-[11px] font-semibold text-white shadow-md shadow-brand-900/60 hover:bg-brand-600"
            >
              Add to ticket
            </button>
            <button
              type="button"
              className="flex-1 rounded-xl border border-slate-700 px-4 py-2 text-[11px] font-semibold text-slate-200 hover:bg-slate-900"
              onClick={handleCompleteSale}
            >
              Complete sale
            </button>
          </div>
        </form>
      </SectionCard>

      {ticketItems.length > 0 && (
        <SectionCard title="Current Ticket">
          <div className="space-y-2 text-xs">
            {ticketItems.map((item, index) => {
              const product = products.find((p) => p.id === item.product_id);
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-800/80 bg-slate-950/80 px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-50">
                      {product?.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      KSh {item.total.toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-300">
                    {item.quantity} × {product?.name}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      <SectionCard
        title="Today's tickets"
        description="Overview of your recent sales."
      >
        <div className="space-y-2 text-xs">
          {sales.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-2xl border border-slate-800/80 bg-slate-950/80 px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-50">
                  {ticket.ticket_id}
                </div>
                <div className="text-[11px] text-slate-400">
                  {ticket.time}
                </div>
              </div>
              <div className="mt-1 text-[11px] text-slate-300">
                {ticket.quantity} × {ticket.product.name}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                Total: KSh {ticket.total.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
