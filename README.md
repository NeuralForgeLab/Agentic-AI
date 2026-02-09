# Agentic AI

A comprehensive collection of Agentic AI concepts, patterns, and implementations.

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-blue.svg" alt="Python">
  <img src="https://img.shields.io/badge/LLM-Gemini%202.0-orange.svg" alt="Gemini">
  <img src="https://img.shields.io/badge/Framework-OpenAI%20Agents-green.svg" alt="OpenAI Agents">
  <img src="https://img.shields.io/badge/UI-Chainlit-purple.svg" alt="Chainlit">
</p>

## What is Agentic AI?

Agentic AI refers to AI systems that can:
- **Act autonomously** to achieve goals
- **Use tools** to extend capabilities
- **Make decisions** about what actions to take
- **Collaborate** with other agents
- **Validate** inputs and outputs

## Repository Structure

```
Agentic-AI/
│
└── Agents/
    ├── 01-basic-agent/           # Simple agent with LLM
    ├── 02-agent-with-tools/      # Function calling
    ├── 03-multi-agent-handoffs/  # Sequential agent pipeline
    ├── 04-triage-routing/        # Classification & routing
    ├── 05-guardrails/            # Input validation
    ├── 06-mcp-protocol/          # Model Context Protocol
    │
    └── projects/
        └── travel-chatbot/       # Complete project example
```

## Concepts Covered

### Core Patterns

| Pattern | Description |
|---------|-------------|
| **Basic Agent** | LLM wrapper with instructions and personality |
| **Tool Use** | Extending agent capabilities with functions |
| **Handoffs** | Passing context between specialized agents |
| **Triage** | Classifying and routing requests |
| **Guardrails** | Validating inputs before processing |
| **MCP** | Standardized protocol for tool exposure |

### Technologies

- **Google Gemini 2.0 Flash** - Large Language Model
- **OpenAI Agents SDK** - Agent framework
- **Chainlit** - Chat UI framework
- **Pydantic** - Data validation
- **FastMCP** - Model Context Protocol server

## Getting Started

### Prerequisites

```bash
Python 3.10+
pip or uv package manager
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/NeuralForgeLab/Agentic-AI.git
   cd Agentic-AI
   ```

2. Install dependencies:
   ```bash
   pip install openai-agents chainlit python-dotenv pydantic google-generativeai
   ```

3. Set up environment variables:
   ```bash
   # Create .env file
   echo "GEMINI_API_KEY=your_api_key_here" > .env
   ```

4. Run any example:
   ```bash
   cd Agents/01-basic-agent
   chainlit run main.py
   ```

## Learning Path

```
Start Here
    │
    ▼
┌─────────────────────────────────────┐
│  01 - Basic Agent                   │
│  Learn: Agent, Runner, Model        │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  02 - Agent with Tools              │
│  Learn: Function calling, Schemas   │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  03 - Multi-Agent Handoffs          │
│  Learn: Specialization, Pipelines   │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  04 - Triage Routing                │
│  Learn: Classification, Pydantic    │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  05 - Guardrails                    │
│  Learn: Input validation, Security  │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  06 - MCP Protocol                  │
│  Learn: HTTP tools, JSON-RPC        │
└─────────────────────────────────────┘
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**Zeeshan Zubair**
PGD Data Science with AI - Batch 8

---

<p align="center">
  Made with passion for AI learning
</p>
