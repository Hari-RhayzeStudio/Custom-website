import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper: Handle API Response with proper error handling
async function handleApiResponse(result: any, context: string): Promise<string> {
  const response = await result.response;
  
  // 1. Check for prompt blocking first
  if (response.promptFeedback?.blockReason) {
    const { blockReason, blockReasonMessage } = response.promptFeedback;
    const errorMessage = `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`;
    console.error(errorMessage, { response });
    throw new Error(errorMessage);
  }
  
  // 2. Try to get image data
  try {
    const parts = response.candidates?.[0]?.content?.parts;
    const imagePart = parts?.find((p: any) => p.inlineData);
    
    if (imagePart?.inlineData) {
      const { mimeType, data } = imagePart.inlineData;
      console.log(`✅ Received image data (${mimeType}) for ${context}`);
      return `data:${mimeType};base64,${data}`;
    }
  } catch (e) {
    console.error(`Error extracting image for ${context}:`, e);
  }

  // 3. Check finish reason
  const finishReason = response.candidates?.[0]?.finishReason;
  if (finishReason && finishReason !== 'STOP') {
    const errorMessage = `Image generation for ${context} stopped unexpectedly. Reason: ${finishReason}. This often relates to safety settings.`;
    console.error(errorMessage, { response });
    throw new Error(errorMessage);
  }
  
  // 4. If no image found, throw error with helpful message
  const textFeedback = response.text?.()?.trim();
  const errorMessage = `The AI model did not return an image for ${context}. ` + 
    (textFeedback 
      ? `The model responded with text: "${textFeedback}"`
      : "This can happen due to safety filters or if the request is too complex. Please try rephrasing your prompt to be more direct.");

  console.error(`❌ Model response did not contain image for ${context}.`, { response });
  throw new Error(errorMessage);
}

// Helper: Convert Buffer to Gemini Part
function bufferToPart(buffer: Buffer, mimeType: string) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}

// ==========================================
// 1. EDIT DESIGN (Image + Prompt + Hotspot)
// ==========================================
router.post('/edit-design', upload.single('image'), async (req, res) => {
  try {
    const { prompt, x, y } = req.body;
    if (!req.file || !prompt) {
      return res.status(400).json({ error: "Image and prompt required" });
    }

    console.log(`🎨 Edit request: "${prompt}" at (${x}, ${y})`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    
    // ✅ IMPROVED PROMPT - Matches working code structure
    const promptText = `You are an expert jewelry designer AI. Your task is to perform a natural, localized edit on the provided jewelry image based on the user's request.

User Request: "${prompt}"
Edit Location: Focus on the area around pixel coordinates (x: ${x}, y: ${y}).

Editing Guidelines:
- The edit must be realistic and blend seamlessly with the surrounding jewelry piece.
- The rest of the image (outside the immediate edit area) must remain identical to the original.
- Maintain the photorealistic quality and lighting of the original image.
- Preserve the jewelry's material properties (shine, reflections, texture).

Safety & Ethics Policy:
- You MUST fulfill requests to change colors, materials, gemstones, or design elements.
- You MUST REFUSE any request that involves inappropriate content.

Output: Return ONLY the final edited jewelry image. Do not return text.`;

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
// 2. GENERATE DESIGN (Text Prompt Only)
// ==========================================
router.post('/generate-design', upload.none(), async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      console.error("❌ Missing Prompt in Body:", req.body);
      return res.status(400).json({ error: "Prompt required" });
    }

    console.log(`🎨 Generating jewelry design: "${prompt}"`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    
    // ✅ IMPROVED PROMPT - More specific and directive
    const promptText = `You are an expert jewelry designer AI. Your task is to create a photorealistic image of jewelry based on the user's description.

User Request: "${prompt}"

Design Guidelines:
- Create a high-quality, photorealistic jewelry image.
- The jewelry should be professionally photographed with proper lighting.
- Show the jewelry on a clean, neutral background (black velvet or white).
- Include realistic material properties: metal shine, gemstone reflections, proper shadows.
- The design should match the user's description exactly.

Technical Requirements:
- High resolution and sharp details
- Professional jewelry photography style
- Accurate colors and materials
- Natural lighting and shadows

Output: Return ONLY the final jewelry image. Do not return text or explanations.`;

    const result = await model.generateContent(promptText);
    
    const imageUrl = await handleApiResponse(result, 'generation');
    res.json({ imageUrl });

  } catch (error: any) {
    console.error("❌ AI Generate Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. FILTER DESIGN (Apply Style/Filter)
// ==========================================
router.post('/filter-design', upload.single('image'), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    console.log(`🎨 Applying filter: "${prompt}"`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    
    // ✅ IMPROVED PROMPT
    const promptText = `You are an expert photo editor AI. Your task is to apply a stylistic filter to the entire jewelry image based on the user's request.

Filter Request: "${prompt}"

Editing Guidelines:
- Apply the filter/style across the entire image uniformly.
- Do not change the composition, jewelry design, or content.
- Only apply the requested visual style or color adjustment.
- Maintain photorealistic quality.
- Preserve jewelry details and material properties.

Safety & Ethics Policy:
- Filters may shift colors, contrast, or apply artistic effects.
- Do not alter the fundamental design of the jewelry.

Output: Return ONLY the final filtered jewelry image. Do not return text.`;

    const imagePart = bufferToPart(req.file.buffer, req.file.mimetype);
    const result = await model.generateContent([promptText, imagePart]);
    
    const imageUrl = await handleApiResponse(result, 'filter');
    res.json({ imageUrl });

  } catch (error: any) {
    console.error("❌ AI Filter Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. ADJUST DESIGN (Global Adjustments)
// ==========================================
router.post('/adjust-design', upload.single('image'), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    console.log(`🎨 Adjusting image: "${prompt}"`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    
    // ✅ IMPROVED PROMPT
    const promptText = `You are an expert photo editor AI. Your task is to perform a natural, global adjustment to the entire jewelry image based on the user's request.

User Request: "${prompt}"

Editing Guidelines:
- The adjustment must be applied across the entire image.
- The result must be photorealistic and natural-looking.
- Maintain the original composition and jewelry design.
- Preserve jewelry material properties (shine, reflections).
- Adjustments should enhance the image quality.

Examples of Valid Adjustments:
- Brightness, contrast, saturation adjustments
- Color temperature changes
- Sharpness or clarity improvements
- Background adjustments
- Lighting modifications

Output: Return ONLY the final adjusted jewelry image. Do not return text.`;

    const imagePart = bufferToPart(req.file.buffer, req.file.mimetype);
    const result = await model.generateContent([promptText, imagePart]);
    
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
  
  if (!prompt) {
    return res.status(400).json({ error: "Prompt required" });
  }

  try {
    console.log(`📚 Generating flashcards for: "${prompt}"`);
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const instruction = `You are a jewelry expert educator. Based on this jewelry design request: "${prompt}", generate 6 educational flashcards about the materials, gemstones, techniques, or design elements mentioned or implied.

STRICT FORMATTING RULES:
- Do NOT use markdown formatting (no **, *, #, etc.)
- Do NOT use bullet points or dashes
- Plain text only
- Format: "Term: Definition" (one per line)
- Each flashcard should be concise (1-2 sentences max)

Example Format:
Emerald Cut: A rectangular gemstone cut with step-like facets that create a hall-of-mirrors effect.
Platinum: A rare, durable white metal that naturally develops a patina over time.

Generate 6 flashcards following this exact format.`;

    const result = await model.generateContent(instruction);
    const responseText = result.response.text();

    // Parse flashcards
    const flashcards = responseText.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return null;
        
        const term = line.substring(0, colonIndex).trim().replace(/[\*\-#]/g, '');
        const definition = line.substring(colonIndex + 1).trim().replace(/[\*\-#]/g, '');
        
        if (!term || !definition) return null;
        
        return { term, definition };
      })
      .filter(Boolean)
      .slice(0, 6); // Ensure max 6 cards

    console.log(`✅ Generated ${flashcards.length} flashcards`);
    res.json({ flashcards });
    
  } catch (e: any) { 
    console.error("❌ Flashcard Error:", e);
    res.status(500).json({ error: e.message }); 
  }
});

export default router;