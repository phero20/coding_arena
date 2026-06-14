export interface Company {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
}

export interface CompanyProblem {
  problem_id: string;
  difficulty: "Easy" | "Medium" | "Hard";
  title: string;
  slug: string | null;
  frequency: number;
  acceptanceRate: number;
  link: string;
  topics: string[];
  is_premium:boolean;
}

export interface CompanyProblemsResponse {
  company: Company;
  problems: CompanyProblem[];
}
