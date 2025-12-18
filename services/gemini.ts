
import { GoogleGenAI, Type } from "@google/genai";
import { CreatorProfile, ViralScore, OnboardingAnswers, CarouselSlide } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const safeJsonParse = (text: string | undefined) => {
  if (!text) return null;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (e) {
    return null;
  }
};

// Kendidex Authority Guide System
const KENDIDEX_SYSTEM_PROMPT = `
You are a LinkedIn Growth Strategist for Kendidex. 
YOUR JOB: Create "Cheat Sheet" style content that is so valuable people feel obligated to save it.

POST PHILOSOPHY:
- No fluff. No "Believe in yourself."
- Pure math, logic, and frameworks.
- Frame the problem in lost revenue ($).
- Position automation as the unfair competitive advantage.

STRUCTURE:
1. [HOOK]: A stark realization or data point.
2. [THE GAP]: Why the old way is failing (manual prospecting, human error).
3. [THE MULTIPLIER]: Specific numbers showing the ROI of automation.
4. [THE GUIDE]: A step-by-step roadmap.
5. [SOFT CTA]: Low-friction engagement question.
`;

// THE "AUTHORITY INFOGRAPHIC" VISUAL SYSTEM
const AUTHORITY_GRAPHIC_SYSTEM = `
INFOGRAPHIC DESIGN SYSTEM:
- AESTHETIC: High-end Technical Editorial. 
- STYLE: Minimalist abstract 3D frameworks. Clean isometric grids, translucent glass panels, and geometric structural elements.
- LIGHTING: Soft studio lighting, realistic shadows, depth of field.
- PALETTE: Deep Charcoal (#0B0E14) base, with Vibrant Orange (#F97316) and Slate White accents.
- ELEMENTS: 
  - Structural glass pillars (Scale)
  - Interlocking geometric loops (Systems)
  - Sharp isometric floating grids (Data)
  - Abstract blueprints (Roadmap)
- RULE: ABSOLUTELY NO TEXT, LABELS, OR NUMBERS in the generated image. The UI will handle the text.
`;

export const CREATORS: CreatorProfile[] = [
  {
    id: 'justin-welsh',
    name: "Justin Welsh",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Justin",
    description: "Solopreneur guide. High-value frameworks.",
    instructions: "Style: Punchy, structured, 1-line paragraphs, heavy emphasis on 'The Result'."
  },
  {
    id: 'kleo-expert',
    name: "Authority Guide",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kleo",
    description: "The 'Ultimate Guide' formula. Dense, tactical, high-authority.",
    instructions: "Style: The Cheat Sheet Master. Uses numbers, bullet points, and 'The Math' to build undeniable authority."
  }
];

export const generateFullPost = async (prompt: string, voice: CreatorProfile, context: OnboardingAnswers) => {
  const ai = getAI();
  const contextStr = `BRAND INTEL: Niche: ${context.niche}, Audience: ${context.audience}, Tone: ${context.tone}.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `
    ${KENDIDEX_SYSTEM_PROMPT}
    ${AUTHORITY_GRAPHIC_SYSTEM}
    ${contextStr}
    
    TASK: Generate a viral "Cheat Sheet" post and an abstract structural visual prompt.
    USER REQUEST: "${prompt}"
    
    Response Format (JSON):
    {
      "explanation": "Why this framework works.",
      "content": "Tactical post content...",
      "imagePrompt": "Description for a high-end isometric abstract framework (glass, orange accents, minimalist). No text."
    }`,
    config: { responseMimeType: 'application/json' }
  });
  return safeJsonParse(response.text);
};

export const chatEditPost = async (currentContent: string, instruction: string, voice: CreatorProfile, context: OnboardingAnswers) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `
    Current Post: "${currentContent}"
    Instruction: "${instruction}"
    
    TASK: Update the post or visual prompt.
    Return JSON:
    {
      "explanation": "Briefly state what changed.",
      "content": "Updated content.",
      "shouldUpdateImage": true/false,
      "imagePromptOverride": "If true, provide a new high-end structural abstract prompt."
    }`,
    config: { responseMimeType: 'application/json' }
  });
  return safeJsonParse(response.text);
};

export const generatePostImage = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { 
      parts: [{ text: `${prompt}. Style: Technical Editorial, minimalist 3D isometric, soft global illumination, charcoal and orange accents, premium materials, 8k. NO TEXT.` }] 
    },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

export const generateCarouselDecks = async (postContent: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Convert this post into a 7-slide "Ultimate Authority Guide" Carousel: "${postContent}". 
    
    CRITICAL:
    - Slide 1: High-impact title (The Ultimate Guide to X).
    - Slides 2-6: Deep tactical breakdown (The Problem, The Math, The System, Step-by-Step, The Result).
    - Slide 7: The Recap & CTA.
    - CONTENT: Each slide needs a Title and a list of 3-4 short tactical bullet points.
    
    Return JSON array: [{ "title": "...", "content": "Bullet 1\\nBullet 2\\nBullet 3", "visualPrompt": "Abstract structural metaphor for [slide theme]" }]`,
    config: { responseMimeType: 'application/json' }
  });
  return safeJsonParse(response.text);
};

export const analyzeVirality = async (content: string): Promise<ViralScore | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze virality: "${content}". JSON: {total, readability, hookStrength, formatting, improvementTips: []}`,
    config: { responseMimeType: 'application/json' }
  });
  return safeJsonParse(response.text);
};

export const generateHookLab = async (topic: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 10 'Cheat Sheet' hooks for: "${topic}". JSON array {category, text}`,
    config: { responseMimeType: 'application/json' }
  });
  return safeJsonParse(response.text);
};
