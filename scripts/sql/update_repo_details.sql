-- MCP Servers Repository Details Update

-- Generated at: 2025-06-30T05:32:15.931954Z

-- This script updates repository information fetched from GitHub


BEGIN;

UPDATE mcp_servers SET stars = 1, forks = 0, watchers = 1, open_issues = 0, last_updated = '2025-04-18T18:02:38Z', repo_created_at = '2025-04-17T12:11:49Z', quality_score = 33, quality_documentation = 60, quality_maintenance = 25, quality_community = 0, quality_performance = 50, complexity = 'high', maturity = 'experimental', is_official = FALSE, updated_at = NOW() WHERE slug = '0010aor_mcp-mtg-assistant';

INSERT INTO server_installation (server_id, method, command) 
VALUES ('0010aor_mcp-mtg-assistant', 'pip', 'pip install mcp-server-mtg-assistant')
ON CONFLICT (server_id, method) 
DO UPDATE SET command = EXCLUDED.command, created_at = NOW();

INSERT INTO server_tech_stack (server_id, technology) 
VALUES ('0010aor_mcp-mtg-assistant', 'Python')
ON CONFLICT (server_id, technology) DO NOTHING;

INSERT INTO server_readmes (server_id, filename, project_name, raw_content, content_hash, file_size) 
VALUES (
    '0010aor_mcp-mtg-assistant', 
    'README.md', 
    '0010aor_mcp-mtg-assistant', 
    '# MCP Server MTG Assistant

A Model Context Protocol server that provides Magic: The Gathering card information fetching capabilities using the Scryfall API.

### Example Rules Question Workflow

While primarily used for looking up specific card details, this server can also be a crucial first step in answering MTG rules questions.

**User Query:** "If I cast a Finale of Devastation with X=10 and search for an Avenger of Zendikar, do the tokens also get +10/+10 and haste, or not?"

<img src="sample.gif" alt="Example Video Walkthrough" width="1000"/>

### Available Tools

-   `get_mtg_card_info` - Retrieves details for a specific Magic: The Gathering card from Scryfall.
    -   `query` (string, required): The search query string (e.g., card name, partial name, characteristics).


## Installation and Running

This project uses [`uv`](https://docs.astral.sh/uv/) for dependency management and running scripts.

### Using uv (recommended)

Ensure `uv` is installed. You can run the server directly from the project directory:

```bash
# Navigate to the project root directory first
cd path/to/mcp-servers/mcp-mtg-assistant

# Install dependencies (if needed) and run the server script
uv run mcp-server-mtg-assistant
```

### Using PIP (for distribution or alternative setup)

If the package were published, you could install it via pip:

```bash
pip install mcp-server-mtg-assistant
```

After installation, you could run it as a script:

```bash
python -m mcp_server_mtg_assistant
```

For development, you typically run it using `uv run` as shown above.

## Configuration

### Configure for MCP Clients (e.g., Claude.app, Inspector)

Add an entry to your client''s MCP server configuration. The exact key (`"mtg-assistant"` in the examples) can be chosen by you.

**Important:** The configuration needs to point `uv` to the correct project directory using the `--directory` argument. The path style (`/` vs `\`) depends on your operating system and how you run `uv`.

<details>
<summary>Default: Using uv Directly (Linux/macOS/WSL)</summary>

This is the standard approach if your MCP client and the server run in the same Linux, macOS, or WSL environment.

```json
// Example for mcp.json or Claude settings
"mcpServers": {
  "mtg-assistant": {
    "command": "uv",
    "args": [
      "--directory",
      "/path/to/mcp-servers/mcp-mtg-assistant", // Unix-style path
      "run",
      "mcp-server-mtg-assistant"
    ]
  }
}
```

</details>

<details>
<summary>Windows Client + WSL Server</summary>

This configuration is **recommended** if your MCP client runs on **Windows**, but you want the server to execute within **WSL** It uses `wsl.exe` to invoke `uv` inside WSL.

**Requirements:**
*   `uv` must be installed *inside* your WSL distribution.
*   Adjust the path to `uv` inside WSL (e.g., `/home/user/.cargo/bin/uv`) if it''s not in the WSL `PATH`.
*   Use the `/mnt/...` style path for the `--directory` argument accessible from within WSL.

```json
// Example for mcp.json or Claude settings on Windows
"mcpServers": {
  "mtg-assistant": {
    "command": "wsl.exe",
    "args": [
      "/home/your-user/.cargo/bin/uv", // uv WSL PATH
      "--directory",
      "/mnt/d/repos/mcp-servers/mcp-mtg-assistant", // WSL-style path to project
      "run",
      "mcp-server-mtg-assistant"
    ]
  }
}
```

</details>

<details>
<summary>Alternative: Using uv Directly on Windows</summary>

This assumes `uv` is installed directly on Windows and your MCP client also runs directly on Windows.
*   Use the Windows-style path (`D:\...`) for the `--directory` argument.
*   Be mindful of potential `.venv` conflicts if you also use WSL (see below).

```json
// Example for mcp.json or Claude settings on Windows
"mcpServers": {
  "mtg-assistant": {
    "command": "uv",
    "args": [
      "--directory",
      "D:\path\to\mcp-servers\mcp-mtg-assistant", // Windows-style path
      "run",
      "mcp-server-mtg-assistant"
    ]
  }
}
```

</details>

### Handling `.venv` Conflicts (Different Environments)

*   **Problem:** `uv run` creates a `.venv` directory specific to the operating system/environment (e.g., Linux vs. Windows). If you switch between running the server directly on Windows and running it via WSL (or native Linux), the existing `.venv` might be incompatible.
*   **Solution:** Before switching environments, **delete the `.venv` directory** in the `mcp-mtg-assistant` project root. `uv run` will then create a fresh, compatible one for the environment you are using.

## Debugging

You can use the MCP inspector to debug the server by prefixing the command and arguments from your configuration with `npx @modelcontextprotocol/inspector`.

```bash
# Example using the Default (Linux/macOS/WSL) configuration:
npx @modelcontextprotocol/inspector uv --directory /path/to/mcp-servers/mcp-mtg-assistant run mcp-server-mtg-assistant

# Example using the Recommended (Windows Client + WSL Server) configuration:
npx @modelcontextprotocol/inspector wsl.exe /home/your-user/.cargo/bin/uv --directory /mnt/d/repos/mcp-servers/mcp-mtg-assistant run mcp-server-mtg-assistant

# Example using the Alternative (Direct Windows) configuration:
npx @modelcontextprotocol/inspector uv --directory D:\path\to\mcp-servers\mcp-mtg-assistant run mcp-server-mtg-assistant
```

## Contributing

We encourage contributions to help expand and improve this MTG Assistant MCP server. Whether you want to add new features, enhance existing functionality, or improve documentation, your input is valuable.

For examples of other MCP servers and implementation patterns, see:
https://github.com/modelcontextprotocol/servers

Pull requests are welcome! Feel free to contribute new ideas, bug fixes, or enhancements.

## License

mcp-server-mtg-assistant is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License.', 
    'f4e468f62fcce8435aca6e0fe4344c663134af396f20d864cc394a994cb3aea9', 
    5915
)
ON CONFLICT (server_id) 
DO UPDATE SET 
    raw_content = EXCLUDED.raw_content,
    content_hash = EXCLUDED.content_hash,
    file_size = EXCLUDED.file_size,
    updated_at = NOW();

UPDATE mcp_servers SET stars = 3, forks = 0, watchers = 3, open_issues = 0, last_updated = '2025-04-22T21:59:28Z', repo_created_at = '2025-04-21T23:07:23Z', quality_score = 33, quality_documentation = 60, quality_maintenance = 25, quality_community = 0, quality_performance = 50, complexity = 'high', maturity = 'experimental', is_official = FALSE, updated_at = NOW() WHERE slug = '0010aor_mcp-pr-pilot';

INSERT INTO server_installation (server_id, method, command) 
VALUES ('0010aor_mcp-pr-pilot', 'pip', 'pip install mcp-server-pr-pilot')
ON CONFLICT (server_id, method) 
DO UPDATE SET command = EXCLUDED.command, created_at = NOW();

INSERT INTO server_tech_stack (server_id, technology) 
VALUES ('0010aor_mcp-pr-pilot', 'Python')
ON CONFLICT (server_id, technology) DO NOTHING;

INSERT INTO server_readmes (server_id, filename, project_name, raw_content, content_hash, file_size) 
VALUES (
    '0010aor_mcp-pr-pilot', 
    'README.md', 
    '0010aor_mcp-pr-pilot', 
    '# MCP Server PR Pilot

<img src="sample.gif" alt="Demo of MCP Server PR Pilot" width="1080" />

A Model Context Protocol (MCP) server that helps you create pull request (PR) descriptions, commit messages, and code reviews based on the actual code changes in your repository. It provides the output of `git diff` and a summarization instruction, making it easy to generate meaningful PR descriptions, commit messages, and reviews using LLMs or other tools.

### Example PR/Commit/Review Workflow

This server is designed to automate and improve your pull request documentation, commit message generation, and code review process.

### Available Tools

-   `summarize_pr` - Summarize the changes in this branch for a pull request.
    -   **Input:**
        - `branch` (string, optional): The branch to diff against (defaults to `main`).

-   `review_changes` - Review the changes in my working directory.
    -   **Input:**
        - `branch` (string, optional): The branch to diff against (defaults to `main`).

-   `generate_commit` - Generate a conventional commit message for my staged changes.

-   `generate_docs` - Generate documentation updates based on the code changes.
    -   **Input:**
        - `branch` (string, optional): The branch to diff against (defaults to `main`).

## Installation and Running

This project uses [`uv`](https://docs.astral.sh/uv/) for dependency management and running scripts.

### Using uv (recommended)

Ensure `uv` is installed. You can run the server directly from the project directory:

```bash
# Navigate to the project root directory first
cd path/to/mcp-servers/mcp-pr-pilot

# Install dependencies (if needed) and run the server script
uv run mcp-server-pr-pilot
```

### Using PIP (for distribution or alternative setup)

If the package were published, you could install it via pip:

```bash
pip install mcp-server-pr-pilot
```

After installation, you could run it as a script:

```bash
python -m mcp_server_pr_pilot
```

For development, you typically run it using `uv run` as shown above.

## Configuration

### Configure for MCP Clients (e.g., Claude.app, Inspector)

Add an entry to your client''s MCP server configuration. The exact key (`"pr-pilot"` in the examples) can be chosen by you.

**Important:** The configuration needs to point `uv` to the correct project directory using the `--directory` argument. The path style (`/` vs `\`) depends on your operating system and how you run `uv`.

<details>
<summary>Default: Using uv Directly (Linux/macOS/WSL)</summary>

This is the standard approach if your MCP client and the server run in the same Linux, macOS, or WSL environment.

```json
// Example for mcp.json or Claude settings
"mcpServers": {
  "pr-pilot": {
    "command": "uv",
    "args": [
      "--directory",
      "/path/to/mcp-servers/mcp-pr-pilot", // Unix-style path
      "run",
      "mcp-server-pr-pilot"
    ]
  }
}
```

</details>

<details>
<summary>Windows Client + WSL Server</summary>

This configuration is **recommended** if your MCP client runs on **Windows**, but you want the server to execute within **WSL**. It uses `wsl.exe` to invoke `uv` inside WSL.

**Requirements:**
*   `uv` must be installed *inside* your WSL distribution.
*   Adjust the path to `uv` inside WSL (e.g., `/home/user/.cargo/bin/uv`) if it''s not in the WSL `PATH`.
*   Use the `/mnt/...` style path for the `--directory` argument accessible from within WSL.

```json
// Example for mcp.json or Claude settings on Windows
"mcpServers": {
  "pr-pilot": {
    "command": "wsl.exe",
    "args": [
      "/home/your-user/.cargo/bin/uv", // uv WSL PATH
      "--directory",
      "/mnt/d/repos/mcp-servers/mcp-pr-pilot", // WSL-style path to project
      "run",
      "mcp-server-pr-pilot"
    ]
  }
}
```

</details>

<details>
<summary>Alternative: Using uv Directly on Windows</summary>

This assumes `uv` is installed directly on Windows and your MCP client also runs directly on Windows.
*   Use the Windows-style path (`D:\...`) for the `--directory` argument.
*   Be mindful of potential `.venv` conflicts if you also use WSL (see below).

```json
// Example for mcp.json or Claude settings on Windows
"mcpServers": {
  "pr-pilot": {
    "command": "uv",
    "args": [
      "--directory",
      "D:\path\to\mcp-servers\mcp-pr-pilot", // Windows-style path
      "run",
      "mcp-server-pr-pilot"
    ]
  }
}
```

</details>

### Handling `.venv` Conflicts (Different Environments)

*   **Problem:** `uv run` creates a `.venv` directory specific to the operating system/environment (e.g., Linux vs. Windows). If you switch between running the server directly on Windows and running it via WSL (or native Linux), the existing `.venv` might be incompatible.
*   **Solution:** Before switching environments, **delete the `.venv` directory** in the `mcp-pr-pilot` project root. `uv run` will then create a fresh, compatible one for the environment you are using.

## Debugging

You can use the MCP inspector to debug the server by prefixing the command and arguments from your configuration with `npx @modelcontextprotocol/inspector`.

```bash
# Example using the Default (Linux/macOS/WSL) configuration:
npx @modelcontextprotocol/inspector uv --directory /path/to/mcp-servers/mcp-pr-pilot run mcp-server-pr-pilot

# Example using the Recommended (Windows Client + WSL Server) configuration:
npx @modelcontextprotocol/inspector wsl.exe /home/your-user/.cargo/bin/uv --directory /mnt/d/repos/mcp-servers/mcp-pr-pilot run mcp-server-pr-pilot

# Example using the Alternative (Direct Windows) configuration:
npx @modelcontextprotocol/inspector uv --directory D:\path\to\mcp-servers\mcp-pr-pilot run mcp-server-pr-pilot
```

## Contributing

We encourage contributions to help expand and improve this PR Pilot MCP server. Whether you want to add new features, enhance existing functionality, or improve documentation, your input is valuable.

Pull requests are welcome! Feel free to contribute new ideas, bug fixes, or enhancements.

## License

mcp-server-pr-pilot is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License.', 
    '4815104ec415103b29c084b82407327b95de648cf6ed9e73df6d9430d4cbb7d9', 
    6181
)
ON CONFLICT (server_id) 
DO UPDATE SET 
    raw_content = EXCLUDED.raw_content,
    content_hash = EXCLUDED.content_hash,
    file_size = EXCLUDED.file_size,
    updated_at = NOW();

UPDATE mcp_servers SET stars = 0, forks = 0, watchers = 0, open_issues = 0, last_updated = '2025-03-28T14:44:37Z', repo_created_at = '2025-03-27T21:25:49Z', quality_score = 30, quality_documentation = 45, quality_maintenance = 25, quality_community = 0, quality_performance = 50, complexity = 'low', maturity = 'beta', is_official = FALSE, updated_at = NOW() WHERE slug = '0kenx_filesystem-mcp';

INSERT INTO server_tech_stack (server_id, technology) 
VALUES ('0kenx_filesystem-mcp', 'Python')
ON CONFLICT (server_id, technology) DO NOTHING;

INSERT INTO server_tech_stack (server_id, technology) 
VALUES ('0kenx_filesystem-mcp', 'Dockerfile')
ON CONFLICT (server_id, technology) DO NOTHING;

INSERT INTO server_readmes (server_id, filename, project_name, raw_content, content_hash, file_size) 
VALUES (
    '0kenx_filesystem-mcp', 
    'README.md', 
    '0kenx_filesystem-mcp', 
    '# Filesystem MCP Server

A Python server implementing Model Context Protocol (MCP) for secure filesystem operations.

## Features

- Read/write files with multiple access methods (whole file, line ranges, keyword-based)
- Create/list directories and file trees
- Move files/directories
- Search files by name and content
- Perform diff-based edits with preview support
- Get detailed file metadata (size, permissions, ownership)
- Git-aware directory tree listing respecting .gitignore
- Function/keyword search in files with contextual results
- Multi-file read operations
- Path validation and security checks

**Note**: The server only allows operations within directories specified via command-line arguments.

## Installation

Build the Docker image locally:

```bash
docker build -t mcp/filesystem .
```

## Usage with Claude

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--mount", "type=bind,src=/path/to/your/directory,dst=/projects",
        "mcp/filesystem",
        "/projects"
      ]
    }
  }
}
```

Note: All directories are mounted to `/projects` by default. Adding the `,ro` flag will make the directory read-only.

## Available Tools

### read_file
- Read complete contents of a file
- Input: `path` (string)

### read_multiple_files
- Read multiple files simultaneously
- Input: `paths` (string[])
- Failed reads won''t stop the entire operation

### read_file_by_line
- Read specific lines or line ranges from a file
- Inputs:
  - `path` (string)
  - `ranges` (string[]): Line numbers or ranges (e.g., ["5", "10-20"])

### read_file_by_keyword
- Find lines containing a keyword with optional context
- Inputs:
  - `path` (string)
  - `keyword` (string): Text to search for
  - `before` (int): Lines to include before match (default: 0)
  - `after` (int): Lines to include after match (default: 0)
  - `use_regex` (bool): Use regex pattern (default: false)
  - `ignore_case` (bool): Case-insensitive search (default: false)
- Returns matching lines with ">" prefix and line numbers

### read_function_by_keyword
- Extract function definitions by keyword
- Inputs:
  - `path` (string)
  - `keyword` (string): Typically function name
  - `before` (int): Lines to include before match (default: 0)
  - `use_regex` (bool): Use regex pattern (default: false)

### write_file
- Create or overwrite a file
- Inputs:
  - `path` (string)
  - `content` (string)

### edit_file_diff
- Make surgical edits to a file without specifying line numbers
- Inputs:
  - `path` (string)
  - `replacements` (object): Dictionary with keys as content to find and values as replacement content
  - `inserts` (object): Dictionary for inserting content after specified anchor text
  - `replace_all` (boolean): Replace all occurrences or just first match (default: true)
  - `dry_run` (boolean): Preview changes without applying (default: false)
- Returns a summary of changes made

### edit_file_diff_line
- Edit a file with precise line number specifications
- Inputs:
  - `path` (string)
  - `edits` (object): Dictionary of edits with keys as line specifiers and values as content
    - "N": Replace line N with provided content
    - "N-M": Replace lines N through M with provided content
    - "Ni": Insert content after line N (use "0i" for beginning)
    - "a": Append content to end of file
  - `dry_run` (boolean): Preview changes without applying (default: false)
- Returns a summary of applied changes

### create_directory
- Create directory or ensure it exists
- Input: `path` (string)
- Creates parent directories if needed

### list_directory
- List directory contents with [FILE] or [DIR] prefixes
- Input: `path` (string)

### directory_tree
- Get a recursive tree view of files and directories with metadata
- Inputs:
  - `path` (string)
  - `count_lines` (boolean): Include line counts (default: false)
  - `show_permissions` (boolean): Show file permissions (default: false)
  - `show_owner` (boolean): Show file ownership information (default: false)
  - `show_size` (boolean): Show file sizes (default: false)

### git_directory_tree
- Get a directory tree for a git repository respecting .gitignore
- Inputs:
  - `path` (string)
  - `count_lines` (boolean): Include line counts (default: false)
  - `show_permissions` (boolean): Show file permissions (default: false)
  - `show_owner` (boolean): Show file ownership information (default: false)
  - `show_size` (boolean): Show file sizes (default: false)

### move_file
- Move or rename files and directories
- Inputs:
  - `source` (string)
  - `destination` (string)

### search_files
- Recursively search for files/directories matching a pattern
- Inputs:
  - `path` (string): Starting directory
  - `pattern` (string): Search pattern (case-insensitive)
  - `excludePatterns` (string[]): Glob patterns to exclude
- Returns full paths to all matching files and directories

### get_file_info
- Get detailed file metadata
- Input: `path` (string)
- Returns size, creation time, modified time, permissions, etc.

### list_allowed_directories
- List all directories the server is allowed to access

## Security

The server implements comprehensive security measures:

- Maintains a whitelist of allowed directories specified via command-line arguments
- Performs strict path validation to prevent unauthorized access outside allowed directories 
- Validates symlink targets to ensure they don''t escape the allowed directories
- Handles circular symlinks and invalid paths gracefully
- Verifies parent directories for non-existent paths to ensure they''re within allowed boundaries

## Requirements

- Python 3.12+
- MCP 1.5.0+
- Docker
- httpx 0.28.1+
- Git (optional, for git_directory_tree)

## License

[MIT](LICENSE)
', 
    'fbb683cabeb2fe0abffcae2b3d5c60825d12463d1cf3713399a40c56a23fb3ae', 
    5829
)
ON CONFLICT (server_id) 
DO UPDATE SET 
    raw_content = EXCLUDED.raw_content,
    content_hash = EXCLUDED.content_hash,
    file_size = EXCLUDED.file_size,
    updated_at = NOW();

UPDATE mcp_servers SET stars = 0, forks = 0, watchers = 0, open_issues = 0, last_updated = '2025-04-26T17:36:30Z', repo_created_at = '2025-04-24T17:12:37Z', quality_score = 28, quality_documentation = 40, quality_maintenance = 25, quality_community = 0, quality_performance = 50, complexity = 'low', maturity = 'experimental', is_official = FALSE, updated_at = NOW() WHERE slug = '0xanpham_my-crypto-mcp';

INSERT INTO server_installation (server_id, method, command) 
VALUES ('0xanpham_my-crypto-mcp', 'npm', 'npm install ```')
ON CONFLICT (server_id, method) 
DO UPDATE SET command = EXCLUDED.command, created_at = NOW();

INSERT INTO server_tech_stack (server_id, technology) 
VALUES ('0xanpham_my-crypto-mcp', 'TypeScript')
ON CONFLICT (server_id, technology) DO NOTHING;

INSERT INTO server_readmes (server_id, filename, project_name, raw_content, content_hash, file_size) 
VALUES (
    '0xanpham_my-crypto-mcp', 
    'README.md', 
    '0xanpham_my-crypto-mcp', 
    '# My Crypto MCP

This Model Context Protocol (MCP) server provides cryptocurrency information through Claude Desktop. It connects to the CoinMarketCap API to fetch real-time cryptocurrency data.

## Features

- Get current cryptocurrency information by symbol
- View a sample cryptocurrency portfolio

## Prerequisites

- [Claude Desktop](https://claude.ai/desktop)
- [Node.js](https://nodejs.org/) (v16 or later)
- CoinMarketCap API key (get one at [coinmarketcap.com/api](https://coinmarketcap.com/api/))

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Project

```bash
npm run build
```

### 3. Configure Claude Desktop

Add the MCP server to Claude Desktop by editing the Claude configuration file:

1. Open Claude Desktop settings
2. Add the following configuration:

```json
{
  "mcpServers": {
    "crypto": {
      "command": "node",
      "args": ["/absolute/path/to/your/project/build/index.js"],
      "env": {
        "CMC_API_KEY": "your-coinmarketcap-api-key"
      }
    }
  }
}
```

> **Important:** Replace `/absolute/path/to/your/project` with the actual path to your project directory and `your-coinmarketcap-api-key` with your actual CoinMarketCap API key.

### 4. Restart Claude Desktop

After adding the configuration, restart Claude Desktop to load the MCP server.

## Using the Crypto MCP

Once configured, you can use the following commands in your chat with Claude:

### Get Portfolio Information

#### 1. Add Portfolio Resource

Attach **portfolio** resource from the MCP using the attachment button in Claude Desktop.

#### 2. Ask your own questions

You can now ask questions like:

```
What is my portfolio''s current value?
```

Claude will fetch the latest information from the CoinMarketCap API and provide detailed information about your portfolio.

##### Example Response

Here''s a sample of what Claude might return:

```
Based on your portfolio and current market prices, here''s the value of your cryptocurrency holdings as of April 27, 2025:

ZK (ZKsync): 69,696 ZK × $0.06051 = $4,217.48
Bitcoin (BTC): 9,696 BTC × $94,361.18 = $914,904,201.28
Ethereum (ETH): 23,456 ETH × $1,803.33 = $42,288,825.48

Total portfolio value: $957,197,244.24
Your portfolio is primarily dominated by your Bitcoin holdings, which represent over 95% of your total portfolio value. Would you like any additional information about market trends or recommendations for your portfolio?
```

## Development

- Source code is in the src directory
- The main MCP server is defined in index.ts
- API interactions are handled in helper.ts

## Troubleshooting

If you encounter issues:

1. Check that your CoinMarketCap API key is valid
2. Verify the path to the build file in Claude Desktop configuration
3. Check console output for any error messages
', 
    '98b4856285c6dbd5af80e7177ce8aaba78ecf1cf0f4cb2262095ea3c67aa3753', 
    2807
)
ON CONFLICT (server_id) 
DO UPDATE SET 
    raw_content = EXCLUDED.raw_content,
    content_hash = EXCLUDED.content_hash,
    file_size = EXCLUDED.file_size,
    updated_at = NOW();

UPDATE mcp_servers SET stars = 24, forks = 1, watchers = 24, open_issues = 0, last_updated = '2025-06-27T18:39:15Z', repo_created_at = '2025-04-05T23:33:03Z', quality_score = 27, quality_documentation = 25, quality_maintenance = 25, quality_community = 8, quality_performance = 50, complexity = 'low', maturity = 'experimental', is_official = FALSE, updated_at = NOW() WHERE slug = '0xDAEF0F_job-searchoor';

INSERT INTO server_tech_stack (server_id, technology) 
VALUES ('0xDAEF0F_job-searchoor', 'JavaScript')
ON CONFLICT (server_id, technology) DO NOTHING;

INSERT INTO server_readmes (server_id, filename, project_name, raw_content, content_hash, file_size) 
VALUES (
    '0xDAEF0F_job-searchoor', 
    'README.md', 
    '0xDAEF0F_job-searchoor', 
    '# Job Searchoor MCP Server
[![Twitter Follow](https://img.shields.io/twitter/follow/Alex?style=social)](https://x.com/0xdaef0f)

An MCP server implementation that provides job search functionality.

![mc-demo](https://github.com/user-attachments/assets/87159634-5e4c-41af-ad54-4c5ef19bf9d0)

## Tools

get_jobs

Get available jobs with filtering options
Inputs:

sinceWhen (string): Since when to get available jobs. e.g., ''1d'' or ''1w'' (only days and weeks are supported)
keywords (string[], optional): Keywords to filter jobs by
excludeKeywords (string[], optional): Keywords to exclude from the jobs
isRemote (boolean, optional): Whether to filter jobs by remote work

## Usage with Claude Desktop

Add this to your claude_desktop_config.json:

```json{
"mcpServers": {
    "job-search": {
        "command": "npx",
        "args": ["-y", "job-searchoor"]
    }
}
```

License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
', 
    '331bf6220e0927ddeb7786df883a94348c9d3d929ee8a81cdd8a9e6f5816be06', 
    1129
)
ON CONFLICT (server_id) 
DO UPDATE SET 
    raw_content = EXCLUDED.raw_content,
    content_hash = EXCLUDED.content_hash,
    file_size = EXCLUDED.file_size,
    updated_at = NOW();

UPDATE mcp_servers SET stars = 0, forks = 0, watchers = 0, open_issues = 0, last_updated = '2025-04-09T13:15:13Z', repo_created_at = '2025-04-09T11:23:32Z', quality_score = 27, quality_documentation = 35, quality_maintenance = 25, quality_community = 0, quality_performance = 50, complexity = 'medium', maturity = 'experimental', is_official = FALSE, updated_at = NOW() WHERE slug = '1282saa_news_se';

INSERT INTO server_installation (server_id, method, command) 
VALUES ('1282saa_news_se', 'pip', 'pip install -e')
ON CONFLICT (server_id, method) 
DO UPDATE SET command = EXCLUDED.command, created_at = NOW();

INSERT INTO server_tech_stack (server_id, technology) 
VALUES ('1282saa_news_se', 'Python')
ON CONFLICT (server_id, technology) DO NOTHING;

INSERT INTO server_tech_stack (server_id, technology) 
VALUES ('1282saa_news_se', 'JavaScript')
ON CONFLICT (server_id, technology) DO NOTHING;

INSERT INTO server_tech_stack (server_id, technology) 
VALUES ('1282saa_news_se', 'Shell')
ON CONFLICT (server_id, technology) DO NOTHING;

INSERT INTO server_tech_stack (server_id, technology) 
VALUES ('1282saa_news_se', 'Dockerfile')
ON CONFLICT (server_id, technology) DO NOTHING;

INSERT INTO server_readmes (server_id, filename, project_name, raw_content, content_hash, file_size) 
VALUES (
    '1282saa_news_se', 
    'README.md', 
    '1282saa_news_se', 
    '# 서울경제신문 스타일북 MCP 서버

서울경제신문 스타일북 데이터를 AI 모델에 제공하는 Model Context Protocol (MCP) 서버입니다.

## 특징

- 스타일북 섹션 및 문서 검색 기능
- 파일 경로 기반 문서 접근
- 키워드 기반 검색 (페이지네이션 지원)
- 스마트 폴백 메커니즘 (유사한 문서/키워드 추천)
- API 키 인증 (선택적으로 비활성화 가능 - MVP 모드)

## 설치 방법

### 소스코드에서 설치

```bash
git clone https://github.com/1282saa/news_se.git
cd news_se
pip install -e .
```

### pip를 통한 설치 (향후 지원 예정)

```bash
pip install stylebook-mcp-server
```

## 사용 방법

### 서버 실행

#### MVP 모드 (API 키 인증 없음)

```bash
# 명령행 옵션으로 인증 비활성화
python -m stylebook_mcp_server.server --no-auth

# 또는 환경 변수로 빈 API 키 설정
API_KEY="" python -m stylebook_mcp_server.server
```

#### API 키 인증 사용

```bash
# 환경 변수로 API 키 설정
API_KEY="your-api-key" python -m stylebook_mcp_server.server
```

### 명령행 옵션

```
--host HOST           서버 호스트 (기본값: 0.0.0.0)
--port PORT           서버 포트 (기본값: 8000)
--tools TOOLS         활성화할 도구 목록 (쉼표로 구분)
--list-tools          사용 가능한 도구 목록 표시
--metadata METADATA   메타데이터 파일 경로 (기본값: stylebook_metadata.json)
--stylebook-dir DIR   스타일북 디렉토리 경로 (기본값: 스타일북)
--no-auth             API 키 인증을 비활성화 (MVP 모드)
```

## Claude Desktop에서 설정

### 로컬 실행 (모듈 방식 - 권장)

```json
{
  "mcpServers": {
    "stylebook-server": {
      "command": "/절대/경로/python3", // 예: "/usr/bin/python3" 또는 "/Users/username/anaconda3/bin/python3"
      "args": ["-m", "stylebook_mcp_server.server", "--no-auth"]
    }
  }
}
```

### 로컬 실행 (상대 경로)

```json
{
  "mcpServers": {
    "stylebook-server": {
      "command": "python3",
      "args": ["-m", "stylebook_mcp_server.server", "--no-auth"]
    }
  }
}
```

### Docker 실행

```json
{
  "mcpServers": {
    "stylebook-server": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-p",
        "8000:8000",
        "stylebook-mcp-server",
        "--no-auth"
      ]
    }
  }
}
```

### URL 기반 접근 (인증 사용 시)

```json
{
  "mcpServers": {
    "stylebook-server": {
      "url": "https://your-server-url/rpc",
      "headers": {
        "Authorization": "Bearer your-api-key"
      }
    }
  }
}
```

### URL 기반 접근 (MVP 모드 - 인증 없음)

```json
{
  "mcpServers": {
    "stylebook-server": {
      "url": "https://your-server-url/rpc"
    }
  }
}
```

### 문제 해결

Claude Desktop에서 MCP 서버 연결 시 문제가 발생하는 경우:

1. Python 경로가 올바른지 확인하세요:

   ```bash
   which python3  # 실제 Python 경로 확인
   ```

2. 패키지가 설치되어 있는지 확인하세요:

   ```bash
   pip list | grep stylebook-mcp-server
   ```

3. 경로에 공백이나 한글이 포함된 경우 모듈 방식으로 실행하세요:

   ```json
   {
     "command": "/절대/경로/python3",
     "args": ["-m", "stylebook_mcp_server.server", "--no-auth"]
   }
   ```

4. **PATH 환경 변수 설정 (권장):**

   ```json
   {
     "mcpServers": {
       "stylebook-server": {
         "command": "/Users/username/anaconda3/bin/python3",
         "args": ["-m", "stylebook_mcp_server.server", "--no-auth"],
         "env": {
           "PATH": "/Users/username/anaconda3/bin:/usr/local/bin:/usr/bin:/bin"
         }
       }
     }
   }
   ```

5. **`ENOENT` 오류 해결:**
   MCP 서버가 "spawn python ENOENT" 오류를 발생시키는 경우, Python 실행 파일의 절대 경로가 올바른지 확인하고 환경 변수를 명시적으로 설정하세요. Claude Desktop은 상대 경로를 처리하는 데 문제가 있을 수 있으므로 항상 절대 경로를 사용하는 것이 좋습니다.

6. **`ModuleNotFoundError` 해결:**
   ''stylebook_mcp_server'' 모듈을 찾을 수 없는 오류가 발생하는 경우, 다음 두 가지 방법 중 하나를 선택하세요:

   a) 패키지 설치하기 (권장):

   ```bash
   cd "프로젝트_디렉토리"
   pip install -e .
   ```

   b) 직접 파일 경로 사용하기:

   ```json
   {
     "mcpServers": {
       "stylebook-server": {
         "command": "/절대/경로/python3",
         "args": [
           "/절대/경로/MCP서버개발/stylebook_mcp_server/server.py",
           "--no-auth"
         ]
       }
     }
   }
   ```

## API 엔드포인트

### 메인 JSON-RPC 엔드포인트

- `/rpc` - JSON-RPC 2.0 엔드포인트

### 기타 엔드포인트

- `/` - 서버 정보
- `/docs` - API 문서 (Swagger UI)

## 사용 가능한 도구

- `get_sections` - 스타일북 섹션 목록 제공
- `get_document` - 특정 문서 조회
- `search_documents` - 키워드 기반 검색
- `get_file_by_path` - 파일 경로로 문서 조회

## 개발 정보

### 개발 환경 설정

```bash
# 개발 의존성 설치
pip install -e ".[dev]"

# 테스트 실행
pytest
```

### 도커 이미지 빌드

```bash
docker build -t stylebook-mcp-server .
```

## 라이선스

MIT License
', 
    'dda2df3b96970d8b2c80610317def1639c41a10aad0e1c5b9da623a3f50c68f1', 
    4011
)
ON CONFLICT (server_id) 
DO UPDATE SET 
    raw_content = EXCLUDED.raw_content,
    content_hash = EXCLUDED.content_hash,
    file_size = EXCLUDED.file_size,
    updated_at = NOW();

UPDATE mcp_servers SET stars = 55, forks = 8, watchers = 55, open_issues = 0, last_updated = '2025-06-25T12:43:13Z', repo_created_at = '2025-03-24T12:54:19Z', quality_score = 38, quality_documentation = 70, quality_maintenance = 25, quality_community = 8, quality_performance = 50, complexity = 'low', maturity = 'beta', is_official = FALSE, node_version = 'v0.1.1', updated_at = NOW() WHERE slug = '13bm_GhidraMCP';

INSERT INTO server_installation (server_id, method, command) 
VALUES ('13bm_GhidraMCP', 'pip', 'pip install FastMCP')
ON CONFLICT (server_id, method) 
DO UPDATE SET command = EXCLUDED.command, created_at = NOW();

INSERT INTO server_tech_stack (server_id, technology) 
VALUES ('13bm_GhidraMCP', 'Java')
ON CONFLICT (server_id, technology) DO NOTHING;

INSERT INTO server_tech_stack (server_id, technology) 
VALUES ('13bm_GhidraMCP', 'Python')
ON CONFLICT (server_id, technology) DO NOTHING;

INSERT INTO server_readmes (server_id, filename, project_name, raw_content, content_hash, file_size) 
VALUES (
    '13bm_GhidraMCP', 
    'README.md', 
    '13bm_GhidraMCP', 
    '# GhidraMCP

A Ghidra plugin that implements the Model Context Protocol (MCP) for AI-assisted binary analysis.

## Overview

GhidraMCP bridges the gap between Ghidra''s powerful reverse engineering capabilities and AI assistants through the Model Context Protocol (MCP). This plugin enables AI models to connect to Ghidra and assist with binary analysis tasks, making reverse engineering more efficient and accessible.

## Features

- **AI-Powered Binary Analysis**: Connect AI assistants to Ghidra via the Model Context Protocol
- **Natural Language Interface**: Ask questions about binaries in plain English
- **Deep Code Insights**: Retrieve detailed function information and decompiled code
- **Binary Structure Analysis**: Explore imports, exports, and memory layouts
- **Automated Security Analysis**: Get AI-assisted insights about potential security vulnerabilities
- **Socket-Based Architecture**: High-performance communication between Ghidra and AI assistants
- **Cross-Platform Compatibility**: Works on all platforms supported by Ghidra

## Installation

### Prerequisites

- Ghidra 11.2.1+
- Java 17 or newer
- Python 3.8+ (for the bridge script)

### Steps

1. Download the latest release ZIP file from the [Releases](https://github.com/yourusername/GhidraMCP/releases) page
2. Open Ghidra
3. Navigate to `File > Install Extensions`
4. Click the "+" button and select the downloaded ZIP file
5. Restart Ghidra to complete the installation
6. Enable the extension by going to `File > Configure > Miscellaneous` and checking the box next to "MCPServerPlugin"

## Usage

### Starting the MCP Server

The server automatically starts when you open a Ghidra project after enabling the plugin. By default, it runs on:
- Host: `localhost`
- Port: `8765`

You can verify the server is running by checking the Ghidra console for messages like:
```
MCP Server started on port 8765
```

### Connecting with AI Assistants

#### Connecting with Claude

To connect Claude to the GhidraMCP plugin:

1. Install the MCP bridge script:
   ```bash
   pip install FastMCP
   ```

2. Add the following configuration to your Claude MCP setup:
   ```json
   {
     "mcpServers": {
       "ghidra": {
         "command": "python",
         "args": ["PATH-TO-REPO/GhidraMCP/ghidra_server.py"]
       }
     }
   }
   ```

The bridge script creates a connection between Ghidra and Claude, enabling real-time binary analysis through natural language.

### Available Tools

The plugin exposes several powerful functions through the MCP interface:

| Tool | Description |
|------|-------------|
| `get_function(address, decompile=False)` | Retrieve detailed information about a function at a specific address |
| `analyze_binary(question)` | Ask natural language questions about the loaded binary |
| `get_imports()` | List all imported functions in the binary |
| `get_exports()` | List all exported functions in the binary |
| `get_memory_map()` | Get the memory layout of the binary |
| `connect_to_ghidra(host, port)` | Connect to a specific Ghidra instance |
| `rename_function(current_name, new_name)` | Rename a function by its current name |
| `rename_data(address, new_name)` | Rename a data label at a specific address |
| `extract_api_call_sequences(address)` | Extract API calls from a function for security analysis |
| `identify_user_input_sources()` | Find potential sources of user input in the binary |
| `generate_call_graph(address, max_depth=3)` | Generate a hierarchical representation of function calls |
| `identify_crypto_patterns()` | Detect cryptographic implementations in the binary |
| `find_obfuscated_strings()` | Locate potentially obfuscated strings |

### Example Queries

Here are examples of questions you can ask through an MCP-compatible AI client:

- "What encryption algorithms are used in this binary?"
- "Can you show me the decompiled code for the function at 0x401000?"
- "What suspicious API calls does this malware make?"
- "Explain the purpose of this binary based on its imports and exports."
- "How does the authentication mechanism in this program work?"
- "Are there any potential buffer overflow vulnerabilities in this code?"
- "What network connections does this binary establish?"
- "Can you rename this function to something more descriptive?"
- "Show me all potential user input sources that could be exploited."
- "Generate a call graph for the main function."

## Advanced Usage

### Security Analysis Capabilities

GhidraMCP provides specialized tools for security-focused analysis:

#### API Call Sequence Analysis
Extract and categorize external API calls from a function for security analysis. This helps identify potentially dangerous functions and understand their interactions.

#### User Input Sources
Identify entry points where external data enters the program, crucial for vulnerability assessment and understanding attack surfaces.

#### Call Graph Generation
Create structured call graphs to understand execution flow, track data propagation, and identify potential attack paths.

#### Cryptographic Pattern Detection
Identify cryptographic implementations including standard algorithms (AES, RSA, etc.) and custom implementations based on code patterns.

#### Obfuscated String Detection
Find strings that may be obfuscated through techniques like XOR encoding or character-by-character construction.

### Custom Configurations

You can modify the server port by editing the `MCPServerPlugin.java` file:

```java
server.setPort(YOUR_CUSTOM_PORT);
```

### Integration with Analysis Workflows

GhidraMCP can be integrated into your existing analysis workflows:

1. Use Ghidra''s standard analysis features to identify areas of interest
2. Leverage AI assistance through GhidraMCP for deeper understanding
3. Combine the AI insights with your manual analysis
4. Rename functions and data based on AI insights for better readability

## Building from Source

To build the plugin from source:

1. Clone this repository
   ```bash
   git clone https://github.com/yourusername/GhidraMCP.git
   ```

2. Set up a Ghidra development environment as described in the [Ghidra Developer Guide](https://github.com/NationalSecurityAgency/ghidra/blob/master/DevGuide.md)

3. Set the `GHIDRA_INSTALL_DIR` environment variable:
   ```bash
   export GHIDRA_INSTALL_DIR=/path/to/ghidra
   ```

4. Build with Gradle:
   ```bash
   ./gradlew buildExtension
   ```

5. The extension ZIP will be created in the `dist` directory

## Troubleshooting

### Common Issues

- **Connection Issues**: Make sure the Ghidra instance is running and the plugin is enabled
- **Port Conflicts**: If port 8765 is already in use, modify the port in the plugin configuration
- **Bridge Script Errors**: Check if all required Python packages are installed with `pip install FastMCP`
- **Null Results for Analysis Functions**: Some security analysis functions may return null results if the binary doesn''t contain relevant patterns

### Logs

Check the following logs for troubleshooting:
- Ghidra console for server-side messages
- `ghidra_mcp_bridge.log` for bridge script issues

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m ''Add some amazing feature''`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request


## Acknowledgments

- [National Security Agency (NSA)](https://github.com/NationalSecurityAgency/ghidra) for developing Ghidra
- [Model Context Protocol](https://modelcontextprotocol.io/) community
- All contributors to this project

---

*GhidraMCP is not affiliated with or endorsed by the NSA or the Ghidra project.*', 
    '39d69911591c67c3d4e0f7d0b5b70865d2019f637ddd9864068d362fa2a51203', 
    7765
)
ON CONFLICT (server_id) 
DO UPDATE SET 
    raw_content = EXCLUDED.raw_content,
    content_hash = EXCLUDED.content_hash,
    file_size = EXCLUDED.file_size,
    updated_at = NOW();

UPDATE mcp_servers SET stars = 0, forks = 0, watchers = 0, open_issues = 0, last_updated = '2025-04-29T12:25:15Z', repo_created_at = '2025-04-28T12:24:15Z', quality_score = 35, quality_documentation = 65, quality_maintenance = 25, quality_community = 0, quality_performance = 50, complexity = 'low', maturity = 'experimental', is_official = FALSE, updated_at = NOW() WHERE slug = '1999AZZAR_mcp-server-google-search';

INSERT INTO server_installation (server_id, method, command) 
VALUES ('1999AZZAR_mcp-server-google-search', 'npm', 'npm install cp')
ON CONFLICT (server_id, method) 
DO UPDATE SET command = EXCLUDED.command, created_at = NOW();

INSERT INTO server_installation (server_id, method, command) 
VALUES ('1999AZZAR_mcp-server-google-search', 'docker', 'docker run -d')
ON CONFLICT (server_id, method) 
DO UPDATE SET command = EXCLUDED.command, created_at = NOW();

INSERT INTO server_tech_stack (server_id, technology) 
VALUES ('1999AZZAR_mcp-server-google-search', 'TypeScript')
ON CONFLICT (server_id, technology) DO NOTHING;

INSERT INTO server_tech_stack (server_id, technology) 
VALUES ('1999AZZAR_mcp-server-google-search', 'JavaScript')
ON CONFLICT (server_id, technology) DO NOTHING;

INSERT INTO server_readmes (server_id, filename, project_name, raw_content, content_hash, file_size) 
VALUES (
    '1999AZZAR_mcp-server-google-search', 
    'README.md', 
    '1999AZZAR_mcp-server-google-search', 
    '# Google Search MCP Server

A microservice for Google Custom Search with caching, rate-limiting, metrics, and robust error handling.

## Features

- Centralized error handling middleware
- Config validation via Zod (fail-fast)
- Redis + LRU caching with stale-while-revalidate
- Prometheus metrics endpoint (`/metrics`)
- Rate limiting via `express-rate-limit`
- Swagger UI documentation (`/docs`)
- REST endpoints: `/health`, `/ready`, `/`, `/search`, `/search-file-type`, `/extract`, `/filters`, `/tools`, `/metrics`
- Unit tests with Jest + Supertest
- ESLint + TypeScript linting
- GraphQL endpoint (`/graphql`) with Apollo Server Sandbox UI

## Quickstart

### Prerequisites

- Node.js >= v14
- npm >= v6
- Google API Key with Custom Search API enabled
- Google CSE ID
- Redis instance (optional)

### Installation

```bash
git clone https://github.com/azzar/mcp-server-google-search.git
cd mcp-server-google-search
npm install
cp .env.example .env
```

### Configuration

Edit `.env` to set:
```ini
GOOGLE_API_KEY=your_api_key
GOOGLE_CSE_ID=your_cse_id
PORT=3000
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600
LRU_CACHE_SIZE=500
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=30
CB_TIMEOUT_MS=5000
CB_ERROR_THRESHOLD=50
CB_RESET_TIMEOUT_MS=30000
LOG_LEVEL=info
```

Alternatively, adjust settings directly in `config.ts` for advanced use.

### Running in Development

```bash
npm run dev
```
- Live reload with ts-node
- Swagger UI available at `http://localhost:3000/docs`
- GraphQL Sandbox UI available at `http://localhost:3000/graphql`

### Running in Production

```bash
npm run build
npm start
```

### API Usage Examples

**Health Check**
```bash
curl http://localhost:3000/health
```

**Readiness**
```bash
curl http://localhost:3000/ready
```

**Search**
```bash
curl "http://localhost:3000/search?q=openai&safe=active"
```

**Filters**
```bash
curl http://localhost:3000/filters
```

**Tools**
```bash
curl http://localhost:3000/tools
```

**Search by file type**
```bash
curl "http://localhost:3000/search-file-type?q=openai&fileType=pdf"
```

**Extract**
```bash
curl "http://localhost:3000/extract?url=https://example.com"
```

**Metrics**
```bash
curl http://localhost:3000/metrics
```

**Swagger UI**
Visit `http://localhost:3000/docs`

**GraphQL (UI)**
Visit Apollo Sandbox at `http://localhost:3000/graphql`

**GraphQL Schema (SDL)**
```bash
curl http://localhost:3000/graphql/schema
```

**GraphQL (Query)**
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d ''{"query":"{ search(q:\"openai\") }"}''
```

### Testing & Linting

```bash
npm run lint
npm test
```

### Docker

**Dockerfile**
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY . .
RUN npm install --production
CMD ["npm", "start"]
```

**Build & Run**
```bash
docker build -t mcp-google-search .
docker run -d -p 3000:3000 --env-file .env mcp-google-search
```

## Environment Variables

| Variable                 | Description                                | Default                     |
|--------------------------|--------------------------------------------|-----------------------------|
| `GOOGLE_API_KEY`         | Google API key                             | (required)                  |
| `GOOGLE_CSE_ID`          | Custom Search Engine ID                    | (required)                  |
| `PORT`                   | HTTP port                                  | `3000`                      |
| `REDIS_URL`              | Redis connection URL                       | `redis://localhost:6379`    |
| `CACHE_TTL`              | Redis cache TTL (seconds)                  | `3600`                      |
| `LRU_CACHE_SIZE`         | Fallback LRU cache max entries             | `500`                       |
| `RATE_LIMIT_WINDOW_MS`   | Rate limit window (ms)                     | `60000`                     |
| `RATE_LIMIT_MAX`         | Max requests per window                    | `30`                        |
| `CB_TIMEOUT_MS`          | Circuit breaker timeout (ms)               | `5000`                      |
| `CB_ERROR_THRESHOLD`     | Circuit breaker error threshold (%)        | `50`                        |
| `CB_RESET_TIMEOUT_MS`    | Circuit breaker reset timeout (ms)         | `30000`                     |
| `LOG_LEVEL`              | Pino log level                             | `info`                      |

## API Reference

### GET /health

Liveness probe. Returns `200 OK`.

### GET /ready

Readiness probe. Checks Redis & Google API reachability. Returns `200 OK` or `503 Service Unavailable` with JSON `{ checks: {...} }`.

### GET /

Root endpoint. Returns JSON `{ status: ''ok'' }`.

### GET /search

Perform a Google Custom Search.

**Query Parameters**:
- `q` (string, required): search query
- Optional filters: `searchType`, `fileType`, `siteSearch`, `dateRestrict`, `safe`, `exactTerms`, `excludeTerms`, `sort`, `gl`, `hl`, `num`, `start`

**Response**: JSON from Google API.

### GET /search-file-type

Search only specific file types.

**Query Parameters**:
- `q` (string, required): search query
- `fileType` (string, required): file type

**Response**: JSON from Google API.

### GET /extract

Extract main content and sentiment from a URL.

**Query Parameters**:
- `url` (string, required): URL to extract

**Response**: JSON with extracted content and sentiment.

### GET /filters

List supported filters.

### GET /tools

List available tool descriptions.
```json
{
  "tools": [
    {
      "name": "search",
      "method": "GET",
      "path": "/search",
      "description": "Perform a Google Custom Search with optional filters",
      "parameters": {
        "q": "string",
        "searchType": "string",
        "fileType": "string",
        "siteSearch": "string",
        "dateRestrict": "string",
        "safe": "string",
        "exactTerms": "string",
        "excludeTerms": "string",
        "sort": "string",
        "gl": "string",
        "hl": "string",
        "num": "string",
        "start": "string"
      }
    },
    {
      "name": "searchFileType",
      "method": "GET",
      "path": "/search-file-type",
      "description": "Search only specific file types",
      "parameters": { "q": "string", "fileType": "string" }
    },
    {
      "name": "extract",
      "method": "GET",
      "path": "/extract",
      "description": "Extract main content and sentiment from a URL",
      "parameters": { "url": "string" }
    }
  ]
}
```

### GET /metrics

Prometheus metrics in plain text.

### GET /graphql

GraphQL interactive UI (Apollo Server Sandbox).

### POST /graphql

GraphQL endpoint. Accepts JSON `{ "query": "<GraphQL Query>" }` and returns JSON response.

## Testing

Run unit tests and coverage:

```bash
npm test
```

Coverage report in `coverage/`.

## License

MIT
', 
    '49eb45970de7d005154fadce98f3e62dd15a11cfd2a4a9e2f95cc15249985954', 
    6793
)
ON CONFLICT (server_id) 
DO UPDATE SET 
    raw_content = EXCLUDED.raw_content,
    content_hash = EXCLUDED.content_hash,
    file_size = EXCLUDED.file_size,
    updated_at = NOW();

UPDATE mcp_servers SET stars = 0, forks = 0, watchers = 0, open_issues = 0, last_updated = '2025-06-07T06:15:45Z', repo_created_at = '2025-04-28T06:39:14Z', quality_score = 30, quality_documentation = 25, quality_maintenance = 45, quality_community = 0, quality_performance = 50, complexity = 'medium', maturity = 'experimental', is_official = FALSE, updated_at = NOW() WHERE slug = '1Levick3_postgresql-mcp-server';

INSERT INTO server_installation (server_id, method, command) 
VALUES ('1Levick3_postgresql-mcp-server', 'npm', 'npm install ```')
ON CONFLICT (server_id, method) 
DO UPDATE SET command = EXCLUDED.command, created_at = NOW();

INSERT INTO server_tech_stack (server_id, technology) 
VALUES ('1Levick3_postgresql-mcp-server', 'TypeScript')
ON CONFLICT (server_id, technology) DO NOTHING;

INSERT INTO server_tech_stack (server_id, technology) 
VALUES ('1Levick3_postgresql-mcp-server', 'JavaScript')
ON CONFLICT (server_id, technology) DO NOTHING;

INSERT INTO server_tech_stack (server_id, technology) 
VALUES ('1Levick3_postgresql-mcp-server', 'Dockerfile')
ON CONFLICT (server_id, technology) DO NOTHING;

INSERT INTO server_readmes (server_id, filename, project_name, raw_content, content_hash, file_size) 
VALUES (
    '1Levick3_postgresql-mcp-server', 
    'README.md', 
    '1Levick3_postgresql-mcp-server', 
    '# PostgreSQL MCP Server

[![smithery badge](https://smithery.ai/badge/@1Levick3/postgresql-mcp-server)](https://smithery.ai/server/@1Levick3/postgresql-mcp-server)

A Model Context Protocol (MCP) server that provides direct PostgreSQL database query execution capabilities. This server enables custom SQL query execution against PostgreSQL databases with support for parameterized queries and configurable timeouts. This project is designed specifically for use with the Cursor IDE.


## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL server (for target database operations)
- Network access to target PostgreSQL instances

## Installation
### Installing via Smithery

To install PostgreSQL Database Query Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@1Levick3/postgresql-mcp-server):

```bash
npx -y @smithery/cli install @1Levick3/postgresql-mcp-server --client claude
```

### Manual Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the server:
   ```bash
   npm run build
   ```
4. Add to MCP settings file:
   ```json
    {
      "mcpServers": {
        "postgresql-mcp": {
          "command": "node",
          "args": ["/Users/1Levick3/Desktop/postgresql-mcp-server/build/index.js"],
          "disabled": false,
          "alwaysAllow": [],
          "env": {
            "POSTGRES_CONNECTION_STRING": "postgresUrl",
            "POSTGRES_SSL_CERT_PATH": "/Users/1levick3/Desktop/root.crt"
          }
        }
      }
    }
   ```

## Development

- `npm run dev` - Start development server with hot reload
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Security Considerations

1. Connection Security
   - Uses connection pooling
   - Implements connection timeouts
   - Validates connection strings
   - Supports SSL/TLS connections


## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
', 
    'a89714eac67ac7847e0e71601d773ea75a1542eb999f58089922dd5d4ff56132', 
    1990
)
ON CONFLICT (server_id) 
DO UPDATE SET 
    raw_content = EXCLUDED.raw_content,
    content_hash = EXCLUDED.content_hash,
    file_size = EXCLUDED.file_size,
    updated_at = NOW();

UPDATE mcp_servers SET stars = 3, forks = 2, watchers = 3, open_issues = 2, last_updated = '2025-06-19T09:36:48Z', repo_created_at = '2025-03-23T15:23:06Z', quality_score = 22, quality_documentation = 15, quality_maintenance = 25, quality_community = 0, quality_performance = 50, complexity = 'low', maturity = 'beta', is_official = FALSE, updated_at = NOW() WHERE slug = '1yhy_oss-mcp';

INSERT INTO server_installation (server_id, method, command) 
VALUES ('1yhy_oss-mcp', 'npm', 'npm install -g')
ON CONFLICT (server_id, method) 
DO UPDATE SET command = EXCLUDED.command, created_at = NOW();

INSERT INTO server_tech_stack (server_id, technology) 
VALUES ('1yhy_oss-mcp', 'TypeScript')
ON CONFLICT (server_id, technology) DO NOTHING;

INSERT INTO server_tech_stack (server_id, technology) 
VALUES ('1yhy_oss-mcp', 'JavaScript')
ON CONFLICT (server_id, technology) DO NOTHING;

INSERT INTO server_readmes (server_id, filename, project_name, raw_content, content_hash, file_size) 
VALUES (
    '1yhy_oss-mcp', 
    'README.md', 
    '1yhy_oss-mcp', 
    '# OSS MCP 服务器 🚀

中文版 | [English](README.en.md)

![oss-mcp](https://yhyblog-2023-2-8.oss-cn-hangzhou.aliyuncs.com/2025/2025-03-23/20250323221657.png)

一个基于Model Context Protocol (MCP)的服务器，用于将文件上传到阿里云OSS。此服务器使大型语言模型能够直接将文件上传到阿里云对象存储服务。

## 💡 使用场景

OSS MCP服务器能够与其他MCP工具无缝集成，为您提供强大的工作流程：

- **与[Playwright MCP](https://github.com/executeautomation/mcp-playwright)集成**：可以先使用Playwright MCP抓取网页截图或下载网页资源，然后直接上传到阿里云OSS存储。
- **与[Figma MCP](https://github.com/1yhy/Figma-Context-MCP)集成**：下载图片资源到本地后直接上传OSS、或者Figma网络文件直接上传OSS。
- **与[Filesystem MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)集成**：可以浏览和选择本地文件系统中的文件，然后一步上传到云存储。
- **数据备份流程**：将重要数据从本地或其他服务自动备份到OSS。
- **媒体处理流程**：结合其他处理工具，可以对图片、视频进行处理后直接上传并获取可访问的URL。
- **多OSS账号管理**：便捷地在多个OSS账号间切换上传目标。

## ✨ 功能特点

- 📁 支持多个阿里云OSS配置
- 🗂️ 可指定上传目录
- 🔄 简单易用的接口

## 🔧 安装

您可以通过npm或从源码安装：

### 使用npm安装

```bash
# 使用npm全局安装
npm install -g oss-mcp

# 或使用pnpm全局安装
pnpm add -g oss-mcp
```

### 使用示例

```bash
# 直接启动 (stdio模式)
oss-mcp --oss-config=''{\"default\":{\"region\":\"oss-cn-shenzhen\",\"accessKeyId\":\"YOUR_KEY\",\"accessKeySecret\":\"YOUR_SECRET\",\"bucket\":\"YOUR_BUCKET\",\"endpoint\":\"oss-cn-shenzhen.aliyuncs.com\"}}''


# 使用Inspector调试
oss-mcp --oss-config=''{ "region": "oss-cn-shenzhen", "accessKeyId": "YOUR_KEY", "accessKeySecret": "YOUR_SECRET", "bucket": "BUCKET_NAME", "endpoint": "oss-cn-shenzhen.aliyuncs.com" }'' --inspect
```

### 从源码安装

```bash
# 克隆仓库
git clone https://github.com/1yhy/oss-mcp.git
cd oss-mcp

# 安装依赖
pnpm install

# 构建项目
pnpm build
```

## ⚙️ 配置

您可以通过以下方式配置阿里云OSS参数：

### 方式一：使用.env文件

在项目根目录创建`.env`文件，参考`.env.example`模板。您可以配置多个阿里云OSS服务：

```ini
# 默认OSS配置
OSS_CONFIG_DEFAULT={"region":"oss-cn-hangzhou","accessKeyId":"your-access-key-id","accessKeySecret":"your-access-key-secret","bucket":"your-bucket-name","endpoint":"oss-cn-hangzhou.aliyuncs.com"}

# 其他OSS配置
OSS_CONFIG_TEST={"region":"oss-cn-beijing","accessKeyId":"your-access-key-id-2","accessKeySecret":"your-access-key-secret-2","bucket":"your-bucket-name-2","endpoint":"oss-cn-beijing.aliyuncs.com"}
```

### 方式二：直接设置环境变量

您也可以直接在系统中或启动命令中设置环境变量：

```bash
# 设置环境变量并启动
pnpm dev --oss-config=''{ "default": { "region": "oss-cn-shenzhen", "accessKeyId": "YOUR_KEY", "accessKeySecret": "YOUR_SECRET", "bucket": "BUCKET_NAME", "endpoint": "oss-cn-shenzhen.aliyuncs.com" }, "test": { "region": "oss-cn-beijing", "accessKeyId": "YOUR_KEY", "accessKeySecret": "YOUR_SECRET", "bucket": "BUCKET_NAME", "endpoint": "oss-cn-beijing.aliyuncs.com" } }''
```

## 🔍 参数说明

- `region`: 阿里云OSS区域
- `accessKeyId`: 阿里云访问密钥ID
- `accessKeySecret`: 阿里云访问密钥Secret
- `bucket`: OSS存储桶名称
- `endpoint`: OSS终端节点

## 📋 使用方法

### 命令行选项

```
选项:
  -s, --stdio    使用stdio传输启动服务器
  -h, --http     使用HTTP传输启动服务器
  -p, --port     HTTP服务器端口 (默认: 3000)
  -i, --inspect  使用Inspector工具启动
  -?, --help     显示帮助信息
```


### 从源码启动

```bash
# 开发模式
pnpm dev

# 启动服务 (stdio模式)
pnpm start

# 启动HTTP服务
pnpm start:http

# 使用Inspector调试
pnpm inspect
```

## 🛠️ 与Claude/Cursor配置集成

### Cursor配置方法

1. 在Cursor中打开设置（Settings）
2. 转到MCP服务器（MCP Servers）部分
3. 添加新服务器配置：

```json
{
  "mcpServers": {
    "oss-mcp": {
      "command": "npx",
      "args": [
        "oss-mcp",
        "--oss-config=''{\"default\":{\"region\":\"oss-cn-shenzhen\",\"accessKeyId\":\"YOUR_KEY\",\"accessKeySecret\":\"YOUR_SECRET\",\"bucket\":\"YOUR_BUCKET\",\"endpoint\":\"oss-cn-shenzhen.aliyuncs.com\"}}''",
        "--stdio"
      ]
    }
  }
}
```

### 配置多个OSS账号

使用环境变量方式可以轻松配置多个OSS账号：

```json
{
  "mcpServers": {
    "oss-mcp": {
      "command": "npx",
      "args": [
        "oss-mcp",
        "--oss-config=''{\"default\":{\"region\":\"oss-cn-shenzhen\",\"accessKeyId\":\"YOUR_KEY\",\"accessKeySecret\":\"YOUR_SECRET\",\"bucket\":\"YOUR_BUCKET\",\"endpoint\":\"oss-cn-shenzhen.aliyuncs.com\"}, \"test\":{\"region\":\"oss-cn-shenzhen\",\"accessKeyId\":\"YOUR_KEY\",\"accessKeySecret\":\"YOUR_SECRET\",\"bucket\":\"YOUR_BUCKET\",\"endpoint\":\"oss-cn-shenzhen.aliyuncs.com\"}}''",
        "--stdio"
      ]
    }
  }
}
```

## 🧰 可用工具

服务器提供以下工具：

### 1. 上传文件到OSS (`upload_to_oss`)

**参数**:
- `filePath`: 本地文件路径（必需）
- `targetDir`: 目标目录路径（可选）
- `fileName`: 文件名（可选，默认使用原文件名）
- `configName`: OSS配置名称（可选，默认使用''default''）

### 2. 列出可用的OSS配置 (`list_oss_configs`)

无参数，返回所有可用的OSS配置名称。

## 📦 发布

```bash
# 发布到npm
pnpm pub:release

# 本地打包测试
pnpm publish:local
```

## 📊 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=1yhy/oss-mcp&type=Date)](https://star-history.com/#1yhy/oss-mcp&Date)

## 📄 许可证

[MIT](LICENSE)
', 
    '52ce043f8f3f979d5671da10bdece1bfd2641eebb85396d000ecc54daf3e7a64', 
    4512
)
ON CONFLICT (server_id) 
DO UPDATE SET 
    raw_content = EXCLUDED.raw_content,
    content_hash = EXCLUDED.content_hash,
    file_size = EXCLUDED.file_size,
    updated_at = NOW();


COMMIT;