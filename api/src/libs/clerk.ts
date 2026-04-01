import { createClerkClient, verifyToken } from '@clerk/backend'
import { config } from '../configs/env'

export const clerkClient = createClerkClient({
  secretKey: config.clerkSecretKey,
})

export { verifyToken }
