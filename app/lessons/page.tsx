"use client";

import GenerateForm from '@/components/lessonsummary/GenerateForm';
import ManageLessons from '@/components/lessonsummary/ManageLessons';

const LessonsPage = () => {
  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 font-sans selection:bg-[#6265f0] selection:text-white pb-32">
      <div className="max-w-[1400px] mx-auto px-10 py-16 space-y-24">
        <section className="space-y-10">
          <GenerateForm />
        </section>
        <section className="space-y-10">
          <div className="flex items-center gap-4 px-2">
            <h2 className="text-2xl font-black  text-[#6265f0]">Manage Lesson Summary</h2>
          </div>
          <ManageLessons />
        </section>
      </div>

      {/* Global css */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: #f1f5f9;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 20px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6265f0;
          border: 2px solid transparent;
          background-clip: content-box;
        }

        /* Smooth tab animations */
        .animate-in {
          animation-duration: 500ms;
        }
      `}</style>
    </div>
  );
};

export default LessonsPage;