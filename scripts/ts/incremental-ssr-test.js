import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";

console.log("🔍 逐步SSR测试 - 找出问题组件...\n");

// 测试函数
function testComponent(name, component) {
    try {
        console.log(`🧪 测试: ${name}`);
        const html = renderToString(component);
        console.log(`✅ ${name} 渲染成功 (${html.length}字符)`);
        return true;
    } catch (error) {
        console.log(`❌ ${name} 渲染失败: ${error.message}`);
        console.log(`   堆栈: ${error.stack.split('\n')[1]?.trim()}`);
        return false;
    }
}

// 逐步构建App组件
async function incrementalTest() {
    console.log("📋 逐步构建和测试App组件...\n");
    
    // 1. 最简单的组件
    const Step1 = () => React.createElement('div', null, 'Step 1: Basic');
    testComponent("步骤1: 基础组件", React.createElement(Step1));
    
    // 2. 添加路由
    const Step2 = () => React.createElement(
        MemoryRouter,
        { initialEntries: ['/'] },
        React.createElement('div', null, 'Step 2: With Router')
    );
    testComponent("步骤2: 添加路由", React.createElement(Step2));
    
    // 3. 添加Routes和Route
    const Step3 = () => React.createElement(
        MemoryRouter,
        { initialEntries: ['/'] },
        React.createElement(
            Routes,
            null,
            React.createElement(Route, {
                path: '/',
                element: React.createElement('div', null, 'Step 3: With Routes')
            })
        )
    );
    testComponent("步骤3: 添加Routes", React.createElement(Step3));
    
    // 4. 尝试导入真实组件并逐个测试
    console.log("\n📦 测试真实组件导入...");
    
    try {
        // 测试ClerkProvider
        console.log("🔍 测试Clerk组件...");
        const { ClerkProvider } = await import("@clerk/clerk-react");
        console.log("✅ Clerk导入成功");
        
        const clerkPubKey = "pk_test_dummy"; // 测试用的key
        const Step4 = () => React.createElement(
            ClerkProvider,
            { publishableKey: clerkPubKey },
            React.createElement('div', null, 'Step 4: With Clerk')
        );
        
        const clerkSuccess = testComponent("步骤4: 添加ClerkProvider", React.createElement(Step4));
        
        if (!clerkSuccess) {
            console.log("❌ Clerk组件可能是问题源");
        }
        
    } catch (clerkError) {
        console.log(`❌ Clerk导入失败: ${clerkError.message}`);
    }
    
    try {
        // 测试QueryClient
        console.log("\n🔍 测试QueryClient组件...");
        const { QueryClient, QueryClientProvider } = await import("@tanstack/react-query");
        console.log("✅ QueryClient导入成功");
        
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false, staleTime: Infinity }
            }
        });
        
        const Step5 = () => React.createElement(
            QueryClientProvider,
            { client: queryClient },
            React.createElement('div', null, 'Step 5: With QueryClient')
        );
        
        const querySuccess = testComponent("步骤5: 添加QueryClient", React.createElement(Step5));
        
        if (!querySuccess) {
            console.log("❌ QueryClient组件可能是问题源");
        }
        
    } catch (queryError) {
        console.log(`❌ QueryClient导入失败: ${queryError.message}`);
    }
    
    // 5. 测试自定义组件
    console.log("\n🔍 测试自定义组件...");
    
    try {
        // 简单测试组件导入路径
        const testPaths = [
            '../src/utils/environment.js',
            '../src/store/useAppStore.js',
            '../src/i18n/index.js'
        ];
        
        for (const path of testPaths) {
            try {
                const module = await import(path);
                console.log(`✅ ${path} 导入成功`);
            } catch (pathError) {
                console.log(`❌ ${path} 导入失败: ${pathError.message}`);
            }
        }
        
    } catch (error) {
        console.log(`❌ 自定义组件测试失败: ${error.message}`);
    }
    
    // 6. 尝试模拟完整的App结构
    console.log("\n🔍 测试完整App结构...");
    
    try {
        const { QueryClient, QueryClientProvider } = await import("@tanstack/react-query");
        const { ClerkProvider } = await import("@clerk/clerk-react");
        
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } }
        });
        
        const MockApp = () => React.createElement(
            ClerkProvider,
            { publishableKey: "pk_test_dummy" },
            React.createElement(
                QueryClientProvider,
                { client: queryClient },
                React.createElement(
                    MemoryRouter,
                    { initialEntries: ['/'] },
                    React.createElement(
                        Routes,
                        null,
                        React.createElement(Route, {
                            path: '/',
                            element: React.createElement('div', null, 'Full App Structure')
                        })
                    )
                )
            )
        );
        
        testComponent("步骤6: 完整App结构", React.createElement(MockApp));
        
    } catch (error) {
        console.log(`❌ 完整App结构测试失败: ${error.message}`);
    }
    
    console.log("\n📊 测试完成！");
    console.log("💡 如果上面的测试都通过，问题可能在具体的页面组件中");
}

incrementalTest().catch(error => {
    console.error("💥 测试过程出错:", error);
});