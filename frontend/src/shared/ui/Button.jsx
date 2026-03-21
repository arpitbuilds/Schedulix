// import React from "react";
// import clsx from "clsx";

// export default function Button({
//   children,
//   variant = "primary",
//   size = "md",
//   className,
//   ...props
// }) {
//   return (
//     <button
//       className={clsx(
//         "inline-flex items-center justify-center rounded-xl font-medium transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed",
//         size === "sm" && "px-3 py-2 text-sm",
//         size === "md" && "px-4 py-2.5 text-sm",
//         size === "lg" && "px-5 py-3 text-base",
//         variant === "primary" && "bg-indigo-600 text-white hover:bg-indigo-500",
//         variant === "secondary" && "bg-zinc-900 border border-white/10 hover:bg-zinc-900/5",
//         variant === "danger" && "bg-red-600 text-white hover:bg-red-500",
//         className
//       )}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// }

import React from "react";
import clsx from "clsx";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className,
  ...props
}) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-slate-300",
        "active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",

        /* sizes */
        size === "sm" && "px-3 py-2 text-sm",
        size === "md" && "px-4 py-2.5 text-sm",
        size === "lg" && "px-5 py-3 text-base",

        /* variants */
        variant === "primary" &&
        "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]",

        variant === "secondary" &&
        "bg-zinc-900 border border-white/10 text-zinc-100 hover:bg-zinc-900/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]",

        variant === "danger" &&
        "bg-red-600 text-white hover:bg-red-500 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]",

        variant === "ghost" &&
        "bg-transparent text-zinc-300 hover:bg-zinc-900/5",

        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      )}

      {children}
    </button>
  );
}