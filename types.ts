
export type ToolType = 'editor' | 'hooks' | 'audit' | 'repurpose' | 'strategy' | 'media' | 'comments' | 'carousel' | 'seo' | 'pod' | 'settings' | 'voice';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface PostState {
  content: string;
  authorName: string;
  authorHeadline: string;
  authorAvatar: string;
  imageUrl?: string;
  carouselSlides?: CarouselSlide[];
  voiceProfile: CreatorProfile;
  score?: ViralScore;
}

export interface OnboardingAnswers {
  niche: string;
  audience: string;
  goals: string;
  tone: string;
  offer: string;
  pillars: string;
  transformation: string;
  uniqueInsight: string;
  constraints: string;
  cta: string;
}

export interface CreatorProfile {
  id: string;
  name: string;
  description: string;
  instructions: string;
  avatar: string;
}

export interface ViralScore {
  total: number;
  readability: number;
  hookStrength: number;
  formatting: number;
  improvementTips: string[];
}

export interface HookSuggestion {
  category: string;
  text: string;
}

export interface CarouselSlide {
  title: string;
  content: string;
  visualPrompt: string;
  imageUrl?: string;
}

export interface CommentSuggestion {
  text: string;
  strategy: string;
}

export interface SEOAnalysis {
  keywords: string[];
  headlineSuggestions: string[];
  optimizationTips: string[];
}
