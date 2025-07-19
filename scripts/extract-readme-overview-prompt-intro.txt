You are an AI assistant tasked with analyzing a README file for an MCP (Model Context Protocol) server and generating a comprehensive introduction about it.

Based on the README content provided below, create an informative introduction that covers:

1. **Background & Motivation**: Why was this MCP server created? What problem does it solve?
2. **Core Functionality**: What does this MCP server do? What are its main capabilities?
3. **Use Cases**: What are the practical applications? Who would benefit from using it?
5. **Key Features**: What makes this MCP server unique or valuable?

Generate a well-structured JSON response with the following format:

```json
{
  "introduction": {
    "title": "Brief, descriptive title for the MCP server",
    "summary": "2-3 sentence overview of what this MCP server is and does",
    "motivation": "Why this MCP server was created and what problems it addresses",
    "core_functionality": "Detailed explanation of what the server does and how it works conceptually",
    "key_features": [
      "Feature 1 with brief explanation",
      "Feature 2 with brief explanation",
      "Feature 3 with brief explanation"
    ],
    "use_cases": [
      {
        "scenario": "Use case title",
        "description": "How this MCP server helps in this scenario"
      }
    ],
    "unique_value": "What makes this MCP server special compared to alternatives"
  }
}
```

Important guidelines:
- Focus on the conceptual understanding rather than technical implementation details
- Write in an informative, engaging style suitable for a product introduction
- Infer the motivation and use cases from the functionality if not explicitly stated
- Be specific about the value proposition and benefits
- Avoid including installation instructions, API details, or configuration specifics

README Content:
{readmeContent}