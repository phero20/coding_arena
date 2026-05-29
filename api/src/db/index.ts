import { config } from '../configs/env'
<<<<<<< HEAD
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const db = drizzle(config.databaseUrl, {
  schema,
})

export { db, schema }
=======
import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from './schema'

// Configure persistent WebSocket/TCP pooling instead of stateless HTTP
const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

const db = drizzle(pool, {
  schema,
})

export { db, schema, pool }
>>>>>>> prod-deploy
