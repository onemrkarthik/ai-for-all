import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { ChatMessage } from "./services/chat";
import { Photo } from "./services/photos";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

interface Professional {
    id: number;
    name: string;
    company: string;
    averageRating?: number;
    reviewCount?: number;
}

/**
 * Generates a system prompt based on the professional persona.
 * Photo context is optional - if provided, can reference specific work.
 */
function getSystemPrompt(professional: Professional, photo?: Photo | null): string {
    let photoContext = "";
    if (photo) {
        const attributeStr = photo.attributes?.map(a => `${a.label}: ${a.value}`).join(", ") || "No specific attributes listed.";
        photoContext = `
REFERENCE PHOTO (optional context):
- Title: ${photo.title}
- Description: ${photo.description || "A high-quality kitchen design."}
- Attributes: ${attributeStr}
`;
    }

    return `You are a helpful AI assistant for "${professional.company}". You are helping a client who is interested in the work of ${professional.name}.
Your job is to assist with initial inquiries and help potential clients explore working with this professional.

PROFESSIONAL INFO:
- Name: ${professional.name}
- Company: ${professional.company}
${professional.averageRating ? `- Rating: ${professional.averageRating.toFixed(1)} stars (${professional.reviewCount} reviews)` : ''}
${photoContext}

YOUR GOAL:
1. Help the client refine their vision for a kitchen remodel by following a **Breadth -> Iterative Depth** strategy.
2. **Anchor on Initial Message**: Use the user's very first inquiry as the fundamental context. Acknowledge their specific interest or compliment and ensure all subsequent questions relate back to their stated goal.
3. Maintain a friendly and encouraging tone while gathering Scope, Budget, and Timeline for a consultation.

STRATEGY:
- **Phase 1 (Breadth)**: First, briefly touch on all major aspects (General Scope, Estimated Budget, and Timeline). Do not go deep yet.
- **Phase 2 (Iterative Depth)**: Once you have a broad idea, build on it by asking introductory questions for specific facets (e.g., "Tell me about your cabinetry ideas").
- Only dive into deep specifics (materials, brands, layout nuances) once the general direction for that facet is understood.

CONVERSATION STYLE:
- **Concise**: Keep responses under 3 sentences.
- **One at a time**: Never ask more than one question in a single response.
- **Natural**: Reference the professional's expertise and portfolio naturally.
- **Summary**: Periodically providing a very brief summary of what you've learned so far.

FORMATTING:
- ALWAYS respond in valid JSON format with the following structure:
{
  "response": "Your message to the user here...",
  "suggestions": ["Option 1", "Option 2", "Option 3"],
  "isSufficient": true/false,
  "projectSummary": "Optional markdown summary of the project..."
}

GUIDELINES FOR SUGGESTIONS:
- Provide 2-4 varied suggested answers for the user to pick from.
- Keep them short and punchy (1-4 words).
- Make them specific to the question you just asked.
- **Variety**: Offer different perspectives (e.g., for budget: "Economy/Basic", "Mid-range", "High-end/Luxury", "I'm not sure").
- **Progression**: If you asked about scope, suggest common kitchen areas like "Full kitchen", "Just cabinets", "Counters & tiles".

**Judge Logic**: You are the judge of sufficiency. Set "isSufficient" to true ONLY if you have gathered clear details for:
1. **Scope**: What specific rooms/areas and the general nature of the work.
2. **Budget**: A specific dollar range or level of investment.
3. **Timeline**: When they want to start or complete the project.

**Project Summary**: ALWAYS populate "projectSummary" with a professional HTML-formatted brief reflecting the CURRENT state of what you've learned. If information is missing (e.g., budget), state "To be determined".
Use standard HTML tags like <h4>, <ul>, <li>, <strong> etc. for a clean, professional look. Do not include <html> or <body> tags. Include:
- **Project Overview**: A high-level description.
- **Key Requirements**: A list of scope details.
- **Budget & Timeline**: Current stated ranges or "TBD".
- **Style Notes**: Any preferences mentioned.

Be helpful and provide expert insights about kitchen design based on the professional's expertise.`;
}

export async function generateAIResponse(photo: Photo | null, history: ChatMessage[], professional?: Professional) {
    if (!process.env.GOOGLE_API_KEY) {
        console.error("GOOGLE_API_KEY is missing");
        return {
            response: "I'm sorry, I'm having trouble connecting to my creative brain right now. Please try again later!",
            isSufficient: false
        };
    }

    // Build professional context - use from photo if not provided directly
    const prof: Professional = professional || {
        id: photo?.professional?.id || 0,
        name: photo?.professional?.name || "Design Professional",
        company: photo?.professional?.company || "Design Studio",
        averageRating: photo?.professional?.averageRating,
        reviewCount: photo?.professional?.reviewCount,
    };

    try {
        const systemPrompt = getSystemPrompt(prof, photo);

        // Convert history to Gemini format
        const chatHistory = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }] as Part[],
        }));

        const chat = model.startChat({
            history: chatHistory.slice(0, -1),
        });

        const latestMessage = history[history.length - 1].content;
        const prompt = `${systemPrompt}\n\nLATEST USER MESSAGE: ${latestMessage}`;

        const result = await chat.sendMessage(prompt);
        const text = result.response.text();

        // Parse JSON response
        try {
            const cleanedJson = text.replace(/```json\n?|\n?```/g, "").trim();
            return JSON.parse(cleanedJson);
        } catch (_e) {
            console.error("Failed to parse AI JSON response:", text);
            return {
                response: text,
                isSufficient: false
            };
        }
    } catch (error: unknown) {
        console.error("AI Generation Error:", error);

        // Specialized handling for rate limiting (429)
        const errorObj = error as { status?: number; message?: string };
        if (errorObj?.status === 429 || errorObj?.message?.includes("429")) {
            return {
                response: "Wow, we're getting a lot of design interest right now! I'm taking a quick breather. Please send your message again in a few seconds.",
                isSufficient: false
            };
        }

        throw error;
    }
}
