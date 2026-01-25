import { PrismaClient } from '@prisma/client';

// Create a SINGLE client instance for the entire app
const globalPrisma = new PrismaClient();

// Export the same client for both variables
// This prevents errors in other files that import 'prismaProduct' or 'prismaUser'
export const prismaProduct = globalPrisma;
export const prismaUser = globalPrisma;

// Fix BigInt JSON serialization (required for BigInt IDs)
(BigInt.prototype as any).toJSON = function () { return this.toString(); };