import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-react";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import ServersPage from "./pages/Servers";
import ServerDetailPage from "./pages/ServerDetail";
import CategoriesPage from "./pages/Categories";
import CategoryDetailPage from "./pages/CategoryDetail";
import DocsPage from "./pages/Docs";
import ProfilePage from "./pages/Profile";
import FavoritesPage from "./pages/Favorites";
import { useAppStore } from "./store/useAppStore";

// Get Clerk publishable key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
    throw new Error("Missing Clerk publishable key");
}

// Create Query Client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

const NotFoundPage = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page Not Found</p>
        <a href="/" className="btn-primary">
            Back to Home
        </a>
    </div>
);

function App() {
    const theme = useAppStore((state) => state.theme);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    return (
        <ClerkProvider publishableKey={clerkPubKey}>
            <QueryClientProvider client={queryClient}>
                <Router>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Home />} />
                            <Route path="servers" element={<ServersPage />} />
                            <Route
                                path="servers/:id"
                                element={<ServerDetailPage />}
                            />
                            <Route path="categories" element={<CategoriesPage />} />
                            <Route
                                path="categories/:id"
                                element={<CategoryDetailPage />}
                            />
                            <Route path="docs" element={<DocsPage />} />
                            <Route 
                                path="profile" 
                                element={
                                    <ProtectedRoute>
                                        <ProfilePage />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route path="favorites" element={<FavoritesPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </Route>
                    </Routes>
                </Router>
            </QueryClientProvider>
        </ClerkProvider>
    );
}

export default App;
