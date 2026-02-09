# Agentic AI - Concepts & Patterns

This folder contains practical implementations of core Agentic AI concepts, organized progressively from basic to advanced patterns.

## Learning Path

```
01-basic-agent
      │
      ▼
02-agent-with-tools
      │
      ▼
03-multi-agent-handoffs
      │
      ▼
04-triage-routing
      │
      ▼
05-guardrails
      │
      ▼
06-mcp-protocol
```

## Concepts Overview

| # | Concept | Description | Key Learning |
|---|---------|-------------|--------------|
| 01 | [Basic Agent](./01-basic-agent) | Simple LLM-powered agent | Agent, Runner, Model setup |
| 02 | [Agent with Tools](./02-agent-with-tools) | Function calling | Tool schemas, LangChain vs OpenAI |
| 03 | [Multi-Agent Handoffs](./03-multi-agent-handoffs) | Sequential agent pipeline | Agent specialization, output passing |
| 04 | [Triage Routing](./04-triage-routing) | Classification & routing | Pydantic structured output |
| 05 | [Guardrails](./05-guardrails) | Input validation | InputGuardrail, tripwire pattern |
| 06 | [MCP Protocol](./06-mcp-protocol) | Tool exposure via HTTP | JSON-RPC 2.0, server/client |

## Architecture Patterns

### 1. Basic Agent
```
User → Agent → LLM → Response
```

### 2. Agent with Tools
```
User → Agent → [Tool Selection] → Function → Response
```

### 3. Multi-Agent Handoffs
```
User → Agent A → Agent B → Agent C → Response
```

### 4. Triage Routing
```
User → Triage Agent → Route → Handler → Response
```

### 5. Guardrails
```
User → Guardrail Check → [Allow/Block] → Processing → Response
```

### 6. MCP Protocol
```
Client → HTTP/JSON-RPC → MCP Server → Tool → Response
```

## Tech Stack

- **LLM**: Google Gemini 2.0 Flash (via OpenAI-compatible API)
- **Agent Framework**: OpenAI Agents SDK
- **UI**: Chainlit
- **Validation**: Pydantic
- **MCP**: FastMCP

## Quick Start

1. Clone and navigate:
   ```bash
   cd Agents/01-basic-agent
   ```

2. Create `.env`:
   ```
   GEMINI_API_KEY=your_key_here
   ```

3. Install dependencies:
   ```bash
   pip install openai-agents chainlit python-dotenv pydantic
   ```

4. Run:
   ```bash
   chainlit run main.py
   ```

## Projects

The `projects/` folder contains complete applications combining multiple concepts:

- **[Travel Chatbot](./projects/travel-chatbot)** - Full travel assistant using Gemini

## Authors

**Mansoor Ahmed Siddiqui** (Data Scientist)
**Zeeshan Zubair** (Data Scientist)
