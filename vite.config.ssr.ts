import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// SSR 构建专用配置
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "~/": path.resolve(__dirname, "./src/"),
            "~": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        ssr: true,
        outDir: "dist/server",
        rollupOptions: {
            input: "src/entry-server.tsx",
            output: {
                // SSR 构建使用固定文件名，不带哈希
                entryFileNames: "[name].js",
                chunkFileNames: "chunks/[name].js",
                assetFileNames: "assets/[name].[ext]",
            },
        },
    },
});