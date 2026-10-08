// src/app/docs/api/page.tsx

import Link from 'next/link';
import { ArrowLeft, Terminal } from 'lucide-react';

export default function ApiDocumentation() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-8 bg-white p-8 lg:p-12 rounded-3xl shadow-xl shadow-indigo-500/5 border border-slate-200/80">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">API Documentation</h1>
              <p className="text-xs text-slate-500 font-medium">ResearchMatrix Backend Endpoints v1.0</p>
            </div>
          </div>
          <Link href="/" className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition flex items-center space-x-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back Home</span>
          </Link>
        </div>

        <div className="space-y-8 text-sm text-slate-700 font-medium">
          
          {/* Endpoint 1 */}
          <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-lg">POST</span>
              <code className="text-slate-900 font-bold">/api/papers/upload</code>
            </div>
            <p className="text-xs text-slate-600">Uploads a PDF research paper, extracts structured JSON data via Gemini, and stores it in MongoDB.</p>
            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              <p className="text-indigo-400">// Request Form Data</p>
              <p>file: [Binary PDF]</p>
              <p>userId: "user@example.com"</p>
              <p>modelName: "gemini-3.8-flash"</p>
            </div>
          </div>

          {/* Endpoint 2 */}
          <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-lg">POST</span>
              <code className="text-slate-900 font-bold">/api/papers/compare</code>
            </div>
            <p className="text-xs text-slate-600">Compares 2 to 3 saved papers side-by-side across academic dimensions.</p>
            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              <p className="text-indigo-400">// Request Body (JSON)</p>
              <p>{`{ "paperIds": ["id_1", "id_2"] }`}</p>
            </div>
          </div>

          {/* Endpoint 3 */}
          <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-sky-100 text-sky-800 font-extrabold text-xs rounded-lg">POST</span>
              <code className="text-slate-900 font-bold">/api/chat</code>
            </div>
            <p className="text-xs text-slate-600">Executes hybrid RAG vector search across stored paper segments and returns an AI answer with citations.</p>
            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              <p className="text-indigo-400">// Request Body (JSON)</p>
              <p>{`{ "prompt": "What dataset was used in paper X?" }`}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}