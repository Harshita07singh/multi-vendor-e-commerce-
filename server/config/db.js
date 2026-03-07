import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("MongoDB connected successfully"),
    );

    mongoose.connection.on("disconnected", () =>
      console.log("MongoDB disconnected"),
    );

    mongoose.connection.on("error", (error) =>
      console.error("MongoDB connection error:", error),
    );

    await mongoose.connect(`${process.env.MONGO_URI}`, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    console.log("✓ MongoDB connected successfully");
  } catch (error) {
    console.error("✗ MongoDB connection error:", error.message);
    console.error("Make sure MongoDB is running on:", process.env.MONGO_URI);
    process.exit(1); // Exit process if DB connection fails
  }
};
export default connectDB;
