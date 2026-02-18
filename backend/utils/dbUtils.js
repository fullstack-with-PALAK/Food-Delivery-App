// Database utilities for MongoDB operations

import mongoose from "mongoose";

// Check if database is connected
export const isDBConnected = () => {
  return mongoose.connections[0].readyState === 1;
};

// Get database stats
export const getDBStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get collection stats
export const getCollectionStats = async (collectionName) => {
  try {
    const stats = await mongoose.connection.db
      .collection(collectionName)
      .stats();
    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Create indexes for collections
export const createIndexes = async () => {
  try {
    // User model indexes
    await mongoose.connection.collection("users").createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.collection("users").createIndex({ createdAt: -1 });

    // Food model indexes
    await mongoose.connection.collection("foods").createIndex({ category: 1 });
    await mongoose.connection.collection("foods").createIndex({ name: "text", description: "text" });
    await mongoose.connection.collection("foods").createIndex({ createdAt: -1 });

    // Order model indexes
    await mongoose.connection.collection("orders").createIndex({ userId: 1 });
    await mongoose.connection.collection("orders").createIndex({ status: 1 });
    await mongoose.connection.collection("orders").createIndex({ date: -1 });

    // Review model indexes
    await mongoose.connection.collection("reviews").createIndex({ userId: 1, foodId: 1 });
    await mongoose.connection.collection("reviews").createIndex({ rating: -1 });
    await mongoose.connection.collection("reviews").createIndex({ createdAt: -1 });

    // Notification model indexes
    await mongoose.connection.collection("notifications").createIndex({ userId: 1 });
    await mongoose.connection.collection("notifications").createIndex({ read: 1 });
    await mongoose.connection.collection("notifications").createIndex({ createdAt: -1 });

    console.log("✓ Database indexes created successfully");
    return true;
  } catch (error) {
    console.error("✗ Error creating indexes:", error.message);
    return false;
  }
};

// Clear all collections (for testing only)
export const clearAllCollections = async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    console.log("✓ All collections cleared");
    return true;
  } catch (error) {
    console.error("✗ Error clearing collections:", error.message);
    return false;
  }
};

// Backup database (export collections)
export const backupDatabase = async () => {
  try {
    const collections = {} ;
    const collectionsList = mongoose.connection.collections;

    for (const key in collectionsList) {
      collections[key] = await collectionsList[key].find({}).toArray();
    }

    console.log("✓ Database backup created");
    return {
      success: true,
      data: collections,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("✗ Error backing up database:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Health check for database connection
export const dbHealthCheck = async () => {
  try {
    const connected = isDBConnected();
    const stats = await getDBStats();

    return {
      status: connected ? "healthy" : "disconnected",
      connected,
      timestamp: new Date().toISOString(),
      stats: stats.data,
    };
  } catch (error) {
    return {
      status: "error",
      connected: false,
      error: error.message,
    };
  }
};
