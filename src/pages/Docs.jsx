import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { docsContent } from '../data/docsContent.jsx';
import { BookOpen, Copy, Check, ChevronRight, ArrowUp, Menu, X } from 'lucide-react';

// Code block with copy button
function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const lang = className?.replace('language-', '') || 'code';
  const code = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-5 rounded-xl overflow-hidden border border-cyber-border">
      <div className="flex items-center justify-between px-4 py-2 bg-cyber-bg border-b border-cyber-border">
        <span className="text-[10px] font-mono text-cyber-primary/70 uppercase tracking-widest">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-cyber-dark-text hover:text-cyber-primary transition-colors text-[11px]"
        >
          {copied ? <><Check size={12} className="text-cyber-primary" /> Copied!</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      <pre className="bg-cyber-surface p-4 overflow-x-auto text-[13px] leading-relaxed text-cyber-text font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Markdown components config
const mdComponents = {
  code({ node, inline, className, children, ...props }) {
    if (inline) {
      return (
        <code className="bg-cyber-bg border border-cyber-border text-cyber-primary text-[12px] px-1.5 py-0.5 rounded font-mono" {...props}>
          {children}
        </code>
      );
    }
    return <CodeBlock className={className}>{children}</CodeBlock>;
  },
  h1: ({ children }) => <h1 className="text-2xl font-bold text-cyber-text mb-4 mt-8 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="text-xl font-bold text-cyber-text mb-3 mt-8 flex items-center gap-2 border-b border-cyber-border pb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-bold text-cyber-text mb-2 mt-5">{children}</h3>,
  h4: ({ children }) => <h4 className="text-sm font-bold text-cyber-primary/90 mb-2 mt-4 uppercase tracking-wider">{children}</h4>,
  p: ({ children }) => <p className="text-cyber-dark-text text-[14px] leading-[1.85] mb-3">{children}</p>,
  ul: ({ children }) => <ul className="space-y-1.5 mb-4 ml-1">{children}</ul>,
  ol: ({ children }) => <ol className="space-y-1.5 mb-4 ml-1 list-decimal list-inside">{children}</ol>,
  li: ({ children }) => (
    <li className="flex items-start gap-2.5 text-cyber-dark-text text-[14px] leading-relaxed">
      <span className="w-1.5 h-1.5 rounded-full bg-cyber-primary/60 shrink-0 mt-2" />
      <span className="list-none">{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-cyber-primary/40 pl-5 py-2 my-6 bg-cyber-primary/5 rounded-r-xl border-dashed">
      <div className="text-cyber-text text-[15px] italic leading-relaxed opacity-90">{children}</div>
    </blockquote>
  ),
  strong: ({ children }) => <strong className="text-cyber-text font-bold bg-cyber-primary/5 px-1 rounded">{children}</strong>,
  em: ({ children }) => <em className="text-cyber-primary/95 not-italic font-medium border-b border-cyber-primary/30">{children}</em>,
  hr: () => <hr className="border-cyber-border my-8" />,
  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyber-primary hover:underline">{children}</a>,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="text-left px-4 py-2 border border-cyber-border bg-cyber-bg text-cyber-text font-semibold text-xs uppercase tracking-wider">{children}</th>,
  td: ({ children }) => <td className="px-4 py-2 border border-cyber-border text-cyber-dark-text text-[13px]">{children}</td>,
};

export default function Docs() {
  const [activeSection, setActiveSection] = useState(docsContent?.[0]?.id || '');
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sectionRefs = useRef({});
  const observerRef = useRef(null);

  // IntersectionObserver-based scroll spy — attached to the real scroll container
  useEffect(() => {
    const scrollEl = document.getElementById('main-scroll');
    if (!scrollEl || !docsContent?.length) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveSection(visible[0].target.id);
      },
      { root: scrollEl, rootMargin: '-80px 0px -55% 0px', threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach(el => {
      if (el) observerRef.current.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);


  // Re-observe when refs are populated
  const registerRef = useCallback((id, el) => {
    sectionRefs.current[id] = el;
    if (el && observerRef.current) observerRef.current.observe(el);
  }, []);

  // Scroll-to-top tracking on the main scroll container
  useEffect(() => {
    const scrollEl = document.getElementById('main-scroll');
    if (!scrollEl) return;
    const handleScroll = () => setShowScrollTop(scrollEl.scrollTop > 300);
    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigate using the native scrollIntoView with CSS scroll-margin-top
  const scrollToSection = useCallback((id) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    setActiveSection(id);
    setMobileTocOpen(false);
  }, []);

  return (
    <>
      {/* Mobile TOC overlay */}
      {mobileTocOpen && (
        <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setMobileTocOpen(false)} />
      )}

      {/* Mobile TOC panel */}
      <aside className={`fixed top-0 left-0 h-full z-50 w-72 bg-cyber-bg border-r border-cyber-border flex flex-col transition-transform duration-300 lg:hidden ${mobileTocOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyber-border">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-cyber-primary" />
            <span className="text-cyber-text font-semibold text-sm">Chapters</span>
          </div>
          <button onClick={() => setMobileTocOpen(false)} className="text-cyber-dark-text hover:text-cyber-text"><X size={18} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <TOCList items={docsContent} active={activeSection} onSelect={scrollToSection} />
        </nav>
      </aside>

      {/* Page layout */}
      <div className="flex gap-8 max-w-7xl mx-auto">

        {/* Desktop sticky sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-4 max-h-[calc(100vh-6rem)] flex flex-col bg-cyber-bg border border-cyber-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-cyber-border flex items-center gap-2 shrink-0">
              <BookOpen size={14} className="text-cyber-primary" />
              <span className="text-cyber-text text-xs font-semibold uppercase tracking-widest leading-none">Documentation</span>
            </div>
            <nav className="flex-1 overflow-y-auto py-2 px-2">
              <TOCList items={docsContent} active={activeSection} onSelect={scrollToSection} />
            </nav>
            <div className="px-4 py-3 border-t border-cyber-border shrink-0">
              <p className="text-cyber-dark-text/40 text-[10px] tracking-widest uppercase">{docsContent.length} Chapters</p>
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {/* Mobile header bar */}
          <div className="lg:hidden flex items-center gap-3 mb-6 p-3 bg-cyber-surface border border-cyber-border rounded-xl">
            <button onClick={() => setMobileTocOpen(true)} className="flex items-center gap-2 text-cyber-dark-text hover:text-cyber-text text-sm font-medium">
              <Menu size={16} /> Chapters
            </button>
            <span className="text-cyber-border">·</span>
            <span className="text-cyber-primary text-xs font-medium truncate">{docsContent.find(s => s.id === activeSection)?.title}</span>
          </div>

          {/* Page hero */}
          <div className="mb-14 pb-10 border-b border-cyber-border">
            <span className="text-cyber-primary text-[10px] font-bold tracking-[0.3em] uppercase mb-3 block">Security Intelligence · 2026</span>
            <h1 className="text-4xl md:text-5xl font-bold text-cyber-text mb-5 tracking-tight leading-tight">Security Documentation</h1>
            <p className="text-cyber-dark-text text-base leading-relaxed max-w-xl">
              Comprehensive production-grade security encyclopedia — OWASP Top 10 to Zero Trust, 
              with real code examples and actionable prevention guides.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {['8 Chapters', '30+ Sections', 'OWASP Aligned', 'Code Examples'].map(t => (
                <span key={t} className="text-[11px] text-cyber-dark-text bg-cyber-surface border border-cyber-border px-3 py-1.5 rounded-full">{t}</span>
              ))}
            </div>
          </div>

          {/* Chapters */}
          <div className="space-y-24 pb-32">
            {docsContent.map((chapter, idx) => (
              <section
                key={chapter.id}
                id={chapter.id}
                ref={el => registerRef(chapter.id, el)}
                className="doc-section"
              >
                {/* Chapter header */}
                <div className="flex items-start gap-4 mb-10">
                  <div className="w-10 h-10 rounded-xl bg-cyber-primary/10 border border-cyber-primary/20 flex items-center justify-center text-cyber-primary shrink-0 mt-0.5 shadow-sm">{chapter.icon}</div>
                  <div>
                    <span className="text-cyber-dark-text/40 text-[10px] font-bold tracking-[0.2em] uppercase block mb-1">Chapter {String(idx + 1).padStart(2, '0')}</span>
                    <h2 className="text-2xl md:text-3xl font-bold text-cyber-text tracking-tight leading-tight">{chapter.title}</h2>
                    <p className="text-cyber-dark-text text-sm mt-1.5 leading-relaxed max-w-xl opacity-80">{chapter.description}</p>
                  </div>
                </div>

                {/* Sections */}
                <div className="space-y-10 pl-0 md:pl-14">
                  {chapter.sections.map((sec, si) => (
                    <div key={si} className="border-l-2 border-cyber-border pl-6 hover:border-cyber-primary/40 transition-colors">
                      <div className="flex items-center gap-2 mb-4">
                        <ChevronRight size={15} className="text-cyber-primary shrink-0" />
                        <h3 className="text-cyber-text font-bold text-lg tracking-tight">{sec.subtitle}</h3>
                      </div>
                      <div className="docs-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                          {sec.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>

                {idx < docsContent.length - 1 && (
                  <div className="flex items-center gap-4 mt-16">
                    <div className="flex-1 h-px bg-cyber-border opacity-50" />
                    <span className="text-cyber-dark-text/20 text-[10px] tracking-widest uppercase shrink-0">End of Ch.{idx + 1}</span>
                    <div className="flex-1 h-px bg-cyber-border opacity-50" />
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => document.getElementById('main-scroll')?.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-30 w-10 h-10 bg-cyber-primary text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:bg-cyber-primary-hover transition-all"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </>
  );
}

function TOCList({ items, active, onSelect }) {
  return (
    <ul className="space-y-0.5">
      {items.map(s => (
        <li key={s.id}>
          <button
            onClick={() => onSelect(s.id)}
            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all ${
              active === s.id
                ? 'bg-cyber-primary/10 text-cyber-primary'
                : 'text-cyber-dark-text hover:text-cyber-text hover:bg-cyber-surface-hover'
            }`}
          >
            <span className={`shrink-0 ${active === s.id ? 'text-cyber-primary' : 'text-cyber-dark-text'}`}>{s.icon}</span>
            <span className="truncate">{s.title}</span>
            {active === s.id && <span className="ml-auto w-1.5 h-1.5 bg-cyber-primary rounded-full shrink-0" />}
          </button>
        </li>
      ))}
    </ul>
  );
}
