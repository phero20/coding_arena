import { config } from '../configs/env'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const db = drizzle(config.databaseUrl, {
  schema,
})

export { db, schema }
