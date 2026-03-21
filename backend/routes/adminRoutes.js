import express from "express";
import {
  createTeacher,
  getTeachers,
  updateTeacher,
  deleteTeacher,
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
  createRoom,
  getRooms,
  updateRoom,
  deleteRoom,
  createConstraint,
  getConstraints,
  updateConstraint,
  deleteConstraint
} from "../controller/adminController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/* Protect all admin routes */
router.use(protect);
router.use(authorize("admin"));

// Teacher routes
router.post("/teachers", createTeacher);
router.get("/teachers", getTeachers);
router.put("/teachers/:id", updateTeacher);
router.delete("/teachers/:id", deleteTeacher);

// Subject routes
router.post("/subjects", createSubject);
router.get("/subjects", getSubjects);
router.put("/subjects/:id", updateSubject);
router.delete("/subjects/:id", deleteSubject);

// Room routes
router.post("/rooms", createRoom);
router.get("/rooms", getRooms);
router.put("/rooms/:id", updateRoom);
router.delete("/rooms/:id", deleteRoom);

// Constraint routes
router.post("/constraints", createConstraint);
router.get("/constraints", getConstraints);
router.put("/constraints/:id", updateConstraint);
router.delete("/constraints/:id", deleteConstraint);

export default router;