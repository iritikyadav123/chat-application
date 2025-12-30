import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = 'postgresql://postgres:mysecret@localhost:5432/postgres'

if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is not set");
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({
  connectionString,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test pool connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter: adapter,
  log: ['query', 'error', 'warn'],
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});