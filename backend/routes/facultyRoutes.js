import express from "express";
import Teacher from "../models/Teacher.js";
import Timetable from "../models/Timetable.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/* Protect all faculty routes */
router.use(protect);


/* =====================================
   GET ALL TEACHERS (FOR DROPDOWN)
===================================== */
router.get("/teachers", async (req, res) => {
  try {
    const teachers = await Teacher.find().select("name department email").sort("name");
    res.json({
      success: true,
      data: teachers
    });
  } catch (error) {
    console.error("Error fetching teachers list:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================
   GET TEACHER SCHEDULE
===================================== */
router.get("/schedule/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    const timetables = await Timetable.find({
      "data.teacherId": teacherId,
      isActive: true
    })
      .populate("data.teacherId", "name")
      .populate("data.roomId", "name")
      .populate("data.subjectId", "name");

    const organizedSchedule = timetables.map(timetable => ({
      department: timetable.department,
      semester: timetable.semester,
      section: timetable.section,
      academicYear: timetable.academicYear,
      classes: timetable.data.filter(
        entry =>
          entry.teacherId &&
          (entry.teacherId._id ? entry.teacherId._id.toString() : entry.teacherId.toString()) === teacherId.toString()
      )
    }));

    res.json({
      success: true,
      data: {
        teacher: {
          name: teacher.name,
          department: teacher.department,
          email: teacher.email
        },
        schedule: organizedSchedule
      }
    });

  } catch (error) {
    console.error("Error fetching teacher schedule:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

/* =====================================
   UPDATE AVAILABILITY
===================================== */
router.put("/availability/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { availability } = req.body;

    const teacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { availability },
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    res.json({
      success: true,
      message: "Availability updated successfully",
      data: teacher
    });

  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

/* =====================================
   WORKLOAD SUMMARY
===================================== */
router.get("/workload/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    const timetables = await Timetable.find({
      "data.teacherId": teacherId,
      isActive: true
    });

    let totalClasses = 0;
    const workloadByDay = {};
    const subjects = new Set();

    timetables.forEach(timetable => {
      timetable.data
        .filter(entry =>
          entry.teacherId &&
          entry.teacherId.toString() === teacherId.toString()
        )
        .forEach(entry => {
          totalClasses++;
          subjects.add(entry.subjectId.toString());

          workloadByDay[entry.day] =
            (workloadByDay[entry.day] || 0) + 1;
        });
    });

    const workingDays = Object.keys(workloadByDay).length || 1;

    res.json({
      success: true,
      data: {
        teacher: {
          name: teacher.name,
          department: teacher.department,
          maxHoursPerDay: teacher.maxHoursPerDay
        },
        workload: {
          totalClasses,
          uniqueSubjects: subjects.size,
          workloadByDay,
          averagePerDay: totalClasses / workingDays
        }
      }
    });

  } catch (error) {
    console.error("Error fetching workload:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

export default router;