import * as bcrypt from 'bcryptjs';
import { AppDataSource } from './data-source';
import { User } from '../users/user.entity';

async function seedAdmin(): Promise<void> {
  await AppDataSource.initialize();

  const users = AppDataSource.getRepository(User);
  const email = requireSecret('ADMIN_EMAIL').trim().toLowerCase();
  const password = requireSecret('ADMIN_PASSWORD');
  const name = requireSecret('ADMIN_NAME');
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const existingUser = await users.findOne({ where: { email } });

  await users.save({
    ...existingUser,
    email,
    passwordHash,
    name,
    role: 'admin',
    isActive: true,
  });

  await AppDataSource.destroy();
  console.log(`Admin user seeded: ${email}`);
}

function requireSecret(name: 'ADMIN_EMAIL' | 'ADMIN_PASSWORD' | 'ADMIN_NAME'): string {
  const value = process.env[name]?.trim();

  if (!value || value.startsWith('YOUR_')) {
    throw new Error(`${name} must be set to a non-placeholder value.`);
  }

  return value;
}

seedAdmin().catch(async (error) => {
  console.error(error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
