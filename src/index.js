import connectToDB from "./db/index.js"; // Import connectToDB from db/index.js
import { app } from "./app.js";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

connectToDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server listening http://127.0.0.1:${process.env.PORT}`);
    }); // Start the express server
  })
  .catch((err) => {
    console.log("MongoDB Connection failed: ", err);
  });