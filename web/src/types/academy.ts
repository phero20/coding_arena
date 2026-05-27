export interface Track {
  slug: string;
  title: string;
  course: boolean;
  num_concepts: number;
  num_exercises: number;
  web_url: string;
  icon_url: string;
  tags: string[];
  last_touched_at: string | null;
  is_new: boolean;
  links: {
    self: string;
    exercises: string;
    concepts: string;
  };
}

export interface TracksResponse {
  tracks: Track[];
}

export interface TrackConfigResponse {
  language: string;
  slug: string;
  active: boolean;
  blurb: string;
  version: number;
  exercises: {
    concept: Array<any>;
    practice: Array<any>;
  };
  concepts: Array<any>;
  key_features?: Array<{
    icon: string;
    title: string;
    content: string;
  }>;
  [key: string]: any; // Allow flexible parsing of other fields for now
}

export interface TrackConceptResponse {
  slug: string;
  name: string;
  introduction: string;
  about: string;
}

export interface TrackExerciseResponse {
  slug: string;
  name: string;
  uuid: string;
  type: string;
  status: string | null;
  blurb?: string;
  difficulty?: number;
  concepts?: string[] | null;
  practices?: string[];
  prerequisites?: string[];
  instructions?: string;
  introduction?: string | null;
  hints?: string | null;
  starter_code?: string;
  example_solution?: string;
  test_code?: string;
  source?: string;
  source_url?: string;
  authors?: string[];
  contributors?: string[] | null;
  [key: string]: any;
}


export interface PracticeExercise {
  slug: string;
  name: string;
  blurb?: string;
  difficulty?: number;
  practices?: string[];
  prerequisites?: string[];
  completed?: boolean;
  iconSrc?: string;
  status?: string;
}

export interface PracticeProblemCardRenderProps {
  langSlug: string;
  slug: string;
  name: string;
  blurb?: string;
  iconSrc?: string;
  difficulty?: number;
  practices?: string[];
  prerequisites?: string[];
  completed?: boolean;
}

export interface PracticeProblemCardProps {
  exercise: PracticeExercise;
  className?: string;
}

export interface TrackExercises {
  concept?: any[];
  practice?: PracticeExercise[];
}

export interface PracticeProblemsSectionProps {
  exercises?: TrackExercises | PracticeExercise[];
  solvedExercises?: string[];
  className?: string;
}

export interface RunAcademyExerciseDto {
  userCode: string;
  testCode: string;
}

export interface TestFailure {
  name: string;
  message: string;
  output?: string;
}

export interface ExerciseRunResult {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  compileError: string | null;
  failures: TestFailure[];
  rawOutput: string;
  isRawExecution?: boolean;
}
