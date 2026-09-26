"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Scale, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Sign in error:", err);
      const message = err instanceof Error ? err.message : "Failed to sign in with Google.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 font-sans relative selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Background lights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-600/15 blur-[150px] rounded-full" />
        <div className="absolute -bottom-20 right-10 w-[500px] h-[500px] bg-blue-600/10 blur-[160px] rounded-full" />
      </div>

      {/* Top Header */}
      <header className="px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-xs font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted Session</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-md w-full space-y-8">
          
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <Scale className="w-6 h-6" />
              </div>
            </Link>
            
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome to LegalLens
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Sign in to decode contracts and access your document repository
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 border-slate-800 shadow-2xl space-y-6">
            {error && (
              <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl text-center">
                {error}
              </div>
            )}
            
            <Button 
              className="w-full h-13 text-sm font-semibold bg-white hover:bg-slate-100 text-slate-900 rounded-xl shadow-lg transition-all hover:scale-[1.01] flex items-center justify-center" 
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin text-slate-900" />
              ) : (
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              {loading ? "Signing in..." : "Continue with Google"}
            </Button>

            <div className="pt-2 text-center text-[11px] text-slate-500 leading-relaxed border-t border-slate-800/80">
              By proceeding, you agree to LegalLens&apos;s <span className="text-slate-400 underline cursor-pointer">Terms of Service</span> and <span className="text-slate-400 underline cursor-pointer">Privacy Policy</span>.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} LegalLens Intelligence. All rights reserved.
      </footer>
    </div>
  );
}
