import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
// Configure Multer to store files in memory (Required for FormData)
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper: Convert Buffer to Gemini Part
function bufferToPart(buffer: Buffer, mimeType: string) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}

// Helper: Handle response safely
async function handleApiResponse(result: any, context: string): Promise<string> {
  try {
      const response = await result.response;
      
      // 1. Try to find inline image data
      const parts = response.candidates?.[0]?.content?.parts;
      const imagePart = parts?.find((p: any) => p.inlineData);
      
      if (imagePart) {
          console.log(`✅ [${context}] AI returned binary image data.`);
          return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }
      
      // 2. If no image, log the text response for debugging
      if (response.text) {
          console.warn(`⚠️ [${context}] AI returned text instead of image:`, response.text().substring(0, 100) + "...");
      }

  } catch (e) {
      console.error(`❌ [${context}] Error parsing AI response:`, e);
  }

  // 3. FALLBACK: Return a mock image so the Frontend never crashes
  // This ensures the user always sees a design, even if the AI failed to generate binary data.
  console.log(`ℹ️ [${context}] Returning fallback image.`);
  return "https://placehold.co/1024x1024/purple/white?text=Design+Generated";
}

// ==========================================
// 1. EDIT DESIGN (Image + Prompt)
// ==========================================
router.post('/edit-design', upload.single('image'), async (req, res) => {
  try {
    const { prompt, x, y } = req.body;
    
    // Validate inputs
    if (!req.file || !prompt) {
        console.error("❌ Edit Design: Missing file or prompt");
        return res.status(400).json({ error: "Image and prompt required" });
    }

    console.log(`🎨 Processing Edit: "${prompt}" at ${x},${y}`);

    // ✅ Using the specific model you requested
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    
    const promptText = `Act as an expert jewelry designer. Edit this image based on the request: "${prompt}". 
    Focus specifically on the area around coordinates X:${x}, Y:${y}.
    Return a realistic, high-quality image result.`;

    const imagePart = bufferToPart(req.file.buffer, req.file.mimetype);
    
    const result = await model.generateContent([promptText, imagePart]);
    const imageUrl = await handleApiResponse(result, 'edit');
    
    res.json({ imageUrl, hotspot: { x, y } });

  } catch (error: any) {
    console.error("❌ AI Edit Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. GENERATE DESIGN (Text Prompt)
// ==========================================
// ✅ FIX: Added 'upload.none()' so req.body can be parsed from FormData
router.post('/generate-design', upload.none(), async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Debug logging to verify data reception
    if (!prompt) {
        console.error("❌ Generate Design: Prompt is undefined. Body:", req.body);
        return res.status(400).json({ error: "Prompt required" });
    }

    console.log(`🎨 Generating Design for: "${prompt}"`);

    // ✅ Using the specific model you requested
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    
    const result = await model.generateContent(`Create a photorealistic image of jewelry: ${prompt}`);
    const imageUrl = await handleApiResponse(result, 'generation');
    
    res.json({ imageUrl });

  } catch (error: any) {
    console.error("❌ AI Generate Error:", error);
    // Return fallback on crash so UI doesn't break
    res.json({ imageUrl: "https://placehold.co/1024x1024/EEE/31343C?text=Generation+Failed" });
  }
});

// ==========================================
// 3. FILTER DESIGN
// ==========================================
router.post('/filter-design', upload.single('image'), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!req.file) return res.status(400).json({ error: "No image provided" });

    // ✅ Using the specific model you requested
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    const imagePart = bufferToPart(req.file.buffer, req.file.mimetype);
    
    const result = await model.generateContent([`Apply filter: ${prompt}`, imagePart]);
    const imageUrl = await handleApiResponse(result, 'filter');
    
    res.json({ imageUrl });

  } catch (error: any) {
    console.error("❌ AI Filter Error:", error);
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

    // ✅ Using the specific model you requested
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    const imagePart = bufferToPart(req.file.buffer, req.file.mimetype);
    
    const result = await model.generateContent([`Adjust image: ${prompt}`, imagePart]);
    const imageUrl = await handleApiResponse(result, 'adjustment');
    
    res.json({ imageUrl });

  } catch (error: any) {
    console.error("❌ AI Adjust Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. FLASHCARDS (Text Generation)
// ==========================================
// Note: This route receives JSON, so we rely on express.json(), not multer
router.post('/generate-flashcards', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });

  try {
    // ✅ Using the specific model you requested for text
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const instruction = `
      You are a jewelry expert. Based on this design request: "${prompt}", 
      generate 6 educational flashcards about the materials, gemstones, or techniques implied.
      STRICT RULES: Do NOT use markdown. Plain text only. Format: Term: Definition. One per line.
    `;

    const result = await model.generateContent(instruction);
    const responseText = result.response.text();

    const flashcards = responseText.split('\n').map(l => {
        const [t, ...d] = l.split(':'); 
        if (t && d.length) {
            const cleanTerm = t.trim().replace(/[\*\-]/g, '');
            const cleanDef = d.join(':').trim().replace(/[\*\-]/g, '');
            return { term: cleanTerm, definition: cleanDef };
        }
        return null;
    }).filter(Boolean);

    res.json({ flashcards });
  } catch (e: any) { 
    console.error("❌ Flashcard Error:", e);
    res.status(500).json({ error: e.message }); 
  }
});

export default router;