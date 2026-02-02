
import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const grantPointsDeclaration: FunctionDeclaration = {
  name: 'grantPoints',
  parameters: {
    type: Type.OBJECT,
    description: 'Grant a specific amount of loyalty points to the user for completing a challenge or being helpful.',
    properties: {
      amount: {
        type: Type.NUMBER,
        description: 'Amount of points to grant. Recommended: 10-50 based on task difficulty.',
      },
      reason: {
        type: Type.STRING,
        description: 'The reason why the user is receiving these points.',
      }
    },
    required: ['amount', 'reason'],
  },
};

export const handleAiChatStream = async (
  userMessage: string, 
  lang: 'ar' | 'en', 
  onChunk: (text: string) => void,
  onGrantPoints: (amt: number) => void
) => {
  try {
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction: `You are CARVFi AI Oracle. You can reward users with points (10-50) using the grantPoints tool if they:
        1. Answer a riddle you provide.
        2. Suggest a cool Web3 feature.
        3. Show deep understanding of CARVFi.
        Language: ${lang === 'ar' ? 'Arabic' : 'English'}.
        Tone: Playful, professional, cybernetic.`,
        tools: [{ functionDeclarations: [grantPointsDeclaration] }],
      },
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        fullText += c.text;
        onChunk(c.text);
      }
      
      if (c.functionCalls) {
        for (const call of c.functionCalls) {
          if (call.name === 'grantPoints') {
            const amount = (call.args as any).amount;
            onGrantPoints(amount);
            const rewardMsg = lang === 'ar' 
              ? `\n\n🎉 [نظام]: تم منحك ${amount} نقطة لـ: ${(call.args as any).reason}` 
              : `\n\n🎉 [SYSTEM]: Granted ${amount} points for: ${(call.args as any).reason}`;
            onChunk(rewardMsg);
          }
        }
      }
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    onChunk(lang === 'ar' ? "عذراً، المحرك مشغول." : "Oracle is currently busy.");
  }
};

export const generateNeuralAvatar = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Generate a high-tech, futuristic cyberpunk soulbound avatar based on: ${prompt}. Professional Web3 aesthetic, neon accents, dark background.` }],
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};
