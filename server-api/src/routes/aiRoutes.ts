import express from 'express';
import multer from 'multer';
import { genAI, bufferToPart, handleApiResponse } from '../utils/aiHelper';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/generate-design', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`Generate photorealistic 3D jewelry render: "${req.body.prompt}"`);
    res.json({ imageUrl: handleApiResponse(result.response, 'gen') });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/generate-flashcards', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(`Generate 6 flashcards for jewelry topic: "${req.body.prompt}". Format: Term: Definition`);
    const cards = result.response.text().split('\n').map(l => {
        const [t, ...d] = l.split(':'); 
        return t && d.length ? { term: t.trim().replace(/^\*/g,''), definition: d.join(':').trim() } : null; 
    }).filter(Boolean);
    res.json({ flashcards: cards });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;