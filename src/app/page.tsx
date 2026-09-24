//src/app/page.tsx
//HOME PAGE FOR RESEARCHMATRIX AI

'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Monitor scroll for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-indigo-400">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-mono tracking-widest animate-pulse">INITIALIZING RESEARCHMATRIX AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? "min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-300 overflow-x-hidden font-sans" : "min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-300 overflow-x-hidden font-sans"}>
      
      {/* Background Neon Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- NAVBAR --- */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${darkMode ? 'bg-slate-950/85 border-slate-800/80' : 'bg-white/85 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={scrollToTop}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-xl font-black text-white">R</span>
            </div>
            <span className={`text-xl font-extrabold tracking-tight bg-gradient-to-r ${darkMode ? 'from-white via-slate-200 to-indigo-300' : 'from-slate-900 via-indigo-950 to-cyan-800'} bg-clip-text text-transparent`}>
              ResearchMatrix <span className="text-cyan-400">AI</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold">
            <a href="#features" className={`transition-colors ${darkMode ? 'text-slate-300 hover:text-cyan-400' : 'text-slate-600 hover:text-indigo-600'}`}>Core Modules</a>
            <a href="#architecture" className={`transition-colors ${darkMode ? 'text-slate-300 hover:text-cyan-400' : 'text-slate-600 hover:text-indigo-600'}`}>Deep-Tech Stack</a>
            <a href="#benefits" className={`transition-colors ${darkMode ? 'text-slate-300 hover:text-cyan-400' : 'text-slate-600 hover:text-indigo-600'}`}>Research Advantage</a>
          </nav>

          <div className="flex items-center space-x-4">
            {/* Dark/Light Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl border transition-all ${darkMode ? 'bg-slate-900 border-slate-800 text-yellow-400 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
              title="Toggle Theme"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
              )}
            </button>

            {session ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-105 text-sm"
              >
                Dashboard →
              </button>
            ) : (
              <button
                onClick={() => signIn('google')}
                className={`px-5 py-2.5 font-semibold rounded-xl border transition-all shadow-md text-sm flex items-center gap-2 ${darkMode ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700/80' : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'}`}
              >
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-28 pb-20 px-6 text-center max-w-5xl mx-auto flex-grow flex flex-col items-center justify-center">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs md:text-sm font-semibold rounded-full shadow-inner backdrop-blur-md border ${darkMode ? 'text-cyan-400 bg-cyan-950/50 border-cyan-800/60' : 'text-cyan-700 bg-cyan-50 border-cyan-200'}`}>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          The Ultimate Non-Cursor Deep-Tech Research Hub
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-6">
          AI-Powered Academic & <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300">
            Thesis Synthesis Hub
          </span>
        </h1>
        
        <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          Manage hundreds of research papers (PDFs) smartly, compare methodologies, datasets, and gaps instantly, and automatically synthesize literature reviews for your research.
        </p>

        {/* CTA / Auth Box */}
        <div className="w-full max-w-md mx-auto">
          {session ? (
            <div className={`p-6 rounded-3xl shadow-2xl backdrop-blur-xl border flex flex-col items-center space-y-4 ${darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-white/90 border-slate-200 text-slate-700'}`}>
              <p className="text-base">Welcome back, <span className="font-bold text-indigo-500">{session.user?.name}</span>!</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 text-sm"
                >
                  Open Dashboard
                </button>
                <button
                  onClick={() => signOut()}
                  className={`py-3 px-4 font-semibold rounded-xl transition-all text-sm border ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'}`}
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => signIn('google')}
              className={`w-full flex items-center justify-center gap-3 px-8 py-4 font-bold rounded-2xl shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 border ${darkMode ? 'bg-white hover:bg-slate-100 text-slate-950 border-white' : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'}`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.16 21.32 7.22 24 12 24z"/>
                <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.39-1.49-.39-2.24s.14-1.52.39-2.24V6.6H1.18C.43 8.13 0 9.87 0 12s.43 3.87 1.18 5.4l4.09-3.16z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.16 2.68 1.18 6.6l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
              </svg>
              Sign in with Google to Start
            </button>
          )}
        </div>
      </section>

      {/* --- CORE FEATURES SECTION --- */}
      <section id="features" className={`py-24 px-6 border-t transition-colors duration-300 ${darkMode ? 'bg-slate-900/40 border-slate-900' : 'bg-slate-100/60 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Core Modules & Architecture</h2>
            <p className={`max-w-2xl mx-auto text-base ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Designed for researchers to eliminate manual work and automate literature analysis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Feature 1 */}
            <div className={`p-8 rounded-3xl border shadow-xl backdrop-blur-xl relative group hover:border-indigo-500/50 transition-all ${darkMode ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white border-slate-200'}`}>
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-2xl font-bold mb-6 group-hover:scale-110 transition-transform">
                📄
              </div>
              <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Smart Paper Ingestion</h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Upload PDFs and let Gemini Structured Outputs extract Methodologies, Datasets, and Gaps into a clean comparison matrix.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`p-8 rounded-3xl border shadow-xl backdrop-blur-xl relative group hover:border-cyan-500/50 transition-all ${darkMode ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white border-slate-200'}`}>
              <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center text-2xl font-bold mb-6 group-hover:scale-110 transition-transform">
                🤖
              </div>
              <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Context-Aware RAG Chat</h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                MongoDB Atlas Vector Search powers zero-hallucination queries with exact citations (`[Paper Title - Page X]`).
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`p-8 rounded-3xl border shadow-xl backdrop-blur-xl relative group hover:border-teal-500/50 transition-all ${darkMode ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white border-slate-200'}`}>
              <div className="w-14 h-14 rounded-2xl bg-teal-600/20 text-teal-400 flex items-center justify-center text-2xl font-bold mb-6 group-hover:scale-110 transition-transform">
                🌐
              </div>
              <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Knowledge Graph</h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                React Flow visual mind-map mapping semantic connections and citation links between uploaded research papers.
              </p>
            </div>

            {/* Feature 4 */}
            <div className={`p-8 rounded-3xl border shadow-xl backdrop-blur-xl relative group hover:border-purple-500/50 transition-all ${darkMode ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white border-slate-200'}`}>
              <div className="w-14 h-14 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-2xl font-bold mb-6 group-hover:scale-110 transition-transform">
                📑
              </div>
              <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Thesis Synthesizer</h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Automatically group database entries to generate coherent academic chapters and literature review sections.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- TECH STACK SECTION --- */}
      <section id="architecture" className={`py-20 px-6 border-t transition-colors duration-300 ${darkMode ? 'border-slate-900' : 'border-slate-200'}`}>
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Enterprise Deep-Tech Stack</h2>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Built with modern serverless cloud components optimized for high performance.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className={`p-6 border rounded-2xl flex flex-col items-center justify-center space-y-2 ${darkMode ? 'bg-slate-900/50 border-slate-800/60' : 'bg-white border-slate-200'}`}>
              <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Next.js 16</span>
              <span className="text-xs text-slate-400 font-mono">App Router & Vercel</span>
            </div>
            <div className={`p-6 border rounded-2xl flex flex-col items-center justify-center space-y-2 ${darkMode ? 'bg-slate-900/50 border-slate-800/60' : 'bg-white border-slate-200'}`}>
              <span className="text-xl font-bold text-cyan-400">Tailwind CSS</span>
              <span className="text-xs text-slate-400 font-mono">Modern Styling</span>
            </div>
            <div className={`p-6 border rounded-2xl flex flex-col items-center justify-center space-y-2 ${darkMode ? 'bg-slate-900/50 border-slate-800/60' : 'bg-white border-slate-200'}`}>
              <span className="text-xl font-bold text-emerald-400">MongoDB Atlas</span>
              <span className="text-xs text-slate-400 font-mono">Vector Search & NoSQL</span>
            </div>
            <div className={`p-6 border rounded-2xl flex flex-col items-center justify-center space-y-2 ${darkMode ? 'bg-slate-900/50 border-slate-800/60' : 'bg-white border-slate-200'}`}>
              <span className="text-xl font-bold text-indigo-400">Google Gemini</span>
              <span className="text-xs text-slate-400 font-mono">Multimodal LLM API</span>
            </div>
            <div className={`p-6 border rounded-2xl flex flex-col items-center justify-center space-y-2 col-span-2 md:col-span-1 ${darkMode ? 'bg-slate-900/50 border-slate-800/60' : 'bg-white border-slate-200'}`}>
              <span className="text-xl font-bold text-purple-400">NextAuth.js</span>
              <span className="text-xs text-slate-400 font-mono">Google OAuth</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- RECRUITER & RESEARCH ADVANTAGE SECTION --- */}
      <section id="benefits" className={`py-24 px-6 border-t transition-colors duration-300 ${darkMode ? 'bg-slate-900/30 border-slate-900' : 'bg-slate-100/50 border-slate-200'}`}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 rounded-full">
              Recruiter Magnet
            </div>
            <h2 className="text-3xl font-black tracking-tight">Why This Masterpiece Stands Out</h2>
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Unlike generic wrapper applications, ResearchMatrix AI demonstrates advanced competence in Vector Databases, Zero-Hallucination RAG Pipelines, and Complex Data Processing, instantly placing you ahead in technical interviews.
            </p>
            <ul className="space-y-3 text-sm font-medium">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</span>
                Directly usable for advanced literature reviews and research work
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</span>
                Zero infrastructure cost using scalable modern cloud architecture
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</span>
                100% custom-built logic without generic code cloning
              </li>
            </ul>
          </div>
          <div className={`p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <h3 className="text-xl font-bold mb-4">System Technical Evaluation</h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="flex justify-between mb-1 font-mono text-xs">
                  <span>Academic Depth</span>
                  <span className="text-indigo-400">9/10 (Advanced RAG & Graph)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[90%] h-full bg-indigo-500 rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 font-mono text-xs">
                  <span>Recruiter Impact</span>
                  <span className="text-cyan-400">10/10 (Deep-Tech)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-cyan-400 rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 font-mono text-xs">
                  <span>Personal Utility</span>
                  <span className="text-emerald-400">10/10 (Research Tool)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-emerald-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SCROLL TO TOP FLOATING BUTTON --- */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-600/50 transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center"
          title="Scroll to Top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"/>
          </svg>
        </button>
      )}

      {/* --- FOOTER --- */}
      <footer className={`py-12 px-6 border-t text-sm transition-colors duration-300 ${darkMode ? 'border-slate-900 bg-slate-950 text-slate-500' : 'border-slate-200 bg-white text-slate-500'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              R
            </div>
            <span className={`font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>ResearchMatrix AI</span>
          </div>
          <p>© {new Date().getFullYear()} ResearchMatrix AI Hub. All rights reserved.</p>
          <div className="flex space-x-6 text-xs">
            <span className="hover:text-cyan-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-cyan-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-cyan-400 cursor-pointer">API Documentation</span>
          </div>
        </div>
      </footer>

    </div>
  );
}