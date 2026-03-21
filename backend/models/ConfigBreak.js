import mongoose from "mongoose";

const configSchema = new mongoose.Schema({

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
      default: [4]
    }
  
  });