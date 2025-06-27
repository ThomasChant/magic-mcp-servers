import React from 'react';
import ReactMarkdown from 'react-markdown';
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
              const buttonId = `code-${Math.random().toString(36).substr(2, 9)}`;
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
                    title={isCopied ? '已复制!' : '复制代码'}
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
            // Custom list components
            ul: ({ ...props }) => (
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300" {...props} />
            ),
            ol: ({ ...props }) => (
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300" {...props} />
            ),
            li: ({ ...props }) => (
              <li className="ml-4" {...props} />
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