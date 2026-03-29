import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/leadsmanagement"

async function dropEmailIndex() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    const db = mongoose.connection.db!
    const collection = db.collection("leads")

    // Drop the email index if it exists
    try {
      await collection.dropIndex("email_1")
      console.log("Successfully dropped email_1 index")
    } catch (error: any) {
      if (error.code === 27) {
        console.log("email_1 index does not exist, skipping...")
      } else {
        console.log("Error dropping email_1 index:", error.message)
      }
    }

    // Ensure phone index exists and is unique
    try {
      await collection.createIndex({ phone: 1 }, { unique: true })
      console.log("Ensured phone index is unique")
    } catch (error: any) {
      console.log("Phone index already exists or error:", error.message)
    }

    console.log("Index management completed")
  } catch (error) {
    console.error("Error:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

dropEmailIndex()