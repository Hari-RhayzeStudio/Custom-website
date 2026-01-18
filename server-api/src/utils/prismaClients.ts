import { PrismaClient } from '@prisma/client';
import { PrismaClient as UserPrismaClient } from '@prisma/client-user';

export const prismaProduct = new PrismaClient();
export const prismaUser = new UserPrismaClient();

// Fix BigInt JSON serialization
(BigInt.prototype as any).toJSON = function () { return this.toString(); };