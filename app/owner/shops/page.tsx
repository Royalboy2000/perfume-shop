"use client";
import { useEffect, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import api from "@/lib/api";
import toast from "react-hot-toast";

type Shop = {
  id: string;
  shop_id: string;
  name: string;
  manager: string;
};

export default function OwnerShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [newShop, setNewShop] = useState({
    shop_id: "",
    name: "",
    manager: "",
  });

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await api.get("/owner/shops");
        setShops(response.data);
      } catch (error) {
        console.error("Error fetching shops:", error);
        toast.error("Failed to fetch shops.");
      }
    };
    fetchShops();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewShop({ ...newShop, [e.target.name]: e.target.value });
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/owner/shops", newShop);
      // Refresh shops list
      const response = await api.get("/owner/shops");
      setShops(response.data);
      // Clear form
      setNewShop({
        shop_id: "",
        name: "",
        manager: "",
      });
      toast.success("Shop created successfully!");
    } catch (error) {
      console.error("Error creating shop:", error);
      toast.error("Failed to create shop.");
    }
  };

  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  const handleUpdateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShop) return;

    try {
      await api.put(`/owner/shops/${selectedShop.id}`, selectedShop);
      // Refresh shops list
      const response = await api.get("/owner/shops");
      setShops(response.data);
      // Close modal
      setSelectedShop(null);
      toast.success("Shop updated successfully!");
    } catch (error) {
      console.error("Error updating shop:", error);
      toast.error("Failed to update shop.");
    }
  };

  const handleDeleteShop = async (id: string) => {
    try {
      await api.delete(`/owner/shops/${id}`);
      // Refresh shops list
      const response = await api.get("/owner/shops");
      setShops(response.data);
      toast.success("Shop deleted successfully!");
    } catch (error) {
      console.error("Error deleting shop:", error);
      toast.error("Failed to delete shop.");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Shops</h1>
        <p className="mt-1 text-xs text-slate-400">
          Manage all registered shops from the SHOPS sheet and assign a
          responsible manager to each.
        </p>
      </div>

      <SectionCard
        title="Register new shop"
        description="Create a new shop and assign its manager. Only the owner can do this."
      >
        <form className="grid gap-3 text-xs sm:grid-cols-3" onSubmit={handleCreateShop}>
          <div className="space-y-1 sm:col-span-1">
            <label className="text-[11px] text-slate-300">Shop ID</label>
            <input
              name="shop_id"
              placeholder="e.g. G13"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newShop.shop_id}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1 sm:col-span-1">
            <label className="text-[11px] text-slate-300">Shop name</label>
            <input
              name="name"
              placeholder="e.g. AL FAROUQ"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newShop.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1 sm:col-span-1">
            <label className="text-[11px] text-slate-300">Manager</label>
            <input
              name="manager"
              placeholder="Manager name"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newShop.manager}
              onChange={handleInputChange}
            />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-brand-500 px-4 py-2 text-[11px] font-semibold text-white shadow-md shadow-brand-900/60 hover:bg-brand-600"
            >
              Save shop
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Existing shops"
        description="Overview of all shops with their current manager."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-950/80 p-3 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    {shop.shop_id}
                  </div>
                  <div className="text-sm font-semibold text-slate-50">
                    {shop.name}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    Manager: {shop.manager}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    className="rounded-xl border border-slate-700 px-3 py-1 text-[11px] text-slate-200 hover:bg-slate-900"
                    onClick={() => setSelectedShop(shop)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-3 py-1 text-[11px] text-rose-300 hover:bg-rose-500/20"
                    onClick={() => handleDeleteShop(shop.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {selectedShop && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.95)] backdrop-blur">
            <h2 className="text-xl font-semibold text-slate-50">Edit Shop</h2>
            <form className="mt-4 grid gap-3 text-xs sm:grid-cols-3" onSubmit={handleUpdateShop}>
              <div className="space-y-1 sm:col-span-1">
                <label className="text-[11px] text-slate-300">Shop ID</label>
                <input
                  name="shop_id"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
                  value={selectedShop.shop_id}
                  onChange={(e) =>
                    setSelectedShop({
                      ...selectedShop,
                      shop_id: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1 sm:col-span-1">
                <label className="text-[11px] text-slate-300">Shop name</label>
                <input
                  name="name"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
                  value={selectedShop.name}
                  onChange={(e) =>
                    setSelectedShop({
                      ...selectedShop,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1 sm:col-span-1">
                <label className="text-[11px] text-slate-300">Manager</label>
                <input
                  name="manager"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
                  value={selectedShop.manager}
                  onChange={(e) =>
                    setSelectedShop({
                      ...selectedShop,
                      manager: e.target.value,
                    })
                  }
                />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-700 px-4 py-2 text-[11px] font-semibold text-slate-200 hover:bg-slate-900"
                  onClick={() => setSelectedShop(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-500 px-4 py-2 text-[11px] font-semibold text-white shadow-md shadow-brand-900/60 hover:bg-brand-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
