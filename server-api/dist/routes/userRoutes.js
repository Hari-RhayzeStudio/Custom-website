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
// 1. USER PROFILE
// ==========================================
router.get('/user/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prismaClients_1.prismaUser.user.findUnique({ where: { id: req.params.id } });
        user ? res.json(user) : res.status(404).json({ error: "Not found" });
    }
    catch (e) {
        res.status(500).json({ error: "Server Error" });
    }
}));
router.put('/user/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, age } = req.body;
    try {
        const updated = yield prismaClients_1.prismaUser.user.update({
            where: { id: req.params.id },
            data: { full_name: name, email, age: age ? parseInt(age) : undefined }
        });
        res.json(updated);
    }
    catch (e) {
        res.status(500).json({ error: "Update Failed" });
    }
}));
// ==========================================
// 2. BOOKINGS
// ==========================================
router.post('/bookings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, expert_name, consultation_date, slot, product_skus, product_images } = req.body;
    try {
        const booking = yield prismaClients_1.prismaUser.booking.create({
            data: {
                user_id, expert_name: expert_name || "Mr. Kamraann Rajjani",
                consultation_date: new Date(consultation_date), slot,
                product_skus: product_skus || [], product_images: product_images || [],
                status: "confirmed"
            }
        });
        res.json({ success: true, booking });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
}));
router.get('/bookings/user/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield prismaClients_1.prismaUser.booking.findMany({
            where: { user_id: req.params.id },
            orderBy: { created_at: 'desc' }
        });
        res.json(bookings);
    }
    catch (e) {
        res.status(500).json({ error: "Fetch Failed" });
    }
}));
// ==========================================
// 3. WISHLIST (Optimized for Speed)
// ==========================================
router.post('/wishlist', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield prismaClients_1.prismaUser.wishlistItem.create({ data: req.body });
        res.json({ success: true, item });
    }
    catch (e) {
        if (e.code === 'P2002')
            return res.json({ success: true, message: "Exists" });
        res.status(500).json({ error: e.message });
    }
}));
router.delete('/wishlist', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, product_sku } = req.body;
    try {
        yield prismaClients_1.prismaUser.wishlistItem.deleteMany({
            where: { user_id, product_sku }
        });
        res.json({ success: true });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
}));
// ✅ UPDATED: Supports ?product_sku=... for instant lookup
router.get('/wishlist/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { product_sku } = req.query;
    const whereClause = { user_id: userId };
    if (product_sku) {
        whereClause.product_sku = String(product_sku);
    }
    try {
        const items = yield prismaClients_1.prismaUser.wishlistItem.findMany({
            where: whereClause,
            orderBy: { created_at: 'desc' }
        });
        // ✅ ADD THIS: Cache for 60 seconds
        // This tells the browser: "Don't ask the server again for 1 minute, just use what you have."
        res.set('Cache-Control', 'public, max-age=60');
        res.json(items);
    }
    catch (e) {
        res.status(500).json({ error: "Fetch Failed" });
    }
}));
exports.default = router;
