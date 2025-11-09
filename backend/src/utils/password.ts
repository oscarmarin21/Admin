import { hash, verify } from '@node-rs/argon2';

export const hashPassword = async (password: string): Promise<string> =>
  hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

export const verifyPassword = async (hashedPassword: string, password: string): Promise<boolean> =>
  verify(hashedPassword, password);

