"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import {
  Users,
  ShieldAlert,
  DollarSign,
  Lock,
  Unlock,
  Eye,
  CheckCircle2,
  Search,
  Filter,
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

const SAMPLE_USERS: AdminUser[] = [
  {
    id: "usr-1",
    name: "Tafsirul Islam",
    email: "tafsir@example.com",
    phone: "+880 1711-223344",
    bloodGroup: "O-",
    district: "Dhaka",
    role: "Admin",
    status: "Active",
    donations: 3,
  },
  {
    id: "usr-2",
    name: "Dr. Farhana Yasmin",
    email: "farhana@example.com",
    phone: "+880 1822-334455",
    bloodGroup: "A+",
    district: "Chittagong",
    role: "Volunteer",
    status: "Active",
    donations: 7,
  },
  {
    id: "usr-3",
    name: "Rashidul Hasan",
    email: "rashid@example.com",
    phone: "+880 1933-445566",
    bloodGroup: "B-",
    district: "Rajshahi",
    role: "Donor",
    status: "Active",
    donations: 2,
  },
];

export function AdminCommandCenter() {
  const { language } = useLanguage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
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
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadUsers();
  }, []);

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
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
        );
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
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (e) {
      console.error("Error updating user role:", e);
    } finally {
      setActionLoading(null);
    }
  };

  const totalVolunteers = users.filter((u) => u.role === "Volunteer").length;

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.district.toLowerCase().includes(searchTerm.toLowerCase())
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
            <span className="text-xl font-black text-[var(--text-primary)]">{users.length}</span>
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
            <span className="text-xl font-black text-[var(--text-primary)]">{totalVolunteers}</span>
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

      {/* User Management Table */}
      <div className="card-clinical p-6 border border-[var(--border-subtle)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
          <h3 className="text-base font-black text-[var(--text-primary)]">
            {language === "bn" ? "ব্যবহারকারী ব্যবস্থাপনা ও রোল নির্ধারণ" : "User Management & Role Elevation"}
          </h3>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder={language === "bn" ? "নাম বা জেলা দিয়ে খুঁজুন..." : "Filter users..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-medium outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
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
                    <button
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
