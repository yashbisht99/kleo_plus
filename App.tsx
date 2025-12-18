
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import PostPreview from './components/PostPreview';
import { ToolType, PostState, Message, CreatorProfile, HookSuggestion, CarouselSlide, OnboardingAnswers } from './types';
import { 
  chatEditPost, analyzeVirality, CREATORS, 
  generateFullPost, generatePostImage, generateHookLab, generateCarouselDecks 
} from './services/gemini';
import { 
  Loader2, Sparkles, Send, Check, 
  TrendingUp, Zap, Layers, Save, Settings as SettingsIcon, Image as ImageIcon, RefreshCcw, Layout
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('editor');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm Kleo. Ready to engineer some LinkedIn leverage for Kendidex?", timestamp: new Date() }
  ]);

  const [onboarding, setOnboarding] = useState<OnboardingAnswers>(() => {
    const saved = localStorage.getItem('kleo_brand_v2');
    if (saved) return JSON.parse(saved);
    return {
      niche: "AI automation for recruitment agencies. Specifically for small to medium-sized agencies (5-200 employees) to automate client acquisition, resume screening, and interview scheduling.",
      audience: "Recruitment agency owners and founders (5-200 employees) US, UK, Canada, Australia, India.",
      goals: "Book 10-15 free audit calls per month to close clients at $1,997/month.",
      tone: "Professional yet conversational. Data-driven advisor style.",
      offer: "'The Speed-to-Placement System' - $1,997/mo. Complete automation.",
      pillars: "1. Revenue Gap. 2. Automation shift. 3. Speed advantage.",
      transformation: "Stagnant to automated growth.",
      uniqueInsight: "The problem is reach and speed, not candidate quality.",
      constraints: "Specific numbers. Under 250 words. No jargon. Minimal emojis.",
      cta: "Conversational questions."
    };
  });

  const [post, setPost] = useState<PostState>({
    content: "Most agencies think they have a \"candidate quality\" problem.\n\nThey don't.\nYou have a volume problem.\nAnd it’s costing you $480K a month.\n\nI analyzed the data from over 100 recruitment agencies.\nHere is the math most owners ignore:\n\n1. **The Market Reality**\nThere are 50-75 companies hiring in your niche right now.\nBut manual prospecting only reaches 5-10 of them per month.\n\n2. **The Opportunity Cost**\nMissing 60 companies × 30% close rate = 18 lost clients.\nAt a $30K placement fee, that’s $540,000 in revenue left on the table. Every single month.\n\n3. **The Solution**\nSpeed and volume.\nAgencies automating their outreach hit 100% of the market instantly.\nTime-to-fill drops from 45 days to 15 days.\n\nTL;DR: You don't need better recruiters. You need a system that finds the 90% of the market you're currently ignoring.\n\nHow many new clients did you onboard last month?",
    authorName: CREATORS[4].name,
    authorHeadline: CREATORS[4].description,
    authorAvatar: CREATORS[4].avatar,
    voiceProfile: CREATORS[4]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [copyStatus, setCopyStatus] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [hooks, setHooks] = useState<HookSuggestion[]>([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updateScore = useCallback(async (content: string) => {
    if (content.length < 20) return;
    try {
      const score = await analyzeVirality(content);
      if (score) setPost(prev => ({ ...prev, score }));
    } catch (e) {}
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => updateScore(post.content), 2000);
    return () => clearTimeout(timer);
  }, [post.content, updateScore]);

  const handleChatAction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isLoading) return;
    
    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
    setChatInput('');
    setIsLoading(true);
    
    try {
      const containsCreationKeywords = /make|create|write|new|generate/i.test(userMsg);
      const containsVisualKeywords = /image|visual|look|better image/i.test(userMsg);
      const textLocked = /keep text|don't change|text locked/i.test(userMsg);

      if (containsCreationKeywords && !textLocked) {
        const result = await generateFullPost(userMsg, post.voiceProfile, onboarding);
        if (result) {
          const imageUrl = await generatePostImage(result.imagePrompt);
          setPost(prev => ({ 
            ...prev, 
            content: result.content, 
            imageUrl: imageUrl || prev.imageUrl,
            carouselSlides: undefined 
          }));
          setMessages(prev => [...prev, { role: 'assistant', content: result.explanation, timestamp: new Date() }]);
        }
      } else {
        const result = await chatEditPost(post.content, userMsg, post.voiceProfile, onboarding);
        let updatedImageUrl = post.imageUrl;

        if (result.shouldUpdateImage || containsVisualKeywords) {
          const prompt = result.imagePromptOverride || `Premium 3D authority visual: ${userMsg}`;
          const maybeNewImage = await generatePostImage(prompt);
          if (maybeNewImage) updatedImageUrl = maybeNewImage;
        }

        setPost(prev => ({ 
          ...prev, 
          content: textLocked ? prev.content : result.content, 
          imageUrl: updatedImageUrl 
        }));
        setMessages(prev => [...prev, { role: 'assistant', content: result.explanation, timestamp: new Date() }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error processing your request.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const buildCarousel = async () => {
    setIsLoading(true);
    try {
      const slides: CarouselSlide[] = await generateCarouselDecks(post.content);
      if (slides) {
        const slidesWithImages = await Promise.all(slides.map(async (slide) => {
          const img = await generatePostImage(slide.visualPrompt);
          return { ...slide, imageUrl: img || undefined };
        }));
        setPost(prev => ({ ...prev, carouselSlides: slidesWithImages }));
        setMessages(prev => [...prev, { role: 'assistant', content: "Your Kendidex Authority Carousel is ready! Review the slides in the UI simulator.", timestamp: new Date() }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Failed to build carousel.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderToolContent = () => {
    switch (activeTool) {
      case 'editor':
        return (
          <div className="flex-1 flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
              <div className="max-w-2xl mx-auto space-y-6">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl ${
                      msg.role === 'user' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-800'
                    } text-sm font-medium leading-relaxed`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 p-4 rounded-2xl flex items-center gap-2 shadow-sm border border-slate-200">
                      <Loader2 size={16} className="animate-spin text-blue-600" />
                      <span className="text-[10px] font-black text-slate-400 italic uppercase tracking-widest italic">Kleo Engineering...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <form onSubmit={handleChatAction} className="max-w-3xl mx-auto relative group">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`"Fix the hook" or "Make me a better image"`}
                  className="w-full py-5 pl-6 pr-16 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900 transition-all"
                />
                <button type="submit" disabled={isLoading || !chatInput.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-200 shadow-md transition-all">
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        );
      case 'carousel':
        return (
          <div className="flex-1 p-12 bg-white overflow-y-auto custom-scrollbar">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-10">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Layers size={32} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase mb-2">Carousel Builder</h2>
                <p className="text-slate-500 font-medium italic">Turn your high-value post into an authority-building slide deck.</p>
              </div>

              {!post.carouselSlides ? (
                <button 
                  onClick={buildCarousel}
                  disabled={isLoading}
                  className="w-full py-8 bg-slate-900 text-white font-black rounded-3xl hover:bg-slate-800 transition-all flex items-center justify-center gap-4 shadow-2xl group"
                >
                  {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} className="group-hover:scale-110 transition-transform" />}
                  GENERATE KENDIDEX DECK
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 text-blue-700 font-bold mb-6 flex items-center justify-between">
                    <span>Deck Ready! Check the UI Simulator.</span>
                    <button onClick={buildCarousel} className="p-2 hover:bg-blue-100 rounded-lg"><RefreshCcw size={18}/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {post.carouselSlides.map((slide, i) => (
                      <div key={i} className="aspect-square bg-slate-900 rounded-2xl p-4 flex flex-col justify-center items-center text-center border-2 border-slate-100 hover:border-blue-400 transition-all cursor-default relative overflow-hidden group">
                        {slide.imageUrl && <img src={slide.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-30" />}
                        <div className="relative z-10">
                           <span className="text-[10px] font-black text-blue-400 uppercase mb-2 block">Slide {i+1}</span>
                           <h4 className="text-xs font-black text-white uppercase italic line-clamp-2">{slide.title}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'hooks':
        return (
          <div className="flex-1 p-12 bg-white overflow-y-auto custom-scrollbar">
            <div className="max-w-2xl mx-auto">
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 mb-10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Elite Hook Lab</h3>
                <div className="flex gap-3">
                  <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Topic for hooks..." className="flex-1 px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900" />
                  <button onClick={async () => { setIsLoading(true); const res = await generateHookLab(chatInput); if (res) setHooks(res); setIsLoading(false); }} className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl flex items-center gap-2 transition-all">
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />} GENERATE
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {hooks.map((h, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all cursor-pointer group shadow-sm" onClick={() => { setPost(p => ({...p, content: h.text + "\n\n" + p.content})); setActiveTool('editor'); }}>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 block">{h.category}</span>
                    <p className="text-sm font-bold text-slate-800 italic">"{h.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'voice':
        return (
          <div className="flex-1 p-12 bg-white overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-8 uppercase italic">Elite Writing Engines</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-32">
                {CREATORS.map(creator => (
                  <div key={creator.id} onClick={() => { setPost(prev => ({ ...prev, voiceProfile: creator, authorName: creator.name, authorAvatar: creator.avatar, authorHeadline: creator.description })); setActiveTool('editor'); }} className={`p-8 rounded-3xl border-2 transition-all cursor-pointer group ${post.voiceProfile.id === creator.id ? 'border-blue-600 bg-blue-50/30 shadow-lg' : 'border-slate-100 hover:border-blue-300 bg-white'}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <img src={creator.avatar} className="w-16 h-16 rounded-2xl object-cover border" alt={creator.name} />
                      <h4 className="font-black text-xl text-slate-900 uppercase tracking-tighter italic">{creator.name}</h4>
                    </div>
                    <p className="text-slate-600 text-sm font-medium leading-relaxed italic">"{creator.description}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="flex-1 p-12 bg-white overflow-y-auto custom-scrollbar">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <SettingsIcon className="text-blue-600" size={32} />
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Kendidex Intelligence</h2>
              </div>
              <div className="space-y-8 pb-32">
                {[
                  { key: 'niche', label: '1. Niche', placeholder: 'Niche...' },
                  { key: 'audience', label: '2. Target Audience', placeholder: 'Audience...' },
                  { key: 'goals', label: '3. Main Goal', placeholder: 'Goals...' },
                  { key: 'tone', label: '4. Brand Tone', placeholder: 'Tone...' },
                  { key: 'offer', label: '5. Offer Details', placeholder: 'Offer...' },
                  { key: 'pillars', label: '6. Content Pillars', placeholder: 'Pillars...' },
                  { key: 'transformation', label: '7. Transformation', placeholder: 'Before/After...' },
                  { key: 'uniqueInsight', label: '8. Unique Insight', placeholder: 'Your edge...' },
                  { key: 'constraints', label: '9. Writing Constraints', placeholder: 'Rules...' },
                  { key: 'cta', label: '10. Preferred CTA', placeholder: 'Call to action...' }
                ].map((q) => (
                  <div key={q.key} className="space-y-3">
                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest">{q.label}</label>
                    <textarea 
                      value={(onboarding as any)[q.key]}
                      onChange={(e) => setOnboarding(prev => ({ ...prev, [q.key]: e.target.value }))}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 shadow-sm min-h-[100px] resize-none"
                    />
                  </div>
                ))}
                <button 
                  onClick={() => { localStorage.setItem('kleo_brand_v2', JSON.stringify(onboarding)); alert('Intelligence Synced!'); }}
                  className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-2xl"
                >
                  <Save size={20} /> SYNC KENDIDEX PROFILE
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <div className="flex-1 bg-white p-12 text-slate-400 font-bold italic">Module optimization in progress...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} />
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-[1.4] flex flex-col border-r border-slate-200 relative bg-white">
            {renderToolContent()}
          </div>
          <div className="flex-1 bg-slate-50 overflow-y-auto p-8 flex flex-col gap-8 custom-scrollbar shrink-0 w-[480px]">
             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm shrink-0">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={14} className="text-blue-600" /> Virality Score
                  </h3>
                  <div className={`px-4 py-1.5 rounded-full text-sm font-black ${ (post.score?.total || 0) > 80 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700' }`}>
                    {post.score?.total || 0}/100
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Hook Impact', val: post.score?.hookStrength || 0, color: 'bg-blue-600' },
                    { label: 'Readability', val: post.score?.readability || 0, color: 'bg-indigo-600' },
                    { label: 'Formatting', val: post.score?.formatting || 0, color: 'bg-violet-600' }
                  ].map(stat => (
                    <div key={stat.label}>
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                        <span>{stat.label}</span>
                        <span>{stat.val}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${stat.color} transition-all duration-1000`} style={{ width: `${stat.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
             </div>
             <PostPreview post={post} />
             <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between shrink-0 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Check size={20} /></div>
                  <p className="text-xs font-black text-slate-900 uppercase italic tracking-tighter">Ready for Feed</p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(post.content); setCopyStatus(true); setTimeout(() => setCopyStatus(false), 2000); }} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs hover:bg-blue-700 shadow-xl transition-all">
                  {copyStatus ? 'COPIED' : 'COPY POST'}
                </button>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
