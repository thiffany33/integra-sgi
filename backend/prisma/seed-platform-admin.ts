import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { z } from 'zod';
import { Prisma, PrismaClient } from '../src/generated/prisma/client';

type SeedDatabase = Pick<PrismaClient, 'user' | 'customerProfile'>;
type SeedInput = {
  appEnv: string | undefined;
  name: string | undefined;
  email: string | undefined;
  password: string | undefined;
};

class SeedConfigurationError extends Error {}

const profileFor = (name: string, email: string): Prisma.InputJsonValue => ({
  schemaVersion: 1,
  organization: { name: 'Integra SGI', nif: 'N/A', sector: 'Administração da plataforma', email },
  representative: { name, email, phone: '' },
  selectedSystems: ['sgq'],
});

export async function seedPlatformAdmin(
  input: SeedInput,
  database: SeedDatabase,
  hashPassword: (password: string) => Promise<string>,
): Promise<string> {
  if (input.appEnv !== 'development') {
    throw new SeedConfigurationError('The platform administrator seed can only run with APP_ENV=development.');
  }

  const name = z.string().trim().min(1).max(160).safeParse(input.name);
  if (!name.success) throw new SeedConfigurationError('SEED_ADMIN_NAME must be provided (1–160 characters).');
  const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase()).safeParse(input.email);
  if (!email.success) throw new SeedConfigurationError('SEED_ADMIN_EMAIL must contain a valid email address.');
  const password = z.string().min(12).max(128).safeParse(input.password);
  if (!password.success) throw new SeedConfigurationError('SEED_ADMIN_PASSWORD must be 12–128 characters.');

  const passwordHash = await hashPassword(password.data);
  const now = new Date();
  const user = await database.user.upsert({
    where: { email: email.data },
    create: {
      name: name.data,
      email: email.data,
      passwordHash,
      role: 'PLATFORM_ADMIN',
      emailVerifiedAt: now,
    },
    update: {
      name: name.data,
      passwordHash,
      role: 'PLATFORM_ADMIN',
      emailVerifiedAt: now,
    },
    select: { id: true },
  });
  await database.customerProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, data: profileFor(name.data, email.data) },
    // Keep any locally edited profile answers when rerunning the seed.
    update: {},
    select: { id: true },
  });
  return user.id;
}

async function main(): Promise<void> {
  // Fail closed before constructing a client: a typo or deployed environment must never be seeded.
  if (process.env.APP_ENV !== 'development') {
    throw new SeedConfigurationError('The platform administrator seed can only run with APP_ENV=development.');
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new SeedConfigurationError('DATABASE_URL is required.');

  const database = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const argon2 = await import('argon2');
    await seedPlatformAdmin({
      appEnv: process.env.APP_ENV,
      name: process.env.SEED_ADMIN_NAME,
      email: process.env.SEED_ADMIN_EMAIL,
      password: process.env.SEED_ADMIN_PASSWORD,
    }, database, (password) => argon2.hash(password, { type: argon2.argon2id }));
    process.stdout.write('Local development platform administrator seeded. Use the credentials configured in backend/.env.\n');
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
