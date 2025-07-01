import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

console.log("🔍 SSR组件兼容性诊断工具启动...\n");

// 测试基础组件
const TestBasicComponent = () => React.createElement('div', null, 'Basic Component Test');

// 测试路由组件
const TestRouterComponent = () => {
    return React.createElement(
        MemoryRouter,
        { initialEntries: ['/'] },
        React.createElement('div', null, 'Router Test')
    );
};

// 诊断函数
async function diagnoseComponent(name, componentFactory) {
    try {
        console.log(`\n🧪 测试组件: ${name}`);
        const startTime = Date.now();
        
        const html = renderToString(componentFactory());
        const renderTime = Date.now() - startTime;
        
        console.log(`✅ ${name} 渲染成功`);
        console.log(`   渲染时间: ${renderTime}ms`);
        console.log(`   HTML长度: ${html.length} 字符`);
        console.log(`   HTML预览: ${html.substring(0, 100)}${html.length > 100 ? '...' : ''}`);
        
        return { success: true, html, renderTime };
    } catch (error) {
        console.log(`❌ ${name} 渲染失败`);
        console.log(`   错误类型: ${error.name}`);
        console.log(`   错误信息: ${error.message}`);
        console.log(`   错误位置: ${error.stack.split('\n')[1]?.trim() || '未知'}`);
        
        return { success: false, error: error.message };
    }
}

// 逐步测试App组件的各个部分
async function diagnoseAppComponents() {
    console.log("📋 开始逐步诊断App组件...\n");
    
    const results = [];
    
    // 1. 测试基础组件
    results.push(await diagnoseComponent("基础组件", () => TestBasicComponent()));
    
    // 2. 测试路由组件
    results.push(await diagnoseComponent("路由组件", () => TestRouterComponent()));
    
    // 3. 测试导入的组件
    try {
        console.log("\n📦 测试组件导入...");
        
        // 尝试导入各个组件
        const componentTests = [
            { name: "App", path: "../src/App.js" },
            { name: "Layout", path: "../src/components/Layout/Layout.js" },
            { name: "Header", path: "../src/components/Layout/Header.js" },
            { name: "Home", path: "../src/pages/Home.js" }
        ];
        
        for (const test of componentTests) {
            try {
                console.log(`   📂 导入 ${test.name}...`);
                const module = await import(test.path);
                console.log(`   ✅ ${test.name} 导入成功`);
                console.log(`   📝 导出类型: ${typeof module.default}`);
                console.log(`   📋 导出键: ${Object.keys(module).join(', ')}`);
                
                // 检查组件类型
                if (typeof module.default === 'function') {
                    console.log(`   🔍 ${test.name} 是有效的React组件`);
                } else if (typeof module.default === 'object') {
                    console.log(`   ⚠️ ${test.name} 导出了对象而不是函数`);
                    console.log(`   📄 对象内容: ${JSON.stringify(Object.keys(module.default))}`);
                } else {
                    console.log(`   ❌ ${test.name} 导出类型异常: ${typeof module.default}`);
                }
            } catch (importError) {
                console.log(`   ❌ ${test.name} 导入失败: ${importError.message}`);
            }
        }
        
    } catch (error) {
        console.log(`❌ 组件导入测试失败: ${error.message}`);
    }
    
    // 4. 测试实际的服务端入口
    try {
        console.log("\n🚀 测试实际的服务端入口...");
        const serverModule = await import("../../dist/server/entry-server.js");
        console.log("✅ 服务端模块导入成功");
        console.log(`📋 导出函数: ${Object.keys(serverModule).join(', ')}`);
        
        if (typeof serverModule.render === 'function') {
            console.log("🔍 尝试调用render函数...");
            try {
                const result = serverModule.render('/');
                console.log("✅ render函数调用成功");
                console.log(`📏 HTML长度: ${result.html.length}`);
            } catch (renderError) {
                console.log("❌ render函数调用失败");
                console.log(`   错误: ${renderError.message}`);
                console.log(`   堆栈: ${renderError.stack.split('\n').slice(0, 5).join('\n')}`);
            }
        }
        
    } catch (error) {
        console.log(`❌ 服务端入口测试失败: ${error.message}`);
    }
    
    // 5. 生成诊断报告
    console.log("\n📊 诊断报告总结:");
    console.log("=" * 50);
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`✅ 成功测试: ${successCount}个组件`);
    console.log(`❌ 失败测试: ${failCount}个组件`);
    
    if (failCount > 0) {
        console.log("\n🔍 失败组件详情:");
        results.filter(r => !r.success).forEach((result, index) => {
            console.log(`   ${index + 1}. 错误: ${result.error}`);
        });
    }
    
    console.log("\n💡 建议下一步:");
    if (failCount === 0) {
        console.log("   🎉 基础组件测试都通过了，问题可能在复杂组件或第三方库中");
        console.log("   🔧 建议：逐步添加组件，找出具体的问题组件");
    } else {
        console.log("   🛠️ 优先修复基础组件问题");
        console.log("   📋 检查组件导入/导出是否正确");
    }
}

// 运行诊断
diagnoseAppComponents().catch(error => {
    console.error("💥 诊断过程出错:", error);
});