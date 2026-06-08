import * as bcrypt from 'bcryptjs';
import { AppDataSource } from './data-source';
import { User } from '../users/user.entity';

async function seedAdmin(): Promise<void> {
  await AppDataSource.initialize();

  const users = AppDataSource.getRepository(User);
  const email = (process.env.ADMIN_EMAIL ?? 'admin@example.com').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? 'admin123';
  const name = process.env.ADMIN_NAME ?? 'Arcopal Admin';
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

seedAdmin().catch(async (error) => {
  console.error(error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
