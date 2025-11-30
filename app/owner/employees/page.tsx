"use client";
import { useEffect, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import api from "@/lib/api";
import toast from "react-hot-toast";

type Employee = {
  id: string;
  employee_id: string;
  name: string;
  shop_id: string;
  role: string;
  contact: string;
};

type Shop = {
  id: string;
  shop_id: string;
  name: string;
  manager: string;
};

export default function OwnerEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [newEmployee, setNewEmployee] = useState({
    employee_id: "",
    name: "",
    shop_id: "",
    role: "",
    contact: "",
    username: "",
    password: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const employeesResponse = await api.get("/owner/employees");
        setEmployees(employeesResponse.data);

        const shopsResponse = await api.get("/owner/shops");
        setShops(shopsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data.");
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/owner/employees", newEmployee);
      // Refresh employees list
      const response = await api.get("/owner/employees");
      setEmployees(response.data);
      // Clear form
      setNewEmployee({
        employee_id: "",
        name: "",
        shop_id: "",
        role: "",
        contact: "",
        username: "",
        password: "",
      });
      toast.success("Employee created successfully!");
    } catch (error) {
      console.error("Error creating employee:", error);
      toast.error("Failed to create employee.");
    }
  };

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      await api.put(`/owner/employees/${selectedEmployee.id}`, selectedEmployee);
      // Refresh employees list
      const response = await api.get("/owner/employees");
      setEmployees(response.data);
      // Close modal
      setSelectedEmployee(null);
      toast.success("Employee updated successfully!");
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Failed to update employee.");
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await api.delete(`/owner/employees/${id}`);
      // Refresh employees list
      const response = await api.get("/owner/employees");
      setEmployees(response.data);
      toast.success("Employee deleted successfully!");
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee.");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Employees</h1>
        <p className="mt-1 text-xs text-slate-400">
          Manage employee accounts and shop assignments. Only the owner can see
          contact information for each employee.
        </p>
      </div>

      <SectionCard
        title="Create employee account"
        description="Create a new employee, assign their shop and role, and set an initial login."
      >
        <form className="grid gap-3 text-xs sm:grid-cols-3" onSubmit={handleCreateEmployee}>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Employee ID</label>
            <input
              name="employee_id"
              placeholder="E006"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newEmployee.employee_id}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] text-slate-300">Full name</label>
            <input
              name="name"
              placeholder="Employee full name"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newEmployee.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Shop</label>
            <select
              name="shop_id"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none focus:border-brand-500"
              value={newEmployee.shop_id}
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
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Role</label>
            <input
              name="role"
              placeholder="e.g. Cashier, Sales"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newEmployee.role}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Contact</label>
            <input
              name="contact"
              placeholder="Phone number"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newEmployee.contact}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] text-slate-300">Username</label>
            <input
              name="username"
              placeholder="Username for login"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newEmployee.username}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1 sm:col-span-1">
            <label className="text-[11px] text-slate-300">Temporary password</label>
            <input
              name="password"
              type="password"
              placeholder="Set a temporary password"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
              value={newEmployee.password}
              onChange={handleInputChange}
            />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-brand-500 px-4 py-2 text-[11px] font-semibold text-white shadow-md shadow-brand-900/60 hover:bg-brand-600"
            >
              Save employee
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Employees list"
        description="Overview of all employees with their assigned shop and contact details."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-950/80 p-3 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    {emp.employee_id}
                  </div>
                  <div className="text-sm font-semibold text-slate-50">
                    {emp.name}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    {emp.role} • {emp.shop_id}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    Contact: {emp.contact}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    className="rounded-xl border border-slate-700 px-3 py-1 text-[11px] text-slate-200 hover:bg-slate-900"
                    onClick={() => setSelectedEmployee(emp)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-3 py-1 text-[11px] text-rose-300 hover:bg-rose-500/20"
                    onClick={() => handleDeleteEmployee(emp.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {selectedEmployee && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.95)] backdrop-blur">
            <h2 className="text-xl font-semibold text-slate-50">Edit Employee</h2>
            <form className="mt-4 grid gap-3 text-xs sm:grid-cols-3" onSubmit={handleUpdateEmployee}>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Employee ID</label>
                <input
                  name="employee_id"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
                  value={selectedEmployee.employee_id}
                  onChange={(e) =>
                    setSelectedEmployee({
                      ...selectedEmployee,
                      employee_id: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] text-slate-300">Full name</label>
                <input
                  name="name"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
                  value={selectedEmployee.name}
                  onChange={(e) =>
                    setSelectedEmployee({
                      ...selectedEmployee,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Shop</label>
                <select
                  name="shop_id"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none focus:border-brand-500"
                  value={selectedEmployee.shop_id}
                  onChange={(e) =>
                    setSelectedEmployee({
                      ...selectedEmployee,
                      shop_id: e.target.value,
                    })
                  }
                >
                  <option>Select shop</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.shop_id} • {shop.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Role</label>
                <input
                  name="role"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
                  value={selectedEmployee.role}
                  onChange={(e) =>
                    setSelectedEmployee({
                      ...selectedEmployee,
                      role: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Contact</label>
                <input
                  name="contact"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
                  value={selectedEmployee.contact}
                  onChange={(e) =>
                    setSelectedEmployee({
                      ...selectedEmployee,
                      contact: e.target.value,
                    })
                  }
                />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-700 px-4 py-2 text-[11px] font-semibold text-slate-200 hover:bg-slate-900"
                  onClick={() => setSelectedEmployee(null)}
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
