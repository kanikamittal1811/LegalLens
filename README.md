# ⚖️ LegalLens — AI Document Intelligence & Contract Analysis

> **Understand what your contracts actually mean before signing.**  
> Transform complex legal jargon, agreements, and notices into crystal-clear plain-English summaries, risk alerts, commitments, and actionable counsel talking points.

---

## ✨ Features

- **⚡ 30-Second Executive Summary**: High-level, jargon-free overview of what the contract accomplishes and who holds leverage.
- **🚨 Red-Flag Risk Radar**: Categorizes clauses by severity (`High Risk`, `Needs Review`, `Standard`) to expose unilateral termination, uncapped indemnities, IP grabs, and auto-renewals.
- **📋 Commitment & Obligation Tracking**: Separates and lists mandatory duties for both parties (User vs Counterparty).
- **📅 Important Dates & Deadlines**: Identifies critical notice periods, renewal windows, milestones, and expiration dates.
- **💼 Questions for Legal Counsel**: Generates ready-to-use questions and talking points with one-click copy for attorney consultations or redlining.
- **📂 Document Repository & Dashboard**: Manage, search, and review all previous contract analyses in a unified workspace.
- **🔒 Privacy First & Encrypted**: Designed with secure processing boundaries and private session handling.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **UI & Icons**: [shadcn/ui](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/)
- **AI Engine**: [Google Gemini 3.1 Flash Lite (`@google/genai`)](https://ai.google.dev/) — Native multimodal PDF & text extraction
- **Database & Auth**: [Firebase Realtime Database](https://firebase.google.com/docs/database) & [Firebase Authentication](https://firebase.google.com/docs/auth)
- **PDF Extraction**: [`unpdf`](https://github.com/unjs/unpdf) & Native Base64 buffer streaming
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js**: `v20+` (or `v22` recommended)
- **npm** / **yarn** / **pnpm**

### 1. Clone the Repository

```bash
git clone https://github.com/kanikamittal1811/LegalLens.git
cd LegalLens
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy the sample environment file:

```bash
cp .env.example .env.local
```

Fill in your API credentials in `.env.local`:

```env
# Google Gemini AI
GOOGLE_GENAI_API_KEY="your-google-gemini-api-key"

# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_DATABASE_URL="https://your-project-default-rtdb.firebaseio.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Firebase Admin (Server-Side)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL="https://your-project-default-rtdb.firebaseio.com/"
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
legallens/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/        # AI document extraction & DB sync route
│   │   │   └── chat/           # Document Q&A assistant route
│   │   ├── dashboard/          # Analyzed document repository
│   │   ├── documents/
│   │   │   ├── [documentId]/   # Deep intelligence report page
│   │   │   └── upload/         # Drag-and-drop document upload flow
│   │   ├── login/              # Authentication page
│   │   ├── globals.css         # Dark legal tech design system & glassmorphism
│   │   ├── layout.tsx          # Font optimization (Plus Jakarta Sans, Playfair, Mono)
│   │   └── page.tsx            # Interactive landing page with live clause explorer
│   ├── components/
│   │   └── ui/                 # Reusable UI component library (shadcn/ui)
│   └── lib/
│       ├── ai/                 # Gemini API client, prompts & schema definitions
│       └── firebase/           # Firebase client & Admin SDK configuration
├── .env.example                # Template for environment variables
└── README.md
```

---

## 🛡️ Legal Disclaimer

*LegalLens is an AI-powered document clarity tool designed for informational and educational purposes only. It does not provide formal legal advice, attorney-client representation, or replace consultation with a licensed legal professional.*

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
