import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { ClientOnly } from "./components/ClientOnly";
import LocaleRouter from "./components/LocaleRouter";
import "./i18n"; // Initialize i18n
import Home from "./pages/Home";
import ServersPage from "./pages/Servers";
import ServerDetailPage from "./pages/ServerDetail";
import CategoriesPage from "./pages/Categories";
import CategoryDetailPage from "./pages/CategoryDetail";
import DocsPage from "./pages/Docs";
import ProfilePage from "./pages/Profile";
import FavoritesPage from "./pages/Favorites";
import TagDetailPage from "./pages/TagDetail";
import TagsPage from "./pages/Tags";
import { useAppStore } from "./store/useAppStore";
import { useFavoritesSyncWithClerk } from "./hooks/useFavoritesSyncSafe";
import { isClientSide } from "./utils/environment";

// Get Clerk publishable key - only on client side
const clerkPubKey = isClientSide() ? import.meta.env.VITE_CLERK_PUBLISHABLE_KEY : null;

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

const NotFoundPage = () => {
    const { t } = useTranslation("common");
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">{t("common.notFound")}</p>
            <a href="/" className="btn-primary">
                {t("common.backToHome")}
            </a>
        </div>
    );
};

// SSR兼容的AppContent - 不包含Clerk相关功能
function AppContentSSR() {
    const theme = useAppStore((state) => state.theme);

    useEffect(() => {
        // Only access document on client side
        if (isClientSide()) {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [theme]);

    return (
        <QueryClientProvider client={queryClient}>
            <LocaleRouter>
                {/* Router is now provided by entry-client.tsx or entry-server.tsx */}
                <Routes>
                    {/* Default locale routes (no prefix) */}
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="servers" element={<ServersPage />} />
                        <Route
                            path="servers/:slug"
                            element={<ServerDetailPage />}
                        />
                        <Route path="categories" element={<CategoriesPage />} />
                        <Route
                            path="categories/:id"
                            element={<CategoryDetailPage />}
                        />
                        <Route path="tags" element={<TagsPage />} />
                        <Route path="tags/:tag" element={<TagDetailPage />} />
                        <Route path="docs" element={<DocsPage />} />
                        <Route path="favorites" element={<FavoritesPage />} />
                    </Route>
                    
                    {/* Localized routes with locale prefix */}
                    <Route path="/:locale" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="servers" element={<ServersPage />} />
                        <Route
                            path="servers/:slug"
                            element={<ServerDetailPage />}
                        />
                        <Route path="categories" element={<CategoriesPage />} />
                        <Route
                            path="categories/:id"
                            element={<CategoryDetailPage />}
                        />
                        <Route path="tags" element={<TagsPage />} />
                        <Route path="tags/:tag" element={<TagDetailPage />} />
                        <Route path="docs" element={<DocsPage />} />
                        <Route path="favorites" element={<FavoritesPage />} />
                    </Route>
                    
                    {/* 404 route */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </LocaleRouter>
        </QueryClientProvider>
    );
}

// 客户端专用的AppContent - 包含Clerk功能
function AppContentWithClerk() {
    const theme = useAppStore((state) => state.theme);
    
    // Initialize favorites sync (需要Clerk Provider)
    useFavoritesSyncWithClerk();

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    return (
        <QueryClientProvider client={queryClient}>
            <LocaleRouter>
                <Routes>
                    {/* Default locale routes (no prefix) */}
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="servers" element={<ServersPage />} />
                        <Route
                            path="servers/:slug"
                            element={<ServerDetailPage />}
                        />
                        <Route path="categories" element={<CategoriesPage />} />
                        <Route
                            path="categories/:id"
                            element={<CategoryDetailPage />}
                        />
                        <Route path="tags" element={<TagsPage />} />
                        <Route path="tags/:tag" element={<TagDetailPage />} />
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
                    </Route>
                    
                    {/* Localized routes with locale prefix */}
                    <Route path="/:locale" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="servers" element={<ServersPage />} />
                        <Route
                            path="servers/:slug"
                            element={<ServerDetailPage />}
                        />
                        <Route path="categories" element={<CategoriesPage />} />
                        <Route
                            path="categories/:id"
                            element={<CategoryDetailPage />}
                        />
                        <Route path="tags" element={<TagsPage />} />
                        <Route path="tags/:tag" element={<TagDetailPage />} />
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
                    </Route>
                    
                    {/* 404 route */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </LocaleRouter>
        </QueryClientProvider>
    );
}

function App() {
    return (
        <ClientOnly fallback={<AppContentSSR />}>
            {clerkPubKey ? (
                <ClerkProvider publishableKey={clerkPubKey}>
                    <AppContentWithClerk />
                </ClerkProvider>
            ) : (
                <AppContentSSR />
            )}
        </ClientOnly>
    );
}

export default App;
