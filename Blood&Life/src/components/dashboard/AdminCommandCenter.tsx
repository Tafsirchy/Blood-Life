"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { DIVISIONS, DISTRICTS } from "@/lib/geo/bangladeshData";
import {
  Users,
  ShieldAlert,
  Lock,
  Unlock,
  Eye,
  Search,
  PlusCircle,
  Trash2,
  X,
  FileClock,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: string;
  district: string;
  role: "Donor" | "Requester" | "Volunteer" | "Admin";
  status: "Active" | "Blocked";
  donations: number;
}

interface AuditLogItem {
  _id: string;
  action: string;
  performedBy: string;
  targetId: string;
  targetType: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export function AdminCommandCenter() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"users" | "logs">("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [volunteerCount, setVolunteerCount] = useState(0);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    bloodGroup: "O+",
    division: "Dhaka",
    district: "Dhaka",
    upazila: "Dhanmondi",
    role: "Volunteer" as AdminUser["role"],
  });

  const loadUsers = async (overrideSearch?: string, overrideRole?: string) => {
    try {
      setLoading(true);
      const q = overrideSearch !== undefined ? overrideSearch : searchTerm;
      const r = overrideRole !== undefined ? overrideRole : roleFilter;
      const params = new URLSearchParams();
      if (q.trim()) params.set("search", q.trim());
      if (r !== "all") params.set("role", r);
      params.set("limit", "50");

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (data.users) {
        setUsers(
          data.users.map((u: any) => ({
            id: u._id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            bloodGroup: u.bloodGroup,
            district: u.district,
            role: u.role,
            status: u.status,
            donations: u.totalDonations || 0,
          }))
        );
        setTotalUsers(data.total ?? data.users.length);
        setVolunteerCount(data.volunteerCount ?? data.users.filter((u: any) => u.role === "Volunteer").length);
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const res = await fetch("/api/admin/logs?limit=40");
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (e) {
      console.error("Failed to load audit logs:", e);
    }
  };

  React.useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  React.useEffect(() => {
    if (activeTab === "logs") loadLogs();
  }, [activeTab]);

  const handleToggleStatus = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const newStatus = target.status === "Active" ? "Blocked" : "Active";
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
        );
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (e) {
      console.error("Error updating user status:", e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: AdminUser["role"]) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        alert(data.error || "Failed to update role");
      }
    } catch (e) {
      console.error("Error updating user role:", e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    const msg =
      language === "bn"
        ? `আপনি কি নিশ্চিত যে "${name}" অ্যাকাউন্টটি স্থায়ীভাবে মুছে ফেলতে চান?`
        : `Permanently delete user account "${name}"?`;
    if (!window.confirm(msg)) return;
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setTotalUsers((prev) => Math.max(0, prev - 1));
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch {
      alert("Network error while deleting user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      setShowCreateModal(false);
      setCreateForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        bloodGroup: "O+",
        division: "Dhaka",
        district: "Dhaka",
        upazila: "Dhanmondi",
        role: "Volunteer",
      });
      await loadUsers();
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const modalDistricts = DISTRICTS.filter(
    (d) => d.division.toLowerCase() === createForm.division.toLowerCase()
  );

  return (
    <div className="space-y-6">
      {/* Top Admin Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-clinical p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <span className="text-xl font-black text-[var(--text-primary)]">{totalUsers}</span>
            <span className="text-[11px] text-[var(--text-muted)] block">
              {language === "bn" ? "মোট নিবন্ধিত ব্যবহারকারী" : "Total Users"}
            </span>
          </div>
        </div>

        <div className="card-clinical p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ShieldAlert size={20} />
          </div>
          <div>
            <span className="text-xl font-black text-[var(--text-primary)]">{volunteerCount}</span>
            <span className="text-[11px] text-[var(--text-muted)] block">
              {language === "bn" ? "ভেরিফাইড ভলান্টিয়ার" : "Active Volunteers"}
            </span>
          </div>
        </div>

        <div className="card-clinical p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <Eye size={20} />
          </div>
          <div>
            <span className="text-xl font-black text-[var(--text-primary)]">100%</span>
            <span className="text-[11px] text-[var(--text-muted)] block">
              {language === "bn" ? "প্রাইভেসি অডিট লগ সংরক্ষণ" : "Audit Shield Active"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs + Create Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === "users"
                ? "bg-red-600 text-white"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-main)]"
            }`}
          >
            <Users size={14} />
            <span>{language === "bn" ? "ব্যবহারকারী তালিকা" : "User Management"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === "logs"
                ? "bg-red-600 text-white"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-main)]"
            }`}
          >
            <FileClock size={14} />
            <span>{language === "bn" ? "সিকিউরিটি অডিট লগ" : "Audit Logs"}</span>
          </button>
        </div>

        {activeTab === "users" && (
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5"
          >
            <PlusCircle size={14} />
            <span>{language === "bn" ? "+ নতুন ইউজার / ভলান্টিয়ার" : "+ Create User"}</span>
          </button>
        )}
      </div>

      {activeTab === "users" ? (
        <div className="card-clinical p-6 border border-[var(--border-subtle)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
            <h3 className="text-base font-black text-[var(--text-primary)]">
              {language === "bn" ? "ব্যবহারকারী ব্যবস্থাপনা ও রোল নির্ধারণ" : "User Management & Role Elevation"}
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-bold outline-none"
              >
                <option value="all">{language === "bn" ? "সকল রোল" : "All Roles"}</option>
                <option value="Donor">Donor</option>
                <option value="Requester">Requester</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Admin">Admin</option>
              </select>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  loadUsers();
                }}
                className="relative w-full sm:w-64"
              >
                <Search size={14} className="absolute left-3 top-2.5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder={language === "bn" ? "নাম, ইমেইল বা জেলা..." : "Filter users..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-medium outline-none focus:border-red-500"
                />
              </form>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-8 text-center text-xs text-[var(--text-muted)]">Loading users...</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                    <th className="pb-3 font-bold uppercase tracking-wider">User</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Blood</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">District</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Role</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Status</th>
                    <th className="pb-3 font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[var(--bg-main)] transition-colors">
                      <td className="py-3 font-medium">
                        <div className="font-bold text-[var(--text-primary)]">{u.name}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">{u.email}</div>
                      </td>
                      <td className="py-3 font-black text-red-500">{u.bloodGroup}</td>
                      <td className="py-3 text-[var(--text-secondary)]">{u.district}</td>
                      <td className="py-3">
                        <select
                          disabled={actionLoading === u.id}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as AdminUser["role"])}
                          className="px-2 py-1 rounded bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-bold outline-none"
                        >
                          <option value="Donor">Donor</option>
                          <option value="Requester">Requester</option>
                          <option value="Volunteer">Volunteer</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            disabled={actionLoading === u.id}
                            onClick={() => handleToggleStatus(u.id)}
                            className="px-2.5 py-1 rounded border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] text-[11px] font-bold transition-colors"
                          >
                            {u.status === "Active" ? (
                              <span className="text-red-500 flex items-center gap-1">
                                <Lock size={12} /> Block
                              </span>
                            ) : (
                              <span className="text-emerald-500 flex items-center gap-1">
                                <Unlock size={12} /> Unblock
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading === u.id}
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title={language === "bn" ? "স্থায়ীভাবে ডিলিট করুন" : "Delete User"}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="card-clinical p-6 border border-[var(--border-subtle)] space-y-4">
          <h3 className="text-base font-black text-[var(--text-primary)]">
            {language === "bn" ? "সিস্টেম সিকিউরিটি ও অ্যাকশন অডিট লগ" : "Recent Security & CRUD Audit Logs"}
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] py-6 text-center">No audit logs recorded yet.</p>
            ) : (
              logs.map((log) => (
                <div
                  key={log._id}
                  className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 font-mono font-bold text-[10px] mr-2">
                      {log.action}
                    </span>
                    <span className="font-bold text-[var(--text-primary)]">{log.targetType}</span>
                    <span className="text-[var(--text-muted)] ml-1.5 font-mono text-[11px]">#{log.targetId.slice(-6)}</span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-base font-black text-[var(--text-primary)]">
                {language === "bn" ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "Create New Platform User"}
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-main)]"
              >
                <X size={18} />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Full Name *"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] outline-none"
                />
                <input
                  type="email"
                  required
                  placeholder="Email *"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Phone (11 digits) *"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] outline-none font-mono"
                />
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Password (min 8, letter+digit) *"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <select
                  value={createForm.bloodGroup}
                  onChange={(e) => setCreateForm({ ...createForm, bloodGroup: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] font-bold"
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as AdminUser["role"] })}
                  className="px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] font-bold"
                >
                  <option value="Donor">Donor</option>
                  <option value="Requester">Requester</option>
                  <option value="Volunteer">Volunteer</option>
                  <option value="Admin">Admin</option>
                </select>
                <select
                  value={createForm.division}
                  onChange={(e) => {
                    const nextDiv = e.target.value;
                    const first = DISTRICTS.find((d) => d.division.toLowerCase() === nextDiv.toLowerCase()) || DISTRICTS[0];
                    setCreateForm({
                      ...createForm,
                      division: nextDiv,
                      district: first.nameEn,
                      upazila: first.upazilas[0] || "Sadar",
                    });
                  }}
                  className="px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] font-bold"
                >
                  {DIVISIONS.map((d) => (
                    <option key={d.id} value={d.nameEn}>{d.nameEn}</option>
                  ))}
                </select>
                <select
                  value={createForm.district}
                  onChange={(e) => {
                    const nextDist = e.target.value;
                    const obj = DISTRICTS.find((d) => d.nameEn === nextDist);
                    setCreateForm({
                      ...createForm,
                      district: nextDist,
                      upazila: obj?.upazilas[0] || "Sadar",
                    });
                  }}
                  className="px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] font-bold"
                >
                  {modalDistricts.map((d) => (
                    <option key={d.id} value={d.nameEn}>{d.nameEn}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] font-bold"
                >
                  {language === "bn" ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
