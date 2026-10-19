// Legacy MongoDB connector. The Express app no longer imports this file.
// Kept for optional data migration via scripts/migrateMongoToSupabase.js.
import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on("connected", () => {
        console.log("MongoDB connected successfully");
    });
    await mongoose.connect(`${process.env.MONGODB_URI}`);
};

export default connectDB;
