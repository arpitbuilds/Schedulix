import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI ||
      "mongodb+srv://admin:goPlIRQ0LGzAfCrL@ttscheduler.recbz4t.mongodb.net/mytt";

    const conn = await mongoose.connect(mongoURI);

    console.log("✅ MongoDB Connected");
    console.log(`🌍 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
