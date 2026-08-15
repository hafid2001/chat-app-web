import mongoose from "mongoose";
import { log } from "node:console";

//function to connect to mongo db

export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database connected"),
    );
    await mongoose.connect(`${process.env.MONGODB_URL}`);
  } catch (error) {
     console.log("MongoDB connection error:", error.message);
  }
};
