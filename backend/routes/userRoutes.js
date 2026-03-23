import express from "express";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only admins can manage users
router.use(protect);
router.use(authorize("admin"));

// @route   GET /api/users
// @desc    Get all users (excluding passwords)
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ role: 1, username: 1 });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// @route   POST /api/users
// @desc    Create a new user (Faculty or Admin)
router.post("/", async (req, res) => {
  try {
    const { username, password, role, department, email } = req.body;

    if (!username || !password || !role || !email) {
      return res.status(400).json({
        success: false,
        message: "Please provide username, email, password, and role",
      });
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const user = await User.create({
      username,
      email,
      password,
      role,
      department: role === "faculty" ? department : undefined,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user.id.toString()) {
        return res.status(400).json({ success: false, message: "You cannot delete your own admin account" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "User removed successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
