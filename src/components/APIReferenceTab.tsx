import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  CheckCircle, 
  ChevronDown,
  ChevronRight,
  AlertCircle,
  BookOpen,
  Settings,
  Key,
  ExternalLink
} from 'lucide-react';
import type { ExtractedAPIReference, APITool, APIParameter, APIExample } from '../types';

interface APIReferenceTabProps {
  apiReference?: ExtractedAPIReference;
  repositoryUrl: string;
  copiedStates: { [key: string]: boolean };
  onCopy: (text: string, buttonId: string) => void;
}

const APIReferenceTab: React.FC<APIReferenceTabProps> = ({
  apiReference,
  repositoryUrl,
  copiedStates,
  onCopy
}) => {
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['tools']));

  const toggleTool = (toolName: string) => {
    const newExpanded = new Set(expandedTools);
    if (newExpanded.has(toolName)) {
      newExpanded.delete(toolName);
    } else {
      newExpanded.add(toolName);
    }
    setExpandedTools(newExpanded);
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getParameterTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'string':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'number':
      case 'integer':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'boolean':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'array':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'object':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  if (!apiReference || (!apiReference.tools?.length && !apiReference.usage_examples?.length)) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            API documentation not available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            API reference documentation is being processed. Please check the repository for detailed API information.
          </p>
          <a
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Repository
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Authentication Info */}
      {apiReference.authentication && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Key className="h-5 w-5 mr-2" />
            Authentication
          </h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Type: {apiReference.authentication.type}
              </span>
            </div>
            {apiReference.authentication.description && (
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                {apiReference.authentication.description}
              </p>
            )}
            {apiReference.authentication.setup_instructions && (
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Setup Instructions:</p>
                <ul className="space-y-1">
                  {apiReference.authentication.setup_instructions.map((instruction, index) => (
                    <li key={index} className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Available Tools */}
      {apiReference.tools && apiReference.tools.length > 0 && (
        <div>
          <button
            onClick={() => toggleSection('tools')}
            className="flex items-center w-full text-left mb-4"
          >
            {expandedSections.has('tools') ? (
              <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
            )}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Code2 className="h-5 w-5 mr-2" />
              Available Tools ({apiReference.tools.length})
            </h3>
          </button>

          {expandedSections.has('tools') && (
            <div className="space-y-4">
              {apiReference.tools.map((tool: APITool, index: number) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div
                    className={`p-4 cursor-pointer transition-colors ${
                      expandedTools.has(tool.name)
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                    }`}
                    onClick={() => toggleTool(tool.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <code className="font-mono font-medium text-gray-900 dark:text-white">
                            {tool.name}
                          </code>
                          {tool.parameters && tool.parameters.length > 0 && (
                            <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                              {tool.parameters.length} params
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {tool.description}
                        </p>
                      </div>
                      {expandedTools.has(tool.name) ? (
                        <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500 ml-2" />
                      )}
                    </div>
                  </div>

                  {expandedTools.has(tool.name) && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                      {/* Parameters */}
                      {tool.parameters && tool.parameters.length > 0 && (
                        <div className="mb-6">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-3">Parameters</h5>
                          <div className="space-y-3">
                            {tool.parameters.map((param: APIParameter, paramIndex: number) => (
                              <div key={paramIndex} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <code className="font-mono font-medium text-gray-900 dark:text-white">
                                      {param.name}
                                    </code>
                                    <span className={`text-xs px-2 py-1 rounded ${getParameterTypeColor(param.type)}`}>
                                      {param.type}
                                    </span>
                                    {param.required && (
                                      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded">
                                        Required
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {param.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {param.description}
                                  </p>
                                )}
                                {param.default && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Default: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{param.default}</code>
                                  </p>
                                )}
                                {param.enum_values && param.enum_values.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Possible values:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {param.enum_values.map((value, valueIndex) => (
                                        <code key={valueIndex} className="text-xs bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">
                                          {value}
                                        </code>
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
                      {tool.examples && tool.examples.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-3">Examples</h5>
                          <div className="space-y-4">
                            {tool.examples.map((example: APIExample, exampleIndex: number) => (
                              <div key={exampleIndex}>
                                {example.title && (
                                  <h6 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                                    {example.title}
                                  </h6>
                                )}
                                {example.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {example.description}
                                  </p>
                                )}
                                
                                <div className="grid gap-4 md:grid-cols-2">
                                  {/* Request */}
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Request:
                                      </span>
                                      <button
                                        onClick={() => onCopy(JSON.stringify(example.request, null, 2), `tool-${index}-example-${exampleIndex}-request`)}
                                        className={`text-xs px-2 py-1 rounded transition-colors ${
                                          copiedStates[`tool-${index}-example-${exampleIndex}-request`]
                                            ? 'bg-green-600 text-white'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                      >
                                        {copiedStates[`tool-${index}-example-${exampleIndex}-request`] ? (
                                          <CheckCircle className="h-3 w-3" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </button>
                                    </div>
                                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                                      <code>{JSON.stringify(example.request, null, 2)}</code>
                                    </pre>
                                  </div>

                                  {/* Response */}
                                  {example.response && (
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                          Response:
                                        </span>
                                        <button
                                          onClick={() => onCopy(JSON.stringify(example.response, null, 2), `tool-${index}-example-${exampleIndex}-response`)}
                                          className={`text-xs px-2 py-1 rounded transition-colors ${
                                            copiedStates[`tool-${index}-example-${exampleIndex}-response`]
                                              ? 'bg-green-600 text-white'
                                              : 'bg-blue-600 text-white hover:bg-blue-700'
                                          }`}
                                        >
                                          {copiedStates[`tool-${index}-example-${exampleIndex}-response`] ? (
                                            <CheckCircle className="h-3 w-3" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </button>
                                      </div>
                                      <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                                        <code>{JSON.stringify(example.response, null, 2)}</code>
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Configuration Options */}
      {apiReference.configuration_options && apiReference.configuration_options.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuration Options
          </h3>
          <div className="space-y-3">
            {apiReference.configuration_options.map((option, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <code className="font-mono font-medium text-gray-900 dark:text-white">
                    {option.name}
                  </code>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${getParameterTypeColor(option.type)}`}>
                      {option.type}
                    </span>
                    {option.required && (
                      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded">
                        Required
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {option.description}
                </p>
                {option.default && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Default: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{option.default}</code>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Examples */}
      {apiReference.usage_examples && apiReference.usage_examples.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Usage Examples
          </h3>
          <div className="space-y-4">
            {apiReference.usage_examples.map((example, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Example {index + 1}
                  </span>
                  <button
                    onClick={() => onCopy(example, `usage-example-${index}`)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      copiedStates[`usage-example-${index}`]
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copiedStates[`usage-example-${index}`] ? (
                      <>
                        <CheckCircle className="h-3 w-3 inline mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 inline mr-1" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3">
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                    <code>{example}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Link to GitHub README */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Want more details?
              </p>
              <a
                  href={`${repositoryUrl}#readme`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full README on GitHub
              </a>
          </div>
      </div>
    </div>
  );
};

export default APIReferenceTab;