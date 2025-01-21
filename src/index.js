import connectToDB from "./db/index.js"; // Import connectToDB from db/index.js
import { app } from "./app.js"; // Import app from app.js
import DATA from "./config.js";

/**
 * Connect to the database and start the server
 */
connectToDB()
    .then(() => {
        app.listen(DATA.port || 8000, () => {
            console.log(`Server listening ${DATA.server_url}`);
        }); // Start the express server
    })
    .catch((err) => {
        console.log("MongoDB Connection failed: ", err);
    });
