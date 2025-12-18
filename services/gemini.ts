
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

// User's exact Kendidex system for writing
const KENDIDEX_SYSTEM_PROMPT = `
You are a LinkedIn content writer for Kendidex, a company that provides automation systems for recruitment agencies.
YOUR JOB: Generate high-performing LinkedIn posts that provide VALUE, build authority, and generate inbound interest from recruitment agency owners.

CONTEXT:
- Target audience: Recruitment agency owners/founders (5-200 employees)
- Main pain points: Manual client acquisition, slow time-to-fill, wasted time on screening
- Our solution: Automation for client acquisition, AI resume screening, automated scheduling
- Goal: Position us as experts, not salespeople

POST STRUCTURE (FRAMEWORK):
[HOOK - First 1-2 lines]
[BODY - Main content with line breaks and formatting]
[INSIGHT/SOLUTION - Brief mention]
[CTA - Soft call-to-action]

TONE & STYLE:
✅ DO: Conversational, specific numbers, stories/examples, scannable, teaching not selling.
❌ DON'T: Motivational fluff, unbelievable claims, too many emojis (1-2 max), wall of text, pitch directly.
`;

// RESTORED: The "Perfect" High-End 3D Visual System
const AUTHORITY_GRAPHIC_SYSTEM = `
ELITE VISUAL DESIGN SYSTEM (BIG CREATOR STYLE):
- ABSOLUTE RULE: NO TEXT, NO LETTERS, NO NUMBERS in the image.
- CORE AESTHETIC: High-contrast, cinematic "Dark Mode" dashboard style. 
- PALETTE: Deep charcoal matte (#0F172A), neon cyan (#22D3EE), electric blue (#2563EB).
- STYLE: Volumetric lighting, global illumination, shallow depth of field (bokeh), sharp 4k vector edges, premium glassmorphism.
- CONCEPTS: Metaphorical 3D shapes representing Growth, Speed, Systems, or Scaling.
`;

export const CREATORS: CreatorProfile[] = [
  {
    id: 'justin-welsh',
    name: "Justin Welsh",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Justin",
    description: "The Solopreneur Playbook. Punchy hooks, relatable enemy framing.",
    instructions: "Follow Kendidex rules using Justin Welsh style: Relatable enemy framing, short lines, step-by-step list, TL;DR end."
  },
  {
    id: 'alex-hormozi',
    name: "Alex Hormozi",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    description: "Direct, no-nonsense, tactical entrepreneurship.",
    instructions: "Follow Kendidex rules using Hormozi style: Blunt facts, numbered lists, zero fluff, hard metrics."
  },
  {
    id: 'lara-acosta',
    name: "Lara Acosta",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lara",
    description: "LinkedIn authority, engaging curiosity hooks.",
    instructions: "Follow Kendidex rules using Acosta style: Curiosity hooks, standalone sentences, Upbeat tactical tone."
  },
  {
    id: 'dan-koe',
    name: "Dan Koe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dan",
    description: "Philosophical, high-concept mini-essays.",
    instructions: "Follow Kendidex rules using Koe style: Philosophical essays, high-concept pillars, reflective tone."
  },
  {
    id: 'kleo-expert',
    name: "Kleo Expert",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kleo",
    description: "The hybrid formula of all top 10 elite creators.",
    instructions: "Follow Kendidex rules using Kleo Expert style: Best hybrid formulas of the top 10 LinkedIn voices."
  }
];

export const generateFullPost = async (prompt: string, voice: CreatorProfile, context: OnboardingAnswers) => {
  const ai = getAI();
  const contextStr = `BRAND INTEL: Niche: ${context.niche}, Target: ${context.audience}, Tone: ${context.tone}, Goal: ${context.goals}.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `
    ${KENDIDEX_SYSTEM_PROMPT}
    ${AUTHORITY_GRAPHIC_SYSTEM}
    ${contextStr}
    
    TASK: Generate a viral LinkedIn post and a high-status abstract visual prompt.
    USER REQUEST: "${prompt}"
    CREATOR STYLE: "${voice.name} - ${voice.instructions}"
    
    Response Format (JSON):
    {
      "explanation": "Psychology breakdown.",
      "content": "Formatted post text...",
      "imagePrompt": "Description for a PURELY VISUAL abstract 3D masterpiece. No text."
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
    ${KENDIDEX_SYSTEM_PROMPT}
    Current Post Content: "${currentContent}"
    User Instruction: "${instruction}"
    TASK: Act as the Kendidex Expert.
    
    Return JSON:
    {
      "explanation": "Short conversational response.",
      "content": "Updated post text.",
      "shouldUpdateImage": true/false,
      "imagePromptOverride": "If true, provide a NEW high-end abstract 3D prompt. NO TEXT."
    }`,
    config: { responseMimeType: 'application/json' }
  });
  return safeJsonParse(response.text) || { explanation: "Updated.", content: currentContent, shouldUpdateImage: false };
};

export const generatePostImage = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { 
      parts: [{ text: `${prompt}. Style: Elite Authority 3D Visual. High contrast cinematic lighting, charcoal matte background, neon cyan glassmorphism, raytracing, 8k. ABSOLUTELY NO TEXT.` }] 
    },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
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
    contents: `Generate 10 Kendidex viral hooks for: "${topic}". JSON array {category, text}`,
    config: { responseMimeType: 'application/json' }
  });
  return safeJsonParse(response.text);
};

export const generateCarouselDecks = async (postContent: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Convert this LinkedIn post into a high-value 7-slide carousel: "${postContent}". 
    Each slide must have a title, short punchy body, and a 3D visual prompt following the ELITE VISUAL DESIGN SYSTEM.
    Return JSON array: [{ "title": "...", "content": "...", "visualPrompt": "..." }]`,
    config: { responseMimeType: 'application/json' }
  });
  return safeJsonParse(response.text);
};
