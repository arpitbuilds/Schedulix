import { spawn } from "child_process";
import path from "path";

export const generateTimetableWithCPSAT = async ({
  teachers,
  subjects,
  rooms,
  constraints,
  semester,
  section,
}) => {
  try {

    /* ==============================
       CLEAN TEACHERS
    ============================== */

    const cleanTeachers = teachers.map((t) => ({
      id: t._id.toString(),
      name: t.name,
      subjects: (t.subjects || []).map(s => ({
          subjectId: s.subjectId.toString()
      })),
      maxHoursPerDay: t.maxHoursPerDay || 6,
      availability: t.availability || [],
    }));


    /* ==============================
       CLEAN SUBJECTS
    ============================== */

    const cleanSubjects = subjects.map((s) => ({
      id: s._id.toString(),
      name: s.name,

      weeklyHours: s.weeklyHours || 3,

      requiresLab: s.requiresLab || false,

      labDuration: s.labDuration || 1,
    }));


    /* ==============================
       CLEAN ROOMS
    ============================== */

    const cleanRooms = rooms.map((r) => ({
      id: r._id.toString(),
      name: r.name,
      type: r.type,
      capacity: r.capacity,
    }));


    /* ==============================
       CLEAN CONSTRAINTS
    ============================== */

    const cleanConstraints = constraints.map((c) => ({
      type: c.type,

      teacherId: c.teacherId?.toString(),

      roomId: c.roomId?.toString(),

      subjectId: c.subjectId?.toString(),

      day: c.day,

      slots: c.slots,

      rule: c.rule,

      priority: c.priority,
    }));


    /* ==============================
       SOLVER INPUT
    ============================== */

    const solverInput = {
      teachers: cleanTeachers,
      subjects: cleanSubjects,
      rooms: cleanRooms,
      constraints: cleanConstraints,

      days: 5,
      periodsPerDay: 8,
      breakSlots: [4],

      semester,
      section,
    };


    /* ==============================
       PYTHON PROCESS
    ============================== */

    const pythonPath = process.env.PYTHON_PATH || "python";

    const solverPath = path.join(
      process.cwd(),
      "solver",
      "cpSatSolver.py"
    );


    return new Promise((resolve) => {

      const python = spawn(pythonPath, [solverPath]);

      let outputData = "";
      let errorData = "";


      /* ==============================
         TIMEOUT
      ============================== */

      const timeout = setTimeout(() => {
        python.kill();

        resolve({
          success: false,
          error: "Solver timeout exceeded",
        });

      }, 30000);


      /* ==============================
         SEND INPUT
      ============================== */

      python.stdin.write(JSON.stringify(solverInput));
      python.stdin.end();


      /* ==============================
         RECEIVE OUTPUT
      ============================== */

      python.stdout.on("data", (data) => {
        outputData += data.toString();
      });


      python.stderr.on("data", (data) => {
        errorData += data.toString();
      });


      python.on("close", (code) => {

        clearTimeout(timeout);

        if (code !== 0) {

          return resolve({
            success: false,
            error: errorData || "Python solver failed",
          });

        }

        try {

          const parsed = JSON.parse(outputData);

          resolve({
            success: true,

            data: parsed.timetable || [],

            conflicts: parsed.conflicts || [],

            score: parsed.score || 0,
          });

        } catch {

          resolve({
            success: false,
            error: "Invalid JSON from solver",
          });

        }

      });

    });

  } catch (error) {

    return {
      success: false,
      error: error.message,
    };

  }
};