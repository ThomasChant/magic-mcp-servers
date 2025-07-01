import React from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-react";
import Layout from "./components/Layout/Layout";
import { ClientOnly } from "./components/ClientOnly";
import Home from "./pages/Home";
import ServersPage from "./pages/Servers";
import ServerDetailPage from "./pages/ServerDetail";
import CategoriesPage from "./pages/Categories";
import CategoryDetailPage from "./pages/CategoryDetail";
import DocsPage from "./pages/Docs";
import FavoritesPage from "./pages/Favorites";
import { isClientSide } from "./utils/environment";

// Create a context for SSR data
export const SSRDataContext = React.createContext<{
  serverData?: any;
  readmeData?: any;
  url?: string;
}>({});

const NotFoundPage = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Page Not Found</p>
    <a href="/" className="btn-primary">
      Back to Home
    </a>
  </div>
);

interface SSRAppProps {
  queryClient: QueryClient;
  ssrData?: {
    serverData?: any;
    readmeData?: any;
    url?: string;
  };
}

export function SSRApp({ queryClient, ssrData = {} }: SSRAppProps) {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  // Create the routes component
  const AppRoutes = () => (
    <QueryClientProvider client={queryClient}>
      <SSRDataContext.Provider value={ssrData}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="servers" element={<ServersPage />} />
            <Route path="servers/:slug" element={<ServerDetailPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="categories/:id" element={<CategoryDetailPage />} />
            <Route path="docs" element={<DocsPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </SSRDataContext.Provider>
    </QueryClientProvider>
  );

  // On client side, wrap with ClerkProvider for authentication features
  if (isClientSide() && clerkPubKey) {
    return (
      <ClerkProvider publishableKey={clerkPubKey}>
        <AppRoutes />
      </ClerkProvider>
    );
  }

  // On server side or when Clerk is not configured, render without ClerkProvider
  return <AppRoutes />;
}