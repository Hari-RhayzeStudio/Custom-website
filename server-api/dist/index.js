"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// Register Routes
app.use('/api/auth', authRoutes_1.default);
// ✅ CHANGED: Mount at '/api' so routes like '/wishlist' are at the root of API
app.use('/api', userRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api', aiRoutes_1.default);
// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'healthy', time: new Date() }));
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
