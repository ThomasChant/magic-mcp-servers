import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getServerBySlug } from "./src/server-utils.js";

// Simple test component to check if React Query works in SSR
function TestComponent({ slug }) {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    console.log('TestComponent mounted');
    // Simulate useQuery behavior
    try {
      const cachedData = queryClient.getQueryData(["supabase", "server", slug]);
      console.log('Cached data:', cachedData ? 'EXISTS' : 'NOT FOUND');
      setData(cachedData);
    } catch (err) {
      console.log('Error getting cached data:', err.message);
      setError(err);
    }
  }, [slug]);
  
  if (error) {
    return React.createElement('div', null, `Error: ${error.message}`);
  }
  
  if (!data) {
    return React.createElement('div', null, 'No data found in cache');
  }
  
  return React.createElement('div', null, `Found server: ${data.name}`);
}

async function testQueryCache() {
  try {
    console.log('=== TESTING REACT QUERY CACHE IN SSR ===');
    
    const slug = 'InditexTech_mcp-teams-server';
    
    // Step 1: Get server data
    console.log('1. Fetching server data...');
    const serverData = await getServerBySlug(slug);
    console.log(`   - Server found: ${serverData ? serverData.name : 'NOT FOUND'}`);
    
    // Step 2: Create QueryClient
    console.log('2. Creating QueryClient...');
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
        },
      },
    });
    
    // Step 3: Pre-populate cache
    console.log('3. Pre-populating cache...');
    if (serverData) {
      queryClient.setQueryData(["supabase", "server", slug], serverData);
      console.log('   - Cache populated');
      
      // Verify cache
      const cachedData = queryClient.getQueryData(["supabase", "server", slug]);
      console.log(`   - Cache verification: ${cachedData ? 'SUCCESS' : 'FAILED'}`);
      if (cachedData) {
        console.log(`   - Cached server name: ${cachedData.name}`);
      }
    }
    
    // Step 4: Test rendering with QueryClient
    console.log('4. Testing SSR with QueryClient...');
    
    // Make queryClient globally available for the test component
    global.queryClient = queryClient;
    
    const html = renderToString(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(
            MemoryRouter,
            { initialEntries: [`/servers/${slug}`] },
            React.createElement(TestComponent, { slug })
          )
        )
      )
    );
    
    console.log('5. SSR completed');
    console.log(`   - HTML length: ${html.length}`);
    console.log(`   - HTML content: ${html}`);
    
    console.log('\n=== TEST COMPLETE ===');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

testQueryCache();