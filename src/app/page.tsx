"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Scale, 
  ShieldAlert, 
  CheckCircle2, 
  FileSearch, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Zap
} from "lucide-react";

export default function LandingPage() {
  const [activeDemoClause, setActiveDemoClause] = useState<"termination" | "ip" | "indemnity">("termination");

  const demoData = {
    termination: {
      title: "Section 14.2 — Termination for Convenience",
      risk: "high",
      riskLabel: "High Risk",
      original: '"Company may terminate this Agreement immediately without cause upon written electronic notice, forfeiting all accrued unvested equity and unpaid discretionary compensation."',
      translation: "They can fire or drop you instantly with zero advance warning, and you would lose any unvested stock options and unfinalized bonuses.",
      advice: "Request a mandatory 30-day notice period and clear vesting acceleration for termination without cause.",
    },
    ip: {
      title: "Section 9.1 — Intellectual Property Assignment",
      risk: "review",
      riskLabel: "Needs Review",
      original: '"Contractor irrevocably assigns all right, title, and interest in any inventions conceived during the term, whether during work hours or personal time."',
      translation: "The company claims ownership of EVERYTHING you invent or code while under contract, even side-projects built on your own time and laptop.",
      advice: "Carve out pre-existing personal projects and limit assignment exclusively to direct company deliverables.",
    },
    indemnity: {
      title: "Section 18 — Unlimited Indemnification",
      risk: "high",
      riskLabel: "Critical Attention",
      original: '"Customer agrees to indemnify, defend, and hold harmless Provider against any third-party claims, liabilities, damages, and legal fees without cap or limitation."',
      translation: "If a third party sues the vendor for any related reason, you are on the hook to pay all their legal defense bills with no maximum spending limit.",
      advice: "Insist on a mutual liability cap tied to 12 months of contract fees and carve out gross negligence.",
    },
  };

  const currentDemo = demoData[activeDemoClause];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-blue-500/15 to-purple-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/2 -left-48 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-10 -right-48 w-[700px] h-[700px] bg-indigo-500/10 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 px-6 lg:px-12 py-4 flex items-center justify-between glass-header">
        <Link href="/" className="flex items-center space-x-3 group" aria-label="LegalLens AI Home">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
            <Scale className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
              LegalLens
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI
              </span>
            </span>
          </div>
        </Link>

        <nav aria-label="Main Navigation" className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#demo" className="hover:text-white transition-colors">Interactive Demo</Link>
          <Link href="#security" className="hover:text-white transition-colors">Privacy & Trust</Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link href="/documents/upload">
            <Button className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-full px-6 shadow-lg shadow-indigo-500/25 border border-indigo-400/30 hover:scale-[1.02] transition-all">
              <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
              Analyze Document
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-7xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-32 flex flex-col lg:flex-row items-center gap-16" aria-labelledby="hero-heading">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full shimmer-badge text-xs font-medium text-indigo-300 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" aria-hidden="true" />
              <span>Next-Gen Legal Intelligence & Risk Detection</span>
            </div>

            <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
              Understand what your{" "}
              <span className="gradient-text-accent">contracts actually mean</span>{" "}
              before signing.
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Stop guessing through dense legalese. Upload any contract, agreement, NDA, or policy to instantly extract hidden risks, obligations, strict deadlines, and plain-English translations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/documents/upload" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl px-8 h-14 text-base font-semibold shadow-xl shadow-indigo-500/25 border border-indigo-400/20 group">
                  Upload & Analyze Free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="#demo" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl px-8 h-14 text-base font-medium border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800/80 hover:text-white hover:border-slate-600 backdrop-blur-md">
                  Explore Live Demo
                </Button>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-6 text-left">
              <div>
                <div className="text-2xl font-bold text-white tracking-tight">100%</div>
                <div className="text-xs text-slate-400 mt-0.5">Plain-English clarity</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-400 tracking-tight">&lt; 10s</div>
                <div className="text-xs text-slate-400 mt-0.5">Instant AI extraction</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400 tracking-tight">Zero</div>
                <div className="text-xs text-slate-400 mt-0.5">Hidden trap clauses</div>
              </div>
            </div>
          </div>

          {/* Live Interactive Hero Preview Card */}
          <div className="flex-1 w-full relative max-w-xl" id="demo">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-3xl blur-xl opacity-30 animate-pulse" aria-hidden="true" />
            
            <div className="glass-panel rounded-3xl p-6 relative z-10 shadow-2xl space-y-5">
              
              {/* Card Header & Clause Selector */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" aria-hidden="true" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" aria-hidden="true" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" aria-hidden="true" />
                  <span className="text-xs font-mono text-slate-400 ml-2">Master_Services_Agreement.pdf</span>
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI Deep Scan
                </span>
              </div>

              {/* Clause Tabs */}
              <div role="tablist" aria-label="Interactive demo clauses" className="flex space-x-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs">
                <button
                  role="tab"
                  id="tab-termination"
                  aria-selected={activeDemoClause === "termination"}
                  aria-controls="panel-termination"
                  onClick={() => setActiveDemoClause("termination")}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all ${
                    activeDemoClause === "termination" 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Termination
                </button>
                <button
                  role="tab"
                  id="tab-ip"
                  aria-selected={activeDemoClause === "ip"}
                  aria-controls="panel-ip"
                  onClick={() => setActiveDemoClause("ip")}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all ${
                    activeDemoClause === "ip" 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  IP Rights
                </button>
                <button
                  role="tab"
                  id="tab-indemnity"
                  aria-selected={activeDemoClause === "indemnity"}
                  aria-controls="panel-indemnity"
                  onClick={() => setActiveDemoClause("indemnity")}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all ${
                    activeDemoClause === "indemnity" 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Indemnification
                </button>
              </div>

              {/* Active Tab Panel */}
              <div
                role="tabpanel"
                id={`panel-${activeDemoClause}`}
                aria-labelledby={`tab-${activeDemoClause}`}
                className="space-y-4"
              >
                {/* Original Text Box */}
                <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Original Contract Section</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      currentDemo.risk === "high" 
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" 
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}>
                      {currentDemo.riskLabel}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">{currentDemo.title}</h4>
                  <p className="text-xs text-slate-400 font-serif italic leading-relaxed border-l-2 border-slate-700 pl-3 py-1">
                    {currentDemo.original}
                  </p>
                </div>

                {/* AI Plain-English Translation */}
                <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900/90 p-4 rounded-xl border border-indigo-500/30 space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    <span className="text-xs font-bold uppercase tracking-wider">What it actually means</span>
                  </div>
                  <p className="text-sm font-medium text-slate-100 leading-snug">
                    {currentDemo.translation}
                  </p>
                </div>

                {/* Actionable Advice Pill */}
                <div className="bg-amber-950/30 p-3.5 rounded-xl border border-amber-500/20 flex items-start space-x-3">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">Recommended Action</span>
                    <p className="text-xs text-amber-200/90 mt-0.5 leading-relaxed">{currentDemo.advice}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full max-w-7xl mx-auto px-6 py-24 border-t border-slate-800/80" aria-labelledby="features-heading">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Comprehensive Intelligence</h2>
            <h3 id="features-heading" className="text-3xl sm:text-4xl font-extrabold text-white">
              Everything you need to review with total confidence
            </h3>
            <p className="text-slate-400 max-w-2xl mx-auto text-base">
              Engineered with specialized legal prompt workflows to illuminate hidden commitments, financial exposure, and asymmetric clauses.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-card rounded-2xl p-8 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <FileSearch className="w-6 h-6" aria-hidden="true" />
              </div>
              <h4 className="text-xl font-bold text-white">30-Second Executive Summary</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Receive bulletproof, high-level overviews explaining exactly what the document accomplishes and who holds the leverage.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card rounded-2xl p-8 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-6 h-6" aria-hidden="true" />
              </div>
              <h4 className="text-xl font-bold text-white">Red-Flag Risk Detection</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Highlight unbalanced indemnity clauses, auto-renewals, intellectual property grabs, and non-competes before they hurt you.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card rounded-2xl p-8 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <h4 className="text-xl font-bold text-white">Obligation & Date Tracker</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Automatic extraction of all your commitments, key notice periods, renewal dates, and payment milestones.
              </p>
            </div>
          </div>
        </section>

        {/* Security & Disclaimer Section */}
        <section id="security" className="w-full max-w-5xl mx-auto px-6 py-16" aria-labelledby="security-heading">
          <div className="glass-panel rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-indigo-400 mx-auto mb-4 border border-slate-700">
              <Lock className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 id="security-heading" className="text-2xl font-bold text-white mb-2">Private, Secure & Transparent</h3>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto mb-6 leading-relaxed">
              Your documents are processed securely and never sold or shared with external data brokers. 
            </p>
            <div className="inline-block bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 text-left max-w-2xl mx-auto">
              <span className="font-bold text-slate-200 block mb-1">Legal Disclaimer:</span>
              LegalLens is an AI document assistance and clarity tool. It provides automated explanations and information for reference only, and does not constitute formal legal representation or legal advice.
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="w-full max-w-7xl mx-auto px-6 py-20 text-center" aria-labelledby="cta-heading">
          <div className="space-y-6">
            <h2 id="cta-heading" className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to decode your next contract?
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-base">
              Upload your agreement today and get complete clarity in seconds.
            </p>
            <div>
              <Link href="/documents/upload">
                <Button size="lg" className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-full px-10 h-14 text-lg font-semibold shadow-2xl shadow-indigo-500/40 border border-indigo-400/30 hover:scale-105 transition-all">
                  Upload Document Now
                  <Sparkles className="w-5 h-5 ml-2" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-10 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-indigo-400" aria-hidden="true" />
            <span className="font-bold text-slate-300">LegalLens AI</span>
            <span>— Plain English Contract Intelligence</span>
          </div>
          <p>© {new Date().getFullYear()} LegalLens. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
