import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import sql from '@/config/database'

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env')
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET)

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  let evt: WebhookEvent

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', {
      status: 400,
    })
  }

  // Do something with payload
  // For this guide, log payload to console
  const { id } = evt.data
  if (evt.type === 'user.created') {
    const { username, image_url, first_name, last_name } = evt.data
    await sql`INSERT INTO users(id,username,avatar,first,last) VALUES(${id},${username},${image_url},${first_name},${last_name})`;
    await sql`INSERT INTO handles(id,leetcode,codeforces,codechef,gfg) VALUES(${id},'','','','')`;
  }else if(evt.type === 'user.updated'){
    const { username, image_url, first_name, last_name } = evt.data
    await sql`UPDATE users SET username = ${username}, avatar = ${image_url}, first = ${first_name}, last = ${last_name} WHERE id = ${id}`;
  }else if(evt.type === 'user.deleted'){
    await sql`DELETE FROM users WHERE id = ${id}`;
    await sql`DELETE FROM handles WHERE id = ${id}`;
    await sql`DELETE FROM friends0 WHERE id = ${id}`;
    await sql`DELETE FROM friends0 WHERE friend_id = ${id}`;
  }

  return new Response('Webhook received', { status: 200 })
}