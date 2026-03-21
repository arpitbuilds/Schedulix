// import React from "react";
// import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
// import Button from "../ui/Button.jsx";
// import { useAuth } from "../auth/AuthContext.jsx";

// function NavLink({ to, children }) {
//   const { pathname } = useLocation();
//   const active = pathname === to || pathname.startsWith(to + "/");
//   return (
//     <Link
//       to={to}
//       className={[
//         "rounded-xl px-3 py-2 text-sm transition",
//         active ? "bg-indigo-600 text-white" : "text-zinc-300 hover:bg-zinc-900/5"
//       ].join(" ")}
//     >
//       {children}
//     </Link>
//   );
// }

// export default function AppShell() {
//   const { isAuthed, user, logout } = useAuth();
//   const navigate = useNavigate();

//   function onLogout() {
//     logout();
//     navigate("/student");
//   }

//   return (
//     <div className="min-h-screen">
//       <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-900/80 backdrop-blur">
//         <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
//           <Link to="/student" className="flex items-center gap-2">
//             <div className="grid h-9 w-9 place-items-center rounded-2xl bg-indigo-600 text-white text-sm font-semibold">
//               TT
//             </div>
//             <div className="leading-tight">
//               <div className="text-sm font-semibold">Where is My TimeTable</div>
//               <div className="text-xs text-zinc-400">CP-SAT Generator</div>
//             </div>
//           </Link>

//           <nav className="hidden items-center gap-2 md:flex">
//             <NavLink to="/student">Student</NavLink>
//             {isAuthed && user?.role === "admin" ? <NavLink to="/admin">Admin</NavLink> : null}
//             {isAuthed ? <NavLink to="/faculty">Faculty</NavLink> : null}
//           </nav>

//           <div className="flex items-center gap-2">
//             {isAuthed ? (
//               <>
//                 <div className="hidden text-right md:block">
//                   <div className="text-sm font-semibold">{user.username}</div>
//                   <div className="text-xs text-zinc-400">
//                     {user.role}{user.department ? ` • ${user.department}` : ""}
//                   </div>
//                 </div>
//                 <Button variant="secondary" size="sm" onClick={onLogout}>
//                   Logout
//                 </Button>
//               </>
//             ) : (
//               <Button size="sm" onClick={() => navigate("/login")}>
//                 Login
//               </Button>
//             )}
//           </div>
//         </div>
//       </header>

//       <main className="mx-auto max-w-6xl px-4 py-6">
//         <Outlet />
//       </main>

//       <footer className="mx-auto max-w-6xl px-4 pb-8 text-xs text-zinc-400">
//         Backend expected at <span className="font-mono">/api</span> on{" "}
//         <span className="font-mono">{import.meta.env.VITE_API_URL || "http://localhost:5001"}</span>
//       </footer>
//     </div>
//   );
// }

import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import Button from "../ui/Button.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

function ShellNavLink({ to, children, onClick }) {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + "/");

  return (
    <Link
      to={to}
      onClick={onClick}
      className={[
        "rounded-xl px-3 py-2 text-sm font-medium transition",
        active
          ? "bg-white/10 text-white shadow-inner"
          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-50",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export default function AppShell() {
  const { isAuthed, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function onLogout() {
    logout();
    setMobileOpen(false);
    navigate("/login");
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-900/90 backdrop-blur">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/student"
            className="flex items-center gap-3"
            onClick={closeMobileMenu}
          >
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 text-sm font-bold text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
              TT
            </div>

            <div className="leading-tight">
              <div className="text-sm font-semibold md:text-base">
                Schedulix
              </div>
              <div className="text-xs text-zinc-400">
                Smart timetable management
              </div>
            </div>
          </Link>

          {isAuthed ? (
            <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 md:flex">
              <ShellNavLink to="/student">Student Search</ShellNavLink>
              {user?.role === "admin" ? (
                <ShellNavLink to="/admin">Admin Panel</ShellNavLink>
              ) : null}
              <ShellNavLink to="/faculty">Faculty Dashboard</ShellNavLink>
            </nav>
          ) : (
            <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-zinc-400 md:block">
              STUDENT TIMETABLE PORTAL
            </div>
          )}

          <div className="hidden items-center gap-2 md:flex">
            {isAuthed ? (
              <>
                <div className="rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-right">
                  {user.role === "admin" ? (
                    <div className="text-sm font-semibold tracking-wide text-zinc-200">
                      Administrator
                    </div>
                  ) : (
                    <>
                      <div className="text-sm font-semibold text-zinc-50">
                        {user.username}
                      </div>
                      <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                        {user.role}{user.department ? ` • ${user.department}` : ""}
                      </div>
                    </>
                  )}
                </div>

                <Button variant="secondary" size="sm" onClick={onLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => navigate("/login")}>
                Staff Login
              </Button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-zinc-300 transition hover:bg-zinc-900/5 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-white/10 bg-zinc-900 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4">
              <ShellNavLink to="/student" onClick={closeMobileMenu}>
                Student Search
              </ShellNavLink>

              {isAuthed && user?.role === "admin" ? (
                <ShellNavLink to="/admin" onClick={closeMobileMenu}>
                  Admin Panel
                </ShellNavLink>
              ) : null}

              {isAuthed ? (
                <ShellNavLink to="/faculty" onClick={closeMobileMenu}>
                  Faculty Dashboard
                </ShellNavLink>
              ) : null}

              <div className="mt-2 border-t border-white/5 pt-3">
                {isAuthed ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-zinc-950 px-3 py-3">
                      {user.role === "admin" ? (
                        <div className="text-sm font-semibold tracking-wide text-zinc-200">
                          Administrator
                        </div>
                      ) : (
                        <>
                          <div className="text-sm font-semibold text-zinc-50">
                            {user.username}
                          </div>
                          <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                            {user.role}{user.department ? ` • ${user.department}` : ""}
                          </div>
                        </>
                      )}
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onLogout}
                      className="w-full"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      closeMobileMenu();
                      navigate("/login");
                    }}
                    className="w-full"
                  >
                    Staff Login
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}