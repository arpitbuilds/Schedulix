// import Teacher from "../models/Teacher.js";
// import Subject from "../models/Subject.js";
// import Room from "../models/Rooms.js";
// import Constraint from "../models/Constraint.js";
// import Timetable from "../models/Timetable.js";
// import { generateTimetableWithCPSAT } from "../service/timetableService.js";

// /* =========================================
//    GENERATE TIMETABLE
// ========================================= */
// export const generateTimetable = async (req, res) => {
//   try {
//     const { department, semester, section, academicYear } = req.body;

//     if (!department || !semester || !section || !academicYear) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Department, semester, section, and academicYear are required",
//       });
//     }

//     const semesterNum = parseInt(semester);

//     const teachers = await Teacher.find({ department });
//     const subjects = await Subject.find({ department, semester: semesterNum });
//     const rooms = await Room.find({ department });

//     if (teachers.length === 0 || subjects.length === 0 || rooms.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Insufficient data: Need teachers, subjects, and rooms",
//       });
//     }

//     const constraints = await Constraint.find({
//       $or: [
//         { type: "General" },
//         { teacherId: { $in: teachers.map((t) => t._id) } },
//         { roomId: { $in: rooms.map((r) => r._id) } },
//         { subjectId: { $in: subjects.map((s) => s._id) } },
//       ],
//     });

//     const result = await generateTimetableWithCPSAT({
//       teachers,
//       subjects,
//       rooms,
//       constraints,
//       semester: semesterNum,
//       section,
//     });

//     if (!result.success) {
//       return res.status(500).json({
//         success: false,
//         message: "Failed to generate timetable",
//         error: result.error,
//       });
//     }

//     let timetable = await Timetable.findOne({
//       department,
//       semester: semesterNum,
//       section,
//       academicYear,
//       isActive: true,
//     });

//     if (timetable) {
//       timetable.data = result.data;
//       timetable.conflicts = result.conflicts || [];
//       timetable.score = result.score || 0;
//       timetable.generatedAt = new Date();
//       timetable.generatedBy = "CP-SAT";
//       await timetable.save();
//     } else {
//       timetable = await Timetable.create({
//         department,
//         semester: semesterNum,
//         section,
//         academicYear,
//         data: result.data,
//         conflicts: result.conflicts || [],
//         score: result.score || 0,
//         generatedBy: "CP-SAT",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Timetable generated successfully",
//       data: timetable,
//     });
//   } catch (error) {
//     console.error("Error generating timetable:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// /* =========================================
//    GET TIMETABLE (Student / Generic)
// ========================================= */
// export const getTimetable = async (req, res) => {
//   try {
//     const { department, semester, section, academicYear } = req.query;

//     if (!department || !semester || !section || !academicYear) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Department, semester, section, and academicYear are required",
//       });
//     }

//     const semesterNum = parseInt(semester);

//     const timetable = await Timetable.findOne({
//       department,
//       semester: semesterNum,
//       section,
//       academicYear,
//       isActive: true,
//     })
//       .populate("data.teacherId", "name")
//       .populate("data.roomId", "name")
//       .populate("data.subjectId", "name");

//     if (!timetable) {
//       return res.status(404).json({
//         success: false,
//         message: "Timetable not found",
//       });
//     }

//     res.json({
//       success: true,
//       data: timetable,
//     });
//   } catch (error) {
//     console.error("Error fetching timetable:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// /* =========================================
//    GET TIMETABLE BY TEACHER
// ========================================= */
// export const getTimetableByTeacher = async (req, res) => {
//   try {
//     const { teacherId } = req.params;

//     const timetables = await Timetable.find({
//       "data.teacherId": teacherId,
//       isActive: true,
//     });

//     if (timetables.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No timetables found for this teacher",
//       });
//     }

//     const organized = timetables.map((t) => ({
//       department: t.department,
//       semester: t.semester,
//       section: t.section,
//       academicYear: t.academicYear,
//       classes: t.data.filter(
//         (entry) =>
//           entry.teacherId &&
//           entry.teacherId.toString() === teacherId.toString()
//       ),
//     }));

//     res.json({
//       success: true,
//       data: organized,
//     });
//   } catch (error) {
//     console.error("Error fetching teacher timetable:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// /* =========================================
//    UPDATE SINGLE TIMETABLE ENTRY
// ========================================= */
// export const updateTimetableEntry = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { day, slot, subjectId, teacherId, roomId } = req.body;

//     const timetable = await Timetable.findOne({
//       "data._id": id,
//       isActive: true,
//     });

//     if (!timetable) {
//       return res.status(404).json({
//         success: false,
//         message: "Timetable entry not found",
//       });
//     }

//     const entry = timetable.data.id(id);

//     if (!entry) {
//       return res.status(404).json({
//         success: false,
//         message: "Timetable entry not found",
//       });
//     }

//     if (day) entry.day = day;
//     if (slot) entry.slot = slot;
//     if (subjectId) entry.subjectId = subjectId;
//     if (teacherId) entry.teacherId = teacherId;
//     if (roomId) entry.roomId = roomId;

//     await timetable.save();

//     res.json({
//       success: true,
//       message: "Timetable entry updated successfully",
//       data: entry,
//     });
//   } catch (error) {
//     console.error("Error updating timetable entry:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// /* =========================================
//    DELETE TIMETABLE (Soft Delete)
// ========================================= */
// export const deleteTimetable = async (req, res) => {
//   try {
//     const { department, semester, section, academicYear } = req.body;

//     const semesterNum = parseInt(semester);

//     const timetable = await Timetable.findOneAndUpdate(
//       {
//         department,
//         semester: semesterNum,
//         section,
//         academicYear,
//         isActive: true,
//       },
//       { isActive: false },
//       { new: true }
//     );

//     if (!timetable) {
//       return res.status(404).json({
//         success: false,
//         message: "Timetable not found",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Timetable deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error deleting timetable:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

import Teacher from "../models/Teacher.js";
import Subject from "../models/Subject.js";
import Room from "../models/Rooms.js";
import Constraint from "../models/Constraint.js";
import Timetable from "../models/Timetable.js";
import { generateTimetableWithCPSAT } from "../service/timetableService.js";

/* =========================================
   GENERATE TIMETABLE
========================================= */
export const generateTimetable = async (req, res) => {
  try {
    const { department, semester, section, academicYear } = req.body;

    if (!department || !semester || !section || !academicYear) {
      return res.status(400).json({
        success: false,
        message:
          "Department, semester, section, and academicYear are required",
      });
    }

    const semesterNum = parseInt(semester, 10);

    const teachers = await Teacher.find({ department });
    const subjects = await Subject.find({ department, semester: semesterNum });
    const rooms = await Room.find({ department });

    if (teachers.length === 0 || subjects.length === 0 || rooms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient data: Need teachers, subjects, and rooms",
      });
    }

    const constraints = await Constraint.find({
      $or: [
        { type: "General" },
        { teacherId: { $in: teachers.map((t) => t._id) } },
        { roomId: { $in: rooms.map((r) => r._id) } },
        { subjectId: { $in: subjects.map((s) => s._id) } },
      ],
    });

    const result = await generateTimetableWithCPSAT({
      teachers,
      subjects,
      rooms,
      constraints,
      semester: semesterNum,
      section,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate timetable",
        error: result.error,
      });
    }

    let timetable = await Timetable.findOne({
      department,
      semester: semesterNum,
      section,
      academicYear,
    });

    if (timetable) {
      timetable.data = result.data;
      timetable.conflicts = result.conflicts || [];
      timetable.score = result.score || 0;
      timetable.generatedAt = new Date();
      timetable.generatedBy = "CP-SAT";
      await timetable.save();
    } else {
      timetable = await Timetable.create({
        department,
        semester: semesterNum,
        section,
        academicYear,
        data: result.data,
        conflicts: result.conflicts || [],
        score: result.score || 0,
        generatedBy: "CP-SAT",
      });
    }

    const populatedTimetable = await Timetable.findById(timetable._id)
      .populate("data.teacherId", "name")
      .populate("data.roomId", "name")
      .populate("data.subjectId", "name code");

    res.json({
      success: true,
      message: "Timetable generated successfully",
      data: populatedTimetable,
    });

    // Emit live update to connected clients
    const io = req.app.get("socketio");
    if (io) {
      io.emit("timetable_updated", {
        department,
        semester: semesterNum,
        action: "generate",
      });
    }
  } catch (error) {
    console.error("Error generating timetable:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/* =========================================
   GET TIMETABLE (Student / Generic)
========================================= */
export const getTimetable = async (req, res) => {
  try {
    const { department, semester, section, academicYear } = req.query;

    if (!department || !semester || !section || !academicYear) {
      return res.status(400).json({
        success: false,
        message:
          "Department, semester, section, and academicYear are required",
      });
    }

    const semesterNum = parseInt(semester, 10);

    const timetable = await Timetable.findOne({
      department,
      semester: semesterNum,
      section,
      academicYear,
    })
      .populate("data.teacherId", "name")
      .populate("data.roomId", "name")
      .populate("data.subjectId", "name code");

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    res.json({
      success: true,
      data: timetable,
    });
  } catch (error) {
    console.error("Error fetching timetable:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/* =========================================
   GET TIMETABLE BY TEACHER
========================================= */
export const getTimetableByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const timetables = await Timetable.find({
      "data.teacherId": teacherId,
    })
      .populate("data.teacherId", "name")
      .populate("data.roomId", "name")
      .populate("data.subjectId", "name code");

    if (timetables.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No timetables found for this teacher",
      });
    }

    const organized = timetables.map((t) => ({
      department: t.department,
      semester: t.semester,
      section: t.section,
      academicYear: t.academicYear,
      classes: t.data.filter(
        (entry) =>
          entry.teacherId &&
          (entry.teacherId._id ? entry.teacherId._id.toString() : entry.teacherId.toString()) === teacherId.toString()
      ),
    }));

    res.json({
      success: true,
      data: organized,
    });
  } catch (error) {
    console.error("Error fetching teacher timetable:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/* =========================================
   UPDATE SINGLE TIMETABLE ENTRY
========================================= */
export const updateTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { day, slot, subjectId, teacherId, roomId } = req.body;

    const timetable = await Timetable.findOne({
      "data._id": id,
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found",
      });
    }

    const entry = timetable.data.id(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found",
      });
    }

    if (day) entry.day = day;
    if (slot !== undefined && slot !== null) entry.slot = slot;
    if (subjectId) entry.subjectId = subjectId;
    if (teacherId) entry.teacherId = teacherId;
    if (roomId) entry.roomId = roomId;

    await timetable.save();

    const updatedTimetable = await Timetable.findById(timetable._id)
      .populate("data.teacherId", "name")
      .populate("data.roomId", "name")
      .populate("data.subjectId", "name code");

    const updatedEntry = updatedTimetable?.data?.id(id);

    res.json({
      success: true,
      message: "Timetable entry updated successfully",
      data: updatedEntry,
    });

    // Emit live update to connected clients
    const io = req.app.get("socketio");
    if (io) {
      io.emit("timetable_updated", {
        department: timetable.department,
        semester: timetable.semester,
        action: "update",
      });
    }
  } catch (error) {
    console.error("Error updating timetable entry:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/* =========================================
   MOVE / SWAP TIMETABLE ENTRY (DRAG & DROP)
========================================= */
export const moveTimetableEntry = async (req, res) => {
  try {
    const { timetableId, draggedEntryId, targetDay, targetSlot } = req.body;

    if (!timetableId || !draggedEntryId || !targetDay || targetSlot === undefined) {
      return res.status(400).json({ success: false, message: "Missing required fields for move operation" });
    }

    const timetable = await Timetable.findById(timetableId);
    if (!timetable) {
      return res.status(404).json({ success: false, message: "Timetable not found" });
    }

    const sourceEntry = timetable.data.id(draggedEntryId);
    if (!sourceEntry) {
      return res.status(404).json({ success: false, message: "Source class entry not found" });
    }

    // Check if target slot is already occupied by ANOTHER entry in THIS timetable
    const targetEntry = timetable.data.find(
      (e) => e.day === targetDay && e.slot === parseInt(targetSlot, 10) && e._id.toString() !== draggedEntryId
    );

    if (targetEntry) {
      // SWAP: targetEntry takes sourceEntry's old day/slot
      const oldSourceDay = sourceEntry.day;
      const oldSourceSlot = sourceEntry.slot;

      targetEntry.day = oldSourceDay;
      targetEntry.slot = oldSourceSlot;
    }

    // Update sourceEntry to new day/slot
    sourceEntry.day = targetDay;
    sourceEntry.slot = parseInt(targetSlot, 10);

    await timetable.save();

    // Populate the returned timetable so the frontend can render it immediately correctly
    const populatedTimetable = await Timetable.findById(timetable._id)
      .populate("data.teacherId", "name")
      .populate("data.roomId", "name")
      .populate("data.subjectId", "name code");

    res.json({
      success: true,
      message: targetEntry ? "Classes swapped successfully" : "Class moved successfully",
      data: populatedTimetable,
    });

    // Fire live socket
    const io = req.app.get("socketio");
    if (io) {
      io.emit("timetable_updated", {
        department: timetable.department,
        semester: timetable.semester,
        action: "move",
      });
    }
  } catch (error) {
    console.error("Error moving timetable entry:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/* =========================================
   DELETE TIMETABLE (HARD DELETE)
========================================= */
export const deleteTimetable = async (req, res) => {
  try {
    const { department, semester, section, academicYear } = req.body;

    if (!department || !semester || !section || !academicYear) {
      return res.status(400).json({
        success: false,
        message:
          "Department, semester, section, and academicYear are required",
      });
    }

    const semesterNum = parseInt(semester, 10);

    const timetable = await Timetable.findOneAndDelete({
      department,
      semester: semesterNum,
      section,
      academicYear,
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    res.json({
      success: true,
      message: "Timetable deleted permanently",
    });

    // Emit live update to connected clients
    const io = req.app.get("socketio");
    if (io) {
      io.emit("timetable_updated", {
        department,
        semester: semesterNum,
        action: "delete",
      });
    }
  } catch (error) {
    console.error("Error deleting timetable:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};