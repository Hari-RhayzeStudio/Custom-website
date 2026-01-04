import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client'; 
import { PrismaClient as UserPrismaClient } from '@prisma/client-user'; 
import dotenv from 'dotenv';
import axios from 'axios';
import multer from 'multer';
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from 'crypto';

(BigInt.prototype as any).toJSON = function () { return this.toString(); };

dotenv.config();
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Clients
const prismaProduct = new PrismaClient();
const prismaUser = new UserPrismaClient();
const genAI = new GoogleGenerativeAI(process.env.API_KEY!);

app.use(cors());
app.use(express.json());

// --- AUTH ROUTE ---

/**
 * Verify User & Sync to DB
 * Uses Google Identity Toolkit API to verify the ID token.
 */
app.post('/api/auth/verify-user', async (req, res) => {
  const { idToken, name } = req.body;

  if (!idToken) return res.status(400).json({ error: "ID Token required" });

  try {
    // 1. Verify ID Token using Google Identity Toolkit REST API
    // This allows verification without a Service Account private key
    const googleVerifyURL = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`;
    
    const verifyRes = await axios.post(googleVerifyURL, {
      idToken: idToken
    });

    // 2. Extract user info from Google response
    const firebaseUser = verifyRes.data.users[0];
    const phone = firebaseUser.phoneNumber; // e.g., +919999999999

    if (!phone) return res.status(400).json({ error: "Phone number not found in token" });

    console.log(`Verified User Phone: ${phone}`);

    // 3. Sync with Postgres Database
    let user = await prismaUser.user.findFirst({
      where: { phone_number: phone }
    });

    if (!user) {
      console.log(`Creating DB entry for: ${phone}`);
      user = await prismaUser.user.create({
        data: {
          id: crypto.randomUUID(),
          phone_number: phone,
          full_name: name || "Guest User",
          email: null,
          age: null
        }
      });
    } else if (name) {
      // Update name if provided
      user = await prismaUser.user.update({
        where: { id: user.id },
        data: { full_name: name }
      });
    }

    res.json({ success: true, user });

  } catch (error: any) {
    console.error("Token Verification Failed:", error.response?.data || error.message);
    res.status(401).json({ error: "Invalid Token or expired" });
  }
});


// --- HELPER FUNCTIONS ---

const bufferToPart = (buffer: Buffer, mimeType: string) => ({
  inlineData: {
    data: buffer.toString("base64"),
    mimeType
  }
});

const handleApiResponse = (response: any, context: string): string => {
  if (response.promptFeedback?.blockReason) {
    throw new Error(`Blocked: ${response.promptFeedback.blockReason}`);
  }
  const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
  if (imagePart?.inlineData) {
    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  }
  throw new Error(`No image generated for ${context}. The model might have returned text only.`);
};


/**
 * Get User Profile
 */
app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await prismaUser.user.findUnique({
      where: { id: req.params.id }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Fetch Profile Error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

/**
 * Update User Profile
 */
app.put('/api/user/:id', async (req, res) => {
  const { name, email, age } = req.body;
  try {
    const updatedUser = await prismaUser.user.update({
      where: { id: req.params.id },
      data: { 
        full_name: name, 
        email: email,
        age: age ? parseInt(age) : undefined
      }
    });
    res.json(updatedUser);
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});


// ============================================================================
//  SECTION 2: PRODUCT ROUTES (Product DB)
// ============================================================================

app.get('/api/products', async (req, res) => {
  const { search, category, material } = req.query;
  const whereClause: any = { status: "Filled" };
  
  if (search) {
    whereClause.OR = [
      { product_name: { contains: search as string, mode: 'insensitive' } },
      { final_description: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  if (category && category !== 'All') {
    whereClause.category = { equals: category as string, mode: 'insensitive' };
  }

  if (material && material !== 'All') {
    whereClause.AND = [
       { final_description: { contains: material as string, mode: 'insensitive' } }
    ];
  }

  try {
    const products = await prismaProduct.productAsset.findMany({ 
      where: whereClause,
      orderBy: { id: 'desc' }
    });
    console.log(`Fetched ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error("Product DB Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/products/:sku', async (req, res) => {
  const { sku } = req.params;
  try {
    const product = await prismaProduct.productAsset.findUnique({ where: { sku: sku } });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ============================================================================
//  SECTION 3: AI GENERATION ROUTES
// ============================================================================

app.post('/api/edit-design', upload.single('image'), async (req, res) => {
  try {
    const { prompt, x, y } = req.body;
    if (!req.file || !prompt) return res.status(400).json({ error: "Image and prompt required" });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    const promptText = `Expert jewelry editor. Edit this image based on request: "${prompt}". Focus on area x:${x}, y:${y}. Return ONLY the edited image.`;

    const imagePart = bufferToPart(req.file.buffer, req.file.mimetype);
    const result = await model.generateContent([promptText, imagePart]);
    const imageUrl = handleApiResponse(result.response, 'edit');
    res.json({ imageUrl, hotspot: { x, y } });

  } catch (error: any) {
    console.error("AI Edit Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-design', async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const promptText = `Generate a photorealistic 3D render of luxury jewelry: "${prompt}". Return ONLY the image.`;

    const result = await model.generateContent(promptText);
    const imageUrl = handleApiResponse(result.response, 'generation');
    res.json({ imageUrl });

  } catch (error: any) {
    console.error("AI Generate Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/filter-design', upload.single('image'), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!req.file) return res.status(400).json({ error: "No image provided" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const promptText = `Apply this stylistic filter to the jewelry image: "${prompt}". Return ONLY the image.`;

    const imagePart = bufferToPart(req.file.buffer, req.file.mimetype);
    const result = await model.generateContent([promptText, imagePart]);
    const imageUrl = handleApiResponse(result.response, 'filter');
    res.json({ imageUrl });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/adjust-design', upload.single('image'), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!req.file) return res.status(400).json({ error: "No image provided" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const promptText = `Perform this global photo adjustment: "${prompt}". Return ONLY the image.`;

    const imagePart = bufferToPart(req.file.buffer, req.file.mimetype);
    const result = await model.generateContent([promptText, imagePart]);
    const imageUrl = handleApiResponse(result.response, 'adjustment');
    res.json({ imageUrl });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ============================================================================
//  SECTION 4: UTILITIES & SERVER START
// ============================================================================

app.get('/api/quote', (req, res) => {
  const quotes = [
    "Prudent crafting, stunning art, Rhayze Studio captures every heart.",
    "Gold is a luxury, but design is an emotion.",
    "Where AI meets the artisan's touch."
  ];
  res.json({ quote: quotes[Math.floor(Math.random() * quotes.length)] });
});

app.get('/api/download-proxy', async (req, res) => {
  const { url, filename } = req.query;
  if (!url) return res.status(400).send("URL is required");
  try {
    const response = await axios({ url: url as string, method: 'GET', responseType: 'stream' });
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', response.headers['content-type']);
    response.data.pipe(res);
  } catch (error) {
    res.status(500).send("Failed to download image");
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ============================================================================
//  SECTION 5: BOOKING ROUTES (User DB)
// ============================================================================

// Create a new Booking
app.post('/api/bookings', async (req, res) => {
  const { user_id, expert_name, consultation_date, slot, product_skus, email, name } = req.body;

  if (!user_id || !consultation_date || !slot) {
    return res.status(400).json({ error: "Missing required booking details" });
  }

  try {
    // 1. FETCH CURRENT USER (to check if fields are empty)
    const currentUser = await prismaUser.user.findUnique({
      where: { id: user_id }
    });

    if (currentUser) {
      // Prepare data object for update
      const updateData: any = {};
      
      // Only update name if it's provided AND current profile name is missing/empty
      if (name && (!currentUser.full_name || currentUser.full_name.trim() === "")) {
        updateData.full_name = name;
      }

      // Only update email if it's provided AND current profile email is missing/empty
      if (email && (!currentUser.email || currentUser.email.trim() === "")) {
        updateData.email = email;
      }

      // Perform update only if there's something to change
      if (Object.keys(updateData).length > 0) {
        await prismaUser.user.update({
          where: { id: user_id },
          data: updateData
        });
        console.log(`Conditionally updated profile for user ${user_id}:`, updateData);
      }
    }

    // 2. CREATE BOOKING
    const booking = await prismaUser.booking.create({
      data: {
        user_id: user_id,
        expert_name: expert_name || "Mr. Kamraann Rajjani",
        consultation_date: new Date(consultation_date), 
        slot: slot,
        product_skus: product_skus || [],
        status: "confirmed"
      }
    });

    console.log(`Booking created: ${booking.id}`);
    res.json({ success: true, booking });

  } catch (error: any) {
    console.error("Booking Creation Error:", error);
    res.status(500).json({ error: "Failed to create booking", details: error.message });
  }
});

// Get Bookings for a specific User
app.get('/api/bookings/user/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const bookings = await prismaUser.booking.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    console.error("Fetch Bookings Error:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`-----------------------------------------`);
  console.log(`✅ SERVER RUNNING AT http://localhost:${PORT}`);
  console.log(`-----------------------------------------`);
  console.log(`📍 User DB: Connected`);
  console.log(`📍 Product DB: Connected`);
  console.log(`📍 AI Service: Active`);
  console.log(`🔥 Firebase Auth: Ready`);
});