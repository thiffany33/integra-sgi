import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const localMigrationUrl = 'postgresql://postgres:postgres@localhost:5432/integra_sgi';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // A missing migration URL must fail against local development only, never
    // fall back to a pooled or cross-environment DATABASE_URL.
    url: process.env.DIRECT_URL ?? localMigrationUrl,
  },
});
