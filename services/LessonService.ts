import { GenerateBySubmodulePayload, GenerateResult, GenerateByModulePayload, BulkGenerateResult, PendingLessonsResult, Lesson, ApprovePayload, RejectPayload, TopicsResult, ModulesResult, SubmodulesResult, BoardsResult, SubjectsResult } from "@/types/lesson.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ── Helpers

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const contentType = res.headers.get("content-type");
  let data: any;

  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    throw new Error(`Expected JSON but received ${contentType || "text"}. Status: ${res.status}. Body: ${text.slice(0, 100)}...`);
  }

  if (!res.ok) {
    throw new Error(data?.message || `API error ${res.status}`);
  }

  return data as T;
}

// ── Service ────────────────────────────────────────────────────────────────

export const lessonService = {

  // POST /ai-lesson/generate
  generateBySubmodule: (payload: GenerateBySubmodulePayload) =>
    apiFetch<GenerateResult>("/ai-lesson/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // POST /ai-lesson/generate-by-module
  generateByModule: (payload: GenerateByModulePayload) =>
    apiFetch<BulkGenerateResult>("/ai-lesson/generate-by-module", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // GET /ai-lesson/pending
  getPendingLessons: () =>
    apiFetch<PendingLessonsResult>("/ai-lesson/pending"),

  // GET /ai-lesson/lesson/:submoduleid?status=approved
  getLessonSummary: (submoduleid: string, status = "approved") =>
    apiFetch<{ success: boolean; lesson: Lesson }>(
      `/ai-lesson/lesson/${submoduleid}?status=${status}`
    ),

  // PATCH /ai-lesson/approve/:submoduleid
  approveLesson: (submoduleid: string, payload: ApprovePayload) =>
    apiFetch<{ success: boolean; message: string }>(
      `/ai-lesson/approve/${submoduleid}`,
      { method: "PATCH", body: JSON.stringify(payload) }
    ),

  // PATCH /ai-lesson/reject/:submoduleid
  rejectLesson: (submoduleid: string, payload: RejectPayload) =>
    apiFetch<{ success: boolean; message: string }>(
      `/ai-lesson/reject/${submoduleid}`,
      { method: "PATCH", body: JSON.stringify(payload) }
    ),

  // GET /ai-lesson/lessons (with filters)
  getLessons: (filters: { boardid?: string; subjectid?: string; topicid?: string; moduleid?: string; status?: string; page?: number; limit?: number } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.append(key, val.toString());
    });
    return apiFetch<PendingLessonsResult>(`/ai-lesson/lessons?${params.toString()}`);
  },

  // PATCH /ai-lesson/update/:seqnumber
  updateLesson: (seqnumber: number, payload: Partial<Lesson>) =>
    apiFetch<{ success: boolean; message: string }>(
      `/ai-lesson/update/${seqnumber}`,
      { method: "PATCH", body: JSON.stringify(payload) }
    ),

  // PATCH /ai-lesson/bulk-status-update
  bulkUpdateStatus: (seqnumbers: number[], status: 'approved' | 'rejected' | 'pending') =>
    apiFetch<{ success: boolean; message: string; count: number }>(
      "/ai-lesson/bulk-status-update",
      { method: "PATCH", body: JSON.stringify({ seqnumbers, status }) }
    ),

  // ── Curriculum
  getBoards: () =>
    apiFetch<BoardsResult>("/curriculum/boards"),

  getSubjectsByBoard: (boardid: string) =>
    apiFetch<SubjectsResult>(`/curriculum/subjects/${boardid}`),

  getTopicsBySubjectAndBoard: (boardid: string, subjectid: string) =>
    apiFetch<TopicsResult>(`/curriculum/topics/${boardid}/${subjectid}`),

  getTopicsByBoard: (boardid: string) =>
    apiFetch<TopicsResult>(`/curriculum/topics-by-board/${boardid}`),

  getModulesByTopic: (topicid: string) =>
    apiFetch<ModulesResult>(`/curriculum/modules/${topicid}`),

  getSubmodulesByModule: (moduleid: string) =>
    apiFetch<SubmodulesResult>(`/curriculum/submodules/${moduleid}`),
};