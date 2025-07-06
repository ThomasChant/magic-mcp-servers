import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Simulate Vercel environment
process.env.VERCEL = "1";
process.env.NODE_ENV = "production";

async function testSSR() {
    // Get URL from command line argument or default to home page
    const testUrl = process.argv[2] || "/";

    console.log(`🧪 Testing Vercel SSR function for: ${testUrl}`);
    console.log(`🔄 Calling handler with "${testUrl}" URL...`);

    try {
        // Import the SSR handler
        const { default: handler } = await import("./api/ssr.js");

        // Create mock request/response objects
        const req = {
            url: testUrl,
            headers: {
                host: "magicmcp.net",
                "user-agent": "Test Agent",
            },
        };

        const responseData = {
            status: 200,
            headers: {},
            body: "",
        };

        const res = {
            status: (code) => {
                responseData.status = code;
                return res;
            },
            setHeader: (name, value) => {
                responseData.headers[name] = value;
                return res;
            },
            send: (data) => {
                responseData.body = data;
                return res;
            },
            end: () => {
                responseData.body = "";
                return res;
            },
        };

        // Call the handler
        await handler(req, res);

        // Log results
        console.log(`📊 Response status: ${responseData.status}`);
        console.log(`📊 Response headers:`, responseData.headers);
        console.log(
            `📊 Response content length: ${
                responseData.body?.length || 0
            } characters`
        );

        if (responseData.body && responseData.body.length > 0) {
            const preview = responseData.body.substring(0, 200);
            console.log(`📊 First 200 chars: ${preview}`);
        }

        console.log(`✅ Test completed successfully`);
    } catch (error) {
        console.error(`❌ Test failed:`, error);
        process.exit(1);
    }
}

testSSR();
