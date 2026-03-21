import Teacher from "../models/Teacher.js";
import Subject from "../models/Subject.js";
import Room from "../models/Rooms.js";
import Constraint from "../models/Constraint.js";

/* ===============================
   TEACHER MANAGEMENT
================================= */

export const createTeacher = async (req, res) => {
  try {
    const { name, department, email, subjects, availability, maxHoursPerDay } =
      req.body;

    if (!name || !department || !email) {
      return res.status(400).json({
        success: false,
        message: "Name, department and email are required",
      });
    }

    const existing = await Teacher.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Teacher already exists",
      });
    }

    const teacher = await Teacher.create({
      name,
      department,
      email,
      subjects: subjects || [],
      availability: availability || [],
      maxHoursPerDay: maxHoursPerDay || 6,
    });

    res.status(201).json({ success: true, data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTeachers = async (req, res) => {
  try {
    const { department } = req.query;
    const filter = department ? { department } : {};
    const teachers = await Teacher.find(filter).sort({ name: 1 });

    res.json({ success: true, data: teachers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!teacher)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ===============================
   SUBJECT MANAGEMENT
================================= */

export const createSubject = async (req, res) => {
  try {
    const { code, name, department, semester, weeklyHours, requiresLab } =
      req.body;

    if (!code || !name || !department || !semester || !weeklyHours) {
      return res.status(400).json({
        success: false,
        message:
          "Code, name, department, semester and weeklyHours are required",
      });
    }

    const exists = await Subject.findOne({ code });
    if (exists)
      return res
        .status(400)
        .json({ success: false, message: "Subject already exists" });

    const subject = await Subject.create({
      code,
      name,
      department,
      semester,
      weeklyHours,
      requiresLab: requiresLab || false,
    });

    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const { department, semester } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = parseInt(semester);

    const subjects = await Subject.find(filter).sort({ semester: 1 });
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!subject)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ===============================
   ROOM MANAGEMENT
================================= */

export const createRoom = async (req, res) => {
  try {
    const { name, department, type, capacity } = req.body;

    if (!name || !department || !type || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Name, department, type and capacity required",
      });
    }

    const exists = await Room.findOne({ name });
    if (exists)
      return res
        .status(400)
        .json({ success: false, message: "Room already exists" });

    const room = await Room.create({ name, department, type, capacity });

    res.status(201).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    const { department, type } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (type) filter.type = type;

    const rooms = await Room.find(filter);
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!room)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ===============================
   CONSTRAINT MANAGEMENT
================================= */

export const createConstraint = async (req, res) => {
  try {
    const { type, rule, day, slots } = req.body;

    if (!type || !rule || !day || !slots?.length) {
      return res.status(400).json({
        success: false,
        message: "Type, rule, day and slots required",
      });
    }

    const constraint = await Constraint.create(req.body);

    res.status(201).json({ success: true, data: constraint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getConstraints = async (req, res) => {
  try {
    const constraints = await Constraint.find()
      .populate("teacherId", "name")
      .populate("roomId", "name")
      .populate("subjectId", "name");

    res.json({ success: true, data: constraints });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateConstraint = async (req, res) => {
  try {
    const constraint = await Constraint.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!constraint)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, data: constraint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteConstraint = async (req, res) => {
  try {
    const constraint = await Constraint.findByIdAndDelete(req.params.id);
    if (!constraint)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};