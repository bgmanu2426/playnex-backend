import mongoose from "mongoose"; // Import mongoose
import { DB_NAME } from "../constants.js"; // Import DB_NAME from constants.js

// Connect to MongoDB

const connectToDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected successfully !!!  DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB connection error: ", error);
    process.exit(1);
  }
};

export default connectToDB;

/*
;(
    async () => {
        try {
            await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        } catch (error) {
            console.error("Error: ", error);
            throw new Error(error);
        }
    }
)() // Connect to MongoDB using an IIFE
*/
