// Vercel Edge Function for SSR (Alternative approach with better performance)
export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url);
  
  // Handle static assets
  if (url.pathname.startsWith('/assets/')) {
    return new Response(null, {
      status: 404,
      statusText: 'Not Found'
    });
  }

  try {
    // For Edge Runtime, we need a different approach
    // This is a simplified version that returns the base HTML
    // Full SSR would require Edge-compatible rendering
    
    const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Magic MCP - MCP服务器发现平台</title>
    <meta name="description" content="探索和发现Model Context Protocol (MCP)服务器的综合平台。浏览各种类别的MCP服务器，包括数据库、API客户端、开发工具等。" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <script type="module" crossorigin src="/assets/client.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/client.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

    return new Response(html, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        'cache-control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    return new Response(`Server Error: ${error.message}`, {
      status: 500,
      headers: {
        'content-type': 'text/plain',
      },
    });
  }
}