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

## Usage

```typescript
import { performAiEdit } from 'editcodewithai';

const result = await performAiEdit({
  prompt: "Update the code to use async/await",
  modelName: "openai/gpt-4",
  files: {
    // Your files object
  },
  apiKey: "your-openrouter-api-key",
  baseURL: "https://openrouter.ai/api/v1"
});
```

The `files` object should be a map of file IDs to file objects containing:
- `name`: The filename (e.g. "index.js")
- `text`: The file contents as a string

The function returns:
- `changedFiles`: Updated files with modifications
- `openRouterGenerationId`: ID of the generation
- `upstreamCostCents`: Cost in cents
- `provider`: The AI provider used
- `inputTokens`: Number of input tokens
- `outputTokens`: Number of output tokens

## Similar open source projects

- **Aider**: An AI pair programming tool that integrates with your terminal to assist in code editing within your local git repository. [https://aider.chat/](https://aider.chat/)

- **Bolt.new / Bolt.diy**: A platform that allows users to prompt, run, edit, and deploy full-stack web and mobile applications. [https://bolt.new/](https://bolt.new/)

- **Cline**: An AI-powered code assistant designed to help developers write and debug code more efficiently. [https://cline.ai/](https://cline.ai/)

- **Cerebras Coder**: A code generation tool developed by Cerebras Systems, leveraging advanced AI models to assist in coding tasks. [https://www.cerebras.net/](https://www.cerebras.net/)

- **Pear AI**: An open-source AI code editor that accelerates the development process by integrating features like AI chat, code generation, and debugging assistance. [https://trypear.ai/](https://trypear.ai/)

- **Void**: An open-source alternative to proprietary AI code editors, offering AI-assisted coding features while prioritizing user privacy and control. [https://void.dev/](https://void.dev/)

- **Cody**: An advanced AI coding assistant developed by Sourcegraph, integrating seamlessly with popular IDEs to provide features like AI-driven chat, code autocompletion, and inline editing. [https://github.com/sourcegraph/cody](https://github.com/sourcegraph/cody)
