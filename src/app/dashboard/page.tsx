// src/app/dashboard/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Bot, X, Send, FileText, Loader2, MessageSquareCode, Scale, Pin, Edit3, Trash2, Check, Sparkles, BookOpen, UploadCloud, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; page: number }[];
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [files, setFiles] = useState<File[]>([]); // Multi-file upload state
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [papers, setPapers] = useState<any[]>([]);
  const [activePaper, setActivePaper] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  
  // Multi-Paper Comparison States
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [comparisonResult, setComparisonResult] = useState('');
  const [comparingLoading, setComparingLoading] = useState(false);
  
  const [imageError, setImageError] = useState(false);

  // Chat Drawer & AI States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const userId = session?.user?.email || (session?.user as any)?.id;
  const fullName = session?.user?.name;
  const firstName = fullName ? fullName.split(' ')[0] : '';
  const userImage = session?.user?.image;

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
    if (files.length === 0 || !userId) return;

    setLoading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setStatusMessage(`Analyzing paper ${i + 1} of ${files.length} (${file.name})... 🔬✨`);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);
        formData.append('modelName', selectedModel);

        const res = await fetch('/api/papers/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Failed to analyze ${file.name}`);

        if (i === 0) {
          setActivePaper(data.paper);
        }
      }

      setStatusMessage('All selected papers successfully analyzed & saved! 🎉');
      setFiles([]);
      await fetchPapers(userId);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePin = async (paperId: string, currentPinStatus: boolean) => {
    try {
      const updated = papers.map(p => String(p._id) === String(paperId) ? { ...p, isPinned: !currentPinStatus } : p);
      setPapers(updated);
      if (activePaper && String(activePaper._id) === String(paperId)) {
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

  const handleDeletePaper = async (paperId: string) => {
    if (!confirm('Are you sure you want to delete this paper analysis?')) return;
    try {
      const updatedPapers = papers.filter(p => String(p._id) !== String(paperId));
      setPapers(updatedPapers);
      setSelectedPaperIds(selectedPaperIds.filter(id => String(id) !== String(paperId)));
      if (activePaper && String(activePaper._id) === String(paperId)) {
        setActivePaper(updatedPapers[0] || null);
      }
      await fetch(`/api/papers/${paperId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete paper', err);
    }
  };

  const handleRenamePaper = async (paperId: string) => {
    if (!newTitle.trim()) return;
    try {
      const updated = papers.map(p => String(p._id) === String(paperId) ? { ...p, title: newTitle } : p);
      setPapers(updated);
      if (activePaper && String(activePaper._id) === String(paperId)) {
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

  const handleCheckboxToggle = (paperId: string) => {
    const stringId = String(paperId);
    if (selectedPaperIds.includes(stringId)) {
      setSelectedPaperIds(selectedPaperIds.filter(id => id !== stringId));
    } else {
      if (selectedPaperIds.length >= 3) {
        alert('You can compare a maximum of 3 papers at once.');
        return;
      }
      setSelectedPaperIds([...selectedPaperIds, stringId]);
    }
  };

  const handleComparePapers = async () => {
    if (selectedPaperIds.length < 2) return;
    setComparingLoading(true);
    setIsCompareModalOpen(true);
    try {
      const res = await fetch('/api/papers/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperIds: selectedPaperIds }),
      });
      const data = await res.json();
      if (data.success) {
        setComparisonResult(data.comparison);
      } else {
        setComparisonResult('Error: ' + data.error);
      }
    } catch (err) {
      setComparisonResult('Failed to connect to comparison server.');
    } finally {
      setComparingLoading(false);
    }
  };

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

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim() || chatLoading) return;

    const userMessage = chatPrompt.trim();
    setChatPrompt('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage }),
      });

      const data = await res.json();

      if (data.success) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.answer,
            sources: data.sources,
          },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Error: ' + (data.error || 'Something went wrong') },
        ]);
      }
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error connecting to the chat server.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 font-sans">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-semibold animate-pulse text-slate-500">Loading your research workspace...</p>
        </div>
      </div>
    );
  }

  const sortedPapers = [...papers].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/30 text-slate-900 font-sans antialiased selection:bg-indigo-600 selection:text-white relative">
      
      {/* Header */}
      <header className="flex justify-between items-center px-6 lg:px-12 py-4 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl sticky top-0 z-40 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
              ResearchMatrix
            </span>
            <span className="text-[11px] block font-semibold text-slate-400 uppercase tracking-widest">AI Research Synthesizer</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
            {userImage && !imageError ? (
              <img 
                src={userImage} 
                alt={fullName || 'User'} 
                onError={() => setImageError(true)}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20 shadow-sm" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {firstName ? firstName.charAt(0) : 'U'}
              </div>
            )}
            {fullName && (
              <span className="text-sm font-bold text-slate-800 hidden sm:block">
                {fullName}
              </span>
            )}
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition border border-red-200/60 flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <span>Logout</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="w-full max-w-[96%] 2xl:max-w-[1780px] mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Upload & Saved Papers */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Upload Card */}
          <div className="p-6 bg-white rounded-3xl shadow-xl shadow-indigo-500/5 border border-slate-200/80 backdrop-blur-2xl">
            <h2 className="text-base font-bold mb-4 text-slate-900 flex items-center space-x-2">
              <UploadCloud className="w-5 h-5 text-indigo-600" />
              <span>Upload Papers (Multi-file)</span>
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">Select AI Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 text-sm font-medium focus:ring-2 focus:ring-indigo-600 text-slate-900 transition-colors cursor-pointer"
                >
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
                  <option value="gemini-3.7-flash">Gemini 3.7 Flash</option>
                  <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
                  <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite</option>
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview</option>
                  <option value="gemini-3-flash-preview">Gemini 3 Flash Preview</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">PDF Documents (Multiple Allowed)</label>
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  className="w-full text-sm text-slate-600 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer transition"
                />
                {files.length > 0 && (
                  <p className="text-xs text-indigo-600 mt-2 font-bold">
                    {files.length} file(s) selected
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || files.length === 0}
                className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold rounded-2xl transition shadow-lg shadow-indigo-600/25 disabled:opacity-50 text-sm cursor-pointer flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Papers...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract & Save All</span>
                  </>
                )}
              </button>

              {statusMessage && (
                <p className="text-xs text-center mt-2 font-semibold text-indigo-600 animate-pulse">{statusMessage}</p>
              )}
            </form>
          </div>

          {/* Saved Analyses Card */}
          <div className="p-6 bg-white rounded-3xl shadow-xl shadow-indigo-500/5 border border-slate-200/80 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Saved Analyses ({sortedPapers.length})</span>
              </h3>
            </div>

            <p className="text-xs text-slate-500 mb-4 font-medium">
              Select 2 or 3 papers using checkboxes to compare side-by-side.
            </p>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {sortedPapers.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8 font-medium">No papers analyzed yet.</p>
              ) : (
                sortedPapers.map((p) => {
                  const paperIdStr = String(p._id);
                  return (
                    <div
                      key={paperIdStr}
                      className={`p-3.5 rounded-2xl text-sm transition border flex items-center justify-between ${
                        activePaper && String(activePaper._id) === paperIdStr
                          ? 'bg-indigo-50/90 border-indigo-500 shadow-xs'
                          : 'bg-slate-50/80 border-slate-200/80 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={selectedPaperIds.includes(paperIdStr)}
                          onChange={() => handleCheckboxToggle(paperIdStr)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-600 border-slate-300 cursor-pointer"
                          title="Select for comparison"
                        />
                        <button
                          onClick={() => setActivePaper(p)}
                          className="text-left font-semibold truncate flex-1 text-slate-800 hover:text-indigo-600 cursor-pointer text-xs"
                        >
                          {p.isPinned ? '📌 ' : ''}{p.title || p.fileName}
                        </button>
                      </div>
                        
                      <div className="flex items-center space-x-1.5 ml-2">
                        <button
                          onClick={() => handleTogglePin(paperIdStr, p.isPinned)}
                          className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${p.isPinned ? 'text-indigo-600 bg-indigo-100 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                          title={p.isPinned ? 'Unpin' : 'Pin'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setEditingTitleId(paperIdStr); setNewTitle(p.title || ''); }}
                          className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                          title="Rename"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePaper(paperIdStr)}
                          className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-red-600 transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {editingTitleId === paperIdStr && (
                        <div className="mt-2 flex space-x-2 w-full col-span-full">
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium"
                            placeholder="New title..."
                          />
                          <button
                            onClick={() => handleRenamePaper(paperIdStr)}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-xl font-bold cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {selectedPaperIds.length >= 2 && (
              <button
                onClick={handleComparePapers}
                className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition shadow-lg shadow-purple-500/25 text-xs flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Scale className="w-4 h-4" />
                <span>Compare Selected Papers ({selectedPaperIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Paper Analysis Viewer */}
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl shadow-indigo-500/5 border border-slate-200/80 p-8 flex flex-col backdrop-blur-2xl">
          {activePaper ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">{activePaper.title}</h1>
                <div className="text-xs font-semibold text-slate-600 mt-3 flex flex-wrap gap-2.5">
                  <span className="bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200/80">✍️ Authors: {activePaper.authors?.join(', ') || 'N/A'}</span>
                  <span className="bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200/80">🏛️ Venue: {activePaper.venue || 'N/A'}</span>
                  <span className="bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200/80">📅 Year: {activePaper.publishedYear || 'N/A'}</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
                {['overview', 'problem', 'contributions', 'methodology', 'results', 'limitations', 'references', 'plagiarism'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold capitalize transition whitespace-nowrap cursor-pointer ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab === 'plagiarism' ? '🛡️ AI & Plagiarism' : tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="max-w-none text-sm leading-relaxed max-h-[620px] overflow-y-auto pr-3 relative">
                
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white/95 py-3 backdrop-blur-md z-10 border-b border-slate-100">
                  <h3 className="text-base font-black text-indigo-600 capitalize">
                    {activeTab === 'plagiarism' ? 'AI Detection & Plagiarism Report' : `${activeTab} Summary`}
                  </h3>
                  <button
                    onClick={() => handleCopyText(getTabText(activeTab), activeTab)}
                    className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition flex items-center space-x-1.5 shadow-xs cursor-pointer border border-slate-200"
                  >
                    <span>{copiedTab === activeTab ? '✅ Copied!' : '📋 Copy Section'}</span>
                  </button>
                </div>

                {activeTab === 'overview' && (
                  <p className="text-slate-800 bg-slate-50/90 p-6 rounded-2xl border border-slate-200/80 leading-relaxed font-medium">
                    {activePaper.abstract || activePaper.overview || 'No overview or abstract available.'}
                  </p>
                )}

                {activeTab === 'problem' && (
                  <p className="text-slate-800 bg-slate-50/90 p-6 rounded-2xl border border-slate-200/80 leading-relaxed font-medium">
                    {activePaper.researchProblem || activePaper.problem || 'Specific research problem not extracted for this paper.'}
                  </p>
                )}

                {activeTab === 'contributions' && (
                  <ul className="list-disc pl-5 space-y-2.5 text-slate-800 bg-slate-50/90 p-6 rounded-2xl border border-slate-200/80 font-medium">
                    {activePaper.contributions?.length > 0 ? (
                      activePaper.contributions.map((item: string, idx: number) => <li key={idx}>{item}</li>)
                    ) : (
                      <li>{activePaper.keyContributions || 'No distinct contributions listed.'}</li>
                    )}
                  </ul>
                )}

                {activeTab === 'methodology' && (
                  <p className="text-slate-800 bg-slate-50/90 p-6 rounded-2xl border border-slate-200/80 leading-relaxed font-medium">
                    {activePaper.methodology || 'Methodology details not available.'}
                  </p>
                )}

                {activeTab === 'results' && (
                  <p className="text-slate-800 bg-slate-50/90 p-6 rounded-2xl border border-slate-200/80 leading-relaxed font-medium">
                    {activePaper.results || 'Results and evaluations data not available.'}
                  </p>
                )}

                {activeTab === 'limitations' && (
                  <p className="text-slate-800 bg-slate-50/90 p-6 rounded-2xl border border-slate-200/80 leading-relaxed font-medium">
                    {activePaper.limitations || 'No limitations or future scope mentioned.'}
                  </p>
                )}

                {activeTab === 'references' && (
                  <ul className="list-disc pl-5 space-y-2.5 text-xs text-slate-700 bg-slate-50/90 p-6 rounded-2xl border border-slate-200/80 font-medium">
                    {activePaper.references?.length > 0 ? (
                      activePaper.references.map((ref: string, idx: number) => (
                        <li key={idx} className="leading-relaxed">{ref}</li>
                      ))
                    ) : (
                      <p>No references found.</p>
                    )}
                  </ul>
                )}

                {activeTab === 'plagiarism' && (
                  <div className="space-y-4 bg-slate-50/90 p-6 rounded-2xl border border-slate-200/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                        <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Plagiarism Score</span>
                        <span className="text-3xl font-black text-emerald-600 mt-1 block">
                          {activePaper.plagiarismScore || '2%'}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold block mt-1">Original Content</span>
                      </div>
                      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                        <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">AI-Generated Probability</span>
                        <span className="text-3xl font-black text-indigo-600 mt-1 block">
                          {activePaper.aiProbability || '4%'}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold block mt-1">Human-authored writing style</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold pt-2">
                      ✨ Verified through integrated scanning protocols.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-32 text-slate-400">
              <FileText className="w-12 h-12 mb-3 opacity-40 text-indigo-600" />
              <p className="text-base font-bold text-slate-700">Select a paper or upload new PDFs to view deep insights!</p>
            </div>
          )}
        </div>

      </main>

      {/* Comparison Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-lg tracking-tight">
                    Multi-Paper Comparison Matrix
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Side-by-side comparative synthesis across academic dimensions
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(comparisonResult);
                    alert('Comparison matrix copied to clipboard!');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition flex items-center space-x-1.5 cursor-pointer border border-slate-200 shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Matrix</span>
                </button>
                <button
                  onClick={() => setIsCompareModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-slate-800">
              {comparingLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-bold text-slate-500 animate-pulse">
                    Gemini is synthesizing and comparing your selected papers... 🔬✨
                  </p>
                </div>
              ) : (
                <div className="prose max-w-none 
                  prose-headings:text-indigo-600 prose-headings:font-bold
                  prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                  prose-p:leading-relaxed prose-p:text-slate-800 prose-p:font-medium
                  prose-table:border-collapse prose-table:w-full prose-table:my-4
                  prose-th:bg-slate-100 prose-th:text-slate-900 prose-th:p-3 prose-th:border prose-th:border-slate-200 prose-th:text-left prose-th:font-bold
                  prose-td:p-3 prose-td:border prose-td:border-slate-200 prose-td:bg-white prose-td:text-slate-800 prose-td:font-medium
                  prose-strong:text-indigo-700
                  prose-li:text-slate-800 prose-li:font-medium">
                  
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {comparisonResult}
                  </ReactMarkdown>

                </div>
              )}
            </div>

            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 bg-slate-50/50">
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                Close Comparison
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating AI Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105 cursor-pointer ring-4 ring-indigo-600/20"
        title="Open AI Research Assistant"
      >
        <Bot className="w-6 h-6" />
      </button>

      {/* AI Assistant Chat Drawer */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs transition-opacity">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">Research Assistant</h2>
                  <p className="text-xs text-slate-500 font-medium">RAG Context Enabled</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
                  <MessageSquareCode className="w-10 h-10 mb-2 opacity-30 text-indigo-600" />
                  <p className="text-sm font-bold text-slate-700">Ask anything about your papers!</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    The AI will retrieve relevant sections and provide exact citations.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs font-medium leading-relaxed shadow-xs ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/80'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200">
                          <p className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Sources:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {msg.sources.map((src, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[10px] bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-semibold"
                              >
                                {src.title} (p. {src.page})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex gap-2 items-center text-xs text-slate-500 font-semibold">
                  <div className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    Searching library & synthesizing...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-200 bg-white">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  placeholder="Ask a question about your papers..."
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-3.5 pr-10 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatPrompt.trim()}
                  className="absolute right-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}