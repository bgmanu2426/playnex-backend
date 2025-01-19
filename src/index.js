import connectToDB from "./db/index.js"; // Import connectToDB from db/index.js
import { app } from "./app.js"; // Import app from app.js
import DATA from "./config.js";

connectToDB()
    .then(() => {
        app.listen(DATA.port || 8000, () => {
            console.log(`Server listening http://127.0.0.1:${DATA.port}`);
        }); // Start the express server
    })
    .catch((err) => {
        console.log("MongoDB Connection failed: ", err);
    });
