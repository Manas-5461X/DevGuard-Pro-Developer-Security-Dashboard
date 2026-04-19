import React, { useState, useEffect, useRef, useCallback } from 'react';
import { docsContent } from '../data/docsContent.jsx';
import { ChevronRight, ArrowUp, BookOpen, Menu, X } from 'lucide-react';

export default function Docs() {
  const [activeSection, setActiveSection] = useState(docsContent[0].id);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const contentRef = useRef(null);
  const sectionRefs = useRef({});

  // Handle scroll for both scroll-spy and back-to-top button
  const handleScroll = useCallback(() => {
    const container = contentRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    setShowScrollTop(scrollTop > 400);

    // Find the section currently in view
    let currentActive = docsContent[0].id;
    for (const section of docsContent) {
      const el = sectionRefs.current[section.id];
      if (el) {
        const { top } = el.getBoundingClientRect();
        const containerTop = container.getBoundingClientRect().top;
        const relativeTop = top - containerTop;
        if (relativeTop <= 160) {
          currentActive = section.id;
        }
      }
    }
    setActiveSection(currentActive);
  }, []);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToSection = useCallback((id) => {
    const el = sectionRefs.current[id];
    const container = contentRef.current;
    if (el && container) {
      const containerTop = container.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      const scrollOffset = container.scrollTop + (elTop - containerTop) - 100;
      container.scrollTo({ top: scrollOffset, behavior: 'smooth' });
      setActiveSection(id);
      setMobileTocOpen(false);
    }
  }, []);

  const scrollToTop = useCallback(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="flex gap-0 h-full -m-4 md:-m-8">

      {/* Mobile TOC overlay */}
      {mobileTocOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileTocOpen(false)}
        />
      )}

      {/* Sidebar TOC — desktop sticky, mobile overlay */}
      <nav className={`
        fixed top-0 left-0 h-full z-50 w-72 bg-[#0A0A0A] border-r border-[#1A1A1A] flex flex-col transition-transform duration-300
        lg:static lg:translate-x-0 lg:z-auto lg:h-auto lg:flex-shrink-0
        ${mobileTocOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-cyber-primary" />
            <span className="text-white font-semibold text-sm">Documentation</span>
          </div>
          <button
            onClick={() => setMobileTocOpen(false)}
            className="lg:hidden text-[#737373] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-3 px-3">
          <ul className="space-y-0.5">
            {docsContent.map((section, idx) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-cyber-primary/10 text-cyber-primary'
                      : 'text-[#737373] hover:text-[#E5E5E5] hover:bg-white/5'
                  }`}
                >
                  <span className={`shrink-0 ${activeSection === section.id ? 'text-cyber-primary' : 'text-[#525252]'}`}>
                    {section.icon}
                  </span>
                  <span className="truncate leading-snug">{section.title}</span>
                  {activeSection === section.id && (
                    <span className="ml-auto w-1.5 h-1.5 bg-cyber-primary rounded-full shrink-0" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="px-5 py-4 border-t border-[#1A1A1A]">
          <p className="text-[#404040] text-[10px] tracking-widest uppercase">
            {docsContent.length} Chapters · DevGuard Security Encyclopedia
          </p>
        </div>
      </nav>

      {/* Main content — this is the scrollable container */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        {/* Page header */}
        <div className="sticky top-0 z-20 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#1A1A1A] px-6 md:px-10 py-4 flex items-center gap-4">
          <button
            onClick={() => setMobileTocOpen(true)}
            className="lg:hidden flex items-center gap-2 text-[#737373] hover:text-white transition-colors text-sm"
          >
            <Menu size={16} />
            <span>Chapters</span>
          </button>
          <div className="hidden lg:flex items-center gap-2 text-[#737373] text-xs">
            <BookOpen size={14} className="text-cyber-primary" />
            <span>DevGuard Security Encyclopedia</span>
            <span className="text-[#303030]">·</span>
            <span className="text-cyber-primary font-medium">{docsContent.find(s => s.id === activeSection)?.title}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {showScrollTop && (
              <button
                onClick={scrollToTop}
                className="flex items-center gap-1.5 text-[#737373] hover:text-cyber-primary transition-colors text-[11px]"
              >
                <ArrowUp size={14} />
                <span className="hidden sm:inline">Top</span>
              </button>
            )}
          </div>
        </div>

        {/* Document content */}
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 pb-40">
          {/* Hero */}
          <div className="mb-16">
            <span className="text-cyber-primary text-[10px] font-bold tracking-[0.3em] uppercase mb-3 block">
              Security Intelligence Platform · 2026
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
              Security Documentation
            </h1>
            <p className="text-[#737373] text-lg leading-relaxed max-w-2xl">
              A comprehensive, production-grade security encyclopedia. From OWASP Top 10 to Zero Trust Architecture, 
              every concept you need to build and maintain secure applications.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              {['8 Chapters', '30+ Sections', 'OWASP Aligned', 'DevSecOps Ready'].map(tag => (
                <span key={tag} className="text-[11px] text-[#737373] bg-[#121212] border border-[#262626] px-3 py-1.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Chapters */}
          <div className="space-y-32">
            {docsContent.map((chapter, chapterIdx) => (
              <div
                key={chapter.id}
                id={chapter.id}
                ref={el => sectionRefs.current[chapter.id] = el}
              >
                {/* Chapter header */}
                <div className="flex items-start gap-4 mb-10">
                  <div className="w-10 h-10 rounded-xl bg-cyber-primary/10 border border-cyber-primary/20 flex items-center justify-center text-cyber-primary shrink-0 mt-1">
                    {chapter.icon}
                  </div>
                  <div>
                    <span className="text-[#525252] text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5 block">
                      Chapter {String(chapterIdx + 1).padStart(2, '0')}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                      {chapter.title}
                    </h2>
                    <p className="text-[#737373] text-sm mt-2 leading-relaxed">
                      {chapter.description}
                    </p>
                  </div>
                </div>

                <div className="border-l-2 border-[#1A1A1A] ml-5 pl-8 space-y-14">
                  {chapter.sections.map((sec, secIdx) => (
                    <div key={secIdx}>
                      <div className="flex items-center gap-2 mb-4">
                        <ChevronRight size={16} className="text-cyber-primary shrink-0" />
                        <h3 className="text-white text-lg font-bold tracking-tight">
                          {sec.subtitle}
                        </h3>
                      </div>
                      <div className="text-[#A3A3A3] text-[15px] leading-[1.9] whitespace-pre-wrap">
                        {sec.content}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chapter divider */}
                {chapterIdx < docsContent.length - 1 && (
                  <div className="mt-16 flex items-center gap-4">
                    <div className="flex-1 h-px bg-[#1A1A1A]" />
                    <span className="text-[#303030] text-[10px] tracking-widest uppercase">End of Chapter {chapterIdx + 1}</span>
                    <div className="flex-1 h-px bg-[#1A1A1A]" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-32 text-center border-t border-[#1A1A1A] pt-12">
            <p className="text-[#404040] text-sm">
              DevGuard Pro Security Encyclopedia · {new Date().getFullYear()}
            </p>
            <p className="text-[#303030] text-xs mt-2">
              Documentation covers industry standards including OWASP Top 10, NIST CSF, ISO 27001 & CWE/SANS Top 25
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
