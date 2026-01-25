"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleApiResponse = exports.bufferToPart = exports.genAI = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Export the initialized client
exports.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.API_KEY);
// Helper to convert Multer buffer to Gemini Part
const bufferToPart = (buffer, mimeType) => ({
    inlineData: {
        data: buffer.toString("base64"),
        mimeType
    }
});
exports.bufferToPart = bufferToPart;
// Helper to handle response and extract Image
const handleApiResponse = (response, context) => {
    var _a, _b, _c, _d, _e;
    if ((_a = response.promptFeedback) === null || _a === void 0 ? void 0 : _a.blockReason) {
        throw new Error(`Blocked: ${response.promptFeedback.blockReason}`);
    }
    const imagePart = (_e = (_d = (_c = (_b = response.candidates) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.parts) === null || _e === void 0 ? void 0 : _e.find((p) => p.inlineData);
    if (imagePart === null || imagePart === void 0 ? void 0 : imagePart.inlineData) {
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }
    throw new Error(`No image generated for ${context}. The model might have returned text only.`);
};
exports.handleApiResponse = handleApiResponse;
