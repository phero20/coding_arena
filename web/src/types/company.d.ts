export interface Company {
  id: string;
  name: string;
  imageUrl: string;
}

export interface CompanyProblem {
  problem_id: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  title: string;
  slug: string | null;
  frequency: number;
  acceptanceRate: number;
  link: string;
  topics: string[];
}
