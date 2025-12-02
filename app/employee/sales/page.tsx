"use client";
import { useEffect, useState } from "react";
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
  price_per_unit: number;
  total: number;
  notes: string;
};

type Product = {
  id: string;
  product_id: string;
  name: string;
  selling_price: number;
};

export default function EmployeeSalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ticketItems, setTicketItems] = useState<TicketItem[]>([]);
  const [newSale, setNewSale] = useState({
    product_id: "",
    quantity: 1,
    price_per_unit: 0,
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salesResponse = await api.get("/employee/sales");
        setSales(salesResponse.data);

        const productsResponse = await api.get("/api/products");
        setProducts(productsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "product_id") {
      const selectedProduct = products.find((p) => p.id === Number(value));
      setNewSale({
        ...newSale,
        product_id: value,
        price_per_unit: selectedProduct ? selectedProduct.selling_price : 0,
      });
    } else {
      setNewSale({
        ...newSale,
        [name]:
          e.target.type === "number" ? (parseInt(value, 10) || 0) : value,
      });
    }
  };

  const handleAddToTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicketItem = {
      ...newSale,
      total: newSale.quantity * newSale.price_per_unit,
    };
    setTicketItems([...ticketItems, newTicketItem]);
    setNewSale({
      product_id: "",
      quantity: 1,
      price_per_unit: 0,
      notes: "",
    });
  };

  const handleCompleteSale = async () => {
    try {
      await api.post("/employee/sales", {
        time: new Date().toISOString(),
        items: ticketItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          notes: item.notes,
        })),
      });
      // Refresh sales list
      const response = await api.get("/employee/sales");
      setSales(response.data);
      // Clear ticket
      setTicketItems([]);
    } catch (error) {
      console.error("Error creating sale:", error);
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
              G13 • AL FAROUQ (locked to your account)
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
              name="price_per_unit"
              type="number"
              placeholder="55"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newSale.price_per_unit}
              onChange={handleInputChange}
              disabled
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
              className={`flex-1 rounded-xl border border-slate-700 px-4 py-2 text-[11px] font-semibold text-slate-200 transition-colors ${
                ticketItems.length === 0
                  ? "cursor-not-allowed bg-slate-800 text-slate-500"
                  : "hover:bg-slate-900"
              }`}
              onClick={handleCompleteSale}
              disabled={ticketItems.length === 0}
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
                      KSh {item.total?.toFixed(2)}
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
