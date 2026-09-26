"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  FileUp, 
  Scale, 
  FileText, 
  ChevronRight, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Search, 
  Plus,
  LogOut,
  Loader2
} from "lucide-react";
import { ref, get } from "firebase/database";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { Clause } from "@/lib/ai/schemas";

interface DocumentItem {
  id: string;
  name?: string;
  documentType?: string;
  jurisdiction?: string;
  clauses?: Record<string, Clause> | Clause[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // If not logged in, redirect to login page
        router.push("/login");
        return;
      }

      setCurrentUser(user);

      try {
        const userId = user.uid;
        const userDocsRef = ref(db, `users/${userId}/documents`);
        const snap = await get(userDocsRef);
        
        if (snap.exists()) {
          const val = snap.val() as Record<string, Omit<DocumentItem, "id">>;
          const docList: DocumentItem[] = Object.entries(val).map(([id, data]) => ({
            id,
            ...data
          }));
          setDocuments(docList.reverse());
        } else {
          setDocuments([]);
        }
      } catch (e) {
        console.error("Error loading dashboard docs:", e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const filteredDocs = documents.filter(doc => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (doc.name || "").toLowerCase().includes(q) || (doc.documentType || "").toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-400">Loading your secure workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-1/3 w-[800px] h-[350px] bg-indigo-600/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-10 left-10 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full" />
      </div>

      {/* Header */}
      <header className="px-6 lg:px-12 py-4 flex items-center justify-between glass-header sticky top-0 z-50">
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Scale className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">LegalLens</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold">
            <Link href="/dashboard" className="text-indigo-400">Dashboard</Link>
            <Link href="/documents/upload" className="text-slate-400 hover:text-white transition-colors">New Analysis</Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/documents/upload">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Upload Document
            </Button>
          </Link>

          <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
            <Avatar className="h-8 w-8 border border-slate-700">
              <AvatarImage src={currentUser?.photoURL || ""} />
              <AvatarFallback className="bg-indigo-950 text-indigo-300 font-bold text-xs">
                {currentUser?.displayName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 p-2 h-8 rounded-lg"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* Welcome & Upload Hero Banner */}
        <div className="glass-panel rounded-3xl p-8 md:p-10 relative overflow-hidden bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-slate-950 border-indigo-500/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Executive Legal Workspace • {currentUser?.email || "Personal Vault"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Review & Decode Contracts with Total Confidence
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Upload your latest agreements, policies, or contracts to expose asymmetric risks, hidden obligations, and critical deadlines.
              </p>
            </div>
            
            <Link href="/documents/upload" className="shrink-0">
              <Button size="lg" className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-xl px-8 h-12 text-sm font-semibold shadow-xl shadow-indigo-500/30 border border-indigo-400/30 hover:scale-105 transition-all">
                <FileUp className="mr-2 h-4 w-4" />
                Upload New Document
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 space-y-2 border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Your Documents</span>
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{documents.length}</div>
            <p className="text-xs text-slate-500">Authenticated user vault</p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-2 border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Risk Severity Radar</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-3xl font-extrabold text-rose-400">Active</div>
            <p className="text-xs text-slate-500">AI scanning for trap clauses</p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-2 border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Legal Clarity Level</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">100%</div>
            <p className="text-xs text-slate-500">Plain-English summaries</p>
          </div>
        </div>

        {/* Document List Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Your Analyzed Documents</h2>
              <p className="text-xs text-slate-400 mt-0.5">Click any document to inspect full intelligence breakdown</p>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          
          {documents.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No documents in your vault yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Upload your first contract or agreement to see the AI report and risk breakdown.
                </p>
              </div>
              <Link href="/documents/upload">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs px-5">
                  Upload First Document
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocs.map((doc) => {
                const clauseList: Clause[] = doc.clauses 
                  ? (Array.isArray(doc.clauses) ? doc.clauses : Object.values(doc.clauses)) 
                  : [];
                const clauseCount = clauseList.length;
                const highRiskCount = clauseList.filter((c) => c.priority === "high").length;

                return (
                  <Link key={doc.id} href={`/documents/${doc.id}`} className="group">
                    <div className="glass-card rounded-2xl p-6 border-slate-800 space-y-4 h-full flex flex-col justify-between group-hover:border-indigo-500/40">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400 group-hover:scale-105 transition-transform">
                            <FileText className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                            Decoded
                          </span>
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors line-clamp-1">
                            {doc.name || "Untitled Contract"}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">
                            {doc.documentType || "Agreement"} • {doc.jurisdiction || "General"}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        {highRiskCount > 0 ? (
                          <span className="font-semibold text-rose-400 flex items-center">
                            <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                            {highRiskCount} critical {highRiskCount === 1 ? "flag" : "flags"}
                          </span>
                        ) : (
                          <span className="font-medium text-slate-400 flex items-center">
                            <FileText className="w-3.5 h-3.5 mr-1 text-slate-500" />
                            {clauseCount} sections
                          </span>
                        )}
                        
                        <span className="text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center font-semibold">
                          View Report <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
