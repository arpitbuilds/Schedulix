import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    role: {
      type: String,
      enum: ["admin", "faculty"],
      required: true
    },

    department: {
      type: String,
      trim: true,
      uppercase: true,
      required: function () {
        return this.role === "faculty";
      }
    }
  },
  { timestamps: true }
);

/* ===============================
   HASH PASSWORD BEFORE SAVE
================================= */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

/* ===============================
   COMPARE PASSWORD METHOD
================================= */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);