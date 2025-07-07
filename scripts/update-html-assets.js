#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

/**
 * 自动更新 index-ssr.html 中的资源文件引用
 * 读取 manifest.json 获取最新的文件名，并更新 HTML 模板
 */
async function updateHtmlAssets() {
    try {
        console.log("🔄 开始更新 HTML 资源文件引用...");

        // 读取 manifest.json
        const manifestPath = path.join(
            projectRoot,
            "dist/client/.vite/manifest.json"
        );
        if (!fs.existsSync(manifestPath)) {
            console.error("❌ manifest.json 文件不存在，请先运行构建命令");
            process.exit(1);
        }

        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
        console.log("📄 读取 manifest.json 成功");

        // 查找入口文件的CSS和JS
        const indexEntry = manifest["index.html"];
        if (!indexEntry) {
            console.error("❌ 在 manifest 中找不到 index.html 入口");
            process.exit(1);
        }

        const cssFile = indexEntry.css ? indexEntry.css[0] : null;
        const jsFile = indexEntry.file;

        if (!cssFile || !jsFile) {
            console.error("❌ 无法找到 CSS 或 JS 文件引用");
            console.log(
                "当前 manifest 内容:",
                JSON.stringify(indexEntry, null, 2)
            );
            process.exit(1);
        }

        console.log("✅ 找到资源文件:");
        console.log(`   CSS: ${cssFile}`);
        console.log(`   JS:  ${jsFile}`);

        // 读取 index-ssr.html 模板
        const htmlTemplatePath = path.join(projectRoot, "index-ssr.html");
        if (!fs.existsSync(htmlTemplatePath)) {
            console.error("❌ index-ssr.html 模板文件不存在");
            process.exit(1);
        }

        let htmlContent = fs.readFileSync(htmlTemplatePath, "utf-8");

        // 更新 CSS 引用
        const cssRegex =
            /<link rel="stylesheet"[^>]*href="\/assets\/[^"]*\.css"[^>]*>/;
        const newCssLink = `<link rel="stylesheet" crossorigin href="/${cssFile}">`;
        htmlContent = htmlContent.replace(cssRegex, newCssLink);

        // 更新 JS 引用
        const jsRegex =
            /<script type="module"[^>]*src="\/assets\/[^"]*\.js"[^>]*><\/script>/;
        const newJsScript = `<script type="module" crossorigin src="/${jsFile}"></script>`;
        htmlContent = htmlContent.replace(jsRegex, newJsScript);

        // 写入更新后的内容到源文件
        fs.writeFileSync(htmlTemplatePath, htmlContent, "utf-8");

        // 同时更新 dist 目录中的副本
        const distHtmlPath = path.join(
            projectRoot,
            "dist/client/index-ssr.html"
        );
        fs.writeFileSync(distHtmlPath, htmlContent, "utf-8");

        // 更新服务端文件引用
        await updateServerEntryReference();

        console.log("✅ HTML 资源文件引用更新成功!");
        console.log(`   更新了: ${htmlTemplatePath}`);
        console.log(`   更新了: ${distHtmlPath}`);
    } catch (error) {
        console.error("❌ 更新过程中发生错误:", error.message);
        process.exit(1);
    }
}

/**
 * 更新服务端入口文件引用
 */
async function updateServerEntryReference() {
    try {
        console.log("🔄 更新服务端入口文件引用...");

        // 读取服务端 manifest.json
        const serverManifestPath = path.join(
            projectRoot,
            "dist/server/.vite/manifest.json"
        );
        if (!fs.existsSync(serverManifestPath)) {
            console.warn("⚠️ 服务端 manifest.json 不存在，跳过服务端更新");
            return;
        }

        const serverManifest = JSON.parse(
            fs.readFileSync(serverManifestPath, "utf-8")
        );
        const entryServerEntry = serverManifest["src/entry-server.tsx"];

        if (!entryServerEntry || !entryServerEntry.file) {
            console.error("❌ 在服务端 manifest 中找不到 entry-server 文件");
            return;
        }

        const serverEntryFile = entryServerEntry.file; // 例如: "assets/entry-server.ysiTMTjp.js"
        console.log(`✅ 找到服务端入口文件: ${serverEntryFile}`);

        // 更新 server-simple.js 中的引用
        const serverFilePath = path.join(projectRoot, "server-simple.js");
        if (!fs.existsSync(serverFilePath)) {
            console.error("❌ server-simple.js 文件不存在");
            return;
        }

        let serverFileContent = fs.readFileSync(serverFilePath, "utf-8");

        // 匹配并替换 import 语句中的路径 (支持多行格式)
        const importRegex =
            /await import\(\s*"\.\/dist\/server\/[^"]*\.js"\s*\)/gs;
        const newImportPath = `await import(\n                    "./dist/server/${serverEntryFile}"\n                )`;

        serverFileContent = serverFileContent.replace(
            importRegex,
            newImportPath
        );

        // 写入更新后的内容
        fs.writeFileSync(serverFilePath, serverFileContent, "utf-8");

        console.log("✅ 服务端入口文件引用更新成功!");
        console.log(`   更新了: ${serverFilePath}`);
        console.log(`   新路径: ./dist/server/${serverEntryFile}`);
    } catch (error) {
        console.error("❌ 更新服务端引用时发生错误:", error.message);
        // 不退出进程，允许客户端更新继续进行
    }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
    updateHtmlAssets();
}

export { updateHtmlAssets, updateServerEntryReference };
