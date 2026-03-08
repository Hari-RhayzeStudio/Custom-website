import express from 'express';
import { prismaProduct, prismaUser } from '../utils/prismaClients';

const router = express.Router();

// ==========================================
// 1. TRENDING PRODUCTS
// ==========================================
router.get('/trending', async (req, res) => {
  try {
    // 1. Get the top 3 most wishlisted SKUs
    const stats = await prismaUser.wishlistItem.groupBy({
      by: ['product_sku'],
      _count: { product_sku: true },
      orderBy: { _count: { product_sku: 'desc' } },
      take: 3
    });
    
    // 2. Fetch the ACTUAL product details for these SKUs from the Product Database
    const trending = await Promise.all(stats.map(async (stat: any) => {
      // ✅ FIX: Querying the actual Product table, not the Wishlist table
      const product = await prismaProduct.productAsset.findUnique({ 
        where: { sku: stat.product_sku } 
      });
      
      return product ? {
        sku: product.sku, 
        product_name: product.product_name, 
        final_image_url: product.final_image_url,
        // ✅ FIX: Now passing the real description from your database
        final_description: product.final_description 
      } : null;
    }));
    
    res.json(trending.filter(Boolean));
  } catch (e) { 
    console.error("Trending Error:", e);
    res.status(500).json({ error: "Failed fetch" }); 
  }
});

// ==========================================
// 2. PRODUCT LIST (SEARCH & FILTER)
// ==========================================
router.get('/', async (req, res) => {
  const { search, category, material } = req.query;
  const where: any = { status: "Filled" };
  
  if (search) {
    where.OR = [
      { product_name: { contains: search as string, mode: 'insensitive' } },
      { final_description: { contains: search as string, mode: 'insensitive' } }
    ];
  }
  
  if (category && category !== 'All') {
    where.category = { equals: category as string, mode: 'insensitive' };
  }
  
  if (material && material !== 'All') {
    where.AND = [
      { final_description: { contains: material as string, mode: 'insensitive' } }
    ];
  }
  
  try {
    const products = await prismaProduct.productAsset.findMany({ 
      where, 
      orderBy: { id: 'desc' } 
    });
    res.json(products);
  } catch (error) {
    console.error("Product List Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// ==========================================
// 3. SINGLE PRODUCT DETAILS
// ==========================================
router.get('/:sku', async (req, res) => {
  const { sku } = req.params;
  try {
    const product = await prismaProduct.productAsset.findUnique({ 
      where: { sku: sku } 
    });
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
      
    res.json(product);
  } catch (error) {
    console.error("Single Product Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;