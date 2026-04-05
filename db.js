import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "projectsdb"
    });
    console.log("MongoDB Atlas Connected");
  } catch (err) {
    console.error("DB Connection Error:", err.message);
    process.exit(1);
  }
};