import handler from "./api/ssr.js";

// Mock request and response objects
const mockReq = {
    url: "/",
    headers: {},
    method: "GET",
};

const mockRes = {
    statusCode: 200,
    headers: {},
    setHeader(name, value) {
        this.headers[name] = value;
    },
    status(code) {
        this.statusCode = code;
        return this;
    },
    send(content) {
        console.log(`📊 Response status: ${this.statusCode}`);
        console.log(`📊 Response headers:`, this.headers);
        console.log(`📊 Response content length: ${content.length} characters`);
        console.log(`📊 First 200 chars:`, content.substring(0, 200));
        return this;
    },
    end() {
        console.log(`📊 Response ended with status: ${this.statusCode}`);
        return this;
    },
};

console.log("🧪 Testing Vercel SSR function for home page...");
console.log('🔄 Calling handler with "/" URL...');

try {
    await handler(mockReq, mockRes);
    console.log("✅ Test completed successfully");
} catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("❌ Stack:", error.stack);
}
