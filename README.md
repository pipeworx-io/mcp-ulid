# mcp-ulid

ULID MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1152+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `generate_ulid` | Generate one or more ULIDs (time-sortable unique IDs). Each is a 26-char Crockford Base32 string whose first 10 chars encode the creation time. |
| `parse_ulid` | Validate a ULID and extract its embedded creation timestamp (ISO date + epoch ms) and the random component. Keyless, offline. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "ulid": {
      "url": "https://gateway.pipeworx.io/ulid/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1152+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Ulid data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
