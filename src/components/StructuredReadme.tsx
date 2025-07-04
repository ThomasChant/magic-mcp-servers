import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Book, Copy, Check } from 'lucide-react';
import type { ServerReadme } from '../types';

interface StructuredReadmeProps {
  readme: ServerReadme
  copiedStates: { [key: string]: boolean };
  onCopy: (text: string, buttonId: string) => void;
}

const StructuredReadme: React.FC<StructuredReadmeProps> = ({readme, copiedStates, onCopy}) => {
  // Render markdown content with proper formatting
  const renderContent = (content: string) => {
    return (
      <div className="prose prose-gray max-w-none dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            // Custom link component
            a: ({ ...props }) => (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              />
            ),
            // Custom image component
            img: function CustomImage({ src, alt, title, ...props }) {
              const [imageError, setImageError] = React.useState(false);
              
              if (imageError) {
                return (
                  <div className="flex items-center justify-center h-32 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 my-6">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Image failed to load</p>
                      {alt && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{alt}</p>
                      )}
                    </div>
                  </div>
                );
              }
              
              return (
                <div className="my-6">
                  <img
                    {...props}
                    src={src}
                    alt={alt || ''}
                    title={title}
                    className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mx-auto block"
                    loading="lazy"
                    onError={() => setImageError(true)}
                  />
                  {title && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 italic">
                      {title}
                    </p>
                  )}
                </div>
              );
            },
            // Custom pre component for code blocks
            pre: ({ children, ...props }) => {
              // 提取代码文本内容
               const getCodeText = (node: React.ReactNode): string => {
                  if (typeof node === 'string') return node;
                  if (typeof node === 'number') return node.toString();
                  if (Array.isArray(node)) return node.map(getCodeText).join('');
                  if (node && typeof node === 'object' && 'props' in node) {
                    const element = node as React.ReactElement<{ children?: React.ReactNode }>;
                    return getCodeText(element.props.children);
                  }
                  return '';
                };
              
              const codeText = getCodeText(children);
              // 使用代码内容生成稳定的标识符，处理非 Latin1 字符
              const generateButtonId = (text: string) => {
                try {
                  // 使用 encodeURIComponent 然后 btoa 来处理非 Latin1 字符
                  const encoded = btoa(encodeURIComponent(text));
                  return `code-${encoded.replace(/[^a-zA-Z0-9]/g, '').substring(0, 12)}`;
                } catch {
                  // 如果编码失败，使用简单的哈希算法
                  let hash = 0;
                  for (let i = 0; i < text.length; i++) {
                    const char = text.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash; // 转换为32位整数
                  }
                  return `code-${Math.abs(hash).toString(36).substring(0, 12)}`;
                }
              };
              const buttonId = generateButtonId(codeText);
              const isCopied = copiedStates[buttonId];
              return (
                <div 
                  className="rounded-lg my-4 overflow-hidden relative group"
                  style={{
                    backgroundColor: 'rgb(17 24 39)',
                    color: 'rgb(34 197 94)'
                  }}
                >
                  {/* 复制按钮 */}
                  <button
                    onClick={() => onCopy(codeText, buttonId)}
                    className={`absolute top-2 right-2 px-3 py-2 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 z-10 flex items-center gap-2 ${
                      isCopied 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                    title={isCopied ? 'Copied!' : 'Copy'}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span className="text-sm font-medium">Copied</span>
                      </>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  
                  <div 
                    className="p-4 overflow-x-auto"
                    style={{
                      backgroundColor: 'transparent'
                    }}
                  >
                    <pre 
                      className="text-sm font-mono leading-relaxed"
                      style={{
                        backgroundColor: 'transparent',
                        color: 'rgb(34 197 94)',
                        margin: 0,
                        padding: 0
                      }}
                      {...props}
                    >
                      {children}
                    </pre>
                  </div>
                </div>
              );
            },
            // Custom code component for inline code and code blocks
            code: ({ className, children, ...props }) => {
              // If this code element is inside a pre block, render as block code
              if (className && className.includes('language-')) {
                return (
                  <code 
                    className="font-mono"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'rgb(34 197 94)'
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              // Otherwise render as inline code
              return (
                <code
                  className="px-1 py-0.5 rounded text-sm font-mono bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            // Custom strong/bold component
            strong: ({ ...props }) => (
              <strong className="font-semibold text-gray-900 dark:text-white" {...props} />
            ),
            // Custom paragraph component
            p: ({ ...props }) => (
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4" {...props} />
            ),
            // Custom list components - override prose defaults
            ul: ({ ...props }) => (
              <ul className="!list-disc !list-outside !ml-6 !pl-0 space-y-2 text-gray-600 dark:text-gray-300 !my-4" {...props} />
            ),
            ol: ({ ...props }) => (
              <ol className="!list-decimal !list-outside !ml-6 !pl-0 space-y-2 text-gray-600 dark:text-gray-300 !my-4" {...props} />
            ),
            li: ({ ...props }) => (
              <li className="!ml-0 !pl-2 leading-relaxed" {...props} />
            ),
            // Custom heading components
            h1: ({ ...props }) => (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-6 first:mt-0" {...props} />
            ),
            h2: ({ ...props }) => (
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-5 first:mt-0" {...props} />
            ),
            h3: ({ ...props }) => (
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-4 first:mt-0" {...props} />
            ),
            h4: ({ ...props }) => (
              <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2 mt-3 first:mt-0" {...props} />
            ),
            h5: ({ ...props }) => (
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1 mt-2 first:mt-0" {...props} />
            ),
            h6: ({ ...props }) => (
              <h6 className="text-sm font-normal text-gray-700 dark:text-gray-300 mb-1 mt-2 first:mt-0" {...props} />
            ),
            // Block quote component
            blockquote: ({ ...props }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-300 my-4 bg-blue-50 dark:bg-blue-900/20 py-2 rounded-r-md" {...props} />
            ),
            // Text formatting components
            em: ({ ...props }) => (
              <em className="italic text-gray-700 dark:text-gray-300" {...props} />
            ),
            del: ({ ...props }) => (
              <del className="line-through text-gray-500 dark:text-gray-400 opacity-75" {...props} />
            ),
            mark: ({ ...props }) => (
              <mark className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded text-gray-900 dark:text-gray-100" {...props} />
            ),
            kbd: ({ ...props }) => (
              <kbd className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs font-mono shadow-sm" {...props} />
            ),
            sub: ({ ...props }) => (
              <sub className="text-xs align-sub" {...props} />
            ),
            sup: ({ ...props }) => (
              <sup className="text-xs align-super" {...props} />
            ),
            ins: ({ ...props }) => (
              <ins className="underline decoration-green-500 decoration-2 text-green-700 dark:text-green-300" {...props} />
            ),
            small: ({ ...props }) => (
              <small className="text-sm text-gray-500 dark:text-gray-400" {...props} />
            ),
            // Horizontal rule
            hr: ({ ...props }) => (
              <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600" {...props} />
            ),
            // Line break
            br: ({ ...props }) => (
              <br className="block" {...props} />
            ),
            // Task list checkbox (GFM)
            input: ({ type, checked, ...props }) => {
              if (type === 'checkbox') {
                return (
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled
                    className="mr-2 accent-blue-500 scale-110"
                    {...props}
                  />
                );
              }
              return <input type={type} {...props} />;
            },
            // Generic containers
            div: ({ className, ...props }) => (
              <div className={`${className || ''} prose-div`} {...props} />
            ),
            span: ({ className, ...props }) => (
              <span className={`${className || ''} prose-span`} {...props} />
            ),
            // Figure and figcaption for images with captions
            figure: ({ ...props }) => (
              <figure className="my-6 text-center" {...props} />
            ),
            figcaption: ({ ...props }) => (
              <figcaption className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic" {...props} />
            ),
            // Definition lists
            dl: ({ ...props }) => (
              <dl className="my-4 space-y-2" {...props} />
            ),
            dt: ({ ...props }) => (
              <dt className="font-semibold text-gray-900 dark:text-white" {...props} />
            ),
            dd: ({ ...props }) => (
              <dd className="ml-4 text-gray-600 dark:text-gray-300 mb-2" {...props} />
            ),
            // Abbreviations and citations
            abbr: ({ title, ...props }) => (
              <abbr className="cursor-help border-b border-dashed border-gray-400 dark:border-gray-500" title={title} {...props} />
            ),
            cite: ({ ...props }) => (
              <cite className="italic text-gray-600 dark:text-gray-300" {...props} />
            ),
            // Technical elements
            var: ({ ...props }) => (
              <var className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-1 rounded not-italic text-purple-600 dark:text-purple-400" {...props} />
            ),
            samp: ({ ...props }) => (
              <samp className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-1 rounded text-green-600 dark:text-green-400" {...props} />
            ),
            // Time and address
            time: ({ ...props }) => (
              <time className="text-gray-600 dark:text-gray-300" {...props} />
            ),
            address: ({ ...props }) => (
              <address className="not-italic text-gray-600 dark:text-gray-300 border-l-2 border-gray-300 dark:border-gray-600 pl-3 my-4" {...props} />
            ),
            // Additional text formatting
            q: ({ ...props }) => (
              <q className="italic text-gray-600 dark:text-gray-300" {...props} />
            ),
            s: ({ ...props }) => (
              <s className="line-through text-gray-500 dark:text-gray-400 opacity-75" {...props} />
            ),
            u: ({ ...props }) => (
              <u className="underline decoration-gray-400 dark:decoration-gray-500" {...props} />
            ),
            // Media elements
            video: ({ src, controls = true, className, ...props }) => (
              <div className="my-6">
                <video
                  src={src}
                  controls={controls}
                  className={`max-w-full h-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mx-auto block ${className || ''}`}
                  {...props}
                />
              </div>
            ),
            audio: ({ src, controls = true, className, ...props }) => (
              <div className="my-4">
                <audio
                  src={src}
                  controls={controls}
                  className={`w-full max-w-md mx-auto block ${className || ''}`}
                  {...props}
                />
              </div>
            ),
            // Iframe for embedded content (with security considerations)
            iframe: ({ src, title, className, ...props }) => (
              <div className="my-6 relative">
                <iframe
                  src={src}
                  title={title || 'Embedded content'}
                  className={`w-full border border-gray-200 dark:border-gray-700 rounded-lg ${className || ''}`}
                  sandbox="allow-scripts allow-same-origin"
                  loading="lazy"
                  {...props}
                />
              </div>
            ),
            // Progress and measurement elements
            progress: ({ value, max = 100, className, ...props }) => (
              <progress
                value={value}
                max={max}
                className={`w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden progress-bar ${className || ''}`}
                {...props}
              />
            ),
            meter: ({ value, min = 0, max = 100, className, ...props }) => (
              <meter
                value={value}
                min={min}
                max={max}
                className={`w-full h-2 ${className || ''}`}
                {...props}
              />
            ),
            // Form elements (if they appear in content)
            fieldset: ({ ...props }) => (
              <fieldset className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 my-4" {...props} />
            ),
            legend: ({ ...props }) => (
              <legend className="px-2 text-sm font-medium text-gray-700 dark:text-gray-300" {...props} />
            ),
            // Details/Summary component for collapsible content
            details: ({ children, ...props }) => (
              <details 
                className="border border-gray-200 dark:border-gray-700 rounded-lg mb-4 overflow-hidden"
                {...props}
              >
                {children}
              </details>
            ),
            summary: ({ children, ...props }) => (
              <summary 
                className="bg-gray-50 dark:bg-gray-800 px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 font-medium text-gray-900 dark:text-white select-none [&::-webkit-details-marker]:hidden"
                {...props}
              >
                {children}
              </summary>
            ),
            // Table components for proper markdown table rendering
            table: ({ ...props }) => (
              <div className="overflow-x-auto my-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props} />
              </div>
            ),
            thead: ({ ...props }) => (
              <thead className="bg-gray-50 dark:bg-gray-800" {...props} />
            ),
            tbody: ({ ...props }) => (
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700" {...props} />
            ),
            tr: ({ ...props }) => (
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150" {...props} />
            ),
            th: ({ ...props }) => (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 last:border-r-0" {...props} />
            ),
            td: ({ ...props }) => (
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 last:border-r-0" {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Content */}
      <div className="lg:w-full">
        <style>{`
          details > *:not(summary) {
            padding: 1rem;
            background-color: rgb(255 255 255);
            border-top: 1px solid rgb(229 231 235);
          }
          .dark details > *:not(summary) {
            background-color: rgb(17 24 39);
            border-top-color: rgb(75 85 99);
          }
          
          /* Ensure list markers are visible and properly positioned */
          .prose ul {
            list-style-type: disc !important;
            list-style-position: outside !important;
            margin-left: 1.5rem !important;
            padding-left: 0 !important;
          }
          
          .prose ol {
            list-style-type: decimal !important;
            list-style-position: outside !important;
            margin-left: 1.5rem !important;
            padding-left: 0 !important;
          }
          
          .prose li {
            margin-left: 0 !important;
            padding-left: 0.5rem !important;
            display: list-item !important;
          }
          
          .prose ul ul, .prose ol ol, .prose ul ol, .prose ol ul {
            margin-left: 1.5rem !important;
            margin-top: 0.5rem !important;
          }
          
          /* Image styling overrides */
          .prose img {
            max-width: 100% !important;
            height: auto !important;
            border-radius: 0.5rem !important;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
            border: 1px solid #e5e7eb !important;
            margin: 1.5rem 0 !important;
          }
          
          .dark .prose img {
            border-color: #374151 !important;
          }
          
          /* Ensure images don't break layout */
          .prose img {
            display: block !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          
          /* Table styling overrides for proper GFM table rendering */
          .prose table {
            width: 100% !important;
            margin: 0 !important;
            border-collapse: separate !important;
            border-spacing: 0 !important;
            background-color: white !important;
          }
          
          .dark .prose table {
            background-color: rgb(17 24 39) !important;
          }
          
          .prose th {
            background-color: rgb(249 250 251) !important;
            font-weight: 500 !important;
            text-align: left !important;
            padding: 0.75rem 1rem !important;
            border-bottom: 2px solid rgb(209 213 219) !important;
            border-right: 1px solid rgb(229 231 235) !important;
            font-size: 0.875rem !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
            color: rgb(107 114 128) !important;
          }
          
          .prose th:last-child {
            border-right: none !important;
          }
          
          .dark .prose th {
            background-color: rgb(31 41 55) !important;
            border-bottom-color: rgb(55 65 81) !important;
            border-right-color: rgb(75 85 99) !important;
            color: rgb(156 163 175) !important;
          }
          
          .prose td {
            padding: 0.75rem 1rem !important;
            border-bottom: 1px solid rgb(229 231 235) !important;
            border-right: 1px solid rgb(229 231 235) !important;
            vertical-align: top !important;
            color: rgb(17 24 39) !important;
          }
          
          .prose td:last-child {
            border-right: none !important;
          }
          
          .prose tbody tr:last-child td {
            border-bottom: none !important;
          }
          
          .dark .prose td {
            border-bottom-color: rgb(75 85 99) !important;
            border-right-color: rgb(75 85 99) !important;
            color: rgb(243 244 246) !important;
          }
          
          .prose tbody tr:hover {
            background-color: rgb(249 250 251) !important;
          }
          
          .dark .prose tbody tr:hover {
            background-color: rgb(31 41 55) !important;
          }
          
          /* Text formatting styles */
          .prose em {
            font-style: italic !important;
            color: inherit !important;
          }
          
          .prose del {
            text-decoration: line-through !important;
            opacity: 0.75 !important;
          }
          
          .prose mark {
            background-color: rgb(254 240 138) !important;
            padding: 0.125rem 0.25rem !important;
            border-radius: 0.25rem !important;
            color: rgb(17 24 39) !important;
          }
          
          .dark .prose mark {
            background-color: rgb(133 77 14) !important;
            color: rgb(254 240 138) !important;
          }
          
          .prose kbd {
            background-color: rgb(243 244 246) !important;
            border: 1px solid rgb(209 213 219) !important;
            border-radius: 0.25rem !important;
            padding: 0.125rem 0.5rem !important;
            font-family: ui-monospace, SFMono-Regular, monospace !important;
            font-size: 0.75rem !important;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
          }
          
          .dark .prose kbd {
            background-color: rgb(31 41 55) !important;
            border-color: rgb(75 85 99) !important;
            color: rgb(243 244 246) !important;
          }
          
          .prose ins {
            text-decoration: underline !important;
            text-decoration-color: rgb(34 197 94) !important;
            text-decoration-thickness: 2px !important;
            color: rgb(21 128 61) !important;
          }
          
          .dark .prose ins {
            color: rgb(134 239 172) !important;
          }
          
          .prose small {
            font-size: 0.875rem !important;
            color: rgb(107 114 128) !important;
          }
          
          .dark .prose small {
            color: rgb(156 163 175) !important;
          }
          
          /* Horizontal rule styles */
          .prose hr {
            border: none !important;
            height: 1px !important;
            background: linear-gradient(to right, transparent, rgb(209 213 219), transparent) !important;
            margin: 2rem 0 !important;
          }
          
          .dark .prose hr {
            background: linear-gradient(to right, transparent, rgb(75 85 99), transparent) !important;
          }
          
          /* Task list styles */
          .prose input[type="checkbox"] {
            margin-right: 0.5rem !important;
            transform: scale(1.1) !important;
            accent-color: rgb(59 130 246) !important;
            cursor: default !important;
          }
          
          /* Figure and figcaption styles */
          .prose figure {
            margin: 1.5rem 0 !important;
            text-align: center !important;
          }
          
          .prose figcaption {
            margin-top: 0.5rem !important;
            font-size: 0.875rem !important;
            color: rgb(107 114 128) !important;
            font-style: italic !important;
          }
          
          .dark .prose figcaption {
            color: rgb(156 163 175) !important;
          }
          
          /* Improved blockquote styles */
          .prose blockquote {
            border-left: 4px solid rgb(59 130 246) !important;
            padding-left: 1rem !important;
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
            margin: 1rem 0 !important;
            background-color: rgb(239 246 255) !important;
            border-top-right-radius: 0.375rem !important;
            border-bottom-right-radius: 0.375rem !important;
            font-style: italic !important;
          }
          
          .dark .prose blockquote {
            background-color: rgba(59, 130, 246, 0.1) !important;
            color: rgb(209 213 219) !important;
          }
          
          /* Definition list styles */
          .prose dl {
            margin: 1rem 0 !important;
          }
          
          .prose dt {
            font-weight: 600 !important;
            color: rgb(17 24 39) !important;
            margin-bottom: 0.25rem !important;
          }
          
          .dark .prose dt {
            color: rgb(243 244 246) !important;
          }
          
          .prose dd {
            margin-left: 1rem !important;
            margin-bottom: 0.75rem !important;
            color: rgb(75 85 99) !important;
          }
          
          .dark .prose dd {
            color: rgb(209 213 219) !important;
          }
          
          /* Abbreviation styles */
          .prose abbr {
            cursor: help !important;
            border-bottom: 1px dashed rgb(156 163 175) !important;
          }
          
          .dark .prose abbr {
            border-bottom-color: rgb(107 114 128) !important;
          }
          
          /* Technical element styles */
          .prose var {
            font-family: ui-monospace, SFMono-Regular, monospace !important;
            font-size: 0.875rem !important;
            background-color: rgb(243 244 246) !important;
            padding: 0.125rem 0.25rem !important;
            border-radius: 0.25rem !important;
            font-style: normal !important;
            color: rgb(147 51 234) !important;
          }
          
          .dark .prose var {
            background-color: rgb(31 41 55) !important;
            color: rgb(196 181 253) !important;
          }
          
          .prose samp {
            font-family: ui-monospace, SFMono-Regular, monospace !important;
            font-size: 0.875rem !important;
            background-color: rgb(243 244 246) !important;
            padding: 0.125rem 0.25rem !important;
            border-radius: 0.25rem !important;
            color: rgb(22 163 74) !important;
          }
          
          .dark .prose samp {
            background-color: rgb(31 41 55) !important;
            color: rgb(134 239 172) !important;
          }
          
          /* Address styles */
          .prose address {
            font-style: normal !important;
            border-left: 2px solid rgb(209 213 219) !important;
            padding-left: 0.75rem !important;
            margin: 1rem 0 !important;
            color: rgb(75 85 99) !important;
          }
          
          .dark .prose address {
            border-left-color: rgb(75 85 99) !important;
            color: rgb(209 213 219) !important;
          }
          
          /* Quote styles */
          .prose q {
            font-style: italic !important;
            color: rgb(75 85 99) !important;
          }
          
          .prose q::before {
            content: '"' !important;
          }
          
          .prose q::after {
            content: '"' !important;
          }
          
          .dark .prose q {
            color: rgb(209 213 219) !important;
          }
          
          /* Additional text formatting */
          .prose s {
            text-decoration: line-through !important;
            opacity: 0.75 !important;
            color: rgb(107 114 128) !important;
          }
          
          .dark .prose s {
            color: rgb(156 163 175) !important;
          }
          
          .prose u {
            text-decoration: underline !important;
            text-decoration-color: rgb(156 163 175) !important;
          }
          
          .dark .prose u {
            text-decoration-color: rgb(107 114 128) !important;
          }
          
          /* Citation styles */
          .prose cite {
            font-style: italic !important;
            color: rgb(75 85 99) !important;
          }
          
          .dark .prose cite {
            color: rgb(209 213 219) !important;
          }
          
          /* Media element styles */
          .prose video {
            max-width: 100% !important;
            height: auto !important;
            border-radius: 0.5rem !important;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
            border: 1px solid rgb(229 231 235) !important;
            margin: 1.5rem auto !important;
            display: block !important;
          }
          
          .dark .prose video {
            border-color: rgb(75 85 99) !important;
          }
          
          .prose audio {
            width: 100% !important;
            max-width: 28rem !important;
            margin: 1rem auto !important;
            display: block !important;
          }
          
          .prose iframe {
            width: 100% !important;
            border: 1px solid rgb(229 231 235) !important;
            border-radius: 0.5rem !important;
            margin: 1.5rem 0 !important;
            min-height: 300px !important;
          }
          
          .dark .prose iframe {
            border-color: rgb(75 85 99) !important;
          }
          
          /* Improved task list compatibility (without :has selector) */
          .prose ul.contains-task-list {
            list-style: none !important;
            padding-left: 0 !important;
          }
          
          .prose .task-list-item {
            list-style: none !important;
            margin-left: 0 !important;
            padding-left: 0 !important;
            display: flex !important;
            align-items: flex-start !important;
            gap: 0.5rem !important;
          }
          
          .prose .task-list-item input[type="checkbox"] {
            margin: 0 !important;
            flex-shrink: 0 !important;
            margin-top: 0.1rem !important;
          }
          
          /* Progress and meter styles */
          .prose progress {
            width: 100% !important;
            height: 0.5rem !important;
            background-color: rgb(229 231 235) !important;
            border-radius: 9999px !important;
            overflow: hidden !important;
            border: none !important;
            margin: 1rem 0 !important;
          }
          
          .dark .prose progress {
            background-color: rgb(75 85 99) !important;
          }
          
          .prose progress::-webkit-progress-bar {
            background-color: rgb(229 231 235) !important;
            border-radius: 9999px !important;
          }
          
          .dark .prose progress::-webkit-progress-bar {
            background-color: rgb(75 85 99) !important;
          }
          
          .prose progress::-webkit-progress-value {
            background-color: rgb(59 130 246) !important;
            border-radius: 9999px !important;
            transition: width 0.3s ease !important;
          }
          
          .prose progress::-moz-progress-bar {
            background-color: rgb(59 130 246) !important;
            border-radius: 9999px !important;
          }
          
          .prose meter {
            width: 100% !important;
            height: 0.5rem !important;
            margin: 1rem 0 !important;
          }
          
          /* Fieldset and legend styles */
          .prose fieldset {
            border: 1px solid rgb(209 213 219) !important;
            border-radius: 0.5rem !important;
            padding: 1rem !important;
            margin: 1rem 0 !important;
          }
          
          .dark .prose fieldset {
            border-color: rgb(75 85 99) !important;
          }
          
          .prose legend {
            padding: 0 0.5rem !important;
            font-size: 0.875rem !important;
            font-weight: 500 !important;
            color: rgb(75 85 99) !important;
          }
          
          .dark .prose legend {
            color: rgb(209 213 219) !important;
          }
          
          /* Code block fixes - ensure consistent backgrounds */
          .prose pre {
            background-color: rgb(17 24 39) !important;
            color: rgb(34 197 94) !important;
          }
          
          .dark .prose pre {
            background-color: rgb(3 7 18) !important;
            color: rgb(34 197 94) !important;
          }
          
          .prose pre * {
            background-color: transparent !important;
            color: inherit !important;
          }
          
          .prose pre code {
            background-color: transparent !important;
            color: rgb(34 197 94) !important;
            padding: 0 !important;
            border-radius: 0 !important;
          }
          
          .prose pre span {
            background-color: transparent !important;
            color: inherit !important;
          }
          
          .prose pre div {
            background-color: transparent !important;
          }
          
          /* Ensure no conflicting backgrounds in code blocks - alternative approach */
          .prose .bg-gray-900 {
            background-color: rgb(17 24 39) !important;
          }
          
          .dark .prose .bg-gray-900 {
            background-color: rgb(3 7 18) !important;
          }
          
          .prose .dark\\:bg-gray-950 {
            background-color: rgb(17 24 39) !important;
          }
          
          .dark .prose .dark\\:bg-gray-950 {
            background-color: rgb(3 7 18) !important;
          }
          
          /* Override any prose styles that might affect code blocks */
          .prose .bg-gray-900 * {
            background-color: transparent !important;
          }
          
          .prose .bg-gray-900 pre {
            background-color: transparent !important;
          }
          
          .prose .bg-gray-900 code {
            background-color: transparent !important;
          }
          
          /* Force all elements inside code blocks to have consistent styling */
          .prose pre,
          .prose pre *,
          .prose code[class*="language-"],
          .prose code[class*="language-"] * {
            background-color: transparent !important;
            background: transparent !important;
          }
          
          /* Prevent any background colors on spans inside code blocks */
          .prose pre span,
          .prose pre span *,
          .prose code span,
          .prose code span * {
            background-color: transparent !important;
            background: none !important;
          }
          
          /* Override Tailwind's prose styles that might interfere */
          .prose pre code {
            background-color: transparent !important;
            color: rgb(34 197 94) !important;
            font-size: inherit !important;
            font-weight: inherit !important;
            padding: 0 !important;
            border-radius: 0 !important;
            border: none !important;
          }
          
          .prose :not(pre) > code {
            background-color: rgb(243 244 246) !important;
            color: rgb(31 41 55) !important;
            padding: 0.125rem 0.25rem !important;
            border-radius: 0.25rem !important;
            font-size: 0.875rem !important;
          }
          
          .dark .prose :not(pre) > code {
            background-color: rgb(31 41 55) !important;
            color: rgb(243 244 246) !important;
          }
        `}</style>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
          {/* Overview */}
          {readme && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Book className="h-6 w-6 mr-2" />
                Overview
              </h2>
              <div className="space-y-4">
                {renderContent(readme.rawContent)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StructuredReadme;