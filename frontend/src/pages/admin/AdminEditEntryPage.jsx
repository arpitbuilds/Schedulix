import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "../../shared/ui/Card.jsx";
import Select from "../../shared/ui/Select.jsx";
import Button from "../../shared/ui/Button.jsx";
import { apiErrorMessage } from "../../shared/api/http.js";
import { useToast } from "../../shared/ui/toast/ToastContext.jsx";
import {
  listTeachers,
  listRooms,
  listSubjects,
  updateTimetableEntry,
} from "../../features/admin/adminApi.js";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function normalizeDept(v) {
  return (v || "").trim().toUpperCase();
}

export default function AdminEditEntryPage() {
  const { entryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { push } = useToast();

  const state = location.state || {};
  const entry = state.entry;
  const timetableParams = state.timetableParams;

  if (!entry || !timetableParams) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-800 p-5 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
          <h1 className="text-2xl font-bold tracking-tight">Edit Timetable Entry</h1>
          <p className="mt-1 text-sm text-slate-200">
            The entry details were not found in navigation state.
          </p>
        </div>

        <Card className="border-white/10">
          <CardContent className="p-6">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Missing edit context. Please go back to <b>Lookup Timetable</b> and open Edit again.
            </div>

            <div className="mt-4">
              <Button
                variant="secondary"
                onClick={() => navigate("/admin")}
                type="button"
              >
                Go to Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dept = normalizeDept(timetableParams.department);
  const sem = Number(timetableParams.semester);

  const [form, setForm] = useState({
    day: entry.day,
    slot: entry.slot,
    teacherId: entry.teacherId?._id || entry.teacherId,
    subjectId: entry.subjectId?._id || entry.subjectId,
    roomId: entry.roomId?._id || entry.roomId,
  });

  const teachersQ = useQuery({
    queryKey: ["admin-edit-teachers", dept],
    queryFn: () => listTeachers({ department: dept }),
  });

  const roomsQ = useQuery({
    queryKey: ["admin-edit-rooms", dept],
    queryFn: () => listRooms({ department: dept }),
  });

  const subjectsQ = useQuery({
    queryKey: ["admin-edit-subjects", dept, sem],
    queryFn: () => listSubjects({ department: dept, semester: sem }),
  });

  const save = useMutation({
    mutationFn: () =>
      updateTimetableEntry(entryId, {
        day: form.day,
        slot: Number(form.slot),
        teacherId: form.teacherId,
        subjectId: form.subjectId,
        roomId: form.roomId,
      }),

    onSuccess: async () => {
      push({
        variant: "success",
        title: "Updated",
        message: "Timetable entry updated successfully",
      });

      await qc.invalidateQueries({ queryKey: ["admin-timetable"] });
      navigate("/admin", { replace: true });
    },

    onError: (e) =>
      push({
        variant: "error",
        title: "Update failed",
        message: apiErrorMessage(e),
      }),
  });

  const teachers = teachersQ.data ?? [];
  const rooms = roomsQ.data ?? [];
  const subjects = subjectsQ.data ?? [];

  const metaTitle = useMemo(
    () =>
      `${dept} • Sem ${sem} • Sec ${timetableParams.section} • ${timetableParams.academicYear}`,
    [dept, sem, timetableParams.section, timetableParams.academicYear]
  );

  const selectedSubject = subjects.find((s) => s._id === form.subjectId);
  const selectedTeacher = teachers.find((t) => t._id === form.teacherId);
  const selectedRoom = rooms.find((r) => r._id === form.roomId);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-800 p-5 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Timetable Entry</h1>
            <p className="mt-1 text-sm text-slate-200">
              Update the selected class slot with the correct subject, teacher, and room.
            </p>
          </div>

          <div className="rounded-xl bg-zinc-900/10 px-4 py-3 text-sm backdrop-blur-sm">
            <div className="text-xs uppercase tracking-wide text-slate-200">
              Timetable Context
            </div>
            <div className="mt-1 font-medium text-white">{metaTitle}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden border-white/10 lg:col-span-2">
          <CardHeader className="border-b border-white/5 bg-zinc-950">
            <div>
              <div className="text-lg font-semibold text-zinc-50">Entry Details</div>
              <div className="mt-1 text-sm text-zinc-400">
                Modify the values below and save the updated timetable entry.
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Day
                </label>
                <Select
                  value={form.day}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, day: e.target.value }))
                  }
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Slot
                </label>
                <Select
                  value={String(form.slot)}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slot: e.target.value }))
                  }
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={s}>
                      P{s}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Subject
                </label>
                <Select
                  value={form.subjectId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subjectId: e.target.value }))
                  }
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Teacher
                </label>
                <Select
                  value={form.teacherId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, teacherId: e.target.value }))
                  }
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Room
                </label>
                <Select
                  value={form.roomId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, roomId: e.target.value }))
                  }
                >
                  <option value="">Select Room</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name} ({r.type})
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {(teachersQ.isError || roomsQ.isError || subjectsQ.isError) && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {apiErrorMessage(teachersQ.error || roomsQ.error || subjectsQ.error)}
              </div>
            )}

            {save.isError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {apiErrorMessage(save.error)}
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                onClick={() => save.mutate()}
                disabled={save.isPending}
                type="button"
              >
                {save.isPending ? "Updating..." : "Update Entry"}
              </Button>

              <Button
                variant="secondary"
                onClick={() => navigate("/admin")}
                type="button"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-white/10">
            <CardHeader className="border-b border-white/5 bg-zinc-950">
              <div className="text-base font-semibold text-zinc-50">Preview</div>
            </CardHeader>

            <CardContent className="space-y-4 p-5">
              <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Day & Slot
                </div>
                <div className="mt-2 text-sm font-medium text-zinc-100">
                  {form.day} • Period {form.slot}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Selected Subject
                </div>
                <div className="mt-2 text-sm font-medium text-zinc-100">
                  {selectedSubject
                    ? `${selectedSubject.code} — ${selectedSubject.name}`
                    : "No subject selected"}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Selected Teacher
                </div>
                <div className="mt-2 text-sm font-medium text-zinc-100">
                  {selectedTeacher ? selectedTeacher.name : "No teacher selected"}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Selected Room
                </div>
                <div className="mt-2 text-sm font-medium text-zinc-100">
                  {selectedRoom
                    ? `${selectedRoom.name} (${selectedRoom.type})`
                    : "No room selected"}
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                Review the selected values carefully before saving changes to the timetable.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}