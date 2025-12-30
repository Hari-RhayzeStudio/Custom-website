// server-api/services/geminiServices.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY!);

const bufferToPart = (buffer: Buffer, mimeType: string) => {
    return {
        inlineData: {
            data: buffer.toString("base64"),
            mimeType
        }
    };
};

export const generateEditedImage = async (
    imageBuffer: Buffer,
    mimeType: string,
    userPrompt: string,
    hotspot: { x: number, y: number }
): Promise<string> => {
    // Using gemini-1.5-flash for faster image processing
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    const prompt = `You are an expert jewellery designer. Edit this jewellery image.
    User Request: "${userPrompt}"
    Edit Location: Focus on coordinates (x: ${hotspot.x}, y: ${hotspot.y}).
    Guidelines: Blend the edit seamlessly with the original piece. Return ONLY the edited image data.`;

    const imagePart = bufferToPart(imageBuffer, mimeType);
    
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    
    const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePartFromResponse?.inlineData) {
        const { mimeType: outMime, data } = imagePartFromResponse.inlineData;
        return `data:${outMime};base64,${data}`;
    }
    
    throw new Error("AI did not return an edited image part. Check safety filters.");
};