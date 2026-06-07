import mongoose from 'mongoose'
import { config } from '../configs/env'
let isConnected = false

export const connectMongo = async () => {
  if (isConnected) {
    return
  }

  const uri = config.mongoUri
  const dbName = config.mongoDbName

  await mongoose.connect(uri, {
    dbName: dbName ? dbName : undefined,
    maxPoolSize: 50, // Keep up to 50 socket connections open
    minPoolSize: 10, // Maintain at least 10 idle connections
    maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
    serverSelectionTimeoutMS: 5000, // Fail fast if Mongo is unreachable
  })

  isConnected = true
}

export { mongoose }

