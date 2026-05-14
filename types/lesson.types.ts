
// ── Types ──────────────────────────────────────────────────────────────────

export interface LessonSummary {
  overview: string;
  keyTerms: { term: string; definition: string }[];
  coreContent: {
    narrative: string;
    steps: string[];
    reasoningChain: string;
    additionalPoints: string[];
  };
  commonExamErrors: {
    wrongPhrasing: string;
    whyWrong: string;
    correctPhrasing: string;
  }[];
  quickCheckQuestions: {
    question: string;
    markSchemeAnswer: string[];
  }[];
}

export interface Lesson {
  seqnumber: number;
  submoduleid: string;
  moduleid: string;
  topicid: string;
  boardid: string;
  boardname?: string;
  subjectname?: string;
  topicname: string;
  modulename: string;
  submodulename?: string;
  speccode: string;
  specdesc: string;
  overview: string;
  key_terms: { term: string; definition: string }[];
  core_content: LessonSummary["coreContent"];
  exam_errors: LessonSummary["commonExamErrors"];
  quick_check_qs: LessonSummary["quickCheckQuestions"];
  status: "pending" | "approved" | "rejected";
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  rejected_by?: string;
  rejection_reason?: string;
}

export interface GenerateBySubmodulePayload {
  submoduleid: string;
}

export interface GenerateByModulePayload {
  moduleid: string;
}

export interface GenerateResult {
  success: boolean;
  type?: "ai-generated" | "already-exists";
  status?: string;
  insertedCount?: number;
  topicname?: string;
  modulename?: string;
  submodulename?: string;
  speccode?: string;
  lessonSummary?: LessonSummary;
  message?: string;
}

export interface BulkGenerateResult {
  success: boolean;
  moduleid: string;
  summary: {
    total: number;
    generated: number;
    skipped: number;
    failed: number;
  };
  generated: {
    submoduleid: string;
    submodulename: string;
    speccode: string;
    topicname: string;
    modulename: string;
    lessonSummary: LessonSummary;
  }[];
  skipped: { submoduleid: string; submodulename: string; reason: string }[];
  failed: { submoduleid: string; submodulename: string; reason: string }[];
}

export interface PendingLessonsResult {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  lessons: Lesson[];
}

export interface ApprovePayload {
  approved_by: string;
}

export interface RejectPayload {
  rejected_by: string;
  rejection_reason?: string;
}

export interface Board {
  seqnumber: number;
  boardid: string;
  programid: string;
  boardname: string;
}

export interface Subject {
  seqnumber: number;
  subjectid: string;
  programid: string;
  subjectname: string;
  hasexception: string;
  color?: string;
}

export interface Topic {
  seqnumber: number;
  topicid: string;
  programid: string;
  subjectid: string;
  boardid: string;
  topicname: string;
  hasexception: string;
}

export interface Module {
  seqnumber: number;
  moduleid: string;
  topicid: string;
  modulename: string;
  hasexception: string;
  topicname?: string;
}

export interface Submodule {
  seqnumber: number;
  submoduleid: string;
  moduleid: string;
  speccode: string;
  submodulename: string;
  modulename?: string;
  topicname?: string;
  boardname?: string;
}

export interface BoardsResult {
  success: boolean;
  boards: Board[];
}

export interface SubjectsResult {
  success: boolean;
  subjects: Subject[];
}

export interface TopicsResult {
  success: boolean;
  topics: Topic[];
}

export interface ModulesResult {
  success: boolean;
  modules: Module[];
}

export interface SubmodulesResult {
  success: boolean;
  submodules: Submodule[];
}
