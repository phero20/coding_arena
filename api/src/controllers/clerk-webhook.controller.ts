import type { Context } from 'hono'
import { Webhook } from 'svix'
import type { AuthService } from '../services/auth.service'
import { AppError } from '../utils/app-error'
import { ApiResponse } from '../utils/api-response'
import { config } from '../configs/env'

export class ClerkWebhookController {
  constructor(private readonly authService: AuthService) {}

  async handle(c: Context) {
    const WEBHOOK_SECRET = config.clerkWebhookSecret

    if (!WEBHOOK_SECRET) {
      console.error('CLERK_WEBHOOK_SECRET is missing')
      throw AppError.internal('Webhook verification failed: Secret missing')
    }

    const payload = await c.req.text()
    const headers = {
      'svix-id': c.req.header('svix-id') ?? '',
      'svix-timestamp': c.req.header('svix-timestamp') ?? '',
      'svix-signature': c.req.header('svix-signature') ?? '',
    }

    const wh = new Webhook(WEBHOOK_SECRET)
    let event: any

    try {
      event = wh.verify(payload, headers)
    } catch (err) {
      throw AppError.badRequest('Invalid Clerk webhook signature', err)
    }

    if (event.type === 'user.created' || event.type === 'user.updated') {
      const user = event.data
      
      const primaryEmail =
        user.email_addresses?.find(
          (e: any) => e.id === user.primary_email_address_id,
        )?.email_address ?? user.email_addresses?.[0]?.email_address

      await this.authService.syncUser({
        clerkId: user.id,
        username:
          user.username ||
          (primaryEmail ? primaryEmail.split('@')[0] : `user_${user.id}`),
        email: primaryEmail ?? '',
        avatarUrl: user.image_url,
      })
    }

    const response = ApiResponse.success({
      received: true,
      type: event.type,
    })

    return c.json(response.toJSON())
  }
}

