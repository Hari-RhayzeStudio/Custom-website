import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Single consistent env variable - make sure THIS name is in Render
const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || "";

if (!API_KEY) {
  console.error("❌ CRITICAL: No Gemini API key found! Set GEMINI_API_KEY in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Helper: Convert Buffer to Gemini Part
function bufferToPart(buffer: Buffer, mimeType: string) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}

// Helper: Handle response and extract image
function handleApiResponse(response: any, context: string): string {
  // 1. Check for blocking
  if (response.promptFeedback?.blockReason) {
    throw new Error(`Blocked: ${response.promptFeedback.blockReason}`);
  }

  // 2. Extract image
  const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
  if (imagePart?.inlineData) {
    console.log(`✅ [${context}] Image received`);
    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  }

  // 3. Check finish reason
  const finishReason = response.candidates?.[0]?.finishReason;
  console.error(`❌ [${context}] No image. finishReason: ${finishReason}`);
  console.error(`❌ [${context}] Full response:`, JSON.stringify(response, null, 2));

  throw new Error(`No image generated for ${context}. finishReason: ${finishReason}`);
}

// ==========================================
// 1. EDIT DESIGN (Image + Prompt)
// ==========================================
router.post('/edit-design', upload.single('image'), async (req, res) => {
  try {
    const { prompt, x, y } = req.body;

    if (!req.file || !prompt) {
      return res.status(400).json({ error: "Image and prompt required" });
    }

    console.log(`🎨 [EDIT] "${prompt}" at (${x}, ${y})`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    const imagePart = bufferToPart(req.file.buffer, req.file.mimetype);

    const result = await model.generateContent([
      `Act as an expert jewelry designer. Edit this image based on the request: "${prompt}". Focus on area around X:${x}, Y:${y}. Return only the edited image.`,
      imagePart
    ]);

    const imageUrl = handleApiResponse(result.response, 'edit');
    res.json({ imageUrl, hotspot: { x, y } });

  } catch (error: any) {
    console.error("❌ [EDIT] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. GENERATE DESIGN (Text Prompt)
// ==========================================
router.post('/generate-design', upload.none(), async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      console.error("❌ [GENERATE] Missing prompt. Body:", req.body);
      return res.status(400).json({ error: "Prompt required" });
    }

    console.log(`🎨 [GENERATE] "${prompt}"`);
    console.log(`🔑 [GENERATE] API Key present: ${!!API_KEY}, length: ${API_KEY.length}`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    const result = await model.generateContent(
      `Create a photorealistic image of jewelry: ${prompt}. Professional studio photography, clean background, high quality.`
    );

    const imageUrl = handleApiResponse(result.response, 'generation');
    res.json({ imageUrl });

  } catch (error: any) {
    console.error("❌ [GENERATE] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. FILTER DESIGN
// ==========================================
router.post('/filter-design', upload.single('image'), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!req.file) return res.status(400).json({ error: "No image provided" });

    console.log(`🎨 [FILTER] "${prompt}"`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    const imagePart = bufferToPart(req.file.buffer, req.file.mimetype);

    const result = await model.generateContent([`Apply filter: ${prompt}`, imagePart]);
    const imageUrl = handleApiResponse(result.response, 'filter');
    res.json({ imageUrl });

  } catch (error: any) {
    console.error("❌ [FILTER] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. ADJUST DESIGN
// ==========================================
router.post('/adjust-design', upload.single('image'), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!req.file) return res.status(400).json({ error: "No image provided" });

    console.log(`🎨 [ADJUST] "${prompt}"`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    const imagePart = bufferToPart(req.file.buffer, req.file.mimetype);

    const result = await model.generateContent([`Adjust image: ${prompt}`, imagePart]);
    const imageUrl = handleApiResponse(result.response, 'adjustment');
    res.json({ imageUrl });

  } catch (error: any) {
    console.error("❌ [ADJUST] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. FLASHCARDS
// ==========================================
router.post('/generate-flashcards', upload.none(), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt required" });

    console.log(`📚 [FLASHCARDS] "${prompt}"`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(`
      You are a jewelry expert. Based on this design request: "${prompt}", 
      generate 6 educational flashcards about the materials, gemstones, or techniques implied.
      STRICT RULES: Do NOT use markdown. Plain text only. Format: Term: Definition. One per line.
    `);

    const responseText = result.response.text();
    const flashcards = responseText.split('\n').map(l => {
      const [t, ...d] = l.split(':');
      if (t && d.length) {
        return {
          term: t.trim().replace(/[\*\-]/g, ''),
          definition: d.join(':').trim().replace(/[\*\-]/g, '')
        };
      }
      return null;
    }).filter(Boolean);

    res.json({ flashcards });

  } catch (error: any) {
    console.error("❌ [FLASHCARDS] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;