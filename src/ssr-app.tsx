import React from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-react";
import Layout from "./components/Layout/Layout";
import LocaleRouter from "./components/LocaleRouter";
import Home from "./pages/Home";
import ServersPage from "./pages/Servers";
import ServerDetailPage from "./pages/ServerDetail";
import CategoriesPage from "./pages/Categories";
import CategoryDetailPage from "./pages/CategoryDetail";
import TagsPage from "./pages/Tags";
import TagDetailPage from "./pages/TagDetail";
import DocsPage from "./pages/Docs";
import FavoritesPage from "./pages/Favorites";
import NotFoundPage from "./pages/NotFound";
import { isClientSide } from "./utils/environment";

// Create a context for SSR data
export const SSRDataContext = React.createContext<{
  serverData?: unknown;
  readmeData?: unknown;
  categoryData?: unknown;
  pageType?: string;
  url?: string;
}>({});


interface SSRAppProps {
  queryClient: QueryClient;
  ssrData?: {
    serverData?: unknown;
    readmeData?: unknown;
    categoryData?: unknown;
    pageType?: string;
    url?: string;
  };
}

export function SSRApp({ queryClient, ssrData = {} }: SSRAppProps) {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  // Create the routes component
  const AppRoutes = () => (
    <QueryClientProvider client={queryClient}>
      <SSRDataContext.Provider value={ssrData}>
        <LocaleRouter>
          <Routes>
            {/* Default locale routes (no prefix) */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="servers" element={<ServersPage />} />
              <Route path="servers/:slug" element={<ServerDetailPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="categories/:id" element={<CategoryDetailPage />} />
              <Route path="tags" element={<TagsPage />} />
              <Route path="tags/:tag" element={<TagDetailPage />} />
              <Route path="docs" element={<DocsPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
            </Route>
            
            {/* Localized routes with locale prefix */}
            <Route path="/:locale" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="servers" element={<ServersPage />} />
              <Route path="servers/:slug" element={<ServerDetailPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="categories/:id" element={<CategoryDetailPage />} />
              <Route path="tags" element={<TagsPage />} />
              <Route path="tags/:tag" element={<TagDetailPage />} />
              <Route path="docs" element={<DocsPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </LocaleRouter>
      </SSRDataContext.Provider>
    </QueryClientProvider>
  );

  // Always wrap with ClerkProvider, but provide different configurations for SSR
  if (clerkPubKey) {
    const clerkProps = isClientSide() 
      ? { publishableKey: clerkPubKey }
      : { 
          publishableKey: clerkPubKey,
          // SSR-specific options
          appearance: {},
          initialState: undefined,
          // Disable features that require browser APIs
          afterSignInUrl: undefined,
          afterSignUpUrl: undefined,
          afterSignOutUrl: undefined,
        };
    
    return (
      <ClerkProvider {...clerkProps}>
        <AppRoutes />
      </ClerkProvider>
    );
  }

  // When Clerk is not configured, render without ClerkProvider
  return <AppRoutes />;
}