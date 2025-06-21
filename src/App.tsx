import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home";
import ServersPage from "./pages/Servers";
import ServerDetailPage from "./pages/ServerDetail";
import CategoriesPage from "./pages/Categories";
import CategoryDetailPage from "./pages/CategoryDetail";
import DocsPage from "./pages/Docs";
import AboutPage from "./pages/About";

// 创建 Query Client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5分钟
        },
    },
});

const NotFoundPage = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">页面未找到</p>
        <a href="/" className="btn-primary">
            返回首页
        </a>
    </div>
);

function App() {
    return (
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
                        <Route path="about" element={<AboutPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Route>
                </Routes>
            </Router>
        </QueryClientProvider>
    );
}

export default App;
