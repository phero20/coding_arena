import { mongoose } from '../mongo/connection';

export type SubmissionStatus = 
  | 'ACCEPTED' 
  | 'WRONG_ANSWER' 
  | 'TLE' 
  | 'RUNTIME_ERROR' 
  | 'COMPILATION_ERROR'
  | 'SYSTEM_ERROR' 
  | 'PENDING' 
  | 'RUNNING';

export interface Submission {
  id: string;
  problemId: string;
  userId: string;
  languageId: string;
  sourceCode: string;
  status: SubmissionStatus;
  error?: string;
  time?: number;
  memory?: number;
  details?: any;
  arenaMatchId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubmissionInput {
  problemId: string;
  userId: string;
  languageId: string;
  sourceCode: string;
  status?: SubmissionStatus;
  arenaMatchId?: string;
}

export interface UpdateSubmissionInput {
  status?: SubmissionStatus;
  error?: string;
  time?: number;
  memory?: number;
  details?: any;
}
