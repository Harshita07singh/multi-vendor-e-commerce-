import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("MongoDB connected successfully"),
    );
    await mongoose.connect(`${process.env.MONGO_URI}`);
    // await mongoose.connect(`${process.env.MONGO_URI}/superwebs360`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
};
export default connectDB;
