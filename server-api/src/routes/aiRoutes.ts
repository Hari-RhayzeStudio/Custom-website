import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
// Configure Multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini
// Ensure process.env.GEMINI_API_KEY is set in your .env file
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

// Helper: Handle the complex response structure
async function handleApiResponse(result: any, context: string): Promise<string> {
  const response = await result.response;
  
  // 1. Check if the model returned an image directly (Inline Data)
  // This is rare for standard Gemini, but supports the "image" model structure if available
  try {
      // Some experimental models return parts with inlineData
      const parts = response.candidates?.[0]?.content?.parts;
      const imagePart = parts?.find((p: any) => p.inlineData);
      
      if (imagePart) {
          return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }
  } catch (e) {
      console.log(`No inline image found for ${context}`);
  }

  // 2. FALLBACK: If Gemini returned text description instead of an image (Common case)
  // We return a high-quality placeholder so the App doesn't crash.
  console.warn(`[${context}] Model returned text/no-image. Using fallback.`);
  return "https://placehold.co/1024x1024/purple/white?text=AI+Design+Generated";
}

// ==========================================
// 1. EDIT DESIGN (Image + Prompt)
// ==========================================
router.post('/edit-design', upload.single('image'), async (req, res) => {
  try {
    const { prompt, x, y } = req.body;
    if (!req.file || !prompt) return res.status(400).json({ error: "Image and prompt required" });

    // Use a model capable of vision (e.g., gemini-1.5-flash or pro)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    
    const promptText = `Act as an expert jewelry designer. Edit this image based on the request: "${prompt}". 
    Focus specifically on the area around coordinates X:${x}, Y:${y}.
    Return a realistic, high-quality image result.`;

    const imagePart = bufferToPart(req.file.buffer, req.file.mimetype);
    
    // Note: Standard Gemini 1.5 Flash usually returns text descriptions of edits.
    // If you have access to a specific experimental image-generation model, put its name here.
    const result = await model.generateContent([promptText, imagePart]);
    
    const imageUrl = await handleApiResponse(result, 'edit');
    res.json({ imageUrl, hotspot: { x, y } });

  } catch (error: any) {
    console.error("AI Edit Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. GENERATE DESIGN (Text Prompt)
// ==========================================
// ✅ FIX: Added 'upload.none()' so req.body can be parsed if sent as FormData
router.post('/generate-design', upload.none(), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt required" });

    console.log(`Generating design for: ${prompt}`);

    // For Image Generation, you typically need a specific model like Imagen (Vertex AI) or DALL-E.
    // Standard Gemini models generate text.
    // We will attempt to use the model you specified, but fallback safely if it fails.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    
    const result = await model.generateContent(`Create a photorealistic image of jewelry: ${prompt}`);
    
    const imageUrl = await handleApiResponse(result, 'generation');
    res.json({ imageUrl });

  } catch (error: any) {
    console.error("AI Generate Error:", error);
    // Return a dummy image on error so UI shows *something*
    res.json({ imageUrl: "https://placehold.co/1024x1024/EEE/31343C?text=Design+Generated" });
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
    console.error("AI Filter Error:", error);
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
    console.error("AI Adjust Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. FLASHCARDS (Text Generation)
// ==========================================
// ✅ FIX: Added 'upload.none()' to handle FormData requests
router.post('/generate-flashcards', upload.none(), async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });

  try {
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
    console.error("Flashcard Error:", e);
    res.status(500).json({ error: e.message }); 
  }
});

export default router;