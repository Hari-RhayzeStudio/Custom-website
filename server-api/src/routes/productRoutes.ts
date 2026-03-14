import express from 'express';
import { prismaProduct, prismaUser } from '../utils/prismaClients';
import axios from 'axios';

const router = express.Router();

// ==========================================
// 🔍 DEBUG: Log all incoming requests
// ==========================================
router.use((req, res, next) => {
  console.log(`📍 [PRODUCTS] ${req.method} ${req.path} | Query:`, req.query);
  next();
});

// ==========================================
// 1. TRENDING PRODUCTS
// ==========================================
router.get('/trending', async (req, res) => {
  console.log('✅ [TRENDING] Route matched');
  try {
    const stats = await prismaUser.wishlistItem.groupBy({
      by: ['product_sku'],
      _count: { product_sku: true },
      orderBy: { _count: { product_sku: 'desc' } },
      take: 3
    });
    
    const trending = await Promise.all(stats.map(async (stat: any) => {
      const product = await prismaProduct.productAsset.findUnique({ 
        where: { sku: stat.product_sku } 
      });
      
      return product ? {
        sku: product.sku, 
        product_name: product.product_name, 
        final_image_url: product.final_image_url,
        final_description: product.final_description 
      } : null;
    }));
    
    res.json(trending.filter(Boolean));
  } catch (e) { 
    console.error("❌ [TRENDING] Error:", e);
    res.status(500).json({ error: "Failed fetch" }); 
  }
});

// ==========================================
// 2. DOWNLOAD PROXY - CRITICAL: BEFORE /:sku
// ==========================================
router.get('/download-proxy', async (req, res) => {
  console.log('✅ [DOWNLOAD-PROXY] Route matched!');
  console.log('📥 [DOWNLOAD-PROXY] Query params:', req.query);
  
  try {
    const { url, filename } = req.query;
    
    if (!url || typeof url !== 'string') {
      console.error('❌ [DOWNLOAD-PROXY] Missing URL');
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log(`📥 [DOWNLOAD-PROXY] Fetching: ${url.substring(0, 80)}...`);

    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const contentType = response.headers['content-type'] || 'image/webp';
    const downloadFilename = (filename as string) || 'jewelry-image.jpg';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    response.data.pipe(res);
    
    console.log(`✅ [DOWNLOAD-PROXY] Streaming: ${downloadFilename}`);
    
  } catch (error: any) {
    console.error('❌ [DOWNLOAD-PROXY] Error:', error.message);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to download image',
        details: error.message 
      });
    }
  }
});

// ==========================================
// 3. PRODUCT LIST (SEARCH & FILTER)
// ==========================================
router.get('/', async (req, res) => {
  console.log('✅ [PRODUCT-LIST] Route matched');
  
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
    
    console.log(`✅ [PRODUCT-LIST] Found ${products.length} products`);
    
    // ✅ FIX: Convert BigInt IDs to strings
    const productsData = products.map(p => ({
      ...p,
      id: p.id.toString()
    }));
    
    res.json(productsData);
  } catch (error) {
    console.error("❌ [PRODUCT-LIST] Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// ==========================================
// 4. SINGLE PRODUCT BY SKU - MUST BE LAST
// ==========================================
router.get('/:sku', async (req, res) => {
  const { sku } = req.params;
  console.log(`✅ [SINGLE-PRODUCT] Route matched with SKU: "${sku}"`);
  
  // ⚠️ If you see "download-proxy" here, the route order is wrong!
  if (sku === 'download-proxy') {
    console.error('🚨 [ERROR] download-proxy caught by /:sku route!');
    console.error('🚨 [ERROR] This means the /download-proxy route is NOT before /:sku');
    return res.status(500).json({ 
      error: 'Route configuration error',
      message: 'download-proxy route is in wrong position'
    });
  }
  
  try {
    const product = await prismaProduct.productAsset.findUnique({ 
      where: { sku: sku } 
    });
    
    if (!product) {
      console.log(`❌ [SINGLE-PRODUCT] Not found: ${sku}`);
      return res.status(404).json({ error: "Product not found" });
    }
    
    console.log(`✅ [SINGLE-PRODUCT] Found: ${product.product_name}`);
    
    // ✅ FIX: Convert BigInt to string before JSON serialization
    const productData = {
      ...product,
      id: product.id.toString()
    };
    
    res.json(productData);
  } catch (error) {
    console.error("❌ [SINGLE-PRODUCT] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;