export interface Clause {
  title: string;
  category: string;
  priority: "high" | "review" | "information";
  originalText: string;
  plainEnglish: string;
  whyItMatters: string;
  questions: string[];
  page?: number;
  section?: string;
}

export interface Obligation {
  party: "user" | "other_party";
  description: string;
  deadline?: string;
  sourceClauseId?: string;
}

export interface Deadline {
  description: string;
  date?: string;
  relativePeriod?: string;
  sourceClauseId?: string;
}

export interface DocumentAnalysis {
  summary: string[];
  clauses: Clause[];
  obligations: Obligation[];
  deadlines: Deadline[];
  unclearInformation?: string[];
}
