
import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Globe, ThumbsUp, MessageSquare, Repeat, Send, ChevronLeft, ChevronRight } from 'lucide-react';
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Simulator</h3>
        <div className="flex bg-slate-200/50 p-1 rounded-xl">
          <button 
            onClick={() => setView('mobile')}
            className={`p-2 rounded-lg transition-all ${view === 'mobile' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Smartphone size={16} />
          </button>
          <button 
            onClick={() => setView('desktop')}
            className={`p-2 rounded-lg transition-all ${view === 'desktop' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Monitor size={16} />
          </button>
        </div>
      </div>

      <div className={`flex justify-center transition-all duration-500 ${view === 'mobile' ? 'max-w-xs mx-auto mt-4' : 'w-full'}`}>
        <div className="w-full bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden ring-1 ring-slate-100 flex flex-col">
          {/* Header */}
          <div className="p-4 flex gap-3 shrink-0">
            <div className="relative shrink-0">
              <img src={post.authorAvatar} className="w-12 h-12 rounded-full object-cover border border-slate-100" alt="avatar" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-black text-slate-900 truncate">{post.authorName}</span>
                <span className="text-[10px] text-slate-400 font-bold">• 1st</span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold line-clamp-1 leading-tight mb-0.5">{post.authorHeadline}</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                <span>1h • </span>
                <Globe size={10} />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-4 pb-3 text-[13px] text-slate-900 leading-[1.45] whitespace-pre-wrap font-sans font-medium">
            {previewLines.map((line, i) => (
               <React.Fragment key={i}>
                 {line}{i < previewLines.length - 1 ? '\n' : ''}
               </React.Fragment>
            ))}
            {showMore && (
              <span 
                onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
                className="text-slate-500 hover:text-blue-600 cursor-pointer font-bold ml-1"
              >
                ...see more
              </span>
            )}
          </div>

          {/* Media / Carousel */}
          {!post.carouselSlides && post.imageUrl && (
            <div className="w-full bg-slate-900 relative border-y border-slate-100 overflow-hidden flex items-center justify-center min-h-[300px]">
              <img src={post.imageUrl} className="w-full h-auto object-contain" alt="Post graphic" />
            </div>
          )}

          {/* Carousel Slide View */}
          {post.carouselSlides && post.carouselSlides.length > 0 && (
             <div className="relative aspect-square w-full bg-slate-900 overflow-hidden flex flex-col group shrink-0">
               <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded text-[10px] font-bold">
                 {activeSlide + 1} / {post.carouselSlides.length}
               </div>
               
               {/* Slide Image Background */}
               {post.carouselSlides[activeSlide].imageUrl && (
                 <img src={post.carouselSlides[activeSlide].imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
               )}

               <div className="flex-1 p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 to-indigo-950/60" />
                 <div className="relative z-10 space-y-4">
                   <h4 className="text-xl font-black text-white uppercase italic tracking-tighter leading-tight drop-shadow-lg">
                     {post.carouselSlides[activeSlide].title}
                   </h4>
                   <p className="text-slate-200 text-sm font-medium drop-shadow-md">
                     {post.carouselSlides[activeSlide].content}
                   </p>
                 </div>
               </div>
               
               <button onClick={handlePrevSlide} className={`absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 backdrop-blur-md rounded-full text-white transition-opacity ${activeSlide === 0 ? 'opacity-0' : 'opacity-100'}`}>
                 <ChevronLeft size={20}/>
               </button>
               <button onClick={handleNextSlide} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 backdrop-blur-md rounded-full text-white transition-opacity ${activeSlide === post.carouselSlides.length-1 ? 'opacity-0' : 'opacity-100'}`}>
                 <ChevronRight size={20}/>
               </button>
             </div>
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
                <span className="text-[8px] font-black uppercase">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPreview;
