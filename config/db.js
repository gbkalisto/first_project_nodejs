const mongoose = require("mongoose");

const connectionDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI)
        console.log("✅ MongoDB Connected...");
    } catch (error) {
        console.error("❌ Database connection failed:", err.message);
        process.exit(1);
    }

}

// optional

// Handle connection events for better monitoring
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose default connection disconnected');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});

module.exports = connectionDB;