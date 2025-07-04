import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  CheckCircle, 
  Package, 
  Dock,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import type { ExtractedInstallation, InstallationMethod, ClientConfig } from '../types';

interface InstallationTabProps {
  installation?: ExtractedInstallation;
  repositoryUrl: string;
  copiedStates: { [key: string]: boolean };
  onCopy: (text: string, buttonId: string) => void;
}

const InstallationTab: React.FC<InstallationTabProps> = ({
  installation,
  repositoryUrl,
  copiedStates,
  onCopy
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['methods']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'npm':
        return <Package className="h-5 w-5 text-red-600" />;
      case 'pip':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'Dock':
        return <Dock className="h-5 w-5 text-blue-500" />;
      case 'uv':
        return <Terminal className="h-5 w-5 text-purple-600" />;
      default:
        return <Terminal className="h-5 w-5 text-gray-600" />;
    }
  };

  const getClientIcon = (client: string) => {
    switch (client) {
      case 'claude':
        return '🤖';
      case 'vscode':
        return '💻';
      case 'cursor':
        return '🎯';
      case 'windsurf':
        return '🏄‍♂️';
      case 'zed':
        return '⚡';
      default:
        return '🔧';
    }
  };

  if (!installation || (!installation.methods?.length && !installation.client_configs?.length)) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Installation instructions not available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Detailed installation instructions are being processed. Please check the repository for setup information.
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
      {/* Prerequisites */}
      {installation.prerequisites && installation.prerequisites.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Prerequisites
          </h3>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <ul className="space-y-2">
              {installation.prerequisites.map((req, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-amber-600 dark:text-amber-400 mr-2">•</span>
                  <span className="text-amber-800 dark:text-amber-200">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Installation Methods */}
      {installation.methods && installation.methods.length > 0 && (
        <div>
          <button
            onClick={() => toggleSection('methods')}
            className="flex items-center w-full text-left mb-4"
          >
            {expandedSections.has('methods') ? (
              <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
            )}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Installation Methods
            </h3>
          </button>

          {expandedSections.has('methods') && (
            <div className="space-y-4">
              {installation.methods.map((method: InstallationMethod, index: number) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedMethod === `method-${index}`
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                    }`}
                    onClick={() => setSelectedMethod(selectedMethod === `method-${index}` ? '' : `method-${index}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getMethodIcon(method.type)}
                        <div className="ml-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {method.title}
                          </h4>
                          {method.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {method.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {selectedMethod === `method-${index}` ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {selectedMethod === `method-${index}` && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                      {method.commands.map((command: string, cmdIndex: number) => (
                        <div key={cmdIndex} className="mb-3 last:mb-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Command {cmdIndex + 1}:
                            </span>
                            <button
                              onClick={() => onCopy(command, `method-${index}-cmd-${cmdIndex}`)}
                              className={`text-xs px-2 py-1 rounded transition-colors ${
                                copiedStates[`method-${index}-cmd-${cmdIndex}`]
                                  ? 'bg-green-600 text-white'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {copiedStates[`method-${index}-cmd-${cmdIndex}`] ? (
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
                          <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                            <code>{command}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Client Configurations */}
      {installation.client_configs && installation.client_configs.length > 0 && (
        <div>
          <button
            onClick={() => toggleSection('clients')}
            className="flex items-center w-full text-left mb-4"
          >
            {expandedSections.has('clients') ? (
              <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
            )}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Client Configurations
            </h3>
          </button>

          {expandedSections.has('clients') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {installation.client_configs.map((config: ClientConfig, index: number) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{getClientIcon(config.client)}</span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                          {config.client}
                        </h4>
                        {config.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {config.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onCopy(config.config_json, `client-${index}`)}
                      className={`text-xs px-3 py-1.5 rounded transition-colors ${
                        copiedStates[`client-${index}`]
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {copiedStates[`client-${index}`] ? (
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
                  
                  {config.config_path && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Config path: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{config.config_path}</code>
                    </p>
                  )}
                  
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                    <code>{config.config_json}</code>
                  </pre>
                  
                  {config.notes && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {config.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Environment Setup */}
      {installation.environment_setup && installation.environment_setup.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Environment Variables
          </h3>
          <div className="space-y-3">
            {installation.environment_setup.map((env, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <code className="font-mono font-medium text-gray-900 dark:text-white">
                    {env.name}
                  </code>
                  {env.required && (
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {env.description}
                </p>
                <div className="flex items-center">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono flex-1 mr-2">
                    {env.value}
                  </code>
                  <button
                    onClick={() => onCopy(env.value, `env-${index}`)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      copiedStates[`env-${index}`]
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copiedStates[`env-${index}`] ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallationTab;