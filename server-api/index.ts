import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client'; // Default Client (Products)
import { PrismaClient as UserPrismaClient } from '@prisma/client-user'; // Second Client (Users)
import dotenv from 'dotenv';
import axios from 'axios';
import multer from 'multer';
import { GoogleGenerativeAI } from "@google/generative-ai";
import twilio from 'twilio';
import crypto from 'crypto'; // Added for UUID generation

// 1. BIGINT HELPER
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

dotenv.config();
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// 2. Initialize Database Clients
const prismaProduct = new PrismaClient(); // Connects to Product DB
const prismaUser = new UserPrismaClient(); // Connects to User DB

// 3. Initialize AI
const genAI = new GoogleGenerativeAI(process.env.API_KEY!);

// 4. Initialize Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const TWILIO_SERVICE_SID = process.env.TWILIO_SERVICE_SID!;

app.use(cors());
app.use(express.json());

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


// ============================================================================
//  SECTION 1: USER AUTHENTICATION & PROFILE ROUTES (User DB)
// ============================================================================

/**
 * Step A: Send OTP
 */
app.post('/api/auth/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone) return res.status(400).json({ error: "Phone number is required" });

  try {
    const verification = await twilioClient.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verifications.create({ to: phone, channel: 'sms' });

    console.log(`OTP Sent to ${phone}: ${verification.status}`);
    res.json({ success: true, status: verification.status });
  } catch (error: any) {
    console.error("Twilio Send Error:", error);
    res.status(500).json({ error: error.message || "Failed to send OTP" });
  }
});

/**
 * Step B: Verify OTP & Create User if needed
 */
app.post('/api/auth/verify-otp', async (req, res) => {
  const { phone, code, name } = req.body; // Added 'name'

  if (!phone || !code) {
    return res.status(400).json({ error: "Phone and Code are required" });
  }

  try {
    // 1. Verify with Twilio
    const verificationCheck = await twilioClient.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({ to: phone, code: code });

    if (verificationCheck.status !== 'approved') {
      return res.status(401).json({ error: "Invalid or expired OTP" });
    }

    // 2. Database Logic
    let user = await prismaUser.user.findFirst({
      where: { phone_number: phone }
    });

    if (!user) {
      // Create new user
      console.log(`Creating new user: ${phone}`);
      user = await prismaUser.user.create({
        data: {
          id: crypto.randomUUID(),
          phone_number: phone,
          full_name: name || "Guest User", // Use provided name or default
          email: null,
          age: null
        }
      });
    } else if (name) {
      // If user exists and a name was provided (e.g. updating profile during login), update it
      user = await prismaUser.user.update({
        where: { id: user.id },
        data: { full_name: name }
      });
    }

    console.log(`User logged in: ${user.id}`);
    res.json({ success: true, user });

  } catch (error: any) {
    console.error("Auth/Verify Error:", error);
    res.status(500).json({ error: error.message || "Authentication failed" });
  }
});

/**
 * Get User Profile
 */
app.get('/api/user/:id', async (req, res) => {
  try {
    // FIXED: Removed parseInt() because ID is a UUID string
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
  const { name, email, dob } = req.body; // Frontend sends 'name', 'dob'
  try {
    // FIXED: Removed parseInt(), mapped 'name' -> 'full_name'
    const updatedUser = await prismaUser.user.update({
      where: { id: req.params.id },
      data: { 
        full_name: name, 
        email: email
        // Note: 'dob' is ignored here because schema only has 'age' (Int).
        // You can add logic to convert DOB to Age if needed.
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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`-----------------------------------------`);
  console.log(`✅ SERVER RUNNING AT http://localhost:${PORT}`);
  console.log(`-----------------------------------------`);
  console.log(`📍 User DB: Connected`);
  console.log(`📍 Product DB: Connected`);
  console.log(`📍 AI Service: Active`);
});