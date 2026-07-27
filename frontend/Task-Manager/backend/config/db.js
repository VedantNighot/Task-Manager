const mongoose  = require("mongoose");
const connectDB = async () => {
    // If database is already connected or connecting, do not re-establish
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    const mongoURI = process.env.MONGO_URI || "mongodb+srv://vedantnighotzzz1_db_user:Vedant2@taskmanager.7dxtstg.mongodb.net/?appName=taskmanager";
    try{
        await mongoose.connect(mongoURI, {});
        console.log("MongoDB Connected");        
    }
    catch(err){
        console.error("Error Connecting to MongooDb",err);
        // Only exit process if not running in serverless (e.g. Vercel)
        if (!process.env.VERCEL) {
            process.exit(1);
        }
        throw err;
    }
};
module.exports = connectDB;