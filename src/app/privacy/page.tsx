// src/app/privacy/page.tsx

import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 lg:p-12">
      <div className="max-w-3xl mx-auto space-y-8 bg-white p-8 lg:p-12 rounded-3xl shadow-xl shadow-indigo-500/5 border border-slate-200/80">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
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
            <h2 className="text-lg font-bold text-slate-900">1. Information We Collect</h2>
            <p>
              When you authenticate using Google Sign-In or upload documents, we collect basic profile information (such as your name, email address, and profile picture) and the PDF research papers you explicitly upload for synthesis and analysis.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">2. How We Use Your Information</h2>
            <p>
              Your information is used strictly to provide, maintain, and improve our research synthesis features. Specifically, uploaded PDFs are processed by AI models to generate structured summaries, matrices, and answers to your queries. We do not sell or share your personal data with third-party advertisers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">3. Data Security & Retention</h2>
            <p>
              We implement industry-standard encryption and security protocols to protect your personal information and documents. You retain full control over your saved analyses and can delete your uploaded papers and account data at any time from your dashboard.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">4. Contact Us</h2>
            <p>
              If you have any questions or concerns regarding this Privacy Policy, please reach out via your account dashboard or repository support channels.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}