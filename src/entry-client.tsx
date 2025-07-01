import React from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import "./index.css";
import { SSRApp } from "./ssr-app";
// Import i18n to ensure it's initialized on client side
import "./i18n";

// Create a new QueryClient for client-side
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000,
        },
    },
});

hydrateRoot(
    document.getElementById("root")!,
    <React.StrictMode>
        <BrowserRouter>
            <SSRApp queryClient={queryClient} />
        </BrowserRouter>
    </React.StrictMode>
);