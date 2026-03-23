import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "../../shared/api/http";
import { useToast } from "../../shared/ui/toast/ToastContext";
import Table from "../../shared/ui/Table";
import Button from "../../shared/ui/Button";
import Input from "../../shared/ui/Input";
import Select from "../../shared/ui/Select";

export default function AdminUsersPage() {
  const { push } = useToast();
  const queryClient = useQueryClient();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("faculty");
  const [department, setDepartment] = useState("");

  const q = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await http.get("/api/users");
      return res.data.data;
    },
  });

  const createMut = useMutation({
    mutationFn: async (payload) => await http.post("/api/users", payload),
    onSuccess: () => {
      push({ variant: "success", title: "Registred", message: "User account registered successfully!" });
      setUsername("");
      setEmail("");
      setPassword("");
      setDepartment("");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => {
      push({ variant: "error", title: "Failed", message: err.response?.data?.message || "Failed to create user" });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id) => await http.delete(`/api/users/${id}`),
    onSuccess: () => {
      push({ variant: "success", title: "Deleted", message: "User deleted" });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => {
      push({ variant: "error", title: "Failed", message: err.response?.data?.message || "Delete failed" });
    },
  });

  async function handleCreate(e) {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !email.trim()) return;
    createMut.mutate({ 
      username: username.trim(), 
      email: email.trim(),
      password: password.trim(), 
      role, 
      department: department.trim() 
    });
  }

  function handleDelete(user) {
    if (window.confirm(`Delete user ${user.username}? This cannot be undone.`)) {
      deleteMut.mutate(user._id);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <header>
        <h1 className="text-2xl font-bold text-zinc-50">Manage Users (Accounts)</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Provision secure login credentials for Faculty and co-Administrators.
        </p>
      </header>

      <form
        onSubmit={handleCreate}
        className="grid gap-4 rounded-2xl border border-white/5 bg-zinc-900/50 p-6 md:grid-cols-6 items-end"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Username *</label>
          <Input
            placeholder="e.g. j_sharma or IT_Admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Email *</label>
          <Input
            type="email"
            placeholder="e.g. jsharma@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Password *</label>
          <Input
            type="password"
            placeholder="Min 6 chars"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Role</label>
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="faculty">Faculty (Teacher)</option>
            <option value="admin">Administrator</option>
          </Select>
        </div>

        {role === "faculty" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Department</label>
            <Input
              placeholder="e.g. CSE"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required={role === "faculty"}
            />
          </div>
        )}

        <div className={`flex w-full h-[42px] ${role === "admin" ? 'md:col-span-2' : ''}`}>
          <Button type="submit" disabled={createMut.isPending} className="w-full h-full">
            {createMut.isPending ? "Creating..." : "Create Account"}
          </Button>
        </div>
      </form>

      {q.isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-12 rounded-xl bg-white/5" />
          <div className="h-12 rounded-xl bg-white/5" />
        </div>
      ) : q.isError ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          Failed to load users: {q.error.message}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 bg-zinc-900/30 overflow-hidden shadow-sm">
            <Table
              columns={[
                {
                  key: "username",
                  header: "Username",
                  render: (u) => (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 font-medium text-zinc-200">
                        {u.username}
                        {u.role === "admin" && <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">Superadmin</span>}
                      </div>
                      <div className="text-xs text-zinc-400">{u.email}</div>
                    </div>
                  )
                },
                {
                  key: "role",
                  header: "Role",
                  render: (u) => <span className="capitalize text-zinc-400">{u.role}</span>
                },
                {
                  key: "department",
                  header: "Department",
                  render: (u) => <span className="text-zinc-400">{u.department || "—"}</span>
                },
                {
                  key: "actions",
                  header: "Actions",
                  render: (u) => (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(u)}
                      disabled={deleteMut.isPending}
                    >
                      Delete
                    </Button>
                  )
                }
              ]}
              rows={q.data || []}
              rowKey={(u) => u._id}
            />
        </div>
      )}
    </div>
  );
}
