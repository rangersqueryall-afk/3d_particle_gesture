
import { GoogleGenAI } from "@google/genai";
import { GestureType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getFestiveResponse = async (gesture: GestureType): Promise<string> => {
  if (gesture === GestureType.NONE) return "";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User detected gesture: ${gesture}. Provide a very short (10 words max), extremely festive, and poetic Chinese New Year blessing specifically mentioning the "Year of the Horse" (2026) and this gesture theme. Output ONLY the Chinese text.`,
      config: {
        temperature: 0.9,
        topP: 0.95,
      }
    });

    return response.text?.trim() || "福气满满！";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "祝您马年如意！";
  }
};
