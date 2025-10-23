import mongoose from 'mongoose'
import { ENV } from './env.js'

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI)
    console.log(`MONGODB Connected successfully: ${conn.connection.host}`)
  } catch (error) {
    console.log('Error Connecting to MOngoDB' + error)
    process.exit(1) // status code 1 means error, and 0 means success
  }
}
