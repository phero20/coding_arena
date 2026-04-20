import mongoose from 'mongoose'
import { config } from '../configs/env'

let isConnected = false

export const connectMongo = async () => {
  if (isConnected) {
    return
  }

  const uri = config.mongoUri
  const dbName = config.mongoDbName

  await mongoose.connect(uri, dbName ? { dbName } : undefined)

  isConnected = true
}

export { mongoose }

