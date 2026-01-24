import express from 'express';
import { prismaUser } from '../utils/prismaClients';

const router = express.Router();

// ==========================================
// 1. USER PROFILE
// ==========================================
router.get('/user/:id', async (req, res) => {
  try {
    const user = await prismaUser.user.findUnique({ where: { id: req.params.id } });
    user ? res.json(user) : res.status(404).json({ error: "Not found" });
  } catch (e) { res.status(500).json({ error: "Server Error" }); }
});

router.put('/user/:id', async (req, res) => {
  const { name, email, age } = req.body;
  try {
    const updated = await prismaUser.user.update({
      where: { id: req.params.id },
      data: { full_name: name, email, age: age ? parseInt(age) : undefined }
    });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: "Update Failed" }); }
});

// ==========================================
// 2. BOOKINGS
// ==========================================
router.post('/bookings', async (req, res) => {
  const { user_id, expert_name, consultation_date, slot, product_skus, product_images } = req.body;
  try {
    const booking = await prismaUser.booking.create({
      data: {
        user_id, expert_name: expert_name || "Mr. Kamraann Rajjani",
        consultation_date: new Date(consultation_date), slot,
        product_skus: product_skus || [], product_images: product_images || [],
        status: "confirmed"
      }
    });
    res.json({ success: true, booking });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/bookings/user/:id', async (req, res) => {
  try {
    const bookings = await prismaUser.booking.findMany({ 
      where: { user_id: req.params.id }, 
      orderBy: { created_at: 'desc' } 
    });
    res.json(bookings);
  } catch (e) { res.status(500).json({ error: "Fetch Failed" }); }
});

// ==========================================
// 3. WISHLIST (Optimized for Speed)
// ==========================================
router.post('/wishlist', async (req, res) => {
  try {
    const item = await prismaUser.wishlistItem.create({ data: req.body });
    res.json({ success: true, item });
  } catch (e: any) {
    if (e.code === 'P2002') return res.json({ success: true, message: "Exists" });
    res.status(500).json({ error: e.message });
  }
});

router.delete('/wishlist', async (req, res) => {
  const { user_id, product_sku } = req.body;
  try {
    await prismaUser.wishlistItem.deleteMany({
      where: { user_id, product_sku }
    });
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ✅ UPDATED: Supports ?product_sku=... for instant lookup
router.get('/wishlist/:userId', async (req, res) => {
  const { userId } = req.params;
  const { product_sku } = req.query;

  // If product_sku is provided, we only look for that ONE item (Very Fast)
  const whereClause: any = { user_id: userId };
  if (product_sku) {
    whereClause.product_sku = String(product_sku);
  }

  try {
    const items = await prismaUser.wishlistItem.findMany({ 
      where: whereClause, 
      orderBy: { created_at: 'desc' } 
    });
    res.json(items);
  } catch (e) { res.status(500).json({ error: "Fetch Failed" }); }
});

export default router;