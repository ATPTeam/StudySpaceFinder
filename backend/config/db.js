import mongoose from 'mongoose';

// Connect to MongoDB using the URI stored in the .env file
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Terminate application on database connection failure
    process.exit(1);
  }
};

export default connectDB;