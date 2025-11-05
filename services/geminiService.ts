



import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { QuizResponse, SubjectStudyPlan, YouTubeVideoSuggestion } from "../types";

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

export const generateText = async (prompt: string, modelName: string = 'gemini-flash-lite-latest'): Promise<string> => {
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

export const generateSubjectStudyPlan = async (subject: string): Promise<SubjectStudyPlan | null> => {
    try {
        const prompt = `You are an expert curriculum designer. Create a concise and beginner-friendly study plan for the subject: "${subject}". The plan should include 3-4 learning objectives, 5-7 key topics with brief one-paragraph summaries, 3 recommended YouTube videos with descriptions, and 3 practice problems to test understanding. Format the response as a valid JSON object. For the youtubeSearchQuery, create a concise search query that would find a relevant video on YouTube.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        learningObjectives: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        keyTopics: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    summary: { type: Type.STRING }
                                },
                                required: ['title', 'summary']
                            }
                        },
                        recommendedVideos: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    youtubeSearchQuery: { type: Type.STRING }
                                },
                                required: ['title', 'description', 'youtubeSearchQuery']
                            }
                        },
                        practiceProblems: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING }
                                },
                                required: ['question']
                            }
                        }
                    },
                    required: ['learningObjectives', 'keyTopics', 'recommendedVideos', 'practiceProblems']
                }
            }
        });

        const jsonText = response.text.trim();
        const studyPlan: SubjectStudyPlan = JSON.parse(jsonText);

        // Basic validation
        if (!studyPlan.keyTopics || studyPlan.keyTopics.length === 0) {
            throw new Error("Generated study plan is empty or invalid.");
        }

        return studyPlan;

    } catch (error) {
        console.error(`Error generating study plan for ${subject}:`, error);
        return null;
    }
};


export const generateYoutubeVideoSuggestions = async (query: string): Promise<YouTubeVideoSuggestion[] | null> => {
    try {
        const prompt = `Based on the search query "${query}", find 3 relevant and educational YouTube videos. For each video, provide a title, a brief one-sentence description, and a concise YouTube search query to find it. Return the response as a valid JSON array of objects. Each object should have "title", "description", and "youtubeSearchQuery" keys.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            youtubeSearchQuery: { type: Type.STRING }
                        },
                        required: ['title', 'description', 'youtubeSearchQuery']
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const suggestions: YouTubeVideoSuggestion[] = JSON.parse(jsonText);
        
        return suggestions;

    } catch (error) {
        console.error(`Error generating YouTube suggestions for query "${query}":`, error);
        return null;
    }
};