import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Info } from 'lucide-react';

export const SlugAboutContent = ({ content, language }: { content?: string, language?: string }) => {
  if (!content) return null;

  // Extract h2 headings for the Table of Contents
  const headings = Array.from(content.matchAll(/^##\s+(.*)$/gm)).map(m => m[1]);

  return (
    <div className="bg-background relative z-20 w-full">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl py-20 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center border-t-2 border-border/50">
        
        {/* Left Side: Markdown Content */}
        <div className="flex-1 min-w-0 max-w-[850px]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ node, children, ...props }) => {
                const text = String(children);
                const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                const display = text === 'About' && language ? <>About <span className="text-primary ml-1">{language}</span></> : children;
                return <h2 id={id} className="text-3xl md:text-4xl font-extrabold mt-14 first:mt-0 mb-6 text-foreground tracking-tight scroll-m-24" {...props}>{display}</h2>
              },
              h2: ({ node, children, ...props }) => {
                const text = String(children);
                const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                const display = text === 'About' && language ? <>About <span className="text-primary">{language}</span></> : children;
                return <h3 id={id} className="text-2xl md:text-3xl font-bold mt-12 first:mt-0 mb-4 text-foreground tracking-tight scroll-m-24" {...props}>{display}</h3>
              },
              h3: ({ node, children, ...props }) => {
                const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
                return <h4 id={id} className="text-xl md:text-2xl font-semibold mt-8 first:mt-0 mb-4 text-foreground tracking-tight scroll-m-24" {...props}>{children}</h4>
              },
              p: ({ node, ...props }) => <p className="text-[17px] leading-relaxed mb-6 text-muted-foreground" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2 text-[17px]" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-6 text-muted-foreground space-y-2 text-[17px]" {...props} />,
              li: ({ node, ...props }) => <li className="leading-relaxed pl-1" {...props} />,
              a: ({ node, ...props }) => <a className="text-primary font-medium hover:underline decoration-primary/50 underline-offset-4 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
              pre: ({ node, children, ...props }: any) => (
                <div className="my-8 rounded-xl border border-border/50 bg-secondary/10 overflow-hidden shadow-sm">
                  <pre className="p-5 overflow-x-auto text-sm leading-relaxed [&>code]:bg-transparent [&>code]:p-0 [&>code]:border-none [&>code]:text-inherit" {...props}>
                    {children}
                  </pre>
                </div>
              ),
              code: ({ node, className, children, ...props }: any) => (
                <code className={`bg-secondary/40 text-foreground px-1.5 py-0.5 rounded-md text-[14px] font-mono border border-border/30 ${className || ''}`} {...props}>
                  {children}
                </code>
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-[4px] border-primary/50 pl-6 bg-secondary/5 rounded-r-xl italic text-muted-foreground/90 my-8 py-3 pr-4 text-[17px]" {...props} />
              ),
              img: ({ node, ...props }) => (
                <img className="rounded-xl border border-border/50 my-8 max-w-full h-auto shadow-sm" {...props} />
              ),
              hr: ({ node, ...props }) => <hr className="my-12 border-border/40" {...props} />,
              table: ({ node, ...props }) => (
                <div className="w-full overflow-x-auto my-8 border border-border/50 rounded-xl">
                  <table className="w-full text-left border-collapse text-sm" {...props} />
                </div>
              ),
              th: ({ node, ...props }) => <th className="bg-secondary/30 p-4 font-semibold text-foreground border-b border-border/50" {...props} />,
              td: ({ node, ...props }) => <td className="p-4 border-b border-border/40 text-muted-foreground last:border-0" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Right Side: Sticky Visual Graphic for 'About' */}
        <aside className="hidden lg:flex w-87 shrink-0 sticky top-32 mt-0 justify-center items-center">
          <div className="relative flex items-center justify-center w-full h-100">
            {/* The central icon */}
            <div className="relative z-10 flex items-center justify-center w-48 h-48 text-primary">
              <Info className="w-full h-full relative z-20" strokeWidth={1} />
            </div>

            {/* Colorful Floating Geometric Decorations (matching the hero aesthetic) */}
            
            {/* Yellow Circle - Top Left */}
            <div className="absolute top-12 left-6 drop-shadow-sm text-foreground">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <circle cx="12" cy="12" r="9" fill="#facc15" />
              </svg>
            </div>

            {/* Green Diamond - Middle Left */}
            <div className="absolute top-1/2 -left-4 drop-shadow-sm text-foreground rotate-45">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" fill="#34d399" />
              </svg>
            </div>

            {/* Dashes - Top Left Center */}
            <div className="absolute top-20 left-16 flex gap-1.5 -rotate-45">
              <div className="w-4 h-1 bg-foreground rounded-full opacity-80"></div>
              <div className="w-4 h-1 bg-foreground rounded-full opacity-80"></div>
            </div>

            {/* Yellow Diamond - Top Right */}
            <div className="absolute top-10 right-4 drop-shadow-sm text-foreground -rotate-12">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" fill="#facc15" />
              </svg>
            </div>

            {/* Green Square - Middle Right */}
            <div className="absolute bottom-1/3 -right-4 drop-shadow-sm text-foreground rotate-12">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" fill="#34d399" />
              </svg>
            </div>

            {/* Yellow Triangle - Bottom Center */}
            <div className="absolute -bottom-4 right-1/3 drop-shadow-sm -rotate-12 text-foreground">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
                <polygon points="12 3 22 20 2 20" fill="#facc15" />
              </svg>
            </div>

            {/* Dotted squares - Top Left */}
            <div className="absolute -top-4 left-1/3 grid grid-cols-3 gap-1.5 opacity-40">
              {[...Array(9)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-foreground rounded-full"></div>)}
            </div>
            
            {/* Dotted squares - Middle Right */}
            <div className="absolute top-1/2 right-4 grid grid-cols-3 gap-1.5 opacity-40">
              {[...Array(9)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-foreground rounded-full"></div>)}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
