import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./shared/layout/AppShell.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import StudentTimetablePage from "./pages/student/StudentTimetablePage.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import FacultyDashboard from "./pages/faculty/FacultyDashboard.jsx";
import ProtectedRoute from "./shared/auth/ProtectedRoute.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/login" replace />} />

          <Route path="/student" element={<StudentTimetablePage />} />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/faculty/*"
            element={
              <ProtectedRoute roles={["faculty", "admin"]}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
         {/* Fixed Watermark in Bottom Right Corner */}
      <div className="fixed bottom-4 right-5 z-50 pointer-events-none rounded-full bg-zinc-900/50 px-3 py-1.5 backdrop-blur-sm shadow-sm border border-white/5">
        <p className="text-xs font-medium tracking-wide text-zinc-300">
          Made by Arpit 
        </p>
      </div>
    </div>
  );
}
