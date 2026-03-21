import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    name: {
      type: String,
      required: true,
      trim: true
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

    weeklyHours: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },

    type: {
      type: String,
      enum: ["Theory", "Lab"],
      default: "Theory"
    },

    requiresLab: {
      type: Boolean,
      default: false
    },

    labDuration: {
      type: Number,
      default: 2
    }
  },
  { timestamps: true }
);

subjectSchema.index(
  { code: 1, department: 1 },
  { unique: true }
);

export default mongoose.model("Subject", subjectSchema);