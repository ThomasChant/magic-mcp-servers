import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
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
});
