# editcodewithai

Edit Code With AI

## A Simple Open Source AI Code Editor

The premise of this project is to build and iterate an open source AI code editing system. The core idea is that you can feed this system a set of source code files and high level instructions, and it will return the edited code after some time. It aims to be compatible with many LLMs, and flexible enough to adapt to future models as they come out.

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/editcodewithai.git

# Navigate to project directory
cd editcodewithai

# Install dependencies
npm install
```

## CLI Usage

The CLI tool allows you to edit code files using AI. You'll need an OpenRouter API key set in your environment variables.

```bash
# Set your OpenRouter API key
export OPENROUTER_API_KEY=your_api_key_here

# Basic usage
editcode --prompt "your instruction here"

# Specify a different directory (default is current directory)
editcode --prompt "your instruction" --dir ./path/to/code

# Use a different model (default is anthropic/claude-3.7-sonnet)
editcode --prompt "your instruction" --model openai/gpt-4

# Preview changes without writing them
editcode --prompt "your instruction" --dry-run
```

### Options

- `-p, --prompt <prompt>` (required): The instruction for editing the code
- `-d, --dir <directory>`: Directory to process (defaults to current directory)
- `--model <model>`: OpenRouter model to use (defaults to anthropic/claude-3.7-sonnet)
- `--dry-run`: Show changes without writing them

## Library Usage

```typescript
import { performAiEdit } from "editcodewithai";
import { VizFiles } from "@vizhub/viz-types";

// Define your LLM function that will process the prompt
const myLlmFunction = async (prompt: string) => {
  // Call your preferred LLM API here
  // This example assumes using OpenRouter
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4",
        messages: [{ role: "user", content: prompt }],
      }),
    }
  );

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    generationId: data.id,
  };
};

// Your files
const files: VizFiles = {
  file1: {
    name: "index.js",
    text: "console.log('Hello world');",
  },
};

// Perform the AI edit
const result = await performAiEdit({
  prompt: "Update the code to use async/await",
  files: files,
  llmFunction: myLlmFunction,
  apiKey: "your-openrouter-api-key",
});
```

### Parameters

The `performAiEdit` function accepts the following parameters:

- `prompt`: A string containing instructions for the AI
- `files`: A `VizFiles` object (map of file IDs to file objects)
- `llmFunction`: A function that takes a prompt string and returns a Promise with the LLM response
- `apiKey`: Your OpenRouter API key for retrieving cost metadata

Each file in the `files` object should contain:

- `name`: The filename (e.g. "index.js")
- `text`: The file contents as a string

### Return Value

The function returns an object with:

- `changedFiles`: Updated files with modifications
- `openRouterGenerationId`: ID of the generation
- `upstreamCostCents`: Cost in cents
- `provider`: The AI provider used
- `inputTokens`: Number of input tokens
- `outputTokens`: Number of output tokens
- `promptTemplateVersion`: Version of the prompt template used

## Similar open source projects

- **Aider**: An AI pair programming tool that integrates with your terminal to assist in code editing within your local git repository. [https://aider.chat/](https://aider.chat/)

- **Bolt.new / Bolt.diy**: A platform that allows users to prompt, run, edit, and deploy full-stack web and mobile applications. [https://bolt.new/](https://bolt.new/)

- **Cline**: An AI-powered code assistant designed to help developers write and debug code more efficiently. [https://cline.ai/](https://cline.ai/)

- **Cerebras Coder**: A code generation tool developed by Cerebras Systems, leveraging advanced AI models to assist in coding tasks. [https://www.cerebras.net/](https://www.cerebras.net/)

- **Pear AI**: An open-source AI code editor that accelerates the development process by integrating features like AI chat, code generation, and debugging assistance. [https://trypear.ai/](https://trypear.ai/)

- **Void**: An open-source alternative to proprietary AI code editors, offering AI-assisted coding features while prioritizing user privacy and control. [https://void.dev/](https://void.dev/)

- **Cody**: An advanced AI coding assistant developed by Sourcegraph, integrating seamlessly with popular IDEs to provide features like AI-driven chat, code autocompletion, and inline editing. [https://github.com/sourcegraph/cody](https://github.com/sourcegraph/cody)
