"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  FileUp, 
  Scale, 
  X, 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  Loader2, 
  Sparkles, 
  ShieldCheck, 
  Globe,
  FileType
} from "lucide-react";

import { auth } from "@/lib/firebase/client";

const DOCUMENT_TYPES = [
  "Employment Agreement", 
  "Rental / Lease", 
  "Non-Disclosure Agreement (NDA)", 
  "Master Services Agreement (MSA)", 
  "Freelance / Contractor", 
  "Loan / Financing Agreement", 
  "Terms of Service & Privacy", 
  "Legal Notice / Demand", 
  "Other Agreement"
];

const JURISDICTIONS = ["India", "United States", "United Kingdom", "Canada", "European Union", "Global / Neutral"];

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    setProcessingStatus("Initializing secure scan...");
    setProgress(15);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", docType);
      formData.append("jurisdiction", jurisdiction || "General");
      const currentUser = auth.currentUser;
      formData.append("userId", currentUser ? currentUser.uid : "anonymous");

      const steps = [
        { at: 25, msg: "Extracting legal text & structure..." },
        { at: 50, msg: "Analyzing risk severity & red flags..." },
        { at: 70, msg: "Translating legalese to plain English..." },
        { at: 85, msg: "Extracting commitments & key deadlines..." },
        { at: 95, msg: "Finalizing intelligent report..." },
      ];
      let stepIdx = 0;

      const progressInterval = setInterval(() => {
        if (stepIdx < steps.length) {
          setProgress(steps[stepIdx].at);
          setProcessingStatus(steps[stepIdx].msg);
          stepIdx++;
        }
      }, 2500);

      const headers: Record<string, string> = {};
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        headers["Authorization"] = `Bearer ${idToken}`;
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers,
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Analysis failed");
      }

      const data = await response.json();
      
      setProgress(100);
      setProcessingStatus("Document decoded successfully!");
      
      setTimeout(() => {
        router.push(`/documents/${data.documentId}`);
      }, 800);
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "There was an error analyzing the document. Please try again.";
      alert(message);
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Background Lights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/15 blur-[140px] rounded-full" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-blue-600/10 blur-[130px] rounded-full" />
      </div>

      {/* Header */}
      <header className="px-6 lg:px-12 py-4 flex items-center justify-between glass-header sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Scale className="w-4 h-4" />
            </div>
            <span className="font-extrabold tracking-tight text-white">LegalLens</span>
          </Link>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>256-Bit Encrypted Analysis</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 flex-1 w-full">
        
        {/* Page Title */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Contract Diagnostic</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Analyze New Legal Document
          </h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">
            Upload your document in PDF or DOCX format for an exhaustive risk breakdown and plain-English translation.
          </p>
        </div>

        {!isUploading ? (
          <div className="space-y-6">
            {!file ? (
              <div 
                className={`glass-panel rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 relative border-2 border-dashed ${
                  isDragging 
                    ? "border-indigo-400 bg-indigo-950/40 scale-[1.01]" 
                    : "border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl group-hover:scale-105 transition-transform">
                    <FileUp className="w-10 h-10" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white">Drag & drop your document here</h3>
                    <p className="text-xs sm:text-sm text-slate-400">Supports PDF, DOCX up to 15MB</p>
                  </div>

                  <div className="pt-2">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <div className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105">
                        Browse Files on Device
                      </div>
                    </Label>
                    <Input id="file-upload" type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
                {/* File Details Banner */}
                <div className="bg-indigo-950/50 p-6 flex items-center justify-between border-b border-indigo-500/20">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-indigo-300">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-base truncate max-w-xs sm:max-w-md">{file.name}</h3>
                      <p className="text-xs text-indigo-300/80">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI parsing</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl"
                    onClick={() => setFile(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="p-6 sm:p-8 space-y-8">
                  {/* Document Type Selector */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-slate-200">
                      <FileType className="w-4 h-4 text-indigo-400" />
                      <Label className="text-sm font-bold tracking-wide">Select Document Classification</Label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {DOCUMENT_TYPES.map((type) => {
                        const isSelected = docType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setDocType(type)}
                            className={`p-3 rounded-xl text-xs font-medium text-left transition-all border ${
                              isSelected 
                                ? "bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-500/20" 
                                : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50"
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Jurisdiction Selector */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-slate-200">
                      <Globe className="w-4 h-4 text-indigo-400" />
                      <Label className="text-sm font-bold tracking-wide">Governing Jurisdiction (Optional)</Label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {JURISDICTIONS.map((jur) => {
                        const isSelected = jurisdiction === jur;
                        return (
                          <button
                            key={jur}
                            type="button"
                            onClick={() => setJurisdiction(jur)}
                            className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all border ${
                              isSelected 
                                ? "bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/20" 
                                : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60"
                            }`}
                          >
                            {jur}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setJurisdiction("Not sure")}
                        className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all border ${
                          jurisdiction === "Not sure" 
                            ? "bg-slate-700 border-slate-500 text-white" 
                            : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Not sure / Multi-state
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Footer Buttons */}
                <div className="p-6 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    onClick={() => setFile(null)} 
                    className="text-slate-400 hover:text-white"
                  >
                    Change File
                  </Button>
                  <Button 
                    onClick={handleUpload} 
                    className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white px-8 h-12 rounded-xl font-semibold shadow-lg shadow-indigo-500/30 border border-indigo-400/20"
                    disabled={!docType}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Decode Document
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Processing State */
          <div className="glass-panel rounded-3xl p-10 sm:p-14 text-center max-w-lg mx-auto shadow-2xl space-y-8">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-28 h-28 bg-indigo-500/20 rounded-full animate-ping opacity-60" />
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/40 relative z-10">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold text-white tracking-tight">{processingStatus}</h3>
              <div className="relative w-full">
                <Progress value={progress} className="h-2.5 bg-slate-900" />
              </div>
              <p className="text-xs text-slate-400">{progress}% completed</p>
            </div>

            {/* Checklist of stages */}
            <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800/80 text-left space-y-3">
              <div className="flex items-center text-xs">
                {progress >= 15 ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-3 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-700 mr-3 shrink-0" />}
                <span className={progress >= 15 ? "text-slate-200 font-medium" : "text-slate-500"}>Secure upload & OCR verification</span>
              </div>
              <div className="flex items-center text-xs">
                {progress >= 30 ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-3 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-700 mr-3 shrink-0" />}
                <span className={progress >= 30 ? "text-slate-200 font-medium" : "text-slate-500"}>Extracting clause hierarchy & parties</span>
              </div>
              <div className="flex items-center text-xs">
                {progress >= 50 ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-3 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-700 mr-3 shrink-0" />}
                <span className={progress >= 50 ? "text-slate-200 font-medium" : "text-slate-500"}>Flagging high-risk asymmetric terms</span>
              </div>
              <div className="flex items-center text-xs">
                {progress >= 75 ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-3 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-700 mr-3 shrink-0" />}
                <span className={progress >= 75 ? "text-slate-200 font-medium" : "text-slate-500"}>Synthesizing plain-English takeaways</span>
              </div>
              <div className="flex items-center text-xs">
                {progress >= 95 ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-3 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-700 mr-3 shrink-0" />}
                <span className={progress >= 95 ? "text-slate-200 font-medium" : "text-slate-500"}>Building comprehensive executive report</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
