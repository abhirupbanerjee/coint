import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URI || ''

// Disable prefetch as it's not supported for Supabase pooler
const client = postgres(connectionString, { prepare: false })

export const db = drizzle(client, { schema })
