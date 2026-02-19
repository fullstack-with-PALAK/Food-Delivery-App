import { supabase, testConnection } from "./supabase.js";

// Connect to Supabase Database
export const connectDB = async () => {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log("================================");
      console.log("✓ Supabase Connected Successfully");
      console.log("✓ Database: PostgreSQL (Supabase)");
      console.log("================================");
      return true;
    } else {
      console.error("✗ Supabase Connection Failed - Retrying in 5 seconds...");
      setTimeout(connectDB, 5000);
    }
  } catch (error) {
    console.error(`✗ Supabase Connection Error: ${error.message}`);
    setTimeout(connectDB, 5000);
  }
};

export const disconnectDB = async () => {
  try {
    console.log("✓ Supabase Disconnected");
  } catch (error) {
    console.error(`✗ Supabase Disconnection Error: ${error.message}`);
  }
};

export { supabase };
