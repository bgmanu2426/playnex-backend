import mongoose from "mongoose"; // Import mongoose
import DATA from "../config.js";

// Connect to MongoDB
const connectToDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${DATA.database.uri}/${DATA.database.name}`
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
            await mongoose.connect(`${DATA.database.uri}/${DATA.database.name}`)
        } catch (error) {
            console.error("Error: ", error);
            throw new Error(error);
        }
    }
)() // Connect to MongoDB using an IIFE
*/
