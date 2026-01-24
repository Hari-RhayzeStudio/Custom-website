import express from 'express';
import multer from 'multer';
import { genAI, bufferToPart, handleApiResponse } from '../utils/aiHelper';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ==========================================
// 1. EDIT DESIGN (Image + Prompt + Coordinates)
// ==========================================
router.post('/edit-design', upload.single('image'), async (req, res) => {
  try {
    const { prompt, x, y } = req.body;
    if (!req.file || !prompt) return res.status(400).json({ error: "Image and prompt required" });

    // Using the model specified in your original code
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

// ==========================================
// 2. GENERATE DESIGN (Text Prompt Only)
// ==========================================
router.post('/generate-design', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt required" });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    const promptText = `Generate a photorealistic 3D render of luxury jewelry: "${prompt}". Return ONLY the image.`;

    const result = await model.generateContent(promptText);
    const imageUrl = handleApiResponse(result.response, 'generation');
    res.json({ imageUrl });

  } catch (error: any) {
    console.error("AI Generate Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. FILTER DESIGN (Image + Prompt)
// ==========================================
router.post('/filter-design', upload.single('image'), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!req.file) return res.status(400).json({ error: "No image provided" });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    const promptText = `Apply this stylistic filter to the jewelry image: "${prompt}". Return ONLY the image.`;

    const imagePart = bufferToPart(req.file.buffer, req.file.mimetype);
    const result = await model.generateContent([promptText, imagePart]);
    
    const imageUrl = handleApiResponse(result.response, 'filter');
    res.json({ imageUrl });

  } catch (error: any) {
    console.error("AI Filter Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. ADJUST DESIGN (Image + Prompt)
// ==========================================
router.post('/adjust-design', upload.single('image'), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!req.file) return res.status(400).json({ error: "No image provided" });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    const promptText = `Perform this global photo adjustment: "${prompt}". Return ONLY the image.`;

    const imagePart = bufferToPart(req.file.buffer, req.file.mimetype);
    const result = await model.generateContent([promptText, imagePart]);
    
    const imageUrl = handleApiResponse(result.response, 'adjustment');
    res.json({ imageUrl });

  } catch (error: any) {
    console.error("AI Adjust Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. FLASHCARDS
// ==========================================
router.post('/generate-flashcards', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // UPDATED PROMPT: Explicitly forbidding Markdown
    const instruction = `
      You are a jewelry expert. Based on this design request: "${prompt}", 
      generate 6 educational flashcards about the materials, gemstones, or techniques implied.
      
      STRICT RULES:
      1. Do NOT use asterisks (*), bolding, or markdown.
      2. Provide PLAIN TEXT only.
      3. Format exactly as: Term: Definition
      4. One flashcard per line.
      
      Example:
      Platinum: A dense, malleable, silver-white metal highly resistant to corrosion.
      Pave Setting: Small stones set closely together separated by tiny metal beads.
    `;

    const result = await model.generateContent(instruction);
    const responseText = result.response.text();

    const flashcards = responseText.split('\n').map(l => {
        const [t, ...d] = l.split(':'); 
        if (t && d.length) {
            // AGGRESSIVE CLEANING: Removes *, -, and extra spaces
            const cleanTerm = t.trim().replace(/[\*\-]/g, '');
            const cleanDef = d.join(':').trim().replace(/[\*\-]/g, '');
            
            return { term: cleanTerm, definition: cleanDef };
        }
        return null;
    }).filter(Boolean);

    res.json({ flashcards });
  } catch (e: any) { 
    res.status(500).json({ error: e.message }); 
  }
});

export default router;