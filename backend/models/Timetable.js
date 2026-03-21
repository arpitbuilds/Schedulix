import mongoose from "mongoose";

const timetableEntrySchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },

    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ]
    },

    slot: {
      type: Number
    }
  },
  { _id: true }
);

const timetableSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
      uppercase: true
    },

    semester: {
      type: Number,
      required: true
    },

    section: {
      type: String,
      required: true
    },

    academicYear: {
      type: String,
      required: true
    },

    days: {
      type: Number,
      default: 5
    },

    periodsPerDay: {
      type: Number,
      default: 8
    },

    breakSlots: {
      type: [Number],
      default: []
    },

    data: [timetableEntrySchema],

    conflicts: {
      type: [String],
      default: []
    },

    score: {
      type: Number,
      default: 0
    },

    generatedBy: {
      type: String,
      default: "CP-SAT"
    },

    isActive: {
      type: Boolean,
      default: true
    },

    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

timetableSchema.index(
  { department: 1, semester: 1, section: 1, academicYear: 1, isActive: 1 },
  { unique: true }
);

timetableSchema.index({ "data.teacherId": 1 });

export default mongoose.model("Timetable", timetableSchema);