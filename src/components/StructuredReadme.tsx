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
                <div className="bg-gray-900 dark:bg-gray-950 rounded-lg my-4 overflow-hidden relative group">
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
                  
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm font-mono leading-relaxed" {...props}>
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
                  <code className="text-green-400 font-mono" {...props}>
                    {children}
                  </code>
                );
              }
              // Otherwise render as inline code
              return (
                <code
                  className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded text-sm font-mono"
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4" {...props} />
            ),
            h2: ({ ...props }) => (
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3" {...props} />
            ),
            h3: ({ ...props }) => (
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2" {...props} />
            ),
            // Block quote component
            blockquote: ({ ...props }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-300" {...props} />
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