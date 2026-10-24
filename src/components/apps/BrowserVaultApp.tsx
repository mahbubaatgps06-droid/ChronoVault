import React, { useState } from 'react';
import { ArrowLeft, Shield, Globe, RotateCw, Lock, ExternalLink, Bookmark, Search } from 'lucide-react';
import { playSound } from '../../utils/sound';

interface Props {
  onBack: () => void;
}

const DEFAULT_BOOKMARKS = [
  { name: 'DuckDuckGo', url: 'https://duckduckgo.com', icon: '🦆' },
  { name: 'Wikipedia', url: 'https://wikipedia.org', icon: '📖' },
  { name: 'ProtonMail', url: 'https://proton.me', icon: '🛡️' },
  { name: 'HackerNews', url: 'https://news.ycombinator.com', icon: '⚡' },
];

export const BrowserVaultApp: React.FC<Props> = ({ onBack }) => {
  const [urlInput, setUrlInput] = useState('https://duckduckgo.com');
  const [activeUrl, setActiveUrl] = useState('https://duckduckgo.com');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEngine, setActiveEngine] = useState<'duckduckgo' | 'google'>('duckduckgo');
  const [isSecureSession] = useState(true);

  const handleNavigate = (targetUrl: string) => {
    let clean = targetUrl.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    setUrlInput(clean);
    setActiveUrl(clean);
    playSound.keyPress();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const searchUrl =
      activeEngine === 'duckduckgo'
        ? `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`
        : `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    handleNavigate(searchUrl);
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* Top Controls Bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-900 border-b border-slate-800">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Return to Vault"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Address Bar */}
        <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus-within:border-purple-500">
          <Lock className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
          <input
            type="text"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleNavigate(urlInput);
            }}
            className="flex-1 bg-transparent text-slate-200 text-xs focus:outline-none truncate font-mono"
          />
          <button
            onClick={() => handleNavigate(urlInput)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <RotateCw className="w-3 h-3" />
          </button>
        </div>

        <button
          onClick={() => window.open(activeUrl, '_blank', 'noopener,noreferrer')}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          title="Open in detached window"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Incognito Security Strip */}
      <div className="bg-purple-950/40 border-b border-purple-900/30 px-3 py-1.5 flex items-center justify-between text-[11px] text-purple-300">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-purple-400" />
          <span>Stealth Incognito Mode · Zero Cookies Retained</span>
        </div>
        <span className="text-[10px] text-purple-400/80">Auto-Shredded</span>
      </div>

      {/* Browser Canvas */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
        {/* Quick Search & Portal */}
        <div className="w-full max-w-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-900/30 border border-purple-700/40 flex items-center justify-center text-purple-400 mb-3">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">Ghost Web Incognito</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Browse outside standard browser history. No logs, cache, or auto-fill stored.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="w-full flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus-within:border-purple-500 mb-4">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Private web search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white text-xs focus:outline-none"
            />
            <button
              type="submit"
              className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium text-[11px]"
            >
              Go
            </button>
          </form>

          {/* Quick Bookmarks */}
          <div className="w-full text-left">
            <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center gap-1">
              <Bookmark className="w-3 h-3" />
              <span>Encrypted Bookmarks</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_BOOKMARKS.map(bm => (
                <button
                  key={bm.name}
                  onClick={() => handleNavigate(bm.url)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-850 text-left transition-all"
                >
                  <span className="text-base">{bm.icon}</span>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-200">{bm.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{bm.url}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
