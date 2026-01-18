import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import aiRoutes from './routes/aiRoutes';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Register Routes
app.use('/api/auth', authRoutes);

// ✅ CHANGED: Mount at '/api' so routes like '/wishlist' are at the root of API
app.use('/api', userRoutes); 

app.use('/api/products', productRoutes);
app.use('/api', aiRoutes);

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'healthy', time: new Date() }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));