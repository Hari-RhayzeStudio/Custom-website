import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import axios from 'axios';
import multer from 'multer';
import { GoogleGenerativeAI } from "@google/generative-ai";

// BIGINT HELPER
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

// --- AI CONFIGURATION ---
const genAI = new GoogleGenerativeAI(process.env.API_KEY!);

// Helper: Convert Multer Buffer to Gemini API Part
const bufferToPart = (buffer: Buffer, mimeType: string) => ({
  inlineData: {
    data: buffer.toString("base64"),
    mimeType
  }
});

// Helper: Handle API Response
const handleApiResponse = (response: any, context: string): string => {
  // 1. Check for prompt blocking first
  if (response.promptFeedback?.blockReason) {
    const { blockReason, blockReasonMessage } = response.promptFeedback;
    const errorMessage = `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`;
    console.error(errorMessage, { response });
    throw new Error(errorMessage);
  }

  // 2. Try to find the image part
  const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(
    (part: any) => part.inlineData
  );

  if (imagePartFromResponse?.inlineData) {
    const { mimeType, data } = imagePartFromResponse.inlineData;
    console.log(`Received image data (${mimeType}) for ${context}`);
    return `data:${mimeType};base64,${data}`;
  }

  // 3. If no image, check for other reasons
  const finishReason = response.candidates?.[0]?.finishReason;
  if (finishReason && finishReason !== 'STOP') {
    const errorMessage = `Image generation for ${context} stopped unexpectedly. Reason: ${finishReason}. This often relates to safety settings.`;
    console.error(errorMessage, { response });
    throw new Error(errorMessage);
  }
  
  const textFeedback = response.text?.()?.trim();
  const errorMessage = `The AI model did not return an image for the ${context}. ` + 
    (textFeedback 
      ? `The model responded with text: "${textFeedback}"`
      : "This can happen due to safety filters or if the request is too complex. Please try rephrasing your prompt to be more direct.");

  console.error(`Model response did not contain an image part for ${context}.`, { response });
  throw new Error(errorMessage);
};

app.use(cors());
app.use(express.json());

// --- ROUTES ---

/**
 * Endpoint 1: Localized Edit with Hotspot (Image + Prompt + Coordinates)
 * This endpoint handles editing specific areas of an uploaded jewelry image
 */
app.post('/api/edit-design', upload.single('image'), async (req, res) => {
  try {
    const { prompt: userPrompt, x, y } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "No image provided for editing" });
    }

    if (!userPrompt || !userPrompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Parse coordinates with defaults
    const hotspotX = x ? parseInt(x) : 0;
    const hotspotY = y ? parseInt(y) : 0;

    console.log(`Starting generative edit at hotspot: x:${hotspotX}, y:${hotspotY}`);
    console.log(`User prompt: "${userPrompt}"`);
    
    // Use gemini-2.0-flash-exp for image editing capabilities
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    const promptText = `You are an expert jewelry designer and photo editor AI. Your task is to perform a natural, localized edit on the provided jewelry image based on the user's request.

User Request: "${userPrompt}"
Edit Location: Focus on the area around pixel coordinates (x: ${hotspotX}, y: ${hotspotY}).

Editing Guidelines:
- The edit must be realistic and blend seamlessly with the surrounding jewelry piece.
- Maintain the luxury and high-end quality of the jewelry design.
- The rest of the image (outside the immediate edit area) must remain identical to the original.
- For jewelry-specific edits (changing stones, metals, designs), ensure photorealistic results.
- Preserve lighting, shadows, and reflections to maintain realism.

Examples of valid edits:
- "Change the center stone to a 2-carat emerald"
- "Make the band thicker"
- "Add small diamonds around the main stone"
- "Change the metal to rose gold"
- "Increase the brightness of this gemstone"

Safety & Ethics Policy:
- Focus on jewelry design modifications only.
- Maintain professional, high-quality rendering standards.

Output: Return ONLY the final edited image. Do not return text explanations.`;

    const imagePart = bufferToPart(req.file.buffer, req.file.mimetype);
    
    console.log('Sending image and prompt to Gemini API...');
    const result = await model.generateContent([promptText, imagePart]);
    const response = result.response;

    console.log('Received response from Gemini API');
    
    // Use the helper function to handle the response
    const imageUrl = handleApiResponse(response, 'jewelry edit');
    
    return res.json({ 
      imageUrl,
      hotspot: { x: hotspotX, y: hotspotY },
      message: 'Image edited successfully'
    });

  } catch (error: any) {
    console.error("AI Edit Error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to edit image",
      details: error.toString()
    });
  }
});

/**
 * Endpoint 2: Generate New Jewelry Design (Text Only)
 * This endpoint creates entirely new jewelry designs from text descriptions
 */
app.post('/api/generate-design', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log(`Generating new jewelry design with prompt: "${prompt}"`);
    
    // Use imagen or gemini-pro-vision for text-to-image generation
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const promptText = `Generate a high-end, photorealistic 3D render of luxury jewelry based on this description: "${prompt}"

Design Requirements:
- Ultra-realistic, professional jewelry photography quality
- Clean white or gradient background suitable for e-commerce
- Proper lighting with realistic reflections and sparkles
- High detail in gemstones, metal texture, and craftsmanship
- Professional studio photography style
- Focus on showcasing the jewelry piece clearly

Style: Luxury jewelry catalog photography, similar to high-end brands like Tiffany & Co., Cartier, or Harry Winston.

Return ONLY the image, no text.`;

    console.log('Sending prompt to Gemini API for generation...');
    const result = await model.generateContent(promptText);
    const response = result.response;

    console.log('Received generation response from Gemini API');
    
    // Use the helper function to handle the response
    const imageUrl = handleApiResponse(response, 'jewelry generation');
    
    return res.json({ 
      imageUrl,
      message: 'Jewelry design generated successfully'
    });

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate image",
      details: error.toString()
    });
  }
});

/**
 * Endpoint 3: Apply Filter to Jewelry Image
 * This endpoint applies stylistic filters to entire jewelry images
 */
app.post('/api/filter-design', upload.single('image'), async (req, res) => {
  try {
    const { prompt: filterPrompt } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    if (!filterPrompt || !filterPrompt.trim()) {
      return res.status(400).json({ error: "Filter description is required" });
    }

    console.log(`Applying filter: "${filterPrompt}"`);
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const promptText = `You are an expert photo editor AI. Your task is to apply a stylistic filter to the entire jewelry image based on the user's request. Do not change the composition or content, only apply the style/filter.

Filter Request: "${filterPrompt}"

Editing Guidelines:
- Apply the filter uniformly across the entire image.
- Maintain the jewelry's recognizable features and details.
- The result must remain photorealistic.
- Preserve the quality and luxury feel of the jewelry.

Examples of valid filters:
- "Apply a vintage sepia tone"
- "Make it look like film photography"
- "Add a warm golden glow"
- "Apply cool blue tones"
- "Increase contrast and saturation"

Output: Return ONLY the final filtered image. Do not return text.`;

    const imagePart = bufferToPart(req.file.buffer, req.file.mimetype);
    
    const result = await model.generateContent([promptText, imagePart]);
    const response = result.response;
    
    const imageUrl = handleApiResponse(response, 'filter');
    
    return res.json({ 
      imageUrl,
      message: 'Filter applied successfully'
    });

  } catch (error: any) {
    console.error("Filter Error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to apply filter"
    });
  }
});

/**
 * Endpoint 4: Global Adjustment to Jewelry Image
 * This endpoint makes overall adjustments like brightness, contrast, etc.
 */
app.post('/api/adjust-design', upload.single('image'), async (req, res) => {
  try {
    const { prompt: adjustmentPrompt } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    if (!adjustmentPrompt || !adjustmentPrompt.trim()) {
      return res.status(400).json({ error: "Adjustment description is required" });
    }

    console.log(`Applying adjustment: "${adjustmentPrompt}"`);
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const promptText = `You are an expert photo editor AI. Your task is to perform a natural, global adjustment to the entire jewelry image based on the user's request.

User Request: "${adjustmentPrompt}"

Editing Guidelines:
- The adjustment must be applied across the entire image.
- The result must be photorealistic and professional.
- Maintain the jewelry's recognizable features.
- Keep the luxury and high-end quality.

Examples of valid adjustments:
- "Increase brightness by 20%"
- "Make the colors more vibrant"
- "Reduce shadows"
- "Enhance the sparkle of gemstones"
- "Sharpen the image"

Output: Return ONLY the final adjusted image. Do not return text.`;

    const imagePart = bufferToPart(req.file.buffer, req.file.mimetype);
    
    const result = await model.generateContent([promptText, imagePart]);
    const response = result.response;
    
    const imageUrl = handleApiResponse(response, 'adjustment');
    
    return res.json({ 
      imageUrl,
      message: 'Adjustment applied successfully'
    });

  } catch (error: any) {
    console.error("Adjustment Error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to apply adjustment"
    });
  }
});

// --- EXISTING ROUTES ---

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
      { product_name: { contains: search as string, mode: 'insensitive' } },
      { final_description: { contains: search as string, mode: 'insensitive' } }
    ];
  }
  try {
    const products = await prisma.productAsset.findMany({ where: whereClause });
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
    console.error("Error fetching product by SKU:", error);
    res.status(500).json({ error: "Internal server error" });
  }
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
    console.error("Download Proxy Error:", error);
    res.status(500).send("Failed to download image");
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    endpoints: {
      generateDesign: '/api/generate-design',
      editDesign: '/api/edit-design',
      filterDesign: '/api/filter-design',
      adjustDesign: '/api/adjust-design'
    }
  });
});

// --- START SERVER ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`-----------------------------------------`);
  console.log(`✅ SERVER RUNNING AT http://localhost:${PORT}`);
  console.log(`-----------------------------------------`);
  console.log(`📍 Available endpoints:`);
  console.log(`   POST /api/generate-design - Generate new jewelry`);
  console.log(`   POST /api/edit-design - Edit with hotspot`);
  console.log(`   POST /api/filter-design - Apply filters`);
  console.log(`   POST /api/adjust-design - Global adjustments`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`-----------------------------------------`);
});