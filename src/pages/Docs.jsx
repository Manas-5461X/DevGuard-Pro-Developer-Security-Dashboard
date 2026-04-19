import React, { useState, useEffect } from 'react';
import { docsContent } from '../data/docsContent';
import { ChevronRight, ArrowUpCircle } from 'lucide-react';

export default function Docs() {
  const [activeSection, setActiveSection] = useState(docsContent[0].id);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Scroll to top button visibility
      setShowScrollTop(window.scrollY > 500);

      // Scroll Spy logic
      const sectionElements = docsContent.map(s => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 200;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 80, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-12 pb-32 max-w-7xl mx-auto relative px-4">
      {/* Scroll Top Button */}
      {showScrollTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 p-3 bg-cyber-primary text-[#000] rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95"
        >
          <ArrowUpCircle size={24} />
        </button>
      )}

      {/* Sticky Table of Contents */}
      <nav className="hidden lg:block w-72 shrink-0 pt-8">
        <div className="sticky top-8 bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
          <h3 className="text-[#A3A3A3] text-[10px] font-bold tracking-[0.2em] uppercase mb-6 px-4">
            Security Intelligence
          </h3>
          <ul className="flex flex-col gap-1.5">
            {docsContent.map(section => (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 ${
                    activeSection === section.id
                      ? 'bg-cyber-primary text-[#000] shadow-[0_0_20px_rgba(74,222,128,0.15)] translate-x-1'
                      : 'text-[#737373] hover:text-[#F5F5F5] hover:bg-white/5'
                  }`}
                >
                  <span className={activeSection === section.id ? 'text-[#000]' : 'text-cyber-primary/70'}>
                    {section.icon}
                  </span>
                  <span className="truncate">{section.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 pt-8">
        <div className="mb-20 border-b border-[#262626] pb-12">
          <span className="text-cyber-primary text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Knowledge Base 2026</span>
          <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">Security Documentation</h1>
          <p className="text-[#A3A3A3] text-xl leading-relaxed max-w-3xl">
            A comprehensive, industry-grade security encyclopedia covering modern defense mechanisms, 
            threat remediation, and best practices for the full-stack developer.
          </p>
        </div>

        <div className="space-y-40">
          {docsContent.map((chapter, index) => (
            <section id={chapter.id} key={chapter.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center gap-4 mb-10 group">
                <div className="w-12 h-12 rounded-2xl bg-cyber-primary/10 border border-cyber-primary/20 flex items-center justify-center text-cyber-primary group-hover:scale-110 transition-transform">
                  {chapter.icon}
                </div>
                <div>
                  <span className="text-cyber-primary/60 text-[10px] font-bold tracking-widest uppercase mb-1 block">Chapter 0{index + 1}</span>
                  <h2 className="text-3xl font-bold text-[#F5F5F5] tracking-tight">{chapter.title}</h2>
                </div>
              </div>
              
              <p className="text-[#A3A3A3] text-lg mb-12 leading-relaxed italic border-l-2 border-cyber-primary/30 pl-6 py-2">
                {chapter.description}
              </p>

              <div className="space-y-16">
                {chapter.sections.map((sec, sIdx) => (
                  <div key={sIdx} className="prose prose-invert max-w-none text-[#A3A3A3] text-[16px] leading-[1.8]">
                    <h3 className="text-white text-xl font-bold mb-6 flex items-center gap-3">
                      <ChevronRight size={18} className="text-cyber-primary" />
                      {sec.subtitle}
                    </h3>
                    <div className="whitespace-pre-wrap text-[#A3A3A3]">
                      {sec.content}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #262626;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
