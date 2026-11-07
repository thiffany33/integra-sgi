import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { z } from 'zod';
import { Prisma, PrismaClient } from '../src/generated/prisma/client';

type SeedDatabase = Pick<PrismaClient, '$transaction'>;
type SeedInput = {
  name: string | undefined;
  email: string | undefined;
  password: string | undefined;
};
export type SeedResult = { status: 'created' | 'skipped'; userId: string };

class SeedConfigurationError extends Error {}

const profileFor = (name: string, email: string): Prisma.InputJsonValue => ({
  schemaVersion: 1,
  organization: { name: 'Integra SGI', nif: 'N/A', sector: 'Administração da plataforma', email },
  representative: { name, email, phone: '' },
  selectedSystems: ['sgq'],
});

/**
 * Creates the platform administrator when no account uses SEED_ADMIN_EMAIL. An existing account is
 * left exactly as it is (password, name and admin flag included), so the seed is safe to rerun in
 * any environment; use db:promote-platform-admin to make an existing account an administrator.
 */
export async function seedPlatformAdmin(
  input: SeedInput,
  database: SeedDatabase,
  hashPassword: (password: string) => Promise<string>,
): Promise<SeedResult> {
  const name = z.string().trim().min(1).max(160).safeParse(input.name);
  if (!name.success) throw new SeedConfigurationError('SEED_ADMIN_NAME must be provided (1–160 characters).');
  const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase()).safeParse(input.email);
  if (!email.success) throw new SeedConfigurationError('SEED_ADMIN_EMAIL must contain a valid email address.');
  const password = z.string().min(12).max(128).safeParse(input.password);
  if (!password.success) throw new SeedConfigurationError('SEED_ADMIN_PASSWORD must be 12–128 characters.');

  const passwordHash = await hashPassword(password.data);
  try {
    return await database.$transaction(async (transaction) => {
      const existing = await transaction.user.findUnique({ where: { email: email.data }, select: { id: true } });
      if (existing) return { status: 'skipped', userId: existing.id };
      const user = await transaction.user.create({
        data: {
          name: name.data,
          email: email.data,
          passwordHash,
          isAdmin: true,
          emailVerifiedAt: new Date(),
          customerProfile: { create: { data: profileFor(name.data, email.data) } },
        },
        select: { id: true },
      });
      return { status: 'created', userId: user.id };
    });
  } catch (error) {
    // Another run created the same account in the meantime.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const existing = await database.$transaction((transaction) =>
        transaction.user.findUniqueOrThrow({ where: { email: email.data }, select: { id: true } }));
      return { status: 'skipped', userId: existing.id };
    }
    throw error;
  }
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new SeedConfigurationError('DATABASE_URL is required.');
  const input = {
    name: process.env.SEED_ADMIN_NAME,
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
  };

  const database = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const argon2 = await import('argon2');
    const result = await seedPlatformAdmin(input, database, (password) => argon2.hash(password, { type: argon2.argon2id }));
    process.stdout.write(result.status === 'created'
      ? 'Platform administrator created.\n'
      : 'An account with SEED_ADMIN_EMAIL already exists; skipped without changes.\n');
  } finally {
    await database.$disconnect();
  }
}

if (process.argv[1]?.endsWith('seed-platform-admin.ts')) {
  main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof SeedConfigurationError ? error.message : 'Platform administrator seed failed.'}\n`);
    process.exitCode = 1;
  });
}
