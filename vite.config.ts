import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
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
            outDir: 'dist/client',
            rollupOptions: {
                input: "./index.html",
            },
        },
    };
});
