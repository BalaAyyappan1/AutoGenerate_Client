"use client";

import React, { useState, useEffect } from 'react';
import { lessonService } from '@/services/LessonService';
import { Board, Subject, Topic, Module } from '@/types/lesson.types';
import { 
  ChevronRight, 
  Check, 
  Monitor, 
  BookOpen, 
  Layers, 
  Zap, 
  Loader2, 
  ArrowLeft,
  Settings2,
  Sparkles
} from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


const GenerateForm = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [modules, setModules] = useState<Module[]>([]);

  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const [loading, setLoading] = useState<{ [key: string]: boolean }>({
    initial: true,
    subjects: false,
    topics: false,
    modules: false,
    generating: false
  });

  const [step, setStep] = useState(1);
  const [generateResult, setGenerateResult] = useState<any>(null);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const result = await lessonService.getBoards();
        if (result.success) setBoards(result.boards);
      } catch (error) {
        console.error('Failed to fetch boards:', error);
      } finally {
        setLoading(prev => ({ ...prev, initial: false }));
      }
    };
    fetchBoards();
  }, []);

  const handleBoardSelect = async (board: Board) => {
    setSelectedBoard(board);
    setSelectedSubject(null);
    setSelectedTopic(null);
    setSelectedModule(null);
    setStep(2);
    setLoading(prev => ({ ...prev, subjects: true }));
    try {
      const res = await lessonService.getSubjectsByBoard(board.boardid);
      if (res.success) setSubjects(res.subjects);
    } catch (err) {
    } finally {
      setLoading(prev => ({ ...prev, subjects: false }));
    }
  };

  const handleSubjectSelect = async (subject: Subject) => {
    if (!selectedBoard) return;
    setSelectedSubject(subject);
    setSelectedTopic(null);
    setSelectedModule(null);
    setStep(3);
    setLoading(prev => ({ ...prev, topics: true }));
    try {
      const res = await lessonService.getTopicsBySubjectAndBoard(selectedBoard.boardid, subject.subjectid);
      if (res.success) setTopics(res.topics);
    } catch (err) {
    } finally {
      setLoading(prev => ({ ...prev, topics: false }));
    }
  };

  const handleTopicSelect = async (topic: Topic) => {
    setSelectedTopic(topic);
    setSelectedModule(null);
    setStep(4);
    setLoading(prev => ({ ...prev, modules: true }));
    try {
      const res = await lessonService.getModulesByTopic(topic.topicid);
      if (res.success) setModules(res.modules);
    } catch (err) {
    } finally {
      setLoading(prev => ({ ...prev, modules: false }));
    }
  };

  const handleGenerate = async () => {
    if (!selectedModule) return;
    setLoading(prev => ({ ...prev, generating: true }));
    try {
      const res = await lessonService.generateByModule({ moduleid: selectedModule.moduleid });
      setGenerateResult(res);
      setStep(5);
    } catch (err: any) {
      alert(err.message || "Generation failed");
    } finally {
      setLoading(prev => ({ ...prev, generating: false }));
    }
  };

  const resetFrom = (toStep: number) => {
    if (toStep <= 1) setSelectedBoard(null);
    if (toStep <= 2) setSelectedSubject(null);
    if (toStep <= 3) setSelectedTopic(null);
    if (toStep <= 4) setSelectedModule(null);
    setGenerateResult(null);
    setStep(toStep);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[3.5rem] overflow-hidden shadow-2xl shadow-slate-200/50">
      
      {/* Premium Header */}
      <div className="p-10 bg-slate-50 border-b border-slate-200 flex items-center justify-between"> 
         <h2 className="text-2xl font-black  text-[#6265f0]">Generate Lessons Summary</h2>
        {/* Step Indicator */}
        <div className="hidden md:flex items-end gap-2">
           {[1,2,3,4].map(s => (
             <div 
               key={s} 
               className={cn(
                 "w-10 h-2 rounded-full transition-all duration-500",
                 step >= s ? "bg-[#6265f0]" : "bg-slate-200"
               )} 
             />
           ))}
        </div>
      </div>

      <div className="p-12 bg-white/40">
        {/* Breadcrumb Progress */}
        {(selectedBoard || selectedSubject || selectedTopic || selectedModule) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Board', val: selectedBoard?.boardname, step: 1, icon: Monitor },
              { label: 'Subject', val: selectedSubject?.subjectname, step: 2, icon: BookOpen },
              { label: 'Topic', val: selectedTopic?.topicname, step: 3, icon: Layers },
              { label: 'Module', val: selectedModule?.modulename, step: 4, icon: Settings2 }
            ].map((item, i) => (
              item.val ? (
                <div key={i} className="bg-white/40 border border-slate-200 p-6 rounded-[1.5rem] relative group animate-in zoom-in-95 duration-300 shadow-md">
                  <button 
                    onClick={() => resetFrom(item.step)}
                    className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-all bg-slate-100 hover:bg-[#6265f0] hover:text-white rounded-lg text-slate-600"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 mb-3">
                    <item.icon className="w-4 h-4 text-[#6265f0]" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#6265f0]">{item.label}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 truncate pr-8">{item.val}</p>
                </div>
              ) : null
            ))}
          </div>
        )}

        {/* Selection Area */}
        <div className="min-h-[350px]">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {boards.map(b => (
                  <button 
                    key={b.boardid}
                    onClick={() => handleBoardSelect(b)}
                    className="flex items-center justify-between p-5 rounded-[1.2rem] bg-white/60 border border-[#000000]/30 hover:border-[#6265f0] hover:shadow-2xl hover:shadow-[#6265f0]/10 transition-all group text-left"
                  >
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-[#6265f0] transition-colors text-xl leading-tight">{b.boardname}</p>
                      
                    </div>
                    <div className="p-2 bg-slate-100 rounded-2xl group-hover:bg-[#6265f0] group-hover:text-white transition-all text-slate-600">
                       <ChevronRight className="w-6 h-6" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {loading.subjects ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                   <Loader2 className="animate-spin text-[#6265f0] w-12 h-12" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Subjects...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {subjects.map(s => (
                    <button 
                      key={s.subjectid}
                      onClick={() => handleSubjectSelect(s)}
                      className="flex items-center justify-between p-5 rounded-[1.2rem] bg-white/60 border border-[#000000]/30 hover:border-[#6265f0] hover:shadow-2xl hover:shadow-[#6265f0]/10 transition-all group text-left"
                    >
                      <span className="font-bold text-gray-900 group-hover:text-[#6265f0] transition-colors text-xl leading-tight">{s.subjectname}</span>
                      <div className="p-2 bg-slate-100 rounded-2xl group-hover:bg-[#6265f0] group-hover:text-white transition-all text-slate-600">
                         <ChevronRight className="w-6 h-6" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {loading.topics ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                   <Loader2 className="animate-spin text-[#6265f0] w-12 h-12" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Topics...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-6 custom-scrollbar">
                  {topics.map(t => (
                    <button 
                      key={t.topicid}
                      onClick={() => handleTopicSelect(t)}
                      className="flex items-center justify-between p-5 rounded-[1.2rem] bg-white/60 border border-[#000000]/30 hover:border-[#6265f0] hover:shadow-2xl hover:shadow-[#6265f0]/10 transition-all group text-left"
                    >
                      <span className="font-bold text-gray-900 group-hover:text-[#6265f0] transition-colors text-lg">{t.topicname}</span>
                      <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-[#6265f0]" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {loading.modules ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                   <Loader2 className="animate-spin text-[#6265f0] w-12 h-12" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Modules...</p>
                </div>
              ) : (
                <div className="space-y-12">
                   <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-6 custom-scrollbar">
                     {modules.map(m => (
                       <button 
                         key={m.moduleid}
                         onClick={() => setSelectedModule(m)}
                         className={cn(
                           "flex items-center justify-between p-5 rounded-[1.2rem] border transition-all group text-left bg-white/60",
                           selectedModule?.moduleid === m.moduleid 
                             ? "border-[#6265f0] shadow-xl shadow-[#6265f0]/10" 
                             : "border-[#000000]/30 hover:border-[#6265f0]"
                         )}
                       >
                         <span className={cn(
                           "font-bold text-lg",
                           selectedModule?.moduleid === m.moduleid ? "text-[#6265f0]" : "text-gray-900"
                         )}>{m.modulename}</span>
                         <Check className={cn(
                           "w-6 h-6 transition-all",
                           selectedModule?.moduleid === m.moduleid ? "text-[#6265f0] opacity-100" : "opacity-0"
                         )} />
                       </button>
                     ))}
                   </div>

                   <button 
                     onClick={handleGenerate}
                     disabled={!selectedModule || loading.generating}
                     className="w-full py-7 bg-[#6265f0] text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] shadow-2xl shadow-[#6265f0]/30 hover:bg-[#5255d0] transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-4"
                   >
                     {loading.generating ? (
                       <Loader2 className="w-6 h-6 animate-spin" />
                     ) : (
                       <Sparkles className="w-6 h-6" />
                     )}
                     {loading.generating ? "Generating Lessons..." : "Generate Lessons"}
                   </button>
                </div>
              )}
            </div>
          )}

          {step === 5 && generateResult && (
            <div className="py-20 text-center space-y-10 animate-in zoom-in-95 duration-500">
               <div className="w-32 h-32 bg-emerald-50 rounded-[3rem] flex items-center justify-center mx-auto border-4 border-emerald-100 shadow-2xl shadow-emerald-500/10">
                  <Check className="w-16 h-16 text-emerald-500" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-4xl font-black text-gray-900 tracking-tight">Generation Complete</h3>
                  <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto leading-relaxed">
                    The AI has successfully created the lessons for the selected module.
                  </p>
               </div>
               <div className="flex items-center justify-center gap-6 pt-10">
                  <button onClick={() => resetFrom(1)} className="px-12 py-5 border-2 border-slate-200 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] text-slate-600 hover:bg-slate-50 transition-all">New Generation</button>
                  <button onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })} className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all">View Records</button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateForm;