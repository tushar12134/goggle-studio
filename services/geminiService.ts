

import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { QuizResponse } from "../types";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper function to convert file to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generateText = async (prompt: string, modelName: string = 'gemini-2.5-flash'): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
    });
    // FIX: Directly access the .text property for the response.
    return response.text;
  } catch (error) {
    console.error("Error generating text:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
};

export const generateContentWithImage = async (prompt: string, image: File): Promise<string> => {
    try {
        const imagePart = await fileToGenerativePart(image);
        const textPart = { text: prompt };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, imagePart] },
        });
        
        // FIX: Directly access the .text property for the response.
        return response.text;
    } catch (error) {
        console.error("Error generating content with image:", error);
        return "Sorry, I was unable to analyze the image. Please try again.";
    }
};

export const generateQuiz = async (subject: string, difficulty: string): Promise<QuizResponse | null> => {
    try {
        const prompt = `Create a 10-question multiple-choice quiz about "${subject}" at a "${difficulty}" difficulty level. Each question must have exactly 4 options.`;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        quiz: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    options: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING }
                                    },
                                    correctAnswerIndex: { type: Type.INTEGER }
                                },
                                required: ['question', 'options', 'correctAnswerIndex']
                            }
                        }
                    },
                    required: ['quiz']
                }
            }
        });
        
        const jsonText = response.text.trim();
        const quizData: QuizResponse = JSON.parse(jsonText);
        
        // Basic validation
        if (!quizData.quiz || quizData.quiz.length === 0) {
            throw new Error("Generated quiz data is empty or invalid.");
        }

        return quizData;

    } catch (error) {
        console.error("Error generating quiz:", error);
        return null;
    }
};