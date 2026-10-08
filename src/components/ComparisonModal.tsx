// src/components/ComparisonModal.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparisonText: string;
  loading: boolean;
}

export default function ComparisonModal({ isOpen, onClose, comparisonText, loading }: ComparisonModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
            <h2 className="text-xl font-semibold text-white tracking-wide">
              Multi-Paper Comparison Matrix
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-slate-300">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm animate-pulse">
                Synthesizing and comparing selected papers across models...
              </p>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none 
              prose-headings:text-indigo-400 prose-headings:font-semibold 
              prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-slate-300 prose-p:leading-relaxed
              prose-table:border-collapse prose-table:w-full prose-table:my-4
              prose-th:bg-slate-800 prose-th:text-white prose-th:p-3 prose-th:border prose-th:border-slate-700 prose-th:text-left
              prose-td:p-3 prose-td:border prose-td:border-slate-800 prose-td:bg-slate-900/50
              prose-strong:text-indigo-200
              prose-li:text-slate-300">
              
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {comparisonText}
              </ReactMarkdown>

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800 bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  );
}