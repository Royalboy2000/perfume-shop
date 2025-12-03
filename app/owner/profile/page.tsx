"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { SectionCard } from "@/components/ui/SectionCard";
import toast from "react-hot-toast";

/**
 * Profile page for the owner. This page allows the owner to update their
 * login email/username and password. The back‑end exposes a single PUT
 * endpoint for updating any user (including the owner) via `/owner/employees/<id>`.
 * By fetching the list of employees and filtering by role, we can locate
 * the owner’s user record and perform updates accordingly.
 */
export default function OwnerProfilePage() {
  const router = useRouter();
  // Owner object containing id and current username. Additional fields can
  // be displayed as needed.
  const [ownerInfo, setOwnerInfo] = useState<{
    id: string;
    username: string;
  } | null>(null);
  // Track the new username/email and password separately. Using separate
  // state variables allows us to avoid unintentionally clearing fields when
  // the owner chooses not to change them.
  const [newUsername, setNewUsername] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const resp = await api.get("/owner/employees");
        const allUsers: any[] = resp.data;
        // Find the user with role === "owner"
        const owner = allUsers.find((u) => u.role === "owner");
        if (owner) {
          setOwnerInfo({ id: owner.id, username: owner.username });
          setNewUsername(owner.username);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load owner information");
      }
    };
    fetchOwner();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerInfo) return;
    try {
      const payload: any = {};
      // Include username if it has changed
      if (newUsername.trim() && newUsername !== ownerInfo.username) {
        payload.username = newUsername;
      }
      // Include password if provided
      if (newPassword.trim()) {
        payload.password = newPassword;
      }
      if (Object.keys(payload).length === 0) {
        toast.error("No changes to update");
        return;
      }
      await api.put(`/owner/employees/${ownerInfo.id}`, payload);
      toast.success("Profile updated successfully");
      // If username changed, update local state
      setOwnerInfo({ ...ownerInfo, username: newUsername });
      setNewPassword("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Owner Profile</h1>
        <p className="mt-1 text-xs text-slate-400">
          Update your login email/username and password. Leave the password
          field blank if you do not wish to change it.
        </p>
      </div>
      <SectionCard
        title="Account settings"
        description="Manage your login credentials."
      >
        {ownerInfo ? (
          <form className="space-y-4 text-xs" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300">Email / Username</label>
              <input
                type="email"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300">New password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500"
                placeholder="Leave blank to keep current"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-brand-500 px-4 py-2 text-[11px] font-semibold text-white shadow-md shadow-brand-900/60 hover:bg-brand-600"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-400">Loading...</p>
        )}
      </SectionCard>
    </div>
  );
}
