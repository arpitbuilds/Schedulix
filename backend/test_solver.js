import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { generateTimetableWithCPSAT } from "./service/timetableService.js";
import Teacher from "./models/Teacher.js";
import Subject from "./models/Subject.js";
import Room from "./models/Rooms.js";

dotenv.config();

async function run() {
  await connectDB();
  const teachers = await Teacher.find({ department: "CSE" }).lean();
  const subjects = await Subject.find({ department: "CSE", semester: 3 }).lean();
  const rooms = await Room.find({ department: "CSE" }).lean();

  console.log(`Found ${teachers.length} teachers, ${subjects.length} subjects, ${rooms.length} rooms`);
  
  const result = await generateTimetableWithCPSAT({
      teachers,
      subjects,
      rooms,
      constraints: [],
      semester: 3,
      section: "A"
  });

  console.log(JSON.stringify(result, null, 2));
  process.exit();
}

run();
