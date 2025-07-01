import http from 'http';

function testServer() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/servers/InditexTech_mcp-teams-server',
    method: 'GET',
    timeout: 10000
  };

  console.log('Testing server response...');

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`Response length: ${data.length}`);
      
      // Check for SSR content
      const hasEmptyRoot = data.includes('<div id="root"></div>');
      const hasContent = data.includes('<div id="root">') && !hasEmptyRoot;
      
      console.log(`Has empty root div: ${hasEmptyRoot}`);
      console.log(`Has rendered content: ${hasContent}`);
      
      // Check for dynamic title
      const titleMatch = data.match(/<title>(.*?)<\/title>/);
      if (titleMatch) {
        console.log(`Title: ${titleMatch[1]}`);
      }
      
      // Show first few lines of response
      console.log('\nFirst 5 lines of response:');
      console.log(data.split('\n').slice(0, 5).join('\n'));
      
      process.exit(0);
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error.message);
    process.exit(1);
  });

  req.on('timeout', () => {
    console.error('Request timeout');
    req.destroy();
    process.exit(1);
  });

  req.end();
}

testServer();