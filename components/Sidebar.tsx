
import React from 'react';
import { PenTool, Zap, UserCheck, RefreshCcw, Settings, Layout, Compass, Image, MessageCircle, Layers, Search, Users, UserCircle2, FileText } from 'lucide-react';
import { ToolType } from '../types';

interface SidebarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTool, setActiveTool }) => {
  const menuItems = [
    { id: 'editor' as ToolType, label: 'Post Editor', icon: MessageCircle },
    { id: 'carousel' as ToolType, label: 'Carousel Builder', icon: Layers },
    { id: 'hooks' as ToolType, label: 'Hook Lab', icon: Zap },
    { id: 'voice' as ToolType, label: 'Style Engine', icon: UserCircle2 },
    { id: 'strategy' as ToolType, label: 'Growth Plan', icon: Compass },
    { id: 'comments' as ToolType, label: 'Engagement AI', icon: RefreshCcw },
    { id: 'settings' as ToolType, label: 'Brand Intel', icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col p-5 fixed left-0 top-0 z-50">
      <div className="flex items-center gap-3 px-2 mb-12 shrink-0">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
          <Layers className="text-white w-5 h-5" />
        </div>
        <span className="font-black text-2xl tracking-tighter text-slate-900 italic">Kleo<span className="text-blue-600">Plus</span></span>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTool(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
              activeTool === item.id 
                ? 'bg-blue-50 text-blue-700 font-black shadow-sm ring-1 ring-blue-100 scale-[1.02]' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <item.icon size={18} strokeWidth={activeTool === item.id ? 2.5 : 2} />
            <span className="text-[13px] tracking-tight font-medium uppercase">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto p-5 bg-slate-900 rounded-3xl border border-slate-800 shrink-0 shadow-2xl">
        <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3 italic">Authority Plan</p>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-black text-white italic tracking-tight">Kendidex Enterprise</p>
          <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-black border border-blue-500/20">LIVE</span>
        </div>
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 w-[84%]" />
        </div>
        <p className="text-[9px] text-slate-500 font-bold mt-3 uppercase tracking-widest">24/30 Insights Used</p>
      </div>
    </div>
  );
};

export default Sidebar;
