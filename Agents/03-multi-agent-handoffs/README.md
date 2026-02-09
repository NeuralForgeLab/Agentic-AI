# 03 - Multi-Agent Handoffs

## Concept

**Multi-Agent Handoffs** enable sequential processing where each specialized agent handles a specific part of the task and passes results to the next agent.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   User Request                   │
│       "Build me an e-commerce platform"         │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│              Manager Agent                       │
│   "Refine into clear requirements..."           │
│                                                  │
│   Output: Software Requirements Spec            │
└─────────────────────┬───────────────────────────┘
                      │ Handoff
                      ▼
┌─────────────────────────────────────────────────┐
│           Web Developer Agent                    │
│   "Design web application solution..."          │
│                                                  │
│   Output: Web App Architecture                  │
└─────────────────────┬───────────────────────────┘
                      │ Handoff
                      ▼
┌─────────────────────────────────────────────────┐
│        Mobile App Developer Agent               │
│   "Extend to mobile application..."             │
│                                                  │
│   Output: Complete Solution                     │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│              Final Response                      │
└─────────────────────────────────────────────────┘
```

## Key Components

| Component | Description |
|-----------|-------------|
| `handoff_description` | Describes agent's expertise for routing |
| Sequential Pipeline | Each agent passes output to the next |
| Specialized Instructions | Each agent has domain-specific prompts |

## Code Example

```python
# Define specialized agents
manager_agent = Agent(
    name="Manager",
    instructions="Refine the client request into requirements.",
    model=llm_model
)

web_dev_agent = Agent(
    name="Web Developer",
    handoff_description="Expert in building websites",
    instructions="Propose a web application solution.",
    model=llm_model
)

# Sequential execution
manager_result = await Runner.run(manager_agent, user_input)
web_result = await Runner.run(web_dev_agent, manager_result.final_output)
```

## Handoff Pattern

```
Agent A ──output──► Agent B ──output──► Agent C
   │                   │                   │
   └── Specialized     └── Specialized     └── Final
       Task 1              Task 2              Output
```

## Running the Example

```bash
chainlit run main.py
```

## Use Cases

- Software development pipelines
- Content creation workflows
- Multi-step analysis
- Approval chains
- Document processing pipelines
