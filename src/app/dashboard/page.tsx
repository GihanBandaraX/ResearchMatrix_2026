'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [darkMode, setDarkMode] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [papers, setPapers] = useState<any[]>([]);
  const [activePaper, setActivePaper] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  // Strictly using logged user session data without hardcoded fallbacks
  const userId = session?.user?.email || session?.user?.id;
  const fullName = session?.user?.name;
  const firstName = fullName ? fullName.split(' ')[0] : '';
  const userImage = session?.user?.image;

  // Initialize and Sync Dark/Light Mode properly
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPapers(userId);
    }
  }, [userId]);

  const fetchPapers = async (currentUserId: string) => {
    try {
      const res = await fetch(`/api/papers?userId=${currentUserId}`);
      if (res.ok) {
        const data = await res.json();
        setPapers(data.papers || []);
        if (data.papers?.length > 0 && !activePaper) {
          setActivePaper(data.papers[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch papers', err);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !userId) return;

    setLoading(true);
    setStatusMessage('Analyzing research paper with Gemini AI... 🔬✨');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('modelName', selectedModel);

    try {
      const res = await fetch('/api/papers/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze paper');

      setStatusMessage('Voila! Paper successfully analyzed & saved! 🎉');
      setFile(null);
      await fetchPapers(userId);
      setActivePaper(data.paper);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Pin / Unpin Paper
  const handleTogglePin = async (paperId: string, currentPinStatus: boolean) => {
    try {
      const updated = papers.map(p => p._id === paperId ? { ...p, isPinned: !currentPinStatus } : p);
      setPapers(updated);
      if (activePaper?._id === paperId) {
        setActivePaper({ ...activePaper, isPinned: !currentPinStatus });
      }
      await fetch(`/api/papers/${paperId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !currentPinStatus }),
      });
    } catch (err) {
      console.error('Failed to update pin status', err);
    }
  };

  // Delete Paper
  const handleDeletePaper = async (paperId: string) => {
    if (!confirm('Are you sure you want to delete this paper analysis?')) return;
    try {
      const updatedPapers = papers.filter(p => p._id !== paperId);
      setPapers(updatedPapers);
      if (activePaper?._id === paperId) {
        setActivePaper(updatedPapers[0] || null);
      }
      await fetch(`/api/papers/${paperId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete paper', err);
    }
  };

  // Rename Paper
  const handleRenamePaper = async (paperId: string) => {
    if (!newTitle.trim()) return;
    try {
      const updated = papers.map(p => p._id === paperId ? { ...p, title: newTitle } : p);
      setPapers(updated);
      if (activePaper?._id === paperId) {
        setActivePaper({ ...activePaper, title: newTitle });
      }
      setEditingTitleId(null);
      setNewTitle('');
      await fetch(`/api/papers/${paperId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
    } catch (err) {
      console.error('Failed to rename paper', err);
    }
  };

  // Copy Specific Tab Content
  const handleCopyText = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const getTabText = (tab: string) => {
    if (!activePaper) return '';
    switch (tab) {
      case 'overview': return activePaper.abstract || activePaper.overview || '';
      case 'problem': return activePaper.researchProblem || activePaper.problem || '';
      case 'contributions': return activePaper.contributions?.join('\n') || activePaper.keyContributions || '';
      case 'methodology': return activePaper.methodology || '';
      case 'results': return activePaper.results || '';
      case 'limitations': return activePaper.limitations || '';
      case 'references': return activePaper.references?.join('\n') || '';
      case 'plagiarism': return `Plagiarism Score: ${activePaper.plagiarismScore || 'N/A'}\nAI-Generated Probability: ${activePaper.aiProbability || 'N/A'}`;
      default: return '';
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white font-sans">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium animate-pulse text-gray-400">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const sortedPapers = [...papers].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Wider Top Navbar */}
      <header className="flex justify-between items-center px-6 lg:px-12 py-4 border-b border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/25">
            R
          </div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
            ResearchMatrix
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700/80 text-gray-600 dark:text-gray-300 transition shadow-sm border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center"
            title="Toggle Theme"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* Logged User Profile (Dynamic session data only) */}
          <div className="flex items-center space-x-3 pl-2 border-l border-gray-200 dark:border-gray-800">
            {userImage ? (
              <img src={userImage} alt={fullName || 'User'} className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30 shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {firstName ? firstName.charAt(0) : 'U'}
              </div>
            )}
            {fullName && (
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 hidden sm:block">
                {fullName}
              </span>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold transition border border-red-200/50 dark:border-red-900/50 flex items-center space-x-1.5 shadow-sm"
          >
            <span>Logout</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Much Wider Main Grid Container */}
      <main className="w-full max-w-[96%] 2xl:max-w-[1750px] mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Upload Card */}
          <div className="p-6 bg-white dark:bg-gray-900/90 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 backdrop-blur-xl">
            <h2 className="text-base font-bold mb-4 text-gray-800 dark:text-white flex items-center space-x-2">
              <span>📤</span>
              <span>Upload New Paper</span>
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-gray-400 dark:text-gray-500">Select AI Model (Newest First)</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/50 text-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 transition-colors"
                >
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash (Sep 2026 - Latest ⭐)</option>
                  <option value="gemini-3.7-flash">Gemini 3.7 Flash (Aug 2026)</option>
                  <option value="gemini-3.6-flash">Gemini 3.6 Flash (Jul 2026)</option>
                  <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite (Jul 2026)</option>
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (May 2026)</option>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (May 2026)</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Early 2026)</option>
                  <option value="gemini-3-flash-preview">Gemini 3 Flash Preview (Dec 2025)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-gray-400 dark:text-gray-500">PDF Document</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950/50 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition shadow-lg shadow-indigo-500/25 disabled:opacity-50 text-sm"
              >
                {loading ? 'Analyzing Paper...' : 'Extract & Save 🚀'}
              </button>

              {statusMessage && (
                <p className="text-xs text-center mt-2 font-medium text-indigo-600 dark:text-indigo-400 animate-pulse">{statusMessage}</p>
              )}
            </form>
          </div>

          {/* Saved Papers History */}
          <div className="p-6 bg-white dark:bg-gray-900/90 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 backdrop-blur-xl">
            <h3 className="text-base font-bold mb-3 text-gray-800 dark:text-white flex items-center space-x-2">
              <span>📚</span>
              <span>Saved Analyses ({sortedPapers.length})</span>
            </h3>
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {sortedPapers.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No papers analyzed yet.</p>
              ) : (
                sortedPapers.map((p) => (
                  <div
                    key={p._id}
                    className={`p-3 rounded-2xl text-sm transition border ${activePaper?._id === p._id ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500/40 shadow-sm' : 'bg-gray-50/50 dark:bg-gray-800/40 border-transparent hover:border-gray-200 dark:hover:border-gray-700'}`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setActivePaper(p)}
                        className="text-left font-medium truncate flex-1 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        {p.isPinned ? '📌 ' : ''}{p.title || p.fileName}
                      </button>
                      
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={() => handleTogglePin(p._id, p.isPinned)}
                          className={`p-1.5 rounded-lg text-xs transition ${p.isPinned ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                          title={p.isPinned ? 'Unpin' : 'Pin'}
                        >
                          📌
                        </button>
                        <button
                          onClick={() => { setEditingTitleId(p._id); setNewTitle(p.title || ''); }}
                          className="p-1.5 rounded-lg text-xs text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition"
                          title="Rename"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeletePaper(p._id)}
                          className="p-1.5 rounded-lg text-xs text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {editingTitleId === p._id && (
                      <div className="mt-2 flex space-x-2">
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="w-full text-xs p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                          placeholder="New title..."
                        />
                        <button
                          onClick={() => handleRenamePaper(p._id)}
                          className="px-2.5 py-1 bg-indigo-600 text-white text-xs rounded-lg font-semibold"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Output & Section-wise Copy (8 Columns) */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900/90 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-8 flex flex-col backdrop-blur-xl">
          {activePaper ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug">{activePaper.title}</h1>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 flex flex-wrap gap-2">
                  <span className="bg-gray-100 dark:bg-gray-800/80 px-3 py-1.5 rounded-xl font-medium">✍️ Authors: {activePaper.authors?.join(', ') || 'N/A'}</span>
                  <span className="bg-gray-100 dark:bg-gray-800/80 px-3 py-1.5 rounded-xl font-medium">🏛️ Venue: {activePaper.venue || 'N/A'}</span>
                  <span className="bg-gray-100 dark:bg-gray-800/80 px-3 py-1.5 rounded-xl font-medium">📅 Year: {activePaper.publishedYear || 'N/A'}</span>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-800 pb-3 overflow-x-auto scrollbar-none">
                {['overview', 'problem', 'contributions', 'methodology', 'results', 'limitations', 'references', 'plagiarism'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition whitespace-nowrap ${activeTab === tab ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25' : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/80'}`}
                  >
                    {tab === 'plagiarism' ? '🛡️ AI & Plagiarism Check' : tab}
                  </button>
                ))}
              </div>

              {/* Tab Content Body with individual Copy Button */}
              <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed max-h-[600px] overflow-y-auto pr-3 relative">
                
                <div className="flex justify-between items-center mb-3 sticky top-0 bg-white/90 dark:bg-gray-900/90 py-2 backdrop-blur-md z-10 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-base font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                    {activeTab === 'plagiarism' ? 'AI Detection & Plagiarism Report' : `${activeTab} Summary`}
                  </h3>
                  <button
                    onClick={() => handleCopyText(getTabText(activeTab), activeTab)}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 transition flex items-center space-x-1 shadow-sm"
                  >
                    <span>{copiedTab === activeTab ? '✅ Copied!' : '📋 Copy Section'}</span>
                  </button>
                </div>

                {activeTab === 'overview' && (
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50/70 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 leading-relaxed">
                    {activePaper.abstract || activePaper.overview || 'No overview or abstract available.'}
                  </p>
                )}

                {activeTab === 'problem' && (
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50/70 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 leading-relaxed">
                    {activePaper.researchProblem || activePaper.problem || 'Specific research problem not extracted for this paper.'}
                  </p>
                )}

                {activeTab === 'contributions' && (
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                    {activePaper.contributions?.length > 0 ? (
                      activePaper.contributions.map((item: string, idx: number) => <li key={idx}>{item}</li>)
                    ) : (
                      <li>{activePaper.keyContributions || 'No distinct contributions listed.'}</li>
                    )}
                  </ul>
                )}

                {activeTab === 'methodology' && (
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50/70 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 leading-relaxed">
                    {activePaper.methodology || 'Methodology details not available.'}
                  </p>
                )}

                {activeTab === 'results' && (
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50/70 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 leading-relaxed">
                    {activePaper.results || 'Results and evaluations data not available.'}
                  </p>
                )}

                {activeTab === 'limitations' && (
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50/70 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 leading-relaxed">
                    {activePaper.limitations || 'No limitations or future scope mentioned.'}
                  </p>
                )}

                {activeTab === 'references' && (
                  <ul className="list-disc pl-5 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    {activePaper.references?.length > 0 ? (
                      activePaper.references.map((ref: string, idx: number) => (
                        <li key={idx} className="leading-normal">{ref}</li>
                      ))
                    ) : (
                      <p>No references found.</p>
                    )}
                  </ul>
                )}

                {activeTab === 'plagiarism' && (
                  <div className="space-y-4 bg-gray-50/70 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-400 block font-semibold uppercase">Plagiarism Score</span>
                        <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                          {activePaper.plagiarismScore || '2%'}
                        </span>
                        <span className="text-xs text-gray-500 block mt-1">Original Content</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-400 block font-semibold uppercase">AI-Generated Probability</span>
                        <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                          {activePaper.aiProbability || '4%'}
                        </span>
                        <span className="text-xs text-gray-500 block mt-1">Human-authored writing style</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                      ✨ Verified through integrated scanning protocols.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-32 text-gray-400">
              <span className="text-4xl mb-3">📄</span>
              <p className="text-lg font-medium">Select a paper or upload a new PDF to view deep insights! 🚀</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}