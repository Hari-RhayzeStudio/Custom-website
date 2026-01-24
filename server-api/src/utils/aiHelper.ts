import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// Export the initialized client
export const genAI = new GoogleGenerativeAI(process.env.API_KEY!);

// Helper to convert Multer buffer to Gemini Part
export const bufferToPart = (buffer: Buffer, mimeType: string) => ({
  inlineData: {
    data: buffer.toString("base64"),
    mimeType
  }
});

// Helper to handle response and extract Image
export const handleApiResponse = (response: any, context: string): string => {
  if (response.promptFeedback?.blockReason) {
    throw new Error(`Blocked: ${response.promptFeedback.blockReason}`);
  }
  const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
  if (imagePart?.inlineData) {
    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  }
  throw new Error(`No image generated for ${context}. The model might have returned text only.`);
};