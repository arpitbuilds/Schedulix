import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    rollNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    department: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8
    },

    section: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    }
  },
  { timestamps: true }
);

// Unique roll number per department
studentSchema.index(
  { rollNumber: 1, department: 1 },
  { unique: true }
);

export default mongoose.model("Student", studentSchema);