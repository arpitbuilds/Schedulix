import mongoose from "mongoose";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import User from "./models/User.js";
import Teacher from "./models/Teacher.js";
import Subject from "./models/Subject.js";
import Room from "./models/Rooms.js";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Teacher.deleteMany();
    await Subject.deleteMany();
    await Room.deleteMany();
    await mongoose.connection.collection("timetables").deleteMany({});

    /* ===============================
       CREATE USERS
    ================================= */


    const admin = await User.create({
        username: "admin",
        email: "admin@test.com",
        password: "admin123", // plain
        role: "admin",
        department: "CSE",
      });

    /* ===============================
       CREATE SUBJECTS & ROOMS
    ================================= */
    
    // Create Dummy Subjects for CSE Semester 3
    const sub1 = await Subject.create({
      code: "CS301",
      name: "Data Structures",
      department: "CSE",
      semester: 3,
      weeklyHours: 4,
      type: "Theory",
      requiresLab: false
    });

    const sub2 = await Subject.create({
      code: "CS302",
      name: "Object Oriented Programming",
      department: "CSE",
      semester: 3,
      weeklyHours: 4,
      type: "Theory",
      requiresLab: true,
      labDuration: 2
    });

    // Create Dummy Rooms
    const room1 = await Room.create({
      name: "Room 101",
      department: "CSE",
      type: "Classroom",
      capacity: 60
    });

    const room2 = await Room.create({
      name: "Computer Lab 1",
      department: "CSE",
      type: "Lab",
      capacity: 40
    });

    /* ===============================
       CREATE TEACHERS
    ================================= */

    await Teacher.create({
      name: "Dr. Sharma",
      department: "CSE",
      email: "faculty1@test.com",
      subjects: [{ subjectId: sub1._id }],
      maxHoursPerDay: 4,
      availability: [],
    });

    await Teacher.create({
      name: "Dr. Verma",
      department: "CSE",
      email: "faculty2@test.com",
      subjects: [{ subjectId: sub2._id }],
      maxHoursPerDay: 4,
      availability: [],
    });

    console.log("🌱 Database Seeded Successfully with Dummy Data!");
    process.exit();

  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedData();