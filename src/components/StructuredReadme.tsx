import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, CheckCircle, Code, Book, Wrench, Settings, FileText, List, Hash, Link2 } from 'lucide-react';
import type { ProcessedREADME } from '../types';

interface StructuredReadmeProps {
  readmeData: ProcessedREADME;
  server: {
    repository: { url: string };
    installation: {
      npm?: string;
      pip?: string;
      docker?: string;
    };
  };
  copiedStates: { [key: string]: boolean };
  onCopy: (text: string, buttonId: string) => void;
}

const StructuredReadme: React.FC<StructuredReadmeProps> = ({ 
  readmeData, 
  server, 
  copiedStates, 
  onCopy 
}) => {
  const [activeSection, setActiveSection] = useState("overview");

  // Parse tools from API reference content
  const parsedTools = useMemo(() => {
    if (!readmeData.api_reference?.content) return [];
    
    const content = readmeData.api_reference.content;
    const toolPattern = /- \*\*([^*]+)\*\*\s*([\s\S]*?)(?=- \*\*|$)/g;
    const tools: Array<{
      name: string;
      description: string;
      inputs: Array<{ name: string; type: string; required: boolean; description: string; default?: string }>;
    }> = [];
    
    let match;
    while ((match = toolPattern.exec(content)) !== null) {
      const [, name, content] = match;
      const descriptionMatch = content.match(/^\s*-\s*([^\n]+)/);
      const description = descriptionMatch ? descriptionMatch[1] : '';
      
      // Parse inputs
      const inputsPattern = /`([^`]+)`\s*\(([^)]+)\)(?:,\s*([^:)]+))?\s*:\s*([^\n]+)/g;
      const inputs: Array<{ name: string; type: string; required: boolean; description: string; default?: string }> = [];
      
      let inputMatch;
      while ((inputMatch = inputsPattern.exec(content)) !== null) {
        const [, inputName, type, optional, desc] = inputMatch;
        const required = !optional || !optional.includes('optional');
        const defaultMatch = desc.match(/\(default:\s*([^)]+)\)/);
        const defaultValue = defaultMatch ? defaultMatch[1] : undefined;
        
        inputs.push({
          name: inputName,
          type,
          required,
          description: desc.replace(/\(default:[^)]+\)/, '').trim(),
          default: defaultValue
        });
      }
      
      tools.push({ name: name.trim(), description, inputs });
    }
    
    return tools;
  }, [readmeData.api_reference?.content]);

  // Parse features from examples content
  const parsedFeatures = useMemo(() => {
    if (!readmeData.examples?.content) return [];
    
    const content = readmeData.examples.content;
    const featurePattern = /- \*\*([^*]+)\*\*:\s*([^\n]+)/g;
    const features: Array<{ title: string; description: string }> = [];
    
    let match;
    while ((match = featurePattern.exec(content)) !== null) {
      features.push({
        title: match[1],
        description: match[2]
      });
    }
    
    return features;
  }, [readmeData.examples?.content]);

  // Render markdown content with proper formatting
  const renderContent = (content: string) => {
    return (
      <div className="prose prose-gray max-w-none dark:prose-invert">
        <ReactMarkdown
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
            pre: ({ children, ...props }) => (
              <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 my-4 overflow-x-auto">
                <pre className="text-green-400 text-sm font-mono leading-relaxed" {...props}>
                  {children}
                </pre>
              </div>
            ),
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
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  // Table of contents
  const tableOfContents = [
    { id: "overview", title: "Overview", icon: Book, available: !!readmeData.overview },
    { id: "features", title: "Features", icon: List, available: parsedFeatures.length > 0 },
    { id: "installation", title: "Installation", icon: Settings, available: !!readmeData.installation },
    { id: "tools", title: "Tools", icon: Wrench, available: parsedTools.length > 0 },
    { id: "examples", title: "Examples", icon: Code, available: !!readmeData.examples && readmeData.examples.code_blocks.length > 0 },
    { id: "api-reference", title: "API Reference", icon: FileText, available: !!readmeData.api_reference }
  ].filter(item => item.available);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Table of Contents */}
      <div className="lg:w-1/4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Hash className="h-5 w-5 mr-2" />
            Table of Contents
          </h3>
          <nav className="space-y-2">
            {tableOfContents.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left flex items-center px-3 py-2 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.title}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="lg:w-3/4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
          {/* Overview */}
          {activeSection === "overview" && readmeData.overview && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Book className="h-6 w-6 mr-2" />
                Overview
              </h2>
              <div className="space-y-4">
                {renderContent(readmeData.overview.content)}
                
                {readmeData.overview.code_blocks.length > 0 && (
                  <div className="space-y-4 mt-6">
                    {readmeData.overview.code_blocks.map((block, index) => (
                      <div key={index} className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 relative overflow-x-auto">
                        <button
                          onClick={() => onCopy(block.code, `overview-code-${index}`)}
                          className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                        >
                          {copiedStates[`overview-code-${index}`] ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1 inline" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1 inline" />
                              Copy
                            </>
                          )}
                        </button>
                        <pre className="text-green-400 text-sm font-mono leading-relaxed">
                          <code>{block.code}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Features */}
          {activeSection === "features" && parsedFeatures.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <List className="h-6 w-6 mr-2" />
                Features
              </h2>
              <div className="grid gap-4">
                {parsedFeatures.map((feature, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Installation */}
          {activeSection === "installation" && readmeData.installation && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Settings className="h-6 w-6 mr-2" />
                Installation
              </h2>
              <div className="space-y-6">
                <div className="text-gray-600 dark:text-gray-300">
                  {renderContent(readmeData.installation.content)}
                </div>
                
                {readmeData.installation.code_blocks.length > 0 && (
                  <div className="space-y-6">
                    {readmeData.installation.code_blocks.map((block, index) => (
                      <div key={index} className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 relative overflow-x-auto">
                        <span className="absolute top-2 left-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                          {block.language}
                        </span>
                        <button
                          onClick={() => onCopy(block.code, `install-code-${index}`)}
                          className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                        >
                          {copiedStates[`install-code-${index}`] ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1 inline" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1 inline" />
                              Copy
                            </>
                          )}
                        </button>
                        <pre className="text-green-400 text-sm font-mono leading-relaxed mt-6">
                          <code>{block.code}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tools */}
          {activeSection === "tools" && parsedTools.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Wrench className="h-6 w-6 mr-2" />
                Available Tools
              </h2>
              <div className="space-y-6">
                {parsedTools.map((tool, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <Code className="h-5 w-5 mr-2" />
                      {tool.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {tool.description}
                    </p>
                    
                    {tool.inputs.length > 0 && (
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Parameters</h4>
                        <div className="space-y-3">
                          {tool.inputs.map((input, inputIndex) => (
                            <div key={inputIndex} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <code className="text-sm font-mono bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                                  {input.name}
                                </code>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                    {input.type}
                                  </span>
                                  {input.required ? (
                                    <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">
                                      Required
                                    </span>
                                  ) : (
                                    <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                                      Optional
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {input.description}
                                {input.default && (
                                  <span className="text-gray-500 dark:text-gray-400">
                                    {" "}(default: {input.default})
                                  </span>
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Examples */}
          {activeSection === "examples" && readmeData.examples && readmeData.examples.code_blocks.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Code className="h-6 w-6 mr-2" />
                Usage Examples
              </h2>
              <div className="space-y-6">
                {readmeData.examples.code_blocks.map((block, index) => (
                  <div key={index} className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 relative overflow-x-auto">
                    <span className="absolute top-2 left-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                      {block.language}
                    </span>
                    <button
                      onClick={() => onCopy(block.code, `example-code-${index}`)}
                      className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                    >
                      {copiedStates[`example-code-${index}`] ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1 inline" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1 inline" />
                          Copy
                        </>
                      )}
                    </button>
                    <pre className="text-green-400 text-sm font-mono leading-relaxed mt-6">
                      <code>{block.code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Reference */}
          {activeSection === "api-reference" && readmeData.api_reference && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <FileText className="h-6 w-6 mr-2" />
                API Reference
              </h2>
              <div className="space-y-6">
                <div className="text-gray-600 dark:text-gray-300">
                  {renderContent(readmeData.api_reference.content)}
                </div>
                
                {readmeData.api_reference.code_blocks.length > 0 && (
                  <div className="space-y-6">
                    {readmeData.api_reference.code_blocks.map((block, index) => (
                      <div key={index} className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 relative overflow-x-auto">
                        <span className="absolute top-2 left-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                          {block.language}
                        </span>
                        <button
                          onClick={() => onCopy(block.code, `api-code-${index}`)}
                          className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                        >
                          {copiedStates[`api-code-${index}`] ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1 inline" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1 inline" />
                              Copy
                            </>
                          )}
                        </button>
                        <pre className="text-green-400 text-sm font-mono leading-relaxed mt-6">
                          <code>{block.code}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fallback when no data */}
          {!tableOfContents.find(item => item.id === activeSection) && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No documentation available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This section doesn't have any content yet.
              </p>
              <a
                href={server.repository.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <Link2 className="h-4 w-4 mr-1" />
                View Repository
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StructuredReadme;