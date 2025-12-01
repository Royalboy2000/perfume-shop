"use client";
import { useEffect, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import api from "@/lib/api";
import toast from "react-hot-toast";

type Product = {
  id: string;
  product_id: string;
  name: string;
  category: string;
  cost_price: number;
  selling_price: number;
  reorder_level: number;
};

export default function OwnerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    product_id: "",
    name: "",
    category: "",
    cost_price: "",
    selling_price: "",
    reorder_level: "",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/owner/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to fetch products.");
      }
    };
    fetchProducts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newProduct,
        cost_price: parseFloat(newProduct.cost_price),
        selling_price: parseFloat(newProduct.selling_price),
        reorder_level: parseInt(newProduct.reorder_level, 10),
      };
      await api.post("/owner/products", payload);
      const response = await api.get("/owner/products");
      setProducts(response.data);
      setNewProduct({
        product_id: "",
        name: "",
        category: "",
        cost_price: "",
        selling_price: "",
        reorder_level: "",
      });
      toast.success("Product created successfully!");
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product.");
    }
  };

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const payload = {
        ...selectedProduct,
        cost_price: parseFloat(selectedProduct.cost_price),
        selling_price: parseFloat(selectedProduct.selling_price),
        reorder_level: parseInt(selectedProduct.reorder_level, 10),
      };
      await api.put(`/owner/products/${selectedProduct.id}`, payload);
      const response = await api.get("/owner/products");
      setProducts(response.data);
      setSelectedProduct(null);
      toast.success("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await api.delete(`/owner/products/${id}`);
      const response = await api.get("/owner/products");
      setProducts(response.data);
      toast.success("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product.");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Products</h1>
        <p className="mt-1 text-xs text-slate-400">
          Manage your products here.
        </p>
      </div>

      <SectionCard
        title="Add new product"
        description="Add a new product to your inventory."
      >
        <form className="grid gap-3 text-xs sm:grid-cols-3" onSubmit={handleCreateProduct}>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Product ID</label>
            <input
              name="product_id"
              placeholder="P001"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newProduct.product_id}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] text-slate-300">Product name</label>
            <input
              name="name"
              placeholder="Product name"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newProduct.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Category</label>
            <input
              name="category"
              placeholder="e.g. Electronics"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newProduct.category}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Cost price</label>
            <input
              name="cost_price"
              type="number"
              placeholder="Cost price"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newProduct.cost_price}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Selling price</label>
            <input
              name="selling_price"
              type="number"
              placeholder="Selling price"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newProduct.selling_price}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Reorder level</label>
            <input
              name="reorder_level"
              type="number"
              placeholder="Reorder level"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newProduct.reorder_level}
              onChange={handleInputChange}
            />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-brand-500 px-4 py-2 text-[11px] font-semibold text-white shadow-md shadow-brand-900/60 hover:bg-brand-600"
            >
              Save product
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Products list"
        description="Overview of all products."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-950/80 p-3 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    {product.product_id}
                  </div>
                  <div className="text-sm font-semibold text-slate-50">
                    {product.name}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    {product.category}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    Cost: {product.cost_price.toFixed(2)} • Selling: {product.selling_price.toFixed(2)}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    Reorder level: {product.reorder_level}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    className="rounded-xl border border-slate-700 px-3 py-1 text-[11px] text-slate-200 hover:bg-slate-900"
                    onClick={() => setSelectedProduct(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-3 py-1 text-[11px] text-rose-300 hover:bg-rose-500/20"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {selectedProduct && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.95)] backdrop-blur">
            <h2 className="text-xl font-semibold text-slate-50">Edit Product</h2>
            <form className="mt-4 grid gap-3 text-xs sm:grid-cols-3" onSubmit={handleUpdateProduct}>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Product ID</label>
                <input
                  name="product_id"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
                  value={selectedProduct.product_id}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      product_id: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] text-slate-300">Product name</label>
                <input
                  name="name"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
                  value={selectedProduct.name}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Category</label>
                <input
                  name="category"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
                  value={selectedProduct.category}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      category: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Cost price</label>
                <input
                  name="cost_price"
                  type="number"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
                  value={selectedProduct.cost_price}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      cost_price: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Selling price</label>
                <input
                  name="selling_price"
                  type="number"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
                  value={selectedProduct.selling_price}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      selling_price: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Reorder level</label>
                <input
                  name="reorder_level"
                  type="number"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
                  value={selectedProduct.reorder_level}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      reorder_level: e.target.value,
                    })
                  }
                />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-700 px-4 py-2 text-[11px] font-semibold text-slate-200 hover:bg-slate-900"
                  onClick={() => setSelectedProduct(null)}
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
