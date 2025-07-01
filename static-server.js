import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// Enable gzip compression
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=31557600');
  next();
});

// Serve static files from dist/client
app.use(express.static(path.join(__dirname, 'dist/client')));

// Handle SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/client/index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'dist/client')}`);
});