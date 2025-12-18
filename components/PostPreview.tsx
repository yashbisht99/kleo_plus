
import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Globe, ThumbsUp, MessageSquare, Repeat, Send, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { PostState } from '../types';

interface PostPreviewProps {
  post: PostState;
}

const PostPreview: React.FC<PostPreviewProps> = ({ post }) => {
  const [view, setView] = useState<'desktop' | 'mobile'>('mobile');
  const [expanded, setExpanded] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    setExpanded(false);
    setActiveSlide(0);
  }, [post.content, post.carouselSlides]);

  const lines = post.content.split('\n');
  const previewLines = expanded ? lines : lines.slice(0, 3);
  const showMore = lines.length > 3 && !expanded;

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.carouselSlides) {
      setActiveSlide(prev => (prev > 0 ? prev - 1 : prev));
    }
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.carouselSlides) {
      setActiveSlide(prev => (prev < post.carouselSlides!.length - 1 ? prev + 1 : prev));
    }
  };

  return (
    <div className="flex flex-col h-auto animate-in fade-in duration-500 pb-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Simulator</h3>
        <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200">
          <button 
            onClick={() => setView('mobile')}
            className={`p-2 rounded-lg transition-all ${view === 'mobile' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Smartphone size={14} />
          </button>
          <button 
            onClick={() => setView('desktop')}
            className={`p-2 rounded-lg transition-all ${view === 'desktop' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Monitor size={14} />
          </button>
        </div>
      </div>

      <div className={`flex justify-center transition-all duration-500 ${view === 'mobile' ? 'max-w-xs mx-auto mt-2' : 'w-full'}`}>
        <div className="w-full bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col">
          {/* Linked Header */}
          <div className="p-4 flex gap-3 shrink-0 border-b border-slate-50">
            <div className="relative shrink-0">
              <img src={post.authorAvatar} className="w-10 h-10 rounded-full object-cover border border-slate-100" alt="avatar" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[13px] font-black text-slate-900 truncate">{post.authorName}</span>
                <span className="text-[10px] text-slate-400 font-bold">• 1st</span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold line-clamp-1 leading-tight mb-0.5">{post.authorHeadline}</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                <span>1h • </span>
                <Globe size={10} />
              </div>
            </div>
          </div>

          {/* Post Caption */}
          <div className="px-4 py-3 text-[13px] text-slate-900 leading-[1.45] whitespace-pre-wrap font-sans font-medium">
            {previewLines.map((line, i) => (
               <React.Fragment key={i}>
                 {line}{i < previewLines.length - 1 ? '\n' : ''}
               </React.Fragment>
            ))}
            {showMore && (
              <span 
                onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
                className="text-slate-500 hover:text-orange-600 cursor-pointer font-bold ml-1"
              >
                ...see more
              </span>
            )}
          </div>

          {/* INFOGRAPHIC CAROUSEL VIEW */}
          {post.carouselSlides && post.carouselSlides.length > 0 ? (
             <div className="relative aspect-square w-full bg-[#0B0E14] overflow-hidden flex flex-col group shrink-0 select-none border-y border-slate-200">
                {/* Visual Background */}
                {post.carouselSlides[activeSlide].imageUrl && (
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <img 
                      src={post.carouselSlides[activeSlide].imageUrl} 
                      className="w-full h-full object-cover opacity-30 mix-blend-overlay scale-110 blur-[1px]" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0B0E14] via-transparent to-[#0B0E14]/80" />
                  </div>
                )}

                {/* Cheat Sheet Layout */}
                <div className="relative z-10 flex flex-col h-full p-6">
                  {/* Top Bar Accent */}
                  <div className="w-12 h-1 bg-orange-500 rounded-full mb-6" />
                  
                  {/* Slide Header */}
                  <div className="mb-8">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-2 block">
                      Section 0{activeSlide + 1}
                    </span>
                    <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none drop-shadow-md">
                      {post.carouselSlides[activeSlide].title}
                    </h4>
                  </div>

                  {/* Body Content - Infographic Style */}
                  <div className="flex-1 space-y-4">
                    {post.carouselSlides[activeSlide].content.split('\n').map((point, idx) => (
                      point.trim() && (
                        <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                          <div className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-orange-500" />
                          <p className="text-sm font-medium text-slate-300 leading-relaxed">
                            {point.replace(/^[\-•\d\.]+\s*/, '')}
                          </p>
                        </div>
                      )
                    ))}
                  </div>

                  {/* Footer Stats/Branding */}
                  <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center">
                         <CheckCircle2 size={12} className="text-white" />
                       </div>
                       <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Kendidex Authority Guide</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{activeSlide + 1} / {post.carouselSlides.length}</span>
                  </div>
                </div>

                {/* Nav Arrows */}
                <button onClick={handlePrevSlide} className={`absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-all ${activeSlide === 0 ? 'hidden' : 'block'}`}>
                  <ChevronLeft size={20} />
                </button>
                <button onClick={handleNextSlide} className={`absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-all ${activeSlide === post.carouselSlides.length - 1 ? 'hidden' : 'block'}`}>
                  <ChevronRight size={20} />
                </button>
             </div>
          ) : (
            /* Single Image Preview */
            post.imageUrl && (
              <div className="w-full bg-[#0B0E14] relative border-y border-slate-100 overflow-hidden min-h-[350px] flex items-center justify-center p-8">
                <img src={post.imageUrl} className="w-full h-auto object-contain opacity-80" alt="Graphic" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            )
          )}

          {/* Social Stats */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-slate-50 bg-slate-50/10 shrink-0">
            <div className="flex items-center gap-1">
               <div className="flex -space-x-1">
                 <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[7px] text-white">👍</div>
                 <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[7px] text-white">❤️</div>
               </div>
               <span className="text-[10px] text-slate-500 font-bold ml-1">482</span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold">92 comments • 12 reposts</div>
          </div>

          {/* Actions */}
          <div className="px-1 py-1 grid grid-cols-4 bg-white border-t border-slate-50 shrink-0">
            {[
              { label: 'Like', icon: ThumbsUp },
              { label: 'Comment', icon: MessageSquare },
              { label: 'Repost', icon: Repeat },
              { label: 'Send', icon: Send }
            ].map(action => (
              <button key={action.label} className="flex flex-col items-center justify-center py-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
                <action.icon size={16} className="mb-0.5" />
                <span className="text-[8px] font-black uppercase tracking-tighter">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPreview;
