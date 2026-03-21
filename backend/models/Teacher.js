import mongoose from "mongoose";

/* Teacher Subject Mapping */

const teacherSubjectSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    }
  },
  { _id: false }
);

/* Availability */

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      required: true
    },

    slots: {
      type: [Number]
    }
  },
  { _id: false }
);

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    department: {
      type: String,
      required: true,
      uppercase: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    phone: {
      type: String
    },

    subjects: [teacherSubjectSchema],

    maxHoursPerDay: {
      type: Number,
      default: 6
    },

    availability: [availabilitySchema]
  },
  { timestamps: true }
);

teacherSchema.index({ department: 1 });

export default mongoose.model("Teacher", teacherSchema);