import { Webhook } from 'svix';
import { headers } from 'next/headers';
import type { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return Response.json(
      { error: 'CLERK_WEBHOOK_SECRET not configured' },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return Response.json({ error: 'Missing Svix headers' }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return Response.json({ error: 'Webhook verification failed' }, { status: 400 });
  }

  try {
    const eventType = evt.type;

    // User data is managed in Clerk - just log events for now
    // You can add custom logic here if needed (e.g., send welcome emails)
    
    if (eventType === 'user.created') {
      const { id, email_addresses } = evt.data;
      const email = email_addresses[0]?.email_address;
    }

    if (eventType === 'user.updated') {
      const { id } = evt.data;
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('[Clerk Webhook] Error:', error);
    return Response.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
