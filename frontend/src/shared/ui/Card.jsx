// import React from "react";
// import clsx from "clsx";

// export function Card({ className, ...props }) {
//   return (
//     <div
//       className={clsx("rounded-2xl border border-white/10 bg-zinc-900 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]", className)}
//       {...props}
//     />
//   );
// }

// export function CardHeader({ className, ...props }) {
//   return <div className={clsx("border-b border-white/5 p-4", className)} {...props} />;
// }

// export function CardContent({ className, ...props }) {
//   return <div className={clsx("p-4", className)} {...props} />;
// }

import React from "react";
import clsx from "clsx";

export function Card({ className, ...props }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-white/10 bg-zinc-900 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]",
        "transition-shadow duration-200 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.6)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={clsx(
        "border-b border-white/5 px-5 py-4",
        "bg-zinc-950/60",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return (
    <div
      className={clsx(
        "px-5 py-4",
        className
      )}
      {...props}
    />
  );
}