"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const aiHelper_1 = require("../utils/aiHelper");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// ==========================================
// 1. EDIT DESIGN (Image + Prompt + Coordinates)
// ==========================================
router.post('/edit-design', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { prompt, x, y } = req.body;
        if (!req.file || !prompt)
            return res.status(400).json({ error: "Image and prompt required" });
        // Using the model specified in your original code
        const model = aiHelper_1.genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
        const promptText = `Expert jewelry editor. Edit this image based on request: "${prompt}". Focus on area x:${x}, y:${y}. Return ONLY the edited image.`;
        const imagePart = (0, aiHelper_1.bufferToPart)(req.file.buffer, req.file.mimetype);
        const result = yield model.generateContent([promptText, imagePart]);
        const imageUrl = (0, aiHelper_1.handleApiResponse)(result.response, 'edit');
        res.json({ imageUrl, hotspot: { x, y } });
    }
    catch (error) {
        console.error("AI Edit Error:", error);
        res.status(500).json({ error: error.message });
    }
}));
// ==========================================
// 2. GENERATE DESIGN (Text Prompt Only)
// ==========================================
router.post('/generate-design', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { prompt } = req.body;
        if (!prompt)
            return res.status(400).json({ error: "Prompt required" });
        const model = aiHelper_1.genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
        const promptText = `Generate a photorealistic 3D render of luxury jewelry: "${prompt}". Return ONLY the image.`;
        const result = yield model.generateContent(promptText);
        const imageUrl = (0, aiHelper_1.handleApiResponse)(result.response, 'generation');
        res.json({ imageUrl });
    }
    catch (error) {
        console.error("AI Generate Error:", error);
        res.status(500).json({ error: error.message });
    }
}));
// ==========================================
// 3. FILTER DESIGN (Image + Prompt)
// ==========================================
router.post('/filter-design', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { prompt } = req.body;
        if (!req.file)
            return res.status(400).json({ error: "No image provided" });
        const model = aiHelper_1.genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
        const promptText = `Apply this stylistic filter to the jewelry image: "${prompt}". Return ONLY the image.`;
        const imagePart = (0, aiHelper_1.bufferToPart)(req.file.buffer, req.file.mimetype);
        const result = yield model.generateContent([promptText, imagePart]);
        const imageUrl = (0, aiHelper_1.handleApiResponse)(result.response, 'filter');
        res.json({ imageUrl });
    }
    catch (error) {
        console.error("AI Filter Error:", error);
        res.status(500).json({ error: error.message });
    }
}));
// ==========================================
// 4. ADJUST DESIGN (Image + Prompt)
// ==========================================
router.post('/adjust-design', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { prompt } = req.body;
        if (!req.file)
            return res.status(400).json({ error: "No image provided" });
        const model = aiHelper_1.genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
        const promptText = `Perform this global photo adjustment: "${prompt}". Return ONLY the image.`;
        const imagePart = (0, aiHelper_1.bufferToPart)(req.file.buffer, req.file.mimetype);
        const result = yield model.generateContent([promptText, imagePart]);
        const imageUrl = (0, aiHelper_1.handleApiResponse)(result.response, 'adjustment');
        res.json({ imageUrl });
    }
    catch (error) {
        console.error("AI Adjust Error:", error);
        res.status(500).json({ error: error.message });
    }
}));
// ==========================================
// 5. FLASHCARDS
// ==========================================
router.post('/generate-flashcards', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { prompt } = req.body;
    if (!prompt)
        return res.status(400).json({ error: "Prompt required" });
    try {
        const model = aiHelper_1.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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
        const result = yield model.generateContent(instruction);
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
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
}));
exports.default = router;
