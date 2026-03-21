import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "../../shared/ui/Card.jsx";
import Input from "../../shared/ui/Input.jsx";
import Button from "../../shared/ui/Button.jsx";
import Select from "../../shared/ui/Select.jsx";
import Table from "../../shared/ui/Table.jsx";
import { apiErrorMessage } from "../../shared/api/http.js";
import { useToast } from "../../shared/ui/toast/ToastContext.jsx";
import {
  createSubject,
  deleteSubject,
  listSubjects,
  updateSubject,
} from "../../features/admin/adminApi.js";

const DEPARTMENTS = [
  "CSE",
  "IT",
  "CSAIML",
  "CSDS",
  "CSAI",
  "AIML",
  "AIDS",
  "ECE",
  "EEE",
  "ME",
];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

function normalizeDept(v) {
  return (v || "").trim().toUpperCase();
}

function getInitialForm() {
  return {
    code: "",
    name: "",
    department: "IT",
    semester: 1,
    weeklyHours: 3,
    type: "Theory",
    requiresLab: false,
    labDuration: 2,
  };
}

export default function AdminSubjectsPage() {
  const qc = useQueryClient();
  const { push } = useToast();

  const [filters, setFilters] = useState({
    department: "",
    semester: "",
    search: "",
  });

  const [form, setForm] = useState(getInitialForm());
  const [editing, setEditing] = useState(null);

  const q = useQuery({
    queryKey: ["admin-subjects", filters.department, filters.semester],
    queryFn: () =>
      listSubjects({
        ...(filters.department
          ? { department: normalizeDept(filters.department) }
          : {}),
        ...(filters.semester ? { semester: Number(filters.semester) } : {}),
      }),
  });

  const save = useMutation({
    mutationFn: async (payload) => {
      if (editing?._id) return updateSubject(editing._id, payload);
      return createSubject(payload);
    },

    onSuccess: async () => {
      push({
        variant: "success",
        title: "Saved",
        message: editing
          ? "Subject updated successfully"
          : "Subject saved successfully",
      });

      setForm(getInitialForm());
      setEditing(null);

      await qc.invalidateQueries({ queryKey: ["admin-subjects"] });
    },

    onError: (e) =>
      push({
        variant: "error",
        title: "Save failed",
        message: apiErrorMessage(e),
      }),
  });

  const del = useMutation({
    mutationFn: (id) => deleteSubject(id),

    onSuccess: async () => {
      push({
        variant: "success",
        title: "Deleted",
        message: "Subject deleted successfully",
      });

      await qc.invalidateQueries({ queryKey: ["admin-subjects"] });
    },

    onError: (e) =>
      push({
        variant: "error",
        title: "Delete failed",
        message: apiErrorMessage(e),
      }),
  });

  function onEdit(s) {
    setEditing(s);

    setForm({
      code: s.code ?? "",
      name: s.name ?? "",
      department: s.department ?? "IT",
      semester: s.semester ?? 1,
      weeklyHours: s.weeklyHours ?? 3,
      type: s.type ?? "Theory",
      requiresLab: !!s.requiresLab,
      labDuration: s.labDuration ?? 2,
    });


  }

  function resetForm() {
    setEditing(null);
    setForm(getInitialForm());
  }

  function onSubmit(e) {
    e.preventDefault();

    save.mutate({
      ...form,
      code: String(form.code).trim().toUpperCase(),
      department: normalizeDept(form.department),
      semester: Number(form.semester),
      weeklyHours: Number(form.weeklyHours),
      labDuration: Number(form.labDuration),
    });
  }

  const rows = useMemo(() => {
    const base = q.data ?? [];
    const term = filters.search.trim().toLowerCase();

    if (!term) return base;

    return base.filter((subject) => {
      const text = [
        subject.code,
        subject.name,
        subject.department,
        subject.type,
        String(subject.semester ?? ""),
        String(subject.weeklyHours ?? ""),
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(term);
    });
  }, [q.data, filters.search]);

  const subjectStats = useMemo(() => {
    return {
      total: rows.length,
      theory: rows.filter((s) => s.type === "Theory").length,
      lab: rows.filter((s) => s.type === "Lab").length,
      withLab: rows.filter((s) => s.requiresLab).length,
    };
  }, [rows]);

  const columns = useMemo(
    () => [
      {
        key: "code",
        header: "Subject",
        render: (r) => (
          <div className="min-w-[180px]">
            <div className="font-semibold text-zinc-50">{r.code}</div>
            <div className="text-xs text-zinc-400">{r.name}</div>
          </div>
        ),
      },
      {
        key: "department",
        header: "Department",
        render: (r) => (
          <span className="inline-flex rounded-full bg-zinc-900/50 px-2.5 py-1 text-xs font-semibold text-zinc-300">
            {r.department}
          </span>
        ),
      },
      {
        key: "semester",
        header: "Semester",
        render: (r) => (
          <span className="font-medium text-zinc-100">Sem {r.semester}</span>
        ),
      },
      {
        key: "weeklyHours",
        header: "Weekly Hrs",
        render: (r) => (
          <span className="font-medium text-zinc-100">{r.weeklyHours}</span>
        ),
      },
      {
        key: "type",
        header: "Type",
        render: (r) => (
          <div className="flex flex-wrap gap-1.5">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${r.type === "Lab"
                ? "bg-violet-100 text-violet-700"
                : "bg-emerald-100 text-emerald-700"
                }`}
            >
              {r.type}
            </span>

            {r.requiresLab ? (
              <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                Lab Required
              </span>
            ) : null}
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (r) => (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onEdit(r)}
              type="button"
            >
              Edit
            </Button>

            <Button
              size="sm"
              variant="danger"
              onClick={() => del.mutate(r._id)}
              disabled={del.isPending}
              type="button"
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [del.isPending]
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-800 p-5 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subject Management</h1>
            <p className="mt-1 text-sm text-slate-200">
              Create, edit, and organize subjects used in timetable generation.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="rounded-xl bg-zinc-900/10 px-4 py-2 text-sm">
              Total Subjects: <span className="font-semibold">{subjectStats.total}</span>
            </div>
            <div className="rounded-xl bg-zinc-900/10 px-4 py-2 text-sm">
              Theory: <span className="font-semibold">{subjectStats.theory}</span>
            </div>
            <div className="rounded-xl bg-zinc-900/10 px-4 py-2 text-sm">
              Labs: <span className="font-semibold">{subjectStats.lab}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden border-white/10 lg:col-span-1">
          <CardHeader className="border-b border-white/5 bg-zinc-950">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-zinc-50">
                  {editing ? "Edit Subject" : "Create Subject"}
                </div>
              </div>

              {editing ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Editing Mode
                </span>
              ) : (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  New Entry
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Code *
                  </label>
                  <Input
                    value={form.code}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, code: e.target.value }))
                    }
                    placeholder="e.g. CS301"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Semester *
                  </label>
                  <Select
                    value={form.semester}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, semester: Number(e.target.value) }))
                    }
                  >
                    {SEMESTERS.map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Name *
                </label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Enter subject name"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Department *
                </label>
                <Select
                  value={form.department}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, department: e.target.value }))
                  }
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Weekly Hours *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={form.weeklyHours}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, weeklyHours: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Type
                  </label>
                  <Select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                  >
                    <option value="Theory">Theory</option>
                    <option value="Lab">Lab</option>
                  </Select>
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3">
                <input
                  id="requiresLab"
                  type="checkbox"
                  checked={form.requiresLab}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, requiresLab: e.target.checked }))
                  }
                  className="h-4 w-4"
                />
                <div>
                  <div className="text-sm font-medium text-zinc-100">
                    Requires Lab
                  </div>
                  <div className="text-xs text-zinc-400">
                    Enable if this subject also needs a lab allocation.
                  </div>
                </div>
              </label>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Lab Duration (slots)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="4"
                  value={form.labDuration}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, labDuration: e.target.value }))
                  }
                />
                <div className="mt-1 text-xs text-zinc-400">
                  Recommended default is 2 slots.
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Preview
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full bg-zinc-900 px-3 py-1 text-sm font-medium text-zinc-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
                    {form.code || "No Code"}
                  </span>
                  <span className="inline-flex rounded-full bg-zinc-900 px-3 py-1 text-sm font-medium text-zinc-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
                    {form.name || "Unnamed Subject"}
                  </span>
                  <span className="inline-flex rounded-full bg-zinc-900 px-3 py-1 text-sm font-medium text-zinc-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
                    {form.department || "No Dept"}
                  </span>
                  <span className="inline-flex rounded-full bg-zinc-900 px-3 py-1 text-sm font-medium text-zinc-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
                    Sem {form.semester}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button disabled={save.isPending} type="submit">
                  {save.isPending
                    ? "Saving..."
                    : editing
                      ? "Update Subject"
                      : "Save Subject"}
                </Button>

                {editing ? (
                  <Button variant="secondary" type="button" onClick={resetForm}>
                    Cancel
                  </Button>
                ) : null}
              </div>

              {save.isError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {apiErrorMessage(save.error)}
                </div>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3 lg:col-span-2">
          <Card className="border-white/10">
            <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Filter Department
                </label>
                <Select
                  value={filters.department}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, department: e.target.value }))
                  }
                >
                  <option value="">All Departments</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Filter Semester
                </label>
                <Select
                  value={filters.semester}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, semester: e.target.value }))
                  }
                >
                  <option value="">All Semesters</option>
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Search
                </label>
                <Input
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, search: e.target.value }))
                  }
                  placeholder="Search subjects..."
                />
              </div>

              <div className="flex items-end gap-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() =>
                    qc.invalidateQueries({ queryKey: ["admin-subjects"] })
                  }
                >
                  Refresh
                </Button>

                <Button
                  variant="secondary"
                  type="button"
                  onClick={() =>
                    setFilters({
                      department: "",
                      semester: "",
                      search: "",
                    })
                  }
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {q.isError ? (
            <Card>
              <CardContent className="text-sm text-red-600">
                {apiErrorMessage(q.error)}
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-white/10">
            <CardHeader className="border-b border-white/5 bg-zinc-950">
              <div className="flex items-center justify-between">
                <div className="text-base font-semibold text-zinc-50">
                  Subjects List
                </div>
                <div className="text-sm text-zinc-400">
                  Showing {rows.length} item{rows.length === 1 ? "" : "s"}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table columns={columns} rows={rows} rowKey={(r) => r._id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}