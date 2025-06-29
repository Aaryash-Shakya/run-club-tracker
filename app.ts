import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

async function connectDB() {
	try {
		console.log("🔄 Attempting to connect to MongoDB...");
		console.log("📍 MongoDB URI:", process.env.MONGODB_URI ? "Found" : "Not found");
		
		const options = {
			serverSelectionTimeoutMS: 5000, // 5 second timeout
			connectTimeoutMS: 10000, // 10 second timeout
		};
		
		await mongoose.connect(process.env.MONGODB_URI!, options);
		console.log("✅ Connected to MongoDB");
	} catch (err) {
		console.error("❌ MongoDB connection error:", err);
		process.exit(1);
	}
}

async function main() {
	console.log("🚀 Starting application...");
	await connectDB();
    console.log('✨ Application started successfully');
}

main();
