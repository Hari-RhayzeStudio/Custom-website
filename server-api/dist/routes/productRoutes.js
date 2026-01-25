"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClients_1 = require("../utils/prismaClients");
const router = express_1.default.Router();
// ==========================================
// 1. TRENDING PRODUCTS
// ==========================================
router.get('/trending', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield prismaClients_1.prismaUser.wishlistItem.groupBy({
            by: ['product_sku'],
            _count: { product_sku: true },
            orderBy: { _count: { product_sku: 'desc' } },
            take: 3
        });
        // ✅ FIX: Added ': any' to the parameter
        const trending = yield Promise.all(stats.map((stat) => __awaiter(void 0, void 0, void 0, function* () {
            const item = yield prismaClients_1.prismaUser.wishlistItem.findFirst({ where: { product_sku: stat.product_sku } });
            return item ? {
                sku: item.product_sku,
                product_name: item.product_name,
                final_image_url: item.product_image,
                final_description: `Trending ${item.product_name}`
            } : null;
        })));
        res.json(trending.filter(Boolean));
    }
    catch (e) {
        console.error("Trending Error:", e);
        res.status(500).json({ error: "Failed fetch" });
    }
}));
// ==========================================
// 2. PRODUCT LIST (SEARCH & FILTER)
// ==========================================
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, category, material } = req.query;
    const where = { status: "Filled" };
    if (search) {
        where.OR = [
            { product_name: { contains: search, mode: 'insensitive' } },
            { final_description: { contains: search, mode: 'insensitive' } }
        ];
    }
    if (category && category !== 'All') {
        where.category = { equals: category, mode: 'insensitive' };
    }
    if (material && material !== 'All') {
        where.AND = [
            { final_description: { contains: material, mode: 'insensitive' } }
        ];
    }
    try {
        const products = yield prismaClients_1.prismaProduct.productAsset.findMany({
            where,
            orderBy: { id: 'desc' }
        });
        res.json(products);
    }
    catch (error) {
        console.error("Product List Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
}));
// ==========================================
// 3. SINGLE PRODUCT DETAILS
// ==========================================
router.get('/:sku', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sku } = req.params;
    try {
        const product = yield prismaClients_1.prismaProduct.productAsset.findUnique({
            where: { sku: sku }
        });
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json(product);
    }
    catch (error) {
        console.error("Single Product Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
exports.default = router;
