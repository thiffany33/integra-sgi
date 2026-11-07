import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { z } from 'zod';
import { PrismaClient } from '../src/generated/prisma/client';

type PromotionDatabase = Pick<PrismaClient, 'user'>;
class PromotionInputError extends Error {}

export async function promotePlatformAdmin(emailValue: string | undefined, database: PromotionDatabase): Promise<string> {
  const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase()).safeParse(emailValue);
  if (!email.success) throw new PromotionInputError('PLATFORM_ADMIN_EMAIL must contain a valid email address.');
  const account = await database.user.findUnique({ where: { email: email.data }, select: { id: true } });
  if (!account) throw new PromotionInputError('PLATFORM_ADMIN_EMAIL must identify an existing account.');
  await database.user.update({ where: { id: account.id }, data: { role: 'PLATFORM_ADMIN' }, select: { id: true } });
  return account.id;
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new PromotionInputError('DATABASE_URL is required.');
  const database = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    await promotePlatformAdmin(process.env.PLATFORM_ADMIN_EMAIL, database);
    process.stdout.write('Existing account promoted to platform administrator.\n');
  } finally {
    await database.$disconnect();
  }
}

if (process.argv[1]?.endsWith('promote-platform-admin.ts')) {
  main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof PromotionInputError ? error.message : 'Promotion failed.'}\n`);
    process.exitCode = 1;
  });
}
