import express from "express";
import {
  generateTimetable,
  getTimetable,
  getTimetableByTeacher,
  updateTimetableEntry,
  deleteTimetable
} from "../controller/timetableController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ===========================
   STUDENT ROUTE (Public)
=========================== */
router.get("/student", getTimetable);

/* ===========================
   FACULTY ROUTES
=========================== */
router.get(
  "/teacher/:teacherId",
  protect,
  authorize("faculty", "admin"),
  getTimetableByTeacher
);

/* ===========================
   ADMIN ROUTES
=========================== */
router.post(
  "/generate",
  protect,
  authorize("admin"),
  generateTimetable
);

router.get(
  "/",
  protect,
  authorize("admin"),
  getTimetable
);

router.put(
  "/entry/:id",
  protect,
  authorize("admin"),
  updateTimetableEntry
);

router.delete(
  "/",
  protect,
  authorize("admin"),
  deleteTimetable
);

export default router;