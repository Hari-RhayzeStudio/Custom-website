"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaUser = exports.prismaProduct = void 0;
const client_1 = require("@prisma/client");
const client_user_1 = require("@prisma/client-user");
exports.prismaProduct = new client_1.PrismaClient();
exports.prismaUser = new client_user_1.PrismaClient();
// Fix BigInt JSON serialization
BigInt.prototype.toJSON = function () { return this.toString(); };
