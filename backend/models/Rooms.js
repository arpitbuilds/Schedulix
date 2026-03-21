import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    day: String,
    slots: [Number]
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
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

    type: {
      type: String,
      enum: ["Classroom", "Lab"],
      required: true
    },

    capacity: {
      type: Number,
      required: true
    },

    facilities: {
      type: [String],
      default: []
    },

    availability: [availabilitySchema]
  },
  { timestamps: true }
);

roomSchema.index({ name: 1, department: 1 }, { unique: true });

export default mongoose.model("Room", roomSchema);