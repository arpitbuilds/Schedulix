// import React, { useMemo } from "react";
// import { Card, CardContent, CardHeader } from "../ui/Card.jsx";
// import { displayRef, groupEntries } from "./timetableUtils.js";

// function Cell({ entry, isBreak }) {
//   if (isBreak) {
//     return (
//       <div className="h-full rounded-xl border border-dashed border-white/10 bg-zinc-950 p-2 text-center text-xs text-zinc-400">
//         Break
//       </div>
//     );
//   }

//   if (!entry) {
//     return <div className="h-full rounded-xl border border-white/5 bg-zinc-900 p-2" />;
//   }

//   return (
//     <div className="h-full rounded-xl border border-white/10 bg-zinc-900 p-2">
//       <div className="text-xs font-semibold">{displayRef(entry.subjectId)}</div>
//       <div className="mt-1 text-[11px] text-slate-600">
//         Teacher: <span className="font-medium">{displayRef(entry.teacherId)}</span>
//       </div>
//       <div className="text-[11px] text-slate-600">
//         Room: <span className="font-medium">{displayRef(entry.roomId)}</span>
//       </div>
//     </div>
//   );
// }

// export default function TimetableGrid({
//   title,
//   days,
//   periodsPerDay,
//   breakSlots = [],
//   entries,
//   showMeta = false
// }) {
//   const entryMap = useMemo(() => groupEntries(entries), [entries]);

//   return (
//     <Card>
//       <CardHeader>
//         <div className="flex items-center justify-between gap-3">
//           <div className="min-w-0">
//             <div className="text-lg font-semibold truncate">{title}</div>
//             {showMeta ? (
//               <div className="text-sm text-slate-600">
//                 Days: {days.length} • Periods/day: {periodsPerDay}
//               </div>
//             ) : null}
//           </div>
//         </div>
//       </CardHeader>

//       <CardContent>
//         <div className="overflow-auto">
//           <div
//             className="grid gap-2"
//             style={{
//               gridTemplateColumns: `160px repeat(${periodsPerDay}, minmax(160px, 1fr))`
//             }}
//           >
//             <div className="sticky left-0 z-10 rounded-xl bg-zinc-900 p-2 text-xs font-semibold text-zinc-300 border border-white/10">
//               Day / Slot
//             </div>

//             {Array.from({ length: periodsPerDay }, (_, i) => i + 1).map((slot) => (
//               <div key={slot} className="rounded-xl bg-zinc-900 p-2 text-xs font-semibold text-zinc-300 border border-white/10 text-center">
//                 P{slot}
//               </div>
//             ))}

//             {days.map((day) => (
//               <React.Fragment key={day}>
//                 <div className="sticky left-0 z-10 rounded-xl bg-zinc-900 p-2 text-sm font-semibold border border-white/10">
//                   {day}
//                 </div>

//                 {Array.from({ length: periodsPerDay }, (_, i) => i + 1).map((slot) => {
//                   const isBreak = breakSlots.includes(slot);
//                   const entry = entryMap.get(`${day}|${slot}`);
//                   return <Cell key={`${day}-${slot}`} entry={entry} isBreak={isBreak} />;
//                 })}
//               </React.Fragment>
//             ))}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

import React, { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Button from "../ui/Button.jsx";
import { Card, CardContent, CardHeader } from "../ui/Card.jsx";
import { displayRef, groupEntries } from "./timetableUtils.js";

function Cell({ entry, isBreak, day, slot, isEditable, onMove }) {
  if (isBreak) {
    return (
      <div 
        className={`h-full min-h-[110px] rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-3 text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] ${isEditable ? 'opacity-50' : ''}`}
      >
        <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          Break
        </div>
        <div className="mt-2 text-[11px] text-amber-600">
          No class scheduled
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div 
        className={`h-full min-h-[110px] rounded-2xl border border-white/10 bg-zinc-950 p-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] flex items-center justify-center text-xs font-medium text-slate-400 ${isEditable ? 'border-dashed border-white/20 hover:bg-zinc-900/80 transition-colors' : ''}`}
        onDragOver={(e) => {
          if (isEditable) {
            e.preventDefault(); // allow drop
          }
        }}
        onDrop={(e) => {
          if (isEditable) {
            e.preventDefault();
            const sourceEntryId = e.dataTransfer.getData("text/plain");
            if (sourceEntryId) {
              onMove(sourceEntryId, day, slot);
            }
          }
        }}
      >
        {isEditable ? "Drop Here" : "Empty"}
      </div>
    );
  }

  return (
    <div 
      className={`h-full min-h-[110px] rounded-2xl border border-white/10 bg-zinc-900 p-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.6)] ${isEditable ? 'cursor-grab active:cursor-grabbing border-l-4 border-l-indigo-500' : ''}`}
      draggable={isEditable}
      onDragStart={(e) => {
        if (isEditable) {
          e.dataTransfer.setData("text/plain", entry._id);
          e.dataTransfer.effectAllowed = "move";
        }
      }}
      onDragOver={(e) => {
        if (isEditable) {
          e.preventDefault(); // allow swap
        }
      }}
      onDrop={(e) => {
        if (isEditable) {
          e.preventDefault();
          const sourceEntryId = e.dataTransfer.getData("text/plain");
          if (sourceEntryId && sourceEntryId !== entry._id) {
            // Swap logic
            onMove(sourceEntryId, day, slot);
          }
        }
      }}
    >
      <div className="inline-flex rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
        Scheduled
      </div>

      <div className="mt-3 text-sm font-semibold leading-snug text-zinc-50">
        {displayRef(entry.subjectId)}
      </div>

      <div className="mt-3 space-y-1.5 text-[11px] text-slate-600">
        <div className="rounded-lg bg-zinc-950 px-2.5 py-2">
          <span className="font-semibold text-zinc-300">Teacher:</span>{" "}
          <span className="font-medium">{displayRef(entry.teacherId)}</span>
        </div>

        <div className="rounded-lg bg-zinc-950 px-2.5 py-2">
          <span className="font-semibold text-zinc-300">Room:</span>{" "}
          <span className="font-medium">{displayRef(entry.roomId)}</span>
        </div>
      </div>
    </div>
  );
}

export default function TimetableGrid({
  title,
  days,
  periodsPerDay,
  breakSlots = [],
  entries,
  showMeta = false,
  isEditable = false,
  onMove = () => {},
}) {
  const entryMap = useMemo(() => groupEntries(entries), [entries]);
  const gridRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const totalCells = days.length * periodsPerDay;
  const scheduledCount = entries?.length || 0;
  const breakCount = days.length * breakSlots.length;

  const handleExportPDF = async () => {
    if (!gridRef.current) return;
    setExporting(true);
    try {
      const element = gridRef.current;
      const canvas = await html2canvas(element, { 
        scale: 2,
        backgroundColor: "#09090b", // Match zinc-950 base background 
      });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("l", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // Add Title text directly to PDF
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(title || "Timetable", 20, 30);
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(150);
      pdf.text("Generated by Schedulix Timetable Portal", 20, 45);

      // Add actual grid image
      const imgWidth = pdfWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 20, 60, imgWidth, imgHeight);
      
      const cleanTitle = title ? title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'timetable_export';
      pdf.save(`${cleanTitle}.pdf`);
    } catch (err) {
      console.error("PDF Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="overflow-hidden border-white/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
      <CardHeader className="border-b border-white/5 bg-zinc-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="truncate text-xl font-semibold text-zinc-50">
              {title}
            </div>

            {showMeta ? (
              <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
                <span className="inline-flex rounded-full bg-zinc-900 px-3 py-1 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
                  Days: <span className="ml-1 font-medium">{days.length}</span>
                </span>
                <span className="inline-flex rounded-full bg-zinc-900 px-3 py-1 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
                  Periods/day:
                  <span className="ml-1 font-medium">{periodsPerDay}</span>
                </span>
                <span className="inline-flex rounded-full bg-zinc-900 px-3 py-1 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
                  Break slots:
                  <span className="ml-1 font-medium">
                    {breakSlots.length ? breakSlots.join(", ") : "None"}
                  </span>
                </span>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Scheduled
              </div>
              <div className="mt-1 text-lg font-bold text-zinc-50">
                {scheduledCount}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Break Cells
              </div>
              <div className="mt-1 text-lg font-bold text-zinc-50">
                {breakCount}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] col-span-2 sm:col-span-1">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Total Cells
              </div>
              <div className="mt-1 text-lg font-bold text-zinc-50">
                {totalCells}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button 
            size="sm" 
            onClick={handleExportPDF} 
            disabled={exporting} 
            className="flex items-center gap-2 bg-zinc-100 text-zinc-900 hover:bg-white shadow-[0_4px_20px_-4px_rgba(255,255,255,0.2)] font-semibold border-none rounded-xl px-4 py-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            {exporting ? "Generating PDF..." : "Download PDF"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <div className="overflow-auto rounded-2xl border border-white/10 bg-zinc-900/50 p-3">
          <div ref={gridRef} className="min-w-max rounded-2xl bg-[#09090b] p-4">
            <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `170px repeat(${periodsPerDay}, minmax(170px, 1fr))`,
            }}
          >
            <div className="sticky left-0 z-20 rounded-2xl border border-white/10 bg-indigo-600 p-3 text-center text-xs font-semibold uppercase tracking-wide text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
              Day / Slot
            </div>

            {Array.from({ length: periodsPerDay }, (_, i) => i + 1).map((slot) => (
              <div
                key={slot}
                className="rounded-2xl border border-white/10 bg-zinc-900 p-3 text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Period
                </div>
                <div className="mt-1 text-sm font-bold text-zinc-50">
                  P{slot}
                </div>
              </div>
            ))}

            {days.map((day) => (
              <React.Fragment key={day}>
                <div className="sticky left-0 z-10 flex min-h-[110px] items-center rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Day
                    </div>
                    <div className="mt-1 text-sm font-bold text-zinc-50">
                      {day}
                    </div>
                  </div>
                </div>

                {Array.from({ length: periodsPerDay }, (_, i) => i + 1).map((slot) => {
                  const isBreak = breakSlots.includes(slot);
                  const entry = entryMap.get(`${day}|${slot}`);

                  return (
                    <Cell
                      key={`${day}-${slot}`}
                      entry={entry}
                      isBreak={isBreak}
                      day={day}
                      slot={slot}
                      isEditable={isEditable}
                      onMove={onMove}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}