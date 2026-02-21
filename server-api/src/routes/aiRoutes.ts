import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
// Use memory storage for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Ensure API Key exists
const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
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

// Helper: Handle response safely
async function handleApiResponse(result: any, context: string): Promise<string> {
  try {
      const response = await result.response;
      
      const parts = response.candidates?.[0]?.content?.parts;
      const imagePart = parts?.find((p: any) => p.inlineData);
      
      if (imagePart) {
          console.log(`✅ [${context}] AI returned binary image data.`);
          return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }
      
      if (response.text) {
          console.log(`ℹ️ [${context}] AI Text Response:`, response.text().substring(0, 50) + "...");
      }

  } catch (e) {
      console.error(`❌ [${context}] Error parsing AI response:`, e);
  }

  console.log(`ℹ️ [${context}] Using Fallback Image.`);
  return "https://placehold.co/1024x1024/purple/white?text=Design+Generated";
}

// ==========================================
// 1. EDIT DESIGN
// ==========================================
router.post('/edit-design', upload.single('image'), async (req, res) => {
  try {
    const { prompt, x, y } = req.body;
    if (!req.file || !prompt) return res.status(400).json({ error: "Image and prompt required" });

    console.log(`🎨 Processing Edit: "${prompt}" at ${x},${y}`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    
    const promptText = `Act as an expert jewelry designer. Edit this image based on: "${prompt}". Focus on area X:${x}, Y:${y}.`;
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
// 2. GENERATE DESIGN
// ==========================================
router.post('/generate-design', upload.none(), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt required" });

    console.log(`🎨 Generating Design for: "${prompt}"`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    const result = await model.generateContent(`Create a photorealistic image of jewelry: ${prompt}`);
    const imageUrl = await handleApiResponse(result, 'generation');
    
    res.json({ imageUrl });

  } catch (error: any) {
    console.error("❌ AI Generate Error:", error);
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
router.post('/generate-flashcards', upload.none(), async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // ✅ PROMPT: Asking for very short definitions (10 words max)
    const instruction = `
      You are a jewelry educator. Based on this design: "${prompt}", 
      generate 6 educational flashcards.

      STRICT RULES:
      1. Format: "Term: Definition"
      2. Definition MUST be extremely short (Max 10 words).
      3. Start Definition with a Capital Letter.
      4. DO NOT start with "which", "that", "involving", or "-ing" words. 
      5. Start with a main noun or verb (e.g., "A rare metal..." or "Creates a shine...").
      6. No Markdown.

      Example:
      Filigree: Delicate metalwork made of twisted threads.
      Pave: Small stones set closely together for sparkle.
    `;

    const result = await model.generateContent(instruction);
    const responseText = result.response.text();

    const flashcards = responseText.split('\n').map(l => {
        const [t, ...d] = l.split(':'); 
        if (t && d.length) {
            const cleanTerm = t.trim().replace(/[\*\-]/g, '');
            let cleanDef = d.join(':').trim().replace(/[\*\-]/g, '');
            
            // ✅ HARD ENFORCEMENT LOGIC
            if (cleanDef.length > 0) {
                // 1. Force Capitalization
                cleanDef = cleanDef.charAt(0).toUpperCase() + cleanDef.slice(1);
                
                // 2. Strict 70 Char Limit (Hard Cut)
                if (cleanDef.length > 70) {
                    cleanDef = cleanDef.substring(0, 67).trim() + "...";
                }
            }

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