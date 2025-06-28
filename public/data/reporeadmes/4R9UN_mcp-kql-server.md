# 🚀 MCP KQL Server

A Model Context Protocol (MCP) server for executing Kusto Query Language (KQL) queries against Azure Data Explorer clusters. Seamlessly integrates with Claude Desktop and Visual Studio Code (VS Code). Supports Azure CLI authentication and provides a convenient `kql_execute` tool for **execute KQL queries** directly within your **AI prompts**, complete with optional visualizations.

![MCP KQL server](https://github.com/4R9UN/mcp-kql-server/blob/main/MCP%20KQL%20Server_%20Image%20.png)

## ✨ Features

- **🔍 Execute KQL Queries**: Run KQL queries directly within your AI prompts using the `kql_execute` MCP tool.
- **⚡ Plug-and-Play Simplicity**: No manual tenant ID configuration or complex credential management. Simply authenticate via Azure CLI (`az login`) and start querying immediately.
- **🤖 Seamless Claude Integration**: Execute KQL queries within Claude Desktop without switching interfaces or dashboards.
- **🔒 Secure and Efficient**: Leverages Azure CLI’s robust authentication, ensuring secure credential handling and optimized query performance.
- **📊 Visualization Ready**: Optional Markdown table outputs make data analysis intuitive and engaging.
- **🔑 Azure CLI Authentication**: Built-in Azure CLI authentication with retry and caching logic.
- **📡 Protocol Compatibility**: Fully compatible with MCP protocol version `2024-11-05`.
- **🛠️ Reliable Implementation**: Uses `fastmcp` for a robust and reliable MCP server implementation.

### 📌 Comparison with Other Tools

| Feature                      | MCP KQL Server | Azure Data Explorer MCP | Standalone Scripts |
|------------------------------|----------------|-------------------------|--------------------|
| Claude Integration           | ✅             | ❌                      | ❌                 |
| Plug-and-Play Authentication | ✅ (Azure CLI) | ❌ (Manual setup)       | ❌ (Custom code)   |
| No Tenant ID Required        | ✅             | ❌                      | ❌                 |
| Data Visualization           | ✅             | ✅                      | ❌                 |
| Open-Source                  | ✅             | ✅                      | Varies             |

## 📋 Requirements

- Python 3.10 or higher
- Azure Data Explorer cluster access
- Azure CLI installed and authenticated (`az login`)
- Node.js (optional, for Claude Desktop filesystem server)
- VS Code with Claude extension or MCP client (for VS Code integration)

## 📂 Project Structure

```
mcp-kql-server/
├── mcp_kql_server/
│   ├── __init__.py
│   ├── mcp_server.py
│   ├── kql_auth.py
│   └── execute_kql.py
├── pyproject.toml
├── README.md
```

## 🏗️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/4R9UN/mcp-kql-server.git
cd mcp-kql-server
```

### 2️⃣ Install Python 3.10+

- **Windows**:
  ```bash
  winget install Python.Python.3.10
  ```
- **macOS**:
  ```bash
  brew install python@3.10
  ```
- **Linux**:
  ```bash
  sudo apt-get install python3.10
  ```

Verify installation:
```bash
python --version
```

### 3️⃣ Install Azure CLI

- Follow official instructions: [Install Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- Log in to Azure:
  ```bash
  az config set core.login_experience_v2=off
  az login
  ```

### 4️⃣ Create and Activate Virtual Environment

```bash
python -m venv .venv
```

Activate environment:

- **Windows**:
  ```bash
  .venv\Scripts\activate
  ```
- **macOS/Linux**:
  ```bash
  source .venv/bin/activate
  ```

### 5️⃣ Install Dependencies

```bash
pip install .
```

## 🖥️ Setup for Claude Desktop

- Copy `claude_desktop_config.json` to Claude's configuration directory:
  - **Windows**: `C:\Users\YourUser\AppData\Roaming\Claude\`
  - **macOS**: `/Users/YourUser/Library/Application Support/Claude/`
  - **Linux**: Currently not supported by Claude Desktop.

- Update the configuration file with your Python path and project directory:

```json
{
  "mcpServers": {
    "mcp-kql-server": {
      "command": "C:\\Users\\YourUser\\mcp-kql-server\\.venv\\Scripts\\python.exe",
      "args": [
        "-m",
        "mcp_kql_server.mcp_server"
      ]
    }
  }
}
```

- Optional: Install Node.js for filesystem server support ([Node.js](https://nodejs.org/)).
- Restart Claude Desktop.

## 🖱️ Setup for VS Code

- Install [VS Code](https://code.visualstudio.com/).
- Install the `Copilot MCP` client extension.
- Modify the MCP `settings.json` with the following configuration:

```json
{
  "mcpServers": {
    "mcp-kql-server": {
      "command": "C:\\Users\\YourUser\\mcp-kql-server\\.venv\\Scripts\\python.exe",
      "args": [
        "-m",
        "mcp_kql_server.mcp_server"
      ],
      "env": {
        "PYTHONPATH": "C:\\Users\\YourUser\\Downloads\\mcp-kql-server",
        "PYTHONUNBUFFERED": "1",
        "AZURE_CORE_ONLY_SHOW_ERRORS": "true"
      }
    }
  }
}
```

- Run the `MCP: List Servers` command in VS Code’s Command Palette to verify setup.
- Enable autodiscovery if using Claude Desktop’s configuration.

## ✅ Test the Server

- **Claude Desktop**:
  - Open Claude Desktop and provide the following prompt:
    ```
    Use a tool to execute the attached KQL query, visualize the results, and provide high-level insights from the query output.

    KQL query: "cluster('mycluster').database('mydb').MyTable | take 10"
    ```

## 🤝 Contributing

- Fork the repository.
- Create a feature branch:
  ```bash
  git checkout -b feature/YourFeature
  ```
- Commit your changes:
  ```bash
  git commit -m "Add YourFeature"
  ```
- Push to your branch:
  ```bash
  git push origin feature/YourFeature
  ```
- Open a Pull Request.

## 📬 Contact

For issues or questions, please open a ticket on GitHub or contact the maintainer at [arjuntrivedi42@yahoo.com](mailto:arjuntrivedi42@yahoo.com).

🎉 **Happy Querying!**
