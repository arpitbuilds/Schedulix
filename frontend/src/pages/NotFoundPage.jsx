import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../shared/ui/Card.jsx";

export default function NotFoundPage() {
  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="text-lg font-semibold">Page not found</div>
        <div className="text-sm text-slate-600">
          The page you are looking for doesn&apos;t exist.
        </div>
        <Link to="/student" className="text-sm text-zinc-50 underline">
          Go to Student Timetable
        </Link>
      </CardContent>
    </Card>
  );
}
