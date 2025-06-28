/**
 * Unit Tests for useData hooks
 * 
 * These tests verify the optimized data loading hooks work correctly:
 * 1. Core data loads independently
 * 2. Extended data loads separately
 * 3. Data merging works correctly
 * 4. Search index functionality
 * 5. README loading
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useServers,
  useCoreServers,
  useServer,
  useFeaturedServers,
  useServersByCategory,
  useServerReadme,
  useCategories
} from '../src/hooks/useData';

// Mock fetch globally
global.fetch = vi.fn();

// Create wrapper component for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        cacheTime: 0,
      },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return wrapper;
};

// Mock data
const mockCoreData = [
  {
    id: 'server1',
    name: 'Test Server 1',
    owner: 'testowner',
    slug: 'test-server-1',
    description: 'A test server for API integration',
    category: 'web-network',
    subcategory: 'api-integration',
    featured: true,
    verified: true,
    stats: {
      stars: 100,
      forks: 20,
      lastUpdated: '2024-01-01T00:00:00.000Z'
    },
    qualityScore: 85,
    tags: ['api', 'testing', 'integration'],
    links: {
      github: 'https://github.com/testowner/test-server-1',
      npm: 'https://npmjs.com/package/test-server-1',
      docs: 'https://docs.test-server-1.com'
    }
  },
  {
    id: 'server2',
    name: 'Test Server 2',
    owner: 'testowner2',
    slug: 'test-server-2',
    description: 'Another test server for database operations',
    category: 'data-storage',
    subcategory: 'database',
    featured: false,
    verified: false,
    stats: {
      stars: 50,
      forks: 10,
      lastUpdated: '2024-01-02T00:00:00.000Z'
    },
    qualityScore: 70,
    tags: ['database', 'sql', 'storage'],
    links: {
      github: 'https://github.com/testowner2/test-server-2',
      npm: '',
      docs: ''
    }
  }
];

const mockExtendedData = {
  server1: {
    fullDescription: 'Extended description for server 1',
    techStack: ['Node.js', 'TypeScript', 'Express'],
    serviceTypes: ['REST API', 'GraphQL'],
    quality: {
      score: 85,
      factors: {
        documentation: 90,
        maintenance: 80,
        community: 85,
        performance: 85
      }
    },
    metadata: {
      complexity: 'medium',
      maturity: 'stable',
      deployment: ['cloud', 'local'],
      createdAt: '2023-01-01T00:00:00.000Z'
    },
    categorization: {
      confidence: 0.9,
      reason: 'API integration patterns detected',
      matched_keywords: ['api', 'integration']
    },
    usage: {
      downloads: 10000,
      dependents: 50,
      weeklyDownloads: 200
    },
    installation: {
      npm: 'npm install test-server-1',
      pip: null,
      docker: 'docker pull test-server-1',
      manual: null,
      uv: null,
      instructions: [
        {
          type: 'bash',
          content: 'npm install test-server-1',
          description: 'Install via npm'
        }
      ]
    },
    repository: {
      url: 'https://github.com/testowner/test-server-1',
      owner: 'testowner',
      name: 'test-server-1',
      stars: 100,
      forks: 20,
      lastUpdated: '2024-01-01T00:00:00.000Z',
      watchers: 80,
      openIssues: 5
    },
    compatibility: {
      platforms: ['linux', 'macos', 'windows'],
      nodeVersion: '>=18.0.0',
      pythonVersion: null,
      requirements: ['Node.js 18+']
    },
    documentation: {
      hasReadme: true,
      hasExamples: true,
      hasApiReference: true,
      hasInstallation: true,
      api: 'https://docs.test-server-1.com/api'
    },
    allTags: ['api', 'testing', 'integration', 'nodejs', 'typescript'],
    badges: [
      { name: 'Featured', type: 'featured', color: 'blue' },
      { name: 'Verified', type: 'verified', color: 'green' }
    ],
    icon: 'https://example.com/icon.png'
  },
  server2: {
    fullDescription: 'Extended description for server 2',
    techStack: ['Python', 'SQLAlchemy', 'PostgreSQL'],
    serviceTypes: ['Database', 'ORM'],
    quality: {
      score: 70,
      factors: {
        documentation: 65,
        maintenance: 70,
        community: 60,
        performance: 85
      }
    },
    metadata: {
      complexity: 'high',
      maturity: 'beta',
      deployment: ['local'],
      createdAt: '2023-06-01T00:00:00.000Z'
    },
    categorization: {
      confidence: 0.8,
      reason: 'Database operations detected',
      matched_keywords: ['database', 'sql']
    },
    usage: {
      downloads: 5000,
      dependents: 25,
      weeklyDownloads: 100
    },
    installation: {
      npm: null,
      pip: 'pip install test-server-2',
      docker: null,
      manual: 'Manual installation required',
      uv: 'uv add test-server-2',
      instructions: [
        {
          type: 'bash',
          content: 'pip install test-server-2',
          description: 'Install via pip'
        }
      ]
    },
    repository: {
      url: 'https://github.com/testowner2/test-server-2',
      owner: 'testowner2',
      name: 'test-server-2',
      stars: 50,
      forks: 10,
      lastUpdated: '2024-01-02T00:00:00.000Z',
      watchers: 40,
      openIssues: 8
    },
    compatibility: {
      platforms: ['linux', 'macos'],
      nodeVersion: null,
      pythonVersion: '>=3.8',
      requirements: ['Python 3.8+', 'PostgreSQL']
    },
    documentation: {
      hasReadme: true,
      hasExamples: false,
      hasApiReference: false,
      hasInstallation: true,
      api: null
    },
    allTags: ['database', 'sql', 'storage', 'python', 'postgresql'],
    badges: [
      { name: 'Beta', type: 'status', color: 'orange' }
    ],
    icon: null
  }
};

const mockCategories = [
  {
    id: 'web-network',
    name: 'Web & Network',
    nameEn: 'Web & Network',
    description: 'Web and networking services',
    descriptionEn: 'Web and networking services',
    icon: 'globe',
    color: 'blue',
    serverCount: 1,
    subcategories: [
      {
        id: 'api-integration',
        name: 'API Integration',
        nameEn: 'API Integration',
        description: 'API integration services',
        descriptionEn: 'API integration services'
      }
    ]
  },
  {
    id: 'data-storage',
    name: 'Data & Storage',
    nameEn: 'Data & Storage',
    description: 'Data and storage services',
    descriptionEn: 'Data and storage services',
    icon: 'database',
    color: 'green',
    serverCount: 1,
    subcategories: [
      {
        id: 'database',
        name: 'Database',
        nameEn: 'Database',
        description: 'Database services',
        descriptionEn: 'Database services'
      }
    ]
  }
];


const mockReadmeData = {
  serverId: 'server1',
  sections: {
    overview: 'This is a test server for API integration.',
    installation: 'Run npm install test-server-1',
    usage: 'Import and use the server functions',
    api: 'API documentation here',
    examples: 'Example code snippets'
  },
  metadata: {
    hasInstallation: true,
    hasExamples: true,
    hasApiReference: true,
    wordCount: 100,
    lastUpdated: '2024-01-01T00:00:00.000Z'
  }
};

describe('useData hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCoreServers', () => {
    it('should fetch core server data successfully', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCoreData,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCoreServers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockCoreData);
      expect(mockFetch).toHaveBeenCalledWith('/data/servers-core.json');
    });

    it('should handle fetch errors', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCoreServers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });


  describe('useServers', () => {
    it('should merge core and extended data correctly', async () => {
      const mockFetch = vi.mocked(fetch);
      
      // Mock core data fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCoreData,
      } as Response);
      
      // Mock extended data fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockExtendedData,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useServers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBe(2);
      
      const server1 = result.current.data?.find(s => s.id === 'server1');
      expect(server1).toBeDefined();
      expect(server1?.name).toBe('Test Server 1');
      expect(server1?.fullDescription).toBe('Extended description for server 1');
      expect(server1?.quality.score).toBe(85);
      expect(server1?.usage.downloads).toBe(10000);
    });

    it('should work with core data only when extended data is not available', async () => {
      const mockFetch = vi.mocked(fetch);
      
      // Mock core data fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCoreData,
      } as Response);
      
      // Mock extended data fetch failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useServers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBe(2);
      
      const server1 = result.current.data?.find(s => s.id === 'server1');
      expect(server1).toBeDefined();
      expect(server1?.name).toBe('Test Server 1');
      // Should use fallback values when extended data is not available
      expect(server1?.usage.downloads).toBe(1000); // stars * 10
    });
  });

  describe('useServer', () => {
    it('should return specific server by ID', async () => {
      const mockFetch = vi.mocked(fetch);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCoreData,
      } as Response);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockExtendedData,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useServer('server1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.id).toBe('server1');
      expect(result.current.data?.name).toBe('Test Server 1');
    });

    it('should return undefined for non-existent server', async () => {
      const mockFetch = vi.mocked(fetch);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCoreData,
      } as Response);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockExtendedData,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useServer('nonexistent'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useFeaturedServers', () => {
    it('should return only featured servers', async () => {
      const mockFetch = vi.mocked(fetch);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCoreData,
      } as Response);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockExtendedData,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useFeaturedServers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBe(1);
      expect(result.current.data?.[0].id).toBe('server1');
      expect(result.current.data?.[0].featured).toBe(true);
    });
  });

  describe('useServersByCategory', () => {
    it('should return servers filtered by category', async () => {
      const mockFetch = vi.mocked(fetch);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCoreData,
      } as Response);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockExtendedData,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useServersByCategory('web-network'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBe(1);
      expect(result.current.data?.[0].id).toBe('server1');
      expect(result.current.data?.[0].category).toBe('web-network');
    });
  });

  describe('useCategories', () => {
    it('should fetch and transform categories correctly', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCategories(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBe(2);
      
      const category1 = result.current.data?.[0];
      expect(category1?.id).toBe('web-network');
      expect(category1?.name['en']).toBe('Web & Network');
      expect(category1?.subcategories).toHaveLength(1);
    });
  });


  describe('useServerReadme', () => {
    it('should fetch README data for specific server', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReadmeData,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useServerReadme('server1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockReadmeData);
      expect(mockFetch).toHaveBeenCalledWith('/data/readme/server1.json');
    });

    it('should return null for non-existent README', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useServerReadme('nonexistent'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
    });

    it('should not fetch when serverId is empty', async () => {
      const mockFetch = vi.mocked(fetch);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useServerReadme(''), { wrapper });

      // Should not make any fetch call
      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
    });
  });
});