import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => {
    // Load env file based on `mode` in the current working directory.
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
        plugins: [react()],
        resolve: {
            alias: {
                "~/": path.resolve(__dirname, "./src/"),
                "~": path.resolve(__dirname, "./src"),
            },
        },
        server: {
            port: 3000,
            open: true,
        },
        build: {
            rollupOptions: {
                input: {
                    client: "./index.html",
                    "client-ssr": "./index-ssr.html",
                    server: "./src/entry-server.tsx",
                },
            },
            ssr: false,
        },
        ssr: {
            // SSR specific options
            format: "esm",
        },
        define: ssrBuild ? {
            // For SSR builds, inject environment variables as constants
            'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
            'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
            'process.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY),
            'process.env.VITE_USE_SUPABASE': JSON.stringify(env.VITE_USE_SUPABASE),
        } : {},
    };
});
