"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Trash2, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  Calendar, 
  CheckSquare, 
  FileText, 
  Loader2, 
  Sparkles, 
  Check, 
  Copy, 
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import { ref, get, remove } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { DocumentAnalysis, Clause, Obligation, Deadline } from "@/lib/ai/schemas";

interface DocumentMetadata {
  name?: string;
  jurisdiction?: string;
  documentType?: string;
  clauses?: Record<string, Clause> | Clause[];
  obligations?: Record<string, Obligation> | Obligation[];
  deadlines?: Record<string, Deadline> | Deadline[];
  summary?: string[];
  unclearInformation?: string[];
}

function normalizeQuestions(questions: unknown): string[] {
  if (!questions) return [];
  if (typeof questions === "string") {
    const trimmed = questions.trim();
    return trimmed ? [trimmed] : [];
  }
  if (Array.isArray(questions)) {
    // If it is an array of single characters (e.g. from an exploded string), join them back together
    if (questions.length > 1 && questions.every(q => typeof q === "string" && q.length === 1)) {
      const joined = questions.join("").trim();
      return joined ? [joined] : [];
    }
    return questions
      .map(q => (typeof q === "string" ? q.trim() : String(q || "").trim()))
      .filter(q => q.length > 0);
  }
  if (typeof questions === "object") {
    const values = Object.values(questions as Record<string, unknown>);
    if (values.length === 0) return [];
    
    // Check if the object was a string split into single character properties {0: 'D', 1: 'o', 2: 'e', ...}
    if (values.length > 1 && values.every(v => typeof v === "string" && v.length === 1)) {
      const joined = values.join("").trim();
      return joined ? [joined] : [];
    }

    return values
      .map(q => (typeof q === "string" ? q.trim() : String(q || "").trim()))
      .filter(q => q.length > 0);
  }
  return [];
}

export default function DocumentAnalysisPage({ params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "clauses" | "obligations" | "dates" | "questions">("overview");
  const [loading, setLoading] = useState(true);
  const [docMeta, setDocMeta] = useState<DocumentMetadata | null>(null);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [copiedQuestion, setCopiedQuestion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        const userId = user ? user.uid : "anonymous";
        const docRef = ref(db, `users/${userId}/documents/${documentId}`);
        let snapshot = await get(docRef);
        
        // If not found in user's space, check anonymous fallback
        if (!snapshot.exists()) {
          const anonRef = ref(db, `users/anonymous/documents/${documentId}`);
          const anonSnap = await get(anonRef);
          if (anonSnap.exists()) {
            snapshot = anonSnap;
          }
        }

        if (!snapshot.exists()) {
          setLoading(false);
          return;
        }

        const meta = snapshot.val() as DocumentMetadata;
        
        const rawClauses = meta.clauses || {};
        const rawClausesList = Array.isArray(rawClauses) ? rawClauses : Object.values(rawClauses);
        const clauses = rawClausesList.map((c: Clause) => ({
          ...c,
          questions: normalizeQuestions(c.questions)
        })) as Clause[];
        
        const rawObligations = meta.obligations || {};
        const obligations = (Array.isArray(rawObligations) ? rawObligations : Object.values(rawObligations)) as Obligation[];
        
        const rawDeadlines = meta.deadlines || {};
        const deadlines = (Array.isArray(rawDeadlines) ? rawDeadlines : Object.values(rawDeadlines)) as Deadline[];

        const rawSummary = meta.summary || [];
        const summary = Array.isArray(rawSummary) ? rawSummary : Object.values(rawSummary);

        const rawUnclear = meta.unclearInformation || [];
        const unclearInformation = Array.isArray(rawUnclear) ? rawUnclear : Object.values(rawUnclear);

        setDocMeta(meta);
        setAnalysis({
          summary: summary as string[],
          clauses,
          obligations,
          deadlines,
          unclearInformation: unclearInformation as string[]
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [documentId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document analysis?")) return;
    try {
      setIsDeleting(true);
      const userId = auth.currentUser ? auth.currentUser.uid : "anonymous";
      await remove(ref(db, `users/${userId}/documents/${documentId}`));
      router.push("/dashboard");
    } catch (err) {
      console.error("Delete error:", err);
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestion(text);
    setTimeout(() => setCopiedQuestion(null), 2000);
  };

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl">
          <Loader2 className="w-8 h-8 animate-spin" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-slate-400">Loading document intelligence...</p>
        <span className="sr-only">Analyzing document data</span>
      </div>
    );
  }

  if (!docMeta || !analysis) {
    return (
      <div role="alert" className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-300 space-y-6 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <FileText className="w-8 h-8" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Document not found</h2>
          <p className="text-sm text-slate-400 max-w-sm">
            This document may have been deleted or the session has expired.
          </p>
        </div>
        <Link href="/dashboard">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const highPriority = analysis.clauses.filter(c => c.priority === "high");
  const reviewItems = analysis.clauses.filter(c => c.priority === "review");

  const allQuestions = analysis.clauses.flatMap(c => {
    const qList = normalizeQuestions(c.questions);
    return qList.map(q => ({ clause: c.title, question: q }));
  });

  const filteredClauses = analysis.clauses.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.title.toLowerCase().includes(q) || c.plainEnglish.toLowerCase().includes(q) || (c.whyItMatters && c.whyItMatters.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans relative selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Background Lights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute top-0 right-1/4 w-[700px] h-[350px] bg-indigo-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[140px] rounded-full" />
      </div>

      {/* Header */}
      <header className="px-6 lg:px-12 py-4 flex items-center justify-between glass-header sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" aria-label="Back to dashboard" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all focus-visible:ring-2 focus-visible:ring-indigo-400">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </Link>
          
          <div className="flex flex-col">
            <div className="flex items-center space-x-2.5">
              <h1 className="font-bold text-base sm:text-lg text-white truncate max-w-[200px] sm:max-w-md">
                {docMeta.name || "Contract Document"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {docMeta.jurisdiction || "General"}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {docMeta.documentType || "Legal Document"} • Decoded with Gemini AI
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm"
            className="border-slate-800 bg-slate-900/80 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 rounded-xl"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Delete document analysis"
          >
            <Trash2 className="w-4 h-4 mr-1.5" aria-hidden="true" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
          
          <Link href="/documents/upload">
            <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-xl shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-4 h-4 mr-1.5" aria-hidden="true" />
              New Scan
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 outline-none">
        
        {/* Live region for clipboard feedback */}
        <div role="status" aria-live="polite" className="sr-only">
          {copiedQuestion ? "Question copied to clipboard" : ""}
        </div>

        {/* Executive Scorecard Banner */}
        <section aria-label="Executive document summary scorecard" className="glass-panel rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80">
            
            {/* Risk Indicator */}
            <div className="flex items-center space-x-4 pt-2 sm:pt-0">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                highPriority.length > 0 
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" 
                  : reviewItems.length > 0 
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}>
                {highPriority.length > 0 ? (
                  <ShieldAlert className="w-6 h-6" aria-hidden="true" />
                ) : reviewItems.length > 0 ? (
                  <AlertTriangle className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="w-6 h-6" aria-hidden="true" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Risk Severity</div>
                <div className={`text-lg font-extrabold ${
                  highPriority.length > 0 ? "text-rose-400" : reviewItems.length > 0 ? "text-amber-400" : "text-emerald-400"
                }`}>
                  {highPriority.length > 0 ? `${highPriority.length} Critical Risks` : reviewItems.length > 0 ? "Moderate Attention" : "Standard Risk"}
                </div>
              </div>
            </div>

            {/* Total Clauses */}
            <div className="flex items-center space-x-4 pt-4 sm:pt-0 sm:pl-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Clauses Identified</div>
                <div className="text-lg font-extrabold text-white">{analysis.clauses.length} Sections</div>
              </div>
            </div>

            {/* Obligations */}
            <div className="flex items-center space-x-4 pt-4 sm:pt-0 sm:pl-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckSquare className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Obligations</div>
                <div className="text-lg font-extrabold text-white">{analysis.obligations.length} Commitments</div>
              </div>
            </div>

            {/* Deadlines */}
            <div className="flex items-center space-x-4 pt-4 sm:pt-0 sm:pl-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Dates & Deadlines</div>
                <div className="text-lg font-extrabold text-white">{analysis.deadlines.length} Critical Dates</div>
              </div>
            </div>

          </div>
        </section>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div role="tablist" aria-label="Document Sections" className="glass-card rounded-2xl p-3 space-y-1.5 sticky top-24">
              <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Document Sections
              </div>
              
              <button
                role="tab"
                id="tab-overview"
                aria-selected={activeTab === "overview"}
                aria-controls="panel-overview"
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  activeTab === "overview"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <span className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-2.5 text-indigo-400" aria-hidden="true" />
                  Plain-English Summary
                </span>
              </button>

              <button
                role="tab"
                id="tab-clauses"
                aria-selected={activeTab === "clauses"}
                aria-controls="panel-clauses"
                onClick={() => setActiveTab("clauses")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  activeTab === "clauses"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <span className="flex items-center">
                  <FileText className="w-4 h-4 mr-2.5 text-blue-400" aria-hidden="true" />
                  Clauses & Risk Radar
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                  {analysis.clauses.length}
                </span>
              </button>

              <button
                role="tab"
                id="tab-obligations"
                aria-selected={activeTab === "obligations"}
                aria-controls="panel-obligations"
                onClick={() => setActiveTab("obligations")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  activeTab === "obligations"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <span className="flex items-center">
                  <CheckSquare className="w-4 h-4 mr-2.5 text-emerald-400" aria-hidden="true" />
                  Commitments & Duties
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                  {analysis.obligations.length}
                </span>
              </button>

              <button
                role="tab"
                id="tab-dates"
                aria-selected={activeTab === "dates"}
                aria-controls="panel-dates"
                onClick={() => setActiveTab("dates")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  activeTab === "dates"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2.5 text-purple-400" aria-hidden="true" />
                  Important Dates
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                  {analysis.deadlines.length}
                </span>
              </button>

              <button
                role="tab"
                id="tab-questions"
                aria-selected={activeTab === "questions"}
                aria-controls="panel-questions"
                onClick={() => setActiveTab("questions")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  activeTab === "questions"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <span className="flex items-center">
                  <HelpCircle className="w-4 h-4 mr-2.5 text-amber-400" aria-hidden="true" />
                  Questions for Lawyer
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                  {allQuestions.length}
                </span>
              </button>
            </div>

            {/* Quick Consultation Helper Card */}
            <div className="glass-card rounded-2xl p-5 border border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 to-slate-900/70 space-y-3">
              <div className="flex items-center space-x-2 text-indigo-300">
                <Zap className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider">Negotiation Tip</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Before signing, send redlined comments specifically addressing high-risk termination and liability clauses.
              </p>
              <button 
                onClick={() => setActiveTab("questions")}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center pt-1 focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-sm"
              >
                Review talking points <ChevronRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Main Content Body */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <div id="panel-overview" role="tabpanel" tabIndex={0} aria-labelledby="tab-overview" className="space-y-6 animate-fadeIn outline-none">
                <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <Sparkles className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">30-Second Executive Summary</h2>
                        <p className="text-xs text-slate-400">Essential takeaways in clear, jargon-free English</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {analysis.summary.map((point, idx) => (
                      <div key={idx} className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" aria-hidden="true">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed font-normal">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* High Priority Alerts on Overview */}
                {highPriority.length > 0 && (
                  <div className="glass-panel rounded-3xl p-6 sm:p-8 border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-slate-900/80 to-slate-950 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-rose-400">
                        <ShieldAlert className="w-5 h-5" aria-hidden="true" />
                        <h3 className="font-bold text-lg text-white">Critical Risk Areas ({highPriority.length})</h3>
                      </div>
                      <button 
                        onClick={() => setActiveTab("clauses")}
                        className="text-xs font-semibold text-rose-400 hover:text-rose-300 focus-visible:ring-2 focus-visible:ring-rose-400 rounded-sm"
                      >
                        View all clauses →
                      </button>
                    </div>

                    <div className="space-y-3">
                      {highPriority.map((c, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm text-rose-200">{c.title}</h4>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              High Risk
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{c.plainEnglish}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unclear Information Callout */}
                {analysis.unclearInformation && analysis.unclearInformation.length > 0 && (
                  <div className="glass-panel rounded-3xl p-6 border-slate-800 bg-slate-900/60 space-y-3">
                    <div className="flex items-center space-x-2 text-slate-300">
                      <Info className="w-4 h-4 text-amber-400" aria-hidden="true" />
                      <h3 className="font-bold text-sm text-white">Ambiguities & Missing Details</h3>
                    </div>
                    <ul className="space-y-2">
                      {analysis.unclearInformation.map((info, idx) => (
                        <li key={idx} className="text-xs text-slate-400 flex items-start space-x-2">
                          <span className="text-amber-400 mr-1" aria-hidden="true">•</span>
                          <span>{info}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* TAB: CLAUSES */}
            {activeTab === "clauses" && (
              <div id="panel-clauses" role="tabpanel" tabIndex={0} aria-labelledby="tab-clauses" className="space-y-6 animate-fadeIn outline-none">
                
                {/* Search / Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Clauses & Risk Radar</h2>
                    <p className="text-xs text-slate-400">Evaluated against standard market benchmarks</p>
                  </div>
                  <div className="w-full sm:w-64">
                    <label htmlFor="clause-search" className="sr-only">Search clauses or keywords</label>
                    <input
                      id="clause-search"
                      type="text"
                      placeholder="Search clauses or keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-400"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredClauses.map((clause, idx) => {
                    const isHigh = clause.priority === "high";
                    const isReview = clause.priority === "review";

                    const cardBorder = isHigh 
                      ? "border-rose-500/40 bg-gradient-to-br from-rose-950/20 via-slate-900/80 to-slate-950" 
                      : isReview 
                      ? "border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-slate-900/80 to-slate-950" 
                      : "border-slate-800 bg-slate-900/70";

                    const badgeStyle = isHigh 
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30" 
                      : isReview 
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30" 
                      : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";

                    const badgeText = isHigh ? "High Risk" : isReview ? "Needs Review" : "Standard";
                    const clauseQuestions = normalizeQuestions(clause.questions);

                    return (
                      <div key={idx} className={`glass-panel rounded-2xl p-6 border ${cardBorder} shadow-lg transition-all`}>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center space-x-2.5">
                            {isHigh ? (
                              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" aria-hidden="true" />
                            ) : isReview ? (
                              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
                            ) : (
                              <FileText className="w-5 h-5 text-indigo-400 shrink-0" aria-hidden="true" />
                            )}
                            <h3 className="font-bold text-base text-white">{clause.title}</h3>
                          </div>
                          
                          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border shrink-0 ${badgeStyle}`}>
                            {badgeText}
                          </span>
                        </div>

                        {/* Plain English Translation */}
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">Plain English Translation</span>
                          <p className="text-sm font-medium text-slate-200 leading-relaxed">
                            {clause.plainEnglish}
                          </p>
                        </div>

                        {/* Why it matters */}
                        {clause.whyItMatters && (
                          <div className="mb-4 text-xs text-slate-400 space-y-1">
                            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Why you should care:</span>
                            <p className="leading-relaxed">{clause.whyItMatters}</p>
                          </div>
                        )}

                        {/* Original Text & Questions Modal Trigger */}
                        <div className="flex justify-end pt-2 border-t border-slate-800/60">
                          <Dialog>
                            <DialogTrigger
                              render={
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400"
                                  aria-label={`View contract text and negotiation questions for ${clause.title}`}
                                >
                                  View Contract Text & Questions
                                </Button>
                              }
                            />
                            <DialogContent className="sm:max-w-[650px] bg-slate-900 border-slate-800 text-slate-100 p-6 rounded-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-lg font-bold text-white">{clause.title}</DialogTitle>
                                <DialogDescription className="text-xs text-slate-400">
                                  Section {clause.section || "N/A"} • Page {clause.page || "1"}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-6 my-4">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Original Legal Text</h4>
                                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 font-serif italic leading-relaxed">
                                    &ldquo;{clause.originalText}&rdquo;
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Plain English Meaning</h4>
                                  <p className="text-sm text-slate-200 bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-500/20">
                                    {clause.plainEnglish}
                                  </p>
                                </div>

                                {clauseQuestions.length > 0 && (
                                  <div>
                                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Questions to Ask</h4>
                                    <ul className="space-y-2">
                                      {clauseQuestions.map((q: string, qIdx: number) => (
                                        <li key={qIdx} className="text-xs text-slate-300 flex items-start space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                                          <span className="text-amber-400 font-bold" aria-hidden="true">?</span>
                                          <span className="flex-1">{q}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: OBLIGATIONS */}
            {activeTab === "obligations" && (
              <div id="panel-obligations" role="tabpanel" tabIndex={0} aria-labelledby="tab-obligations" className="space-y-6 animate-fadeIn outline-none">
                <div>
                  <h2 className="text-xl font-bold text-white">Your Commitments & Obligations</h2>
                  <p className="text-xs text-slate-400">Actions and duties required by the agreement</p>
                </div>

                <div className="space-y-3">
                  {analysis.obligations.map((ob, idx) => (
                    <div key={idx} className="glass-panel rounded-2xl p-4 sm:p-5 flex items-start space-x-4 border-slate-800">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckSquare className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            ob.party === "user" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-slate-800 text-slate-400"
                          }`}>
                            {ob.party === "user" ? "Your Obligation" : "Counterparty Duty"}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-200 leading-relaxed">{ob.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: DATES */}
            {activeTab === "dates" && (
              <div id="panel-dates" role="tabpanel" tabIndex={0} aria-labelledby="tab-dates" className="space-y-6 animate-fadeIn outline-none">
                <div>
                  <h2 className="text-xl font-bold text-white">Important Dates & Time Limits</h2>
                  <p className="text-xs text-slate-400">Notice periods, expiration windows, and milestones</p>
                </div>

                <div className="space-y-3">
                  {analysis.deadlines.map((dl, idx) => (
                    <div key={idx} className="glass-panel rounded-2xl p-4 sm:p-5 flex items-start space-x-4 border-slate-800">
                      <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex flex-col items-center justify-center shrink-0 text-center p-1">
                        <Calendar className="w-4 h-4 mb-0.5" aria-hidden="true" />
                        <span className="text-[10px] font-extrabold uppercase truncate w-full">{dl.date || dl.relativePeriod || "Date"}</span>
                      </div>
                      <div className="flex-1 space-y-1 pt-1">
                        <p className="text-sm font-medium text-slate-200 leading-relaxed">{dl.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: QUESTIONS FOR LAWYER */}
            {activeTab === "questions" && (
              <div id="panel-questions" role="tabpanel" tabIndex={0} aria-labelledby="tab-questions" className="space-y-6 animate-fadeIn outline-none">
                <div>
                  <h2 className="text-xl font-bold text-white">Questions to Ask Your Legal Counsel</h2>
                  <p className="text-xs text-slate-400">Ready-made talking points for consultations or contract negotiations</p>
                </div>

                {allQuestions.length === 0 ? (
                  <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 text-xs">
                    No specific questions generated for this document.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allQuestions.map((item, idx) => (
                      <div key={idx} className="glass-panel rounded-2xl p-5 border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-indigo-400">{item.clause}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(item.question)}
                            className="h-8 px-2.5 text-xs text-slate-400 hover:text-white rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-400"
                            aria-label={`Copy question for ${item.clause}: ${item.question}`}
                          >
                            {copiedQuestion === item.question ? (
                              <>
                                <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" aria-hidden="true" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                                <span>Copy</span>
                              </>
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-slate-200 font-medium leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                          &ldquo;{item.question}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
