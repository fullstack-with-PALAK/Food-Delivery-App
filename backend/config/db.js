import mongoose from "mongoose";
import config from "./config.js";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(config.mongodbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
    });

    console.log(`✓ MongoDB Connected: ${connection.connection.host}`);
    console.log(`✓ Database: ${connection.connection.name}`);
    
    return connection;
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("✓ MongoDB Disconnected");
  } catch (error) {
    console.error(`✗ MongoDB Disconnection Error: ${error.message}`);
  }
};
