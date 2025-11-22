import React from 'react';
import { Sparkles } from 'lucide-react';

function PromptInput({ prompt, onPromptChange, disabled, hideButton }) {
    return (
        <div className="h-full flex flex-col bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-1 overflow-hidden">
            <div className="flex-1 p-5 flex flex-col">
                <label htmlFor="prompt" className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Directive
                </label>
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    placeholder="Describe the transformation (e.g., 'Cyberpunk city style', 'Turn day into night')..."
                    className="flex-1 w-full bg-slate-950/50 border border-white/5 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 resize-none transition-all scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                    disabled={disabled}
                />
            </div>
            {!hideButton && (
                <div className="p-4 border-t border-white/5 bg-slate-900/80">
                    <button
                        type="button"
                        className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={disabled || !prompt.trim()}
                    >
                        Execute
                    </button>
                </div>
            )}
        </div>
    );
}

export default PromptInput;