import type { Context } from 'hono'
import { ApiResponse } from '../utils/api-response'

export class AuthController {
  async me(c: Context) {
    const auth = c.get('auth')

    const { user } = auth

    const response = ApiResponse.success({
      id: user.id,
      clerkId: user.clerkId,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      status: user.status,
      role: user.role,
    })

    return c.json(response.toJSON())
  }
}

