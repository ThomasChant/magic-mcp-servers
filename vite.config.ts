import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(() => {
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
            outDir: "dist/client",
            manifest: true, // 启用manifest文件生成
            rollupOptions: {
                input: "./index.html",
                output: {
                    // 自定义文件名模式
                    entryFileNames: "assets/[name].[hash].js", // 入口文件
                    chunkFileNames: "assets/[name].[hash].js", // 代码块文件
                    assetFileNames: "assets/[name].[hash].[ext]", // 资源文件（CSS、图片等）

                    // 禁用哈希的配置（不推荐生产环境）
                    // entryFileNames: 'assets/[name].js',
                    // chunkFileNames: 'assets/[name].js',
                    // assetFileNames: 'assets/[name].[ext]',
                },
            },
        },
    };
});
