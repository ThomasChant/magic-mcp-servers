# Solana Forum Summarizer MCP Server

## Model Context Protocol (MCP)

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server that provides a comprehensive suite of tools for AI models, enabling them to interact with various systems through a standardized and unified interface. MCP serves as a bridge between AI agents and external systems, allowing for seamless execution of operations, querying of information, and management of resources. 

By adhering to the MCP specification, this server ensures that AI agents can perform complex tasks efficiently and reliably, without needing to understand the intricacies of each individual system they interact with.

## Overview

This project uses [Stagehand](https://stagehand.dev/) to enhance [Playwright](https://playwright.dev/) with additional AI capabilities, providing tools to easily scrape the [Solana Forum](https://forum.solana.com). 

Using this MCP server, AI agents are easily able to:

* Get posts from the Solana Forum, including latest posts, top posts
* Filter forum posts by category, activity, age, author and more
* Search forum posts by keywords
* Summarize forum posts

## Prerequisites

* Node.js (v20 or higher)
* npm or yarn
* A valid API key for the Anthropic model

## Installation

1. Clone this repository:
```bash
git clone https://github.com/ydimitrov-d/solana-forum-summarizer-mcp
cd solana-forum-summarizer-mcp
```

2. Install dependencies:
```bash
pnpm install
```

## Configuration

### Environment Setup

Create a `.env` file with your Anthropic API key, which you can obtain on the [Anthropic console](https://console.anthropic.com/)

```env
ANTHROPIC_API_KEY=your_api_key_here
```

### Configuring Stagehand

Verify the Stagehand configuration in [stagehand.config.ts](./src/stagehand.config.ts), or change it based on your needs.

**⚠️ Important:** Make sure to edit the `downloadsPath` property with a folder that exists on your system, preferably the downloads folder. You may get a Playwright error otherwise.

```typescript
import type { ConstructorParams } from '@browserbasehq/stagehand';
import 'dotenv/config';

export const StagehandConfig: ConstructorParams = {
  env: 'LOCAL',
  debugDom: false,
  headless: true,
  logger: () => {},
  domSettleTimeoutMs: 30_000,
  modelName: 'claude-3-5-sonnet-latest',
  modelClientOptions: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
  localBrowserLaunchOptions: {
    downloadsPath: '/Users/<your_username>/Downloads',
  },
};
```

## Using with Claude

To use this MCP with the Claude LLM, follow these steps:

1. **Install [Claude for Desktop](https://claude.ai/download)**

2. **Locate the Claude Desktop Configuration File**
  - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
  - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
  - Linux: `~/.config/Claude/claude_desktop_config.json`

3. **Add the Configuration**

Copy the configuration from [claude_desktop_config.json](./claude_desktop_config.json) and adjust it with your own API key and path:

```json
{
  "mcpServers": {
    "solana-forum-summarizer-mcp": {
      "command": "tsx",
      "args": ["/full/path/to/index.ts"],
      "env": {
        "ANTHROPIC_API_KEY": "<ANTHROPIC_API_KEY>"
      }
    }
  }
}
```

4. **Restart Claude for Desktop**

After making these changes, restart Claude Desktop for the configuration to take effect.
You can now prompt Claude to perform any of the available actions using only the text chat.

## Available Actions

The Stagehand project provides the following actions:

* `GET_LATEST_POSTS` - Fetches the most recent posts from the Solana forum
* `GET_TOP_POSTS` - Retrieves the most popular posts from the Solana forum
* `GET_POSTS_BY_CATEGORY` - Obtains posts from a specific category within the Solana forum
* `SEARCH_POSTS` - Searches for posts in the Solana forum based on a keyword
* `SUMMARIZE_POST` - Summarizes the content of a specific post from the Solana forum
