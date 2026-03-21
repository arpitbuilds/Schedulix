// import React from "react";
// import clsx from "clsx";

// export default function ToastViewport({ toasts, onClose }) {
//   return (
//     <div className="fixed right-4 top-4 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
//       {toasts.map((t) => (
//         <div
//           key={t.id}
//           className={clsx(
//             "rounded-2xl border bg-zinc-900 p-4 shadow-lg",
//             t.variant === "error" && "border-red-200",
//             t.variant === "success" && "border-emerald-200",
//             t.variant === "info" && "border-white/10"
//           )}
//         >
//           <div className="flex items-start justify-between gap-3">
//             <div className="min-w-0">
//               {t.title ? (
//                 <div className="text-sm font-semibold">{t.title}</div>
//               ) : null}
//               <div className="text-sm text-zinc-300 break-words">{t.message}</div>
//             </div>
//             <button
//               onClick={() => onClose(t.id)}
//               className="shrink-0 rounded-lg px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-900/5"
//               aria-label="Close"
//               type="button"
//             >
//               ✕
//             </button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

import React from "react";
import clsx from "clsx";

function getVariantStyles(variant) {
  switch (variant) {
    case "success":
      return {
        border: "border-emerald-500/30",
        bg: "bg-emerald-950/40",
        icon: "✓",
        iconColor: "text-emerald-400",
      };

    case "error":
      return {
        border: "border-red-500/30",
        bg: "bg-red-950/40",
        icon: "⚠",
        iconColor: "text-red-400",
      };

    default:
      return {
        border: "border-white/10",
        bg: "bg-zinc-900",
        icon: "ℹ",
        iconColor: "text-slate-600",
      };
  }
}

export default function ToastViewport({ toasts, onClose }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3">
      {toasts.map((t) => {
        const styles = getVariantStyles(t.variant);

        return (
          <div
            key={t.id}
            className={clsx(
              "pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-lg transition animate-in fade-in slide-in-from-top-3",
              styles.border,
              styles.bg
            )}
          >
            <div
              className={clsx(
                "flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                styles.iconColor
              )}
            >
              {styles.icon}
            </div>

            <div className="min-w-0 flex-1">
              {t.title ? (
                <div className="text-sm font-semibold text-zinc-50">
                  {t.title}
                </div>
              ) : null}

              <div className="mt-0.5 break-words text-sm text-zinc-300">
                {t.message}
              </div>
            </div>

            <button
              onClick={() => onClose(t.id)}
              className="shrink-0 rounded-lg px-2 py-1 text-xs text-zinc-400 transition hover:bg-white/5"
              aria-label="Close"
              type="button"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}