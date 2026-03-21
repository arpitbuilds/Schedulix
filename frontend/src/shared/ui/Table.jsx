import React from "react";

export default function Table({ columns, rows, rowKey }) {
  return (
    <div className="overflow-auto rounded-2xl border border-white/10 bg-zinc-900">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-zinc-950 text-xs uppercase text-slate-600">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-semibold">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-zinc-400" colSpan={columns.length}>
                No data
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={rowKey(r)} className="border-t border-white/5">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 align-top">
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// import React from "react";

// export default function Table({ columns, rows, rowKey }) {
//   return (
//     <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
//       <div className="overflow-auto">
//         <table className="min-w-full text-left text-sm">
//           <thead className="bg-zinc-950 text-xs uppercase tracking-wide text-zinc-400">
//             <tr>
//               {columns.map((c) => (
//                 <th
//                   key={c.key}
//                   className="whitespace-nowrap px-4 py-3.5 font-semibold"
//                 >
//                   {c.header}
//                 </th>
//               ))}
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-slate-100">
//             {rows.length === 0 ? (
//               <tr>
//                 <td
//                   className="px-4 py-10 text-center text-sm text-zinc-400"
//                   colSpan={columns.length}
//                 >
//                   No data available
//                 </td>
//               </tr>
//             ) : (
//               rows.map((r, index) => (
//                 <tr
//                   key={rowKey(r)}
//                   className={[
//                     "transition-colors hover:bg-zinc-900/5/80",
//                     index % 2 === 0 ? "bg-zinc-900" : "bg-zinc-950/30",
//                   ].join(" ")}
//                 >
//                   {columns.map((c) => (
//                     <td key={c.key} className="px-4 py-3.5 align-top text-zinc-300">
//                       {c.render ? c.render(r) : r[c.key]}
//                     </td>
//                   ))}
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }