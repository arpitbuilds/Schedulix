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
  createTeacher,
  deleteTeacher,
  listTeachers,
  updateTeacher,
  listSubjects,
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

function normalizeDept(v) {
  return (v || "").trim().toUpperCase();
}

function getInitialForm() {
  return {
    name: "",
    department: "IT",
    email: "",
    phone: "",
    maxHoursPerDay: 6,
    subjects: [],
  };
}

export default function AdminTeachersPage() {
  const qc = useQueryClient();
  const { push } = useToast();

  const [department, setDepartment] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(getInitialForm());
  const [editing, setEditing] = useState(null);

  const q = useQuery({
    queryKey: ["admin-teachers", department],
    queryFn: () =>
      listTeachers(
        department ? { department: normalizeDept(department) } : undefined
      ),
  });

  const subjectsQuery = useQuery({
    queryKey: ["admin-subjects-for-teachers"],
    queryFn: () => listSubjects(),
  });

  const subjectInfoById = useMemo(() => {
    const m = new Map();
    (subjectsQuery.data || []).forEach((s) => {
      m.set(String(s._id), {
        name: s.name,
        code: s.code,
      });
    });
    return m;
  }, [subjectsQuery.data]);

  const rows = useMemo(() => {
    const base = q.data ?? [];
    const term = search.trim().toLowerCase();

    if (!term) return base;

    return base.filter((teacher) => {
      const subjectText = (teacher.subjects || [])
        .map((s) => {
          const id = typeof s === "string" ? s : s.subjectId;
          const subject = subjectInfoById.get(String(id));
          return subject ? `${subject.code || ""} ${subject.name || ""}` : String(id);
        })
        .join(" ");

      const text = [
        teacher.name,
        teacher.department,
        teacher.email,
        teacher.phone,
        String(teacher.maxHoursPerDay ?? ""),
        subjectText,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(term);
    });
  }, [q.data, search, subjectInfoById]);

  const teacherStats = useMemo(() => {
    return {
      total: rows.length,
      withSubjects: rows.filter((t) => (t.subjects || []).length > 0).length,
      avgHours:
        rows.length > 0
          ? Math.round(
            rows.reduce((sum, t) => sum + Number(t.maxHoursPerDay || 0), 0) /
            rows.length
          )
          : 0,
    };
  }, [rows]);

  const save = useMutation({
    mutationFn: async (payload) => {
      if (editing?._id) return updateTeacher(editing._id, payload);
      return createTeacher(payload);
    },

    onSuccess: async () => {
      push({
        variant: "success",
        title: "Saved",
        message: editing
          ? "Teacher updated successfully"
          : "Teacher saved successfully",
      });

      setForm(getInitialForm());
      setEditing(null);

      await qc.invalidateQueries({
        queryKey: ["admin-teachers"],
      });
    },

    onError: (e) =>
      push({
        variant: "error",
        title: "Save failed",
        message: apiErrorMessage(e),
      }),
  });

  const del = useMutation({
    mutationFn: (id) => deleteTeacher(id),

    onSuccess: async () => {
      push({
        variant: "success",
        title: "Deleted",
        message: "Teacher deleted successfully",
      });

      await qc.invalidateQueries({
        queryKey: ["admin-teachers"],
      });
    },

    onError: (e) =>
      push({
        variant: "error",
        title: "Delete failed",
        message: apiErrorMessage(e),
      }),
  });

  function toggleSubject(id) {
    setForm((f) => {
      const exists = f.subjects.includes(id);

      if (exists) {
        return {
          ...f,
          subjects: f.subjects.filter((s) => s !== id),
        };
      }

      return {
        ...f,
        subjects: [...f.subjects, id],
      };
    });
  }

  function onEdit(t) {
    setEditing(t);

    setForm({
      name: t.name ?? "",
      department: t.department ?? "IT",
      email: t.email ?? "",
      phone: t.phone ?? "",
      maxHoursPerDay: t.maxHoursPerDay ?? 6,
      subjects: (t.subjects ?? []).map((s) =>
        typeof s === "string" ? s : s.subjectId
      ),
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
      department: normalizeDept(form.department),
      subjects: form.subjects.map((id) => ({
        subjectId: id,
      })),
    });
  }

  const selectedSubjectsPreview = form.subjects
    .map((id) => subjectInfoById.get(String(id)))
    .filter(Boolean);

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Teacher",
        render: (r) => (
          <div className="min-w-[180px]">
            <div className="font-semibold text-zinc-50">{r.name}</div>
            <div className="text-xs text-zinc-400">{r.email || "-"}</div>
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
        key: "phone",
        header: "Phone",
        render: (r) => r.phone || "-",
      },
      {
        key: "subjects",
        header: "Assigned Subjects",
        render: (r) => {
          if (!r.subjects?.length) return "-";

          return (
            <div className="flex max-w-[360px] flex-wrap gap-1.5">
              {r.subjects.map((s, idx) => {
                const id = typeof s === "string" ? s : s.subjectId;
                const subject = subjectInfoById.get(String(id));

                return (
                  <span
                    key={`${id}-${idx}`}
                    className="inline-flex rounded-full border border-white/10 bg-zinc-950 px-2.5 py-1 text-xs font-medium text-zinc-300"
                  >
                    {subject
                      ? `${subject.code ? `${subject.code} - ` : ""}${subject.name}`
                      : String(id)}
                  </span>
                );
              })}
            </div>
          );
        },
      },
      {
        key: "maxHoursPerDay",
        header: "Max Hrs/Day",
        render: (r) => (
          <span className="font-medium text-zinc-100">
            {r.maxHoursPerDay ?? "-"}
          </span>
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
    [del.isPending, subjectInfoById]
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-800 p-5 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Teacher Management</h1>
            <p className="mt-1 text-sm text-slate-200">
              Create, edit, and manage teachers with subject assignments and workload settings.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="rounded-xl bg-zinc-900/10 px-4 py-2 text-sm">
              Total Teachers: <span className="font-semibold">{teacherStats.total}</span>
            </div>
            <div className="rounded-xl bg-zinc-900/10 px-4 py-2 text-sm">
              Assigned Subjects: <span className="font-semibold">{teacherStats.withSubjects}</span>
            </div>
            <div className="rounded-xl bg-zinc-900/10 px-4 py-2 text-sm">
              Avg Max Hrs: <span className="font-semibold">{teacherStats.avgHours}</span>
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
                  {editing ? "Edit Teacher" : "Create Teacher"}
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
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Name *
                </label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Enter teacher name"
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

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Email *
                </label>
                <Input
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Phone
                </label>
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Max Hours / Day
                </label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={form.maxHoursPerDay}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      maxHoursPerDay: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-medium text-zinc-300">
                    Assign Subjects
                  </label>
                  <span className="text-xs text-zinc-400">
                    Selected: {form.subjects.length}
                  </span>
                </div>

                <div className="max-h-52 overflow-y-auto rounded-xl border border-white/10 bg-zinc-950 p-3">
                  {subjectsQuery.isLoading ? (
                    <div className="text-sm text-zinc-400">Loading subjects...</div>
                  ) : subjectsQuery.data?.length ? (
                    <div className="space-y-2">
                      {subjectsQuery.data.map((s) => (
                        <label
                          key={s._id}
                          className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-zinc-900"
                        >
                          <input
                            type="checkbox"
                            checked={form.subjects.includes(s._id)}
                            onChange={() => toggleSubject(s._id)}
                          />
                          <span className="text-sm text-zinc-300">
                            <span className="font-medium">{s.code}</span> — {s.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-zinc-400">No subjects found.</div>
                  )}
                </div>

                {selectedSubjectsPreview.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selectedSubjectsPreview.map((subject, idx) => (
                      <span
                        key={`${subject.code}-${idx}`}
                        className="inline-flex rounded-full border border-white/10 bg-zinc-950 px-2.5 py-1 text-xs font-medium text-zinc-300"
                      >
                        {subject.code ? `${subject.code} - ` : ""}
                        {subject.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <Button disabled={save.isPending} type="submit">
                  {save.isPending
                    ? "Saving..."
                    : editing
                      ? "Update Teacher"
                      : "Save Teacher"}
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
            <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Filter by Department
                </label>
                <Select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
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
                  Search
                </label>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search teachers..."
                />
              </div>

              <div className="flex items-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    qc.invalidateQueries({
                      queryKey: ["admin-teachers"],
                    })
                  }
                  type="button"
                >
                  Refresh
                </Button>

                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setDepartment("");
                    setSearch("");
                  }}
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
                  Teachers List
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