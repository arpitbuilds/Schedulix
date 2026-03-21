import mongoose from "mongoose";

const constraintSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ["Teacher", "Room", "Subject", "General"],
      required: true
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: function () {
        return this.type === "Teacher";
      }
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: function () {
        return this.type === "Room";
      }
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: function () {
        return this.type === "Subject";
      }
    },

    rule: {
      type: String,
      required: true,
      trim: true
    },

    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      required: true
    },

    slots: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one slot is required"
      }
    },

    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium"
    },

    description: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Constraint", constraintSchema);