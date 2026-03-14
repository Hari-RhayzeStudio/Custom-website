import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prismaProduct: PrismaClient | undefined;
  prismaUser: PrismaClient | undefined;
};

export const prismaProduct = globalForPrisma.prismaProduct ?? new PrismaClient();
export const prismaUser = globalForPrisma.prismaUser ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaProduct = prismaProduct;
  globalForPrisma.prismaUser = prismaUser;
}