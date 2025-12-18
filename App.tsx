
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
  TrendingUp, Zap, Layers, Save, Settings as SettingsIcon, Image as ImageIcon, RefreshCcw, Layout, FileText
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('editor');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm Kleo. Ready to build the 'Ultimate Authority Guide' for Kendidex? I've loaded the high-value infographic templates.", timestamp: new Date() }
  ]);

  const [onboarding, setOnboarding] = useState<OnboardingAnswers>(() => {
    const saved = localStorage.getItem('kleo_brand_v3');
    if (saved) return JSON.parse(saved);
    return {
      niche: "AI automation for recruitment agencies (5-200 employees).",
      audience: "Recruitment agency owners and founders manually prospecting.",
      goals: "Book high-ticket audit calls.",
      tone: "Tactical, authoritative, peer-to-peer.",
      offer: "Speed-to-Placement System ($1,997/mo).",
      pillars: "Revenue Gaps, Automation ROI, Time-to-Fill math.",
      transformation: "From manual chaos to automated precision.",
      uniqueInsight: "The problem is reach speed, not candidate quality.",
      constraints: "Numbers only. Scannable. Short paragraphs.",
      cta: "Low-friction questions."
    };
  });

  const [post, setPost] = useState<PostState>({
    content: "The Ultimate Guide to Automating Client Acquisition ($480K Strategy)\n\nMost agencies fail because they manually prospect.\nIt's slow. It's expensive. It leaves $50k/mo on the table.\n\nHere is the exact 'Cheat Sheet' our clients use to scale:\n\n1. THE REVENUE GAP MATH\nIf you reach 10 companies/mo instead of 50, you lose 80% of the market.\n\n2. THE SPEED ADVANTAGE\nAI-screening cuts time-to-fill from 45 days to 15 days.\n\n3. THE AUTOMATION STACK\nLet the system find the jobs. You just show up to the calls.\n\nTL;DR: Stop recruiting manually. Start building a system that recruits for you.\n\nWhat's your biggest bottleneck right now?",
    authorName: CREATORS[1].name,
    authorHeadline: CREATORS[1].description,
    authorAvatar: CREATORS[1].avatar,
    voiceProfile: CREATORS[1]
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
      const isCreation = /make|create|write|generate/i.test(userMsg);
      const isVisualOnly = /image|visual|look|design/i.test(userMsg) && !/text|caption|content/i.test(userMsg);

      if (isCreation && !isVisualOnly) {
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

        if (result.shouldUpdateImage || isVisualOnly) {
          const prompt = result.imagePromptOverride || `Premium structural abstract for: ${userMsg}`;
          const maybeNewImage = await generatePostImage(prompt);
          if (maybeNewImage) updatedImageUrl = maybeNewImage;
        }

        setPost(prev => ({ 
          ...prev, 
          content: isVisualOnly ? prev.content : result.content, 
          imageUrl: updatedImageUrl 
        }));
        setMessages(prev => [...prev, { role: 'assistant', content: result.explanation, timestamp: new Date() }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error in content engineering.", timestamp: new Date() }]);
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
        setMessages(prev => [...prev, { role: 'assistant', content: "Authority Guide ready. The slides now follow the deep-dive Cheat Sheet layout.", timestamp: new Date() }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Failed to engineer the guide.", timestamp: new Date() }]);
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
                      msg.role === 'user' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-slate-100 text-slate-800'
                    } text-sm font-medium leading-relaxed`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-2 border border-slate-100 shadow-sm">
                      <Loader2 size={16} className="animate-spin text-orange-600" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Optimizing Framework...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <form onSubmit={handleChatAction} className="max-w-3xl mx-auto relative">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`"Make an Authority Guide on X" or "Update visual"`}
                  className="w-full py-5 pl-6 pr-16 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-900 transition-all"
                />
                <button type="submit" disabled={isLoading || !chatInput.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:bg-slate-200 shadow-md transition-all">
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
              <div className="mb-12">
                <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <FileText size={40} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase mb-3">Guide Generator</h2>
                <p className="text-slate-500 font-medium italic text-lg">Engineer deep-dive authority carousels in one click.</p>
              </div>

              {!post.carouselSlides ? (
                <button 
                  onClick={buildCarousel}
                  disabled={isLoading}
                  className="w-full py-10 bg-slate-900 text-white font-black rounded-3xl hover:bg-slate-800 transition-all flex items-center justify-center gap-4 shadow-2xl group border-2 border-slate-800"
                >
                  {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} className="text-orange-400 group-hover:rotate-12 transition-transform" />}
                  <span className="text-xl tracking-tight">ENGINEER ULTIMATE GUIDE</span>
                </button>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 text-orange-700 font-black flex items-center justify-between shadow-sm">
                    <span className="uppercase tracking-widest text-xs italic">Guide Ready for Feed</span>
                    <button onClick={buildCarousel} className="p-2 hover:bg-orange-100 rounded-lg transition-colors"><RefreshCcw size={18}/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    {post.carouselSlides.map((slide, i) => (
                      <div key={i} className="aspect-square bg-[#0B0E14] rounded-2xl p-6 flex flex-col justify-center items-start text-left border-2 border-slate-100 hover:border-orange-500 transition-all cursor-default relative overflow-hidden group shadow-md">
                        {slide.imageUrl && <img src={slide.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-20" />}
                        <div className="relative z-10 w-full">
                           <div className="w-8 h-1 bg-orange-500 mb-4" />
                           <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2 block">Slide {i+1}</span>
                           <h4 className="text-sm font-black text-white uppercase italic line-clamp-2 leading-tight">{slide.title}</h4>
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
              <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 mb-12 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 text-center">Cheat Sheet Hook Lab</h3>
                <div className="flex gap-4">
                  <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Topic (e.g. ROI of AI)..." className="flex-1 px-6 py-5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900 shadow-sm" />
                  <button onClick={async () => { setIsLoading(true); const res = await generateHookLab(chatInput); if (res) setHooks(res); setIsLoading(false); }} className="px-10 py-5 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 shadow-xl flex items-center gap-2 transition-all">
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />} GENERATE
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {hooks.map((h, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-orange-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col items-start" onClick={() => { setPost(p => ({...p, content: h.text + "\n\n" + p.content})); setActiveTool('editor'); }}>
                    <div className="px-2 py-1 bg-orange-50 rounded text-[9px] font-black text-orange-600 uppercase mb-3 tracking-widest">{h.category}</div>
                    <p className="text-[15px] font-bold text-slate-800 italic leading-snug">"{h.text}"</p>
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
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 shadow-inner">
                  <SettingsIcon size={32} />
                </div>
                <div>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Brand Intel</h2>
                   <p className="text-slate-400 font-medium text-sm">Synchronizing your Authority Engine.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-8 pb-32">
                {[
                  { key: 'niche', label: '1. Core Niche', placeholder: 'Niche...' },
                  { key: 'audience', label: '2. Target Demographic', placeholder: 'Audience...' },
                  { key: 'goals', label: '3. Strategic Objectives', placeholder: 'Goals...' },
                  { key: 'tone', label: '4. Communication Tone', placeholder: 'Tone...' },
                  { key: 'offer', label: '5. High-Ticket Offer', placeholder: 'Offer...' },
                  { key: 'pillars', label: '6. Content Pillars', placeholder: 'Pillars...' },
                  { key: 'transformation', label: '7. Client Transformation', placeholder: 'Before/After...' },
                  { key: 'uniqueInsight', label: '8. Unique Advantage', placeholder: 'Your edge...' },
                  { key: 'constraints', label: '9. Visual Constraints', placeholder: 'Rules...' },
                  { key: 'cta', label: '10. Preferred Engagement CTA', placeholder: 'Call to action...' }
                ].map((q) => (
                  <div key={q.key} className="space-y-3 group">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest group-focus-within:text-orange-600 transition-colors">{q.label}</label>
                    <textarea 
                      value={(onboarding as any)[q.key]}
                      onChange={(e) => setOnboarding(prev => ({ ...prev, [q.key]: e.target.value }))}
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900 shadow-inner min-h-[120px] resize-none transition-all"
                    />
                  </div>
                ))}
                <button 
                  onClick={() => { localStorage.setItem('kleo_brand_v3', JSON.stringify(onboarding)); alert('Intel Synchronized!'); }}
                  className="w-full py-6 bg-orange-600 text-white font-black rounded-[2rem] hover:bg-orange-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-orange-100 mt-12 text-lg"
                >
                  <Save size={24} /> SYNC KENDIDEX GUIDE INTELLIGENCE
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <div className="flex-1 bg-white p-12 text-slate-400 font-bold italic">Engine optimization...</div>;
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
             <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 shrink-0">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <TrendingUp size={14} className="text-orange-600" /> Viral Impact
                  </h3>
                  <div className="px-5 py-2 bg-orange-50 rounded-full text-sm font-black text-orange-700 shadow-inner">
                    {post.score?.total || 0}/100
                  </div>
                </div>
                <div className="space-y-5">
                  {[
                    { label: 'Hook Impact', val: post.score?.hookStrength || 0, color: 'bg-orange-500' },
                    { label: 'Tactical Value', val: post.score?.readability || 0, color: 'bg-slate-900' },
                    { label: 'Scannability', val: post.score?.formatting || 0, color: 'bg-orange-400' }
                  ].map(stat => (
                    <div key={stat.label}>
                      <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">
                        <span>{stat.label}</span>
                        <span>{stat.val}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${stat.color} transition-all duration-1000 ease-out`} style={{ width: `${stat.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
             </div>
             <PostPreview post={post} />
             <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-lg flex items-center justify-between shrink-0 mb-4 group cursor-pointer hover:border-orange-200 transition-colors" onClick={() => { navigator.clipboard.writeText(post.content); setCopyStatus(true); setTimeout(() => setCopyStatus(false), 2000); }}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-50 rounded-xl text-orange-600 group-hover:scale-110 transition-transform"><Check size={20} /></div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase italic tracking-tighter">Approved for Feed</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Copy to LinkedIn</p>
                  </div>
                </div>
                <div className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs group-active:scale-95 transition-all">
                  {copyStatus ? 'ENGINEERED' : 'COPY GUIDE'}
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
