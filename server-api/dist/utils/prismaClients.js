"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaUser = exports.prismaProduct = void 0;
const client_1 = require("@prisma/client");
// Create a SINGLE client instance for the entire app
const globalPrisma = new client_1.PrismaClient();
// Export the same client for both variables
// This prevents errors in other files that import 'prismaProduct' or 'prismaUser'
exports.prismaProduct = globalPrisma;
exports.prismaUser = globalPrisma;
// Fix BigInt JSON serialization (required for BigInt IDs)
BigInt.prototype.toJSON = function () { return this.toString(); };
