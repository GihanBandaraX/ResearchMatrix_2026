// src/app/terms/page.tsx

import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 lg:p-12">
      <div className="max-w-3xl mx-auto space-y-8 bg-white p-8 lg:p-12 rounded-3xl shadow-xl shadow-indigo-500/5 border border-slate-200/80">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
              <p className="text-xs text-slate-500 font-medium">Last updated: October 2026</p>
            </div>
          </div>
          <Link href="/" className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition flex items-center space-x-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back Home</span>
          </Link>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed font-medium">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing and using this platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">2. AI Generation & Academic Disclaimer</h2>
            <p>
              Our platform utilizes artificial intelligence to summarize research papers, score plagiarism probabilities, and answer queries. AI outputs can occasionally contain errors, inaccuracies, or hallucinations. Users are solely responsible for verifying the accuracy of all summaries and citations before using them in academic submissions or professional work.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">3. Acceptable Use</h2>
            <p>
              You agree not to upload malicious files, copyrighted material without authorization, or attempt to disrupt platform operations. We reserve the right to suspend or terminate accounts that violate these guidelines.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">4. Limitation of Liability</h2>
            <p>
              The platform is provided on an "as-is" basis. We shall not be held liable for any direct, indirect, or incidental damages arising from the use or inability to use our AI analysis tools.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}