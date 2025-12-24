import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// 1. BIGINT HELPER (Must be first)
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

dotenv.config();
console.log("Environment variables loaded...");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// --- ROUTES ---

app.get('/api/quote', (req, res) => {
  const quotes = [
    "Prudent crafting, stunning art, Rhayze Studio captures every heart.",
    "Gold is a luxury, but design is an emotion.",
    "Where AI meets the artisan's touch."
  ];
  res.json({ quote: quotes[Math.floor(Math.random() * quotes.length)] });
});

app.get('/api/products', async (req, res) => {
  const { search } = req.query;
  const whereClause: any = { status: "Filled" };
  
  if (search) {
    whereClause.OR = [
      // Matches 'product_name' from your schema.prisma
      { product_name: { contains: search as string, mode: 'insensitive' } },
      { final_description: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  try {
    const products = await prisma.productAsset.findMany({ where: whereClause });
    console.log(`Fetched ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/products/:sku', async (req, res) => {
  const { sku } = req.params;
  try {
    const product = await prisma.productAsset.findUnique({ where: { sku: sku } });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error fetching product details" });
  }
});

// --- START SERVER ---
const PORT = process.env.PORT || 3001;

// Use try-catch around listen to catch port errors
try {
  app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`✅ SERVER RUNNING AT http://localhost:${PORT}`);
    console.log(`-----------------------------------------`);
  });
} catch (err) {
  console.error("Failed to start server:", err);
}