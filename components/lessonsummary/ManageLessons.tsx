"use client";

import React, { useEffect, useState, useCallback } from "react";
import { lessonService } from "@/services/LessonService";
import { Board, Subject, Topic, Module, Lesson } from "@/types/lesson.types";
import {
  Search,
  Edit3,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Loader2,
  Trash2,
  Save,
  X,
  FileText,
  Monitor,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Layers,
  ArrowRight,
  ChevronLeft,
  ListOrdered,
  PlusCircle,
  Check,
  Plus,
  ChevronDown
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ManageLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 8;

  const [boards, setBoards] = useState<Board[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [filters, setFilters] = useState({
    boardid: "",
    subjectid: "",
    status: ""
  });

  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await lessonService.getLessons({ ...filters, page, limit });
      if (res.success) {
        setLessons(res.lessons);
        setTotal(res.total);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  useEffect(() => {
    lessonService.getBoards().then(res => res.success && setBoards(res.boards));
  }, []);

  useEffect(() => {
    if (filters.boardid) {
      lessonService.getSubjectsByBoard(filters.boardid).then(res => res.success && setSubjects(res.subjects));
    } else {
      setSubjects([]);
    }
  }, [filters.boardid]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;

    try {
      setIsUpdating(true);
      const res = await lessonService.updateLesson(editingLesson.seqnumber, editingLesson);
      if (res.success) {
        setLessons(prev => prev.map(l => l.seqnumber === editingLesson.seqnumber ? editingLesson : l));
        setEditingLesson(null);
      }
    } catch (err: any) {
      alert(err.message || "Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === lessons.length && lessons.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(lessons.map(l => l.seqnumber));
    }
  };

  const handleBulkStatusUpdate = async (status: "approved" | "rejected") => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to ${status} ${selectedIds.length} lessons?`)) return;

    try {
      setIsBulkProcessing(true);
      const res = await lessonService.bulkUpdateStatus(selectedIds, status);
      if (res.success) {
        setLessons(prev => prev.map(l =>
          selectedIds.includes(l.seqnumber) ? { ...l, status: status } : l
        ));
        setSelectedIds([]);
      }
    } catch (err: any) {
      alert(err.message || `Bulk ${status} failed`);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col space-y-12">

      {/* Search & Filters Section */}
      <div className="bg-white p-8 rounded-[1.2rem] border border-gray-200 shadow-xl flex flex-wrap items-end gap-6">
        <div className="flex-1 min-w-[240px] space-y-3">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-700 ml-2">Board</label>
          <div className="relative group/select">
            <select
              value={filters.boardid}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, boardid: e.target.value, subjectid: "" }));
                setPage(1);
              }}
              className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-6 h-[64px] text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-[#6265f0]/10 transition-all outline-none appearance-none cursor-pointer pr-14"
            >
              <option value="">All Boards</option>
              {boards.map(b => <option key={b.boardid} value={b.boardid}>{b.boardname}</option>)}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within/select:text-[#6265f0] transition-colors" />
          </div>
        </div>

        <div className="flex-1 min-w-[240px] space-y-3">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-700 ml-2">Subject</label>
          <div className="relative group/select">
            <select
              value={filters.subjectid}
              disabled={!filters.boardid}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, subjectid: e.target.value }));
                setPage(1);
              }}
              className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-6 h-[64px] text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-[#6265f0]/10 transition-all outline-none disabled:opacity-30 appearance-none cursor-pointer pr-14"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s.subjectid} value={s.subjectid}>{s.subjectname}</option>)}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within/select:text-[#6265f0] transition-colors" />
          </div>
        </div>

        <div className="flex-1 min-w-[240px] space-y-3">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-700 ml-2">Current Status</label>
          <div className="relative group/select">
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, status: e.target.value }));
                setPage(1);
              }}
              className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-6 h-[64px] text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-[#6265f0]/10 transition-all outline-none appearance-none cursor-pointer pr-14"
            >
              <option value="">Any Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within/select:text-[#6265f0] transition-colors" />
          </div>
        </div>

        <button
          onClick={() => {
            setFilters({ boardid: "", subjectid: "", status: "" });
            setPage(1);
          }}
          className="h-[64px] px-6 bg-slate-100 border border-slate-200 rounded-2xl hover:bg-slate-200 text-gray-600 hover:text-[#6265f0] transition-all flex items-center justify-center"
          title="Clear Filters"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4 border-l border-slate-200 pl-6 ml-2">
          <button
            onClick={toggleAll}
            className="flex items-center gap-3 px-6 h-[64px] bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-xs font-black uppercase tracking-widest text-slate-600"
          >
            <div className={cn(
              "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
              selectedIds.length === lessons.length && lessons.length > 0
                ? "bg-[#6265f0] border-[#6265f0]"
                : "bg-white border-slate-300"
            )}>
              {selectedIds.length === lessons.length && lessons.length > 0 && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            {selectedIds.length === lessons.length && lessons.length > 0 ? "Deselect All" : "Select Page"}
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-4 bg-[#6265f0]/5 px-6 h-[64px] rounded-2xl border border-[#6265f0]/20 animate-in slide-in-from-left-4 duration-300">
            <span className="text-[10px] font-black text-[#6265f0] uppercase tracking-widest whitespace-nowrap">
              {selectedIds.length} Selected
            </span>
            <div className="h-8 w-px bg-[#6265f0]/20 mx-2" />
            <button
              onClick={() => handleBulkStatusUpdate("approved")}
              disabled={isBulkProcessing}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              {isBulkProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
              Approve
            </button>
            <button
              onClick={() => handleBulkStatusUpdate("rejected")}
              disabled={isBulkProcessing}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              {isBulkProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
              Reject
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-4 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Lesson Directory */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-8">
            <Loader2 className="w-12 h-12 text-[#6265f0] animate-spin" />
            <p className="text-[12px] font-black uppercase tracking-[0.4em] text-gray-600">Synchronizing Repository</p>
          </div>
        ) : lessons.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-[3rem] p-32 text-center shadow-xl">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-base font-black text-slate-500 uppercase tracking-widest">No matching records found</p>
          </div>
        ) : (
          <>
            {lessons.map(lesson => (
              <div
                key={lesson.seqnumber}
                className={cn(
                  "bg-white border rounded-[1.2rem] p-5 hover:border-[#6265f0]/50 transition-all group flex flex-col gap-10 shadow-lg hover:shadow-2xl hover:shadow-[#6265f0]/10 relative overflow-hidden",
                  selectedIds.includes(lesson.seqnumber) ? "border-[#6265f0] bg-[#6265f0]/5" : "border-gray-200"
                )}
              >
                {/* Selection Overlay/Checkbox */}
                <div
                  onClick={() => toggleSelection(lesson.seqnumber)}
                  className="absolute top-8 left-8 z-10 cursor-pointer"
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                    selectedIds.includes(lesson.seqnumber)
                      ? "bg-[#6265f0] border-[#6265f0]"
                      : "bg-white border-slate-300 group-hover:border-slate-400"
                  )}>
                    {selectedIds.includes(lesson.seqnumber) && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>

                <div className="flex flex-col xl:flex-row justify-between gap-10 pl-12">
                  <div className="flex-1 space-y-6">
                    {/* Hierarchy Chips */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 bg-slate-50 py-1.5 rounded-full border border-slate-200">
                        <span className="text-slate-700">{lesson.boardname}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        <span className="text-gray-900">{lesson.subjectname || "General"}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        <span className="text-[#6265f0] font-bold">{lesson.topicname}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        <span className="text-slate-500">{lesson.modulename}</span>
                      </div>
                    </div>

                    <div className="space-y-">
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 font-medium max-w-3xl">
                        {lesson.submodulename}
                      </p>
                    </div>
                  </div>

                  <div className="flex xl:flex-col items-center xl:items-end justify-between gap-2">
                    <span className={cn(
                      "text-[9px] font-black uppercase px-4 py-2 rounded-full border flex items-center gap-2 shadow-sm",
                      lesson.status === "approved" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                        lesson.status === "rejected" ? "bg-red-50 border-red-200 text-red-600" :
                          "bg-amber-50 border-amber-200 text-amber-700"
                    )}>
                      {lesson.status === "approved" ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                        lesson.status === "rejected" ? <XCircle className="w-3.5 h-3.5" /> :
                          <Clock className="w-3.5 h-3.5" />}
                      {lesson.status}
                    </span>

                    <div className="flex items-center gap-3">
                      {/* {lesson.status !== "approved" && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await lessonService.bulkUpdateStatus([lesson.seqnumber], "approved");
                              if (res.success) setLessons(prev => prev.map(l => l.seqnumber === lesson.seqnumber ? { ...l, status: "approved" } : l));
                            } catch (err) {}
                          }}
                          className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all border border-emerald-100"
                          title="Quick Approve"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                      {lesson.status !== "rejected" && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await lessonService.bulkUpdateStatus([lesson.seqnumber], "rejected");
                              if (res.success) setLessons(prev => prev.map(l => l.seqnumber === lesson.seqnumber ? { ...l, status: "rejected" } : l));
                            } catch (err) {}
                          }}
                          className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all border border-red-100"
                          title="Quick Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )} */}
                      <button
                        onClick={() => setEditingLesson(lesson)}
                        className="px-5 py-3 bg-[#6265f0] text-white rounded-[2rem] hover:bg-[#5255d0] transition-all flex items-center gap-4 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#6265f0]/30 group-hover:scale-[1.02] active:scale-[0.98]"
                      >
                        view details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-4 bg-white border border-gray-300 rounded-2xl hover:bg-slate-50 disabled:opacity-20 transition-all text-slate-700 shadow-sm"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "w-12 h-12 rounded-2xl font-black text-sm transition-all border shadow-sm",
                        page === p
                          ? "bg-[#6265f0] text-white border-[#6265f0] shadow-lg shadow-[#6265f0]/30"
                          : "bg-white text-slate-600 border-gray-300 hover:border-[#6265f0]"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-4 bg-white border border-gray-300 rounded-2xl hover:bg-slate-50 disabled:opacity-20 transition-all text-slate-700 shadow-sm"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* View all details Modal */}
      {editingLesson && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-slate-900/40 animate-in fade-in duration-500">
          <div className="bg-white border border-slate-200 w-full max-w-8xl h-[95vh] rounded-[4rem] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

            {/* Modal Header */}
            <div className="px-12 py-10 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-[#6265f0] rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-[#6265f0]/40">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{editingLesson.boardname}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{editingLesson.subjectname}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{editingLesson.topicname}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6265f0] font-bold">{editingLesson.modulename}</span>

                  </div>
                  <h2 className="text-md font-medium text-gray-900 tracking-tight leading-tight max-w-4xl">
                    {editingLesson.submodulename}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setEditingLesson(null)}
                className="p-5 bg-slate-200 hover:bg-slate-300 rounded-full transition-all text-slate-700"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-white">
              <div className="max-w-8xl mx-auto space-y-10 pb-20">

                {/* 00: Specification Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Specification Code</label>
                    <input
                      value={editingLesson.speccode || ""}
                      onChange={(e) => setEditingLesson({ ...editingLesson, speccode: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-6 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-[#6265f0]/10 outline-none transition-all"
                      placeholder="e.g. 3.1.1"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Specification Description</label>
                    <textarea
                      value={editingLesson.specdesc || ""}
                      onChange={(e) => setEditingLesson({ ...editingLesson, specdesc: e.target.value })}
                      className="w-full h-[58px] bg-white border border-slate-200 rounded-xl px-6 py-4 text-sm font-medium text-gray-700 focus:ring-4 focus:ring-[#6265f0]/10 outline-none transition-all resize-none"
                      placeholder="Specification description..."
                    />
                  </div>
                </div>

                {/* 01: Overview Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-1 bg-[#6265f0] rounded-full" />
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#6265f0]">Overview</h4>
                  </div>
                  <textarea
                    value={editingLesson.overview}
                    onChange={(e) => setEditingLesson(prev => prev ? { ...prev, overview: e.target.value } : null)}
                    className="w-full h-38 bg-slate-50 border border-slate-200 rounded-[2rem] p-8 text-base font-medium leading-relaxed focus:bg-white focus:ring-4 focus:ring-[#6265f0]/10 outline-none transition-all text-gray-700 resize-none shadow-inner"
                  />
                </div>

                {/* 02: Key Terms */}
                <div className="space-y-10">
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-100 rounded-2xl"><Lightbulb className="w-6 h-6 text-[#6265f0]" /></div>
                      <h4 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">Key Terms</h4>
                    </div>
                    <button
                      onClick={() => {
                        const newTerms = [...(editingLesson.key_terms || []), { term: "", definition: "" }];
                        setEditingLesson({ ...editingLesson, key_terms: newTerms });
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#6265f0] transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add Term
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {editingLesson.key_terms?.map((term, i) => (
                      <div key={i} className="bg-white border border-slate-200 p-6 rounded-[1.5rem] shadow-sm hover:shadow-xl transition-all group relative">
                        <button
                          onClick={() => {
                            const newTerms = editingLesson.key_terms.filter((_, idx) => idx !== i);
                            setEditingLesson({ ...editingLesson, key_terms: newTerms });
                          }}
                          className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-all hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <input
                          value={term.term}
                          onChange={(e) => {
                            const newTerms = [...editingLesson.key_terms];
                            newTerms[i].term = e.target.value;
                            setEditingLesson({ ...editingLesson, key_terms: newTerms });
                          }}
                          placeholder="Term name..."
                          className="text-base font-black text-[#6265f0] bg-transparent outline-none w-full mb-2 pr-8"
                        />
                        <textarea
                          value={term.definition}
                          onChange={(e) => {
                            const newTerms = [...editingLesson.key_terms];
                            newTerms[i].definition = e.target.value;
                            setEditingLesson({ ...editingLesson, key_terms: newTerms });
                          }}
                          placeholder="Define this term..."
                          className="text-sm font-medium text-slate-600 leading-relaxed bg-transparent outline-none w-full h-20 resize-none border-t border-slate-100 pt-4"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 03: Core Content (Steps & Reasoning) */}
                <div className="space-y-10">
                  <div className="flex flex-row items-center gap-4">
                    <div className="p-3 bg-slate-100 rounded-2xl"><Layers className="w-6 h-6 text-[#6265f0]" /></div>
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">Core Content</h4>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Narrative & Reasoning */}
                    <div className="space-y-10">
                      <div className="bg-slate-50 p-7 rounded-[1.2rem] border border-slate-200 shadow-inner space-y-6">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ">Narrative Summary</label>
                        <textarea
                          value={editingLesson.core_content?.narrative}
                          onChange={(e) => setEditingLesson({ ...editingLesson, core_content: { ...editingLesson.core_content, narrative: e.target.value } })}
                          className="w-full h-48 bg-white border border-slate-200 rounded-xl p-8 text-sm font-medium leading-relaxed outline-none focus:ring-4 focus:ring-[#6265f0]/5 text-slate-700"
                        />
                        <div className="pt-2 space-y-4 ">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reasoning Chain</label>
                          <textarea
                            value={editingLesson.core_content?.reasoningChain}
                            onChange={(e) => setEditingLesson({ ...editingLesson, core_content: { ...editingLesson.core_content, reasoningChain: e.target.value } })}
                            className="w-full h-24 bg-white border border-slate-200 rounded-xl p-6 text-[11px] font-mono leading-relaxed outline-none focus:ring-4 focus:ring-[#6265f0]/5 text-[#6265f0]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Steps & Additional Points */}
                    <div className="space-y-10">
                      <div className="bg-white border border-slate-200 p-7 rounded-[1.2rem] shadow-sm space-y-8">
                        <div className="flex items-center gap-3">
                          <ListOrdered className="w-5 h-5 text-[#6265f0]" />
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-900">Learning Path / Steps</label>
                        </div>
                        <div className="space-y-4">
                          {editingLesson.core_content?.steps?.map((step, i) => (
                            <div key={i} className="flex gap-4">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-black">{i + 1}</span>
                              <textarea
                                value={step}
                                onChange={(e) => {
                                  const newSteps = [...editingLesson.core_content.steps];
                                  newSteps[i] = e.target.value;
                                  setEditingLesson({ ...editingLesson, core_content: { ...editingLesson.core_content, steps: newSteps } });
                                }}
                                className="w-full text-sm font-medium text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-4 outline-none focus:bg-white h-20 resize-none"
                              />
                            </div>
                          ))}
                        </div>
                        {editingLesson.core_content?.additionalPoints && (
                          <div className="pt-6 border-t border-slate-100">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Additional Points</label>
                            {editingLesson.core_content.additionalPoints.map((p, i) => (
                              <textarea
                                key={i}
                                value={p}
                                onChange={(e) => {
                                  const newPts = [...editingLesson.core_content.additionalPoints];
                                  newPts[i] = e.target.value;
                                  setEditingLesson({ ...editingLesson, core_content: { ...editingLesson.core_content, additionalPoints: newPts } });
                                }}
                                className="w-full text-xs font-medium text-slate-500 bg-slate-50 border border-slate-100 rounded-xl p-4 outline-none h-16 resize-none"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 04: Exam Errors */}
                <div className="space-y-10">
                  <div className="flex flex-row items-center gap-4">
                    <div className="p-3 bg-red-50 rounded-2xl"><AlertTriangle className="w-6 h-6 text-red-500" /></div>
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">Common Exam Pitfalls</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {editingLesson.exam_errors?.map((err, i) => (
                      <div key={i} className="bg-white border border-red-100 p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all space-y-6">
                        <div className="space-y-2">
                          <p className="text-[11px] font-black text-red-400 uppercase tracking-widest">Wrong Phrasing</p>
                          <textarea
                            value={err.wrongPhrasing}
                            onChange={(e) => {
                              const newErrs = [...editingLesson.exam_errors];
                              newErrs[i].wrongPhrasing = e.target.value;
                              setEditingLesson({ ...editingLesson, exam_errors: newErrs });
                            }}
                            className="w-full h-14 text-sm font-bold text-center text-slate-700 bg-red-50/30 border border-red-50 rounded-xl p-4 outline-none resize-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Why it's wrong</p>
                          <textarea
                            value={err.whyWrong}
                            onChange={(e) => {
                              const newErrs = [...editingLesson.exam_errors];
                              newErrs[i].whyWrong = e.target.value;
                              setEditingLesson({ ...editingLesson, exam_errors: newErrs });
                            }}
                            className="w-full text-xs font-medium text-slate-500 bg-transparent outline-none h-14 resize-none"
                          />
                        </div>
                        <div className=" border-t border-slate-50">
                          <p className="text-[12px] font-black text-emerald-500 uppercase tracking-widest mb-2">Correct Phrasing</p>
                          <textarea
                            value={err.correctPhrasing}
                            onChange={(e) => {
                              const newErrs = [...editingLesson.exam_errors];
                              newErrs[i].correctPhrasing = e.target.value;
                              setEditingLesson({ ...editingLesson, exam_errors: newErrs });
                            }}
                            className="w-full text-sm font-bold text-emerald-700 bg-emerald-50/30 border border-emerald-50 rounded-xl p-4 outline-none h-20 resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 05: Assessment Questions */}
                <div className="space-y-10">
                  <div className="flex flex-row items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-2xl"><HelpCircle className="w-6 h-6 text-emerald-600" /></div>
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">Assessment Questions</h4>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {editingLesson.quick_check_qs?.map((q, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-200 p-10 rounded-[3rem] shadow-inner space-y-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-[#6265f0] text-white flex items-center justify-center font-black text-xs">Q</span>
                            <textarea
                              value={q.question}
                              onChange={(e) => {
                                const newQs = [...editingLesson.quick_check_qs];
                                newQs[i].question = e.target.value;
                                setEditingLesson({ ...editingLesson, quick_check_qs: newQs });
                              }}
                              className="w-full text-base font-bold text-gray-900 bg-white border border-slate-200 rounded-2xl p-6 outline-none shadow-sm h-32"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#6265f0]">Mark Scheme Answers</p>
                          {q.markSchemeAnswer.map((ans, j) => (
                            <div key={j} className="flex gap-4">
                              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
                              <textarea
                                value={ans}
                                onChange={(e) => {
                                  const newQs = [...editingLesson.quick_check_qs];
                                  newQs[i].markSchemeAnswer[j] = e.target.value;
                                  setEditingLesson({ ...editingLesson, quick_check_qs: newQs });
                                }}
                                className="w-full text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl p-4 outline-none h-20 resize-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 06: Status Management (Moved to Last) */}
                <div className="bg-slate-50 p-12 rounded-[3.5rem] border border-slate-200 shadow-inner space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-1 bg-slate-900 rounded-full" />
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">Final Status</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {["pending", "approved", "rejected"].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setEditingLesson({ ...editingLesson, status: s as any })}
                        className={cn(
                          "py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] border transition-all flex flex-col items-center gap-4",
                          editingLesson.status === s
                            ? "bg-slate-900 text-white border-slate-900 shadow-2xl scale-[1.02]"
                            : "bg-white border-slate-200 text-slate-400 hover:bg-slate-100"
                        )}
                      >
                        {s === "approved" ? <CheckCircle2 className={cn("w-6 h-6", editingLesson.status === s ? "text-emerald-400" : "text-slate-200")} /> :
                          s === "rejected" ? <XCircle className={cn("w-6 h-6", editingLesson.status === s ? "text-red-400" : "text-slate-200")} /> :
                            <Clock className={cn("w-6 h-6", editingLesson.status === s ? "text-amber-400" : "text-slate-200")} />}
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer (Sticky Controls) */}
            <div className="p-10 border-t border-slate-200 flex items-center justify-end bg-slate-50">
              <div className="flex items-center gap-4">
                <button onClick={() => setEditingLesson(null)} className="px-10 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 hover:bg-slate-200 transition-all">Dismiss Changes</button>
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="px-14 py-5 bg-[#6265f0] text-white rounded-[2rem] font-bold uppercase tracking-[0.3em] text-xs shadow-2xl shadow-[#6265f0]/30 flex items-center gap-4 hover:bg-[#5255d0] transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {isUpdating ? "Syncing..." : "Finalize Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
