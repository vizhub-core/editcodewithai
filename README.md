# editcodewithai

A lightweight, flexible library for AI-powered code editing.

See also [vizhub-benchmarks](https://github.com/vizhub-core/vizhub-benchmarks).

## Overview

`editcodewithai` is a JavaScript/TypeScript library that enables AI-powered code editing in your applications. It provides a simple interface to send code files and instructions to an LLM (Large Language Model) and receive edited code in return.

The library is designed to be model-agnostic, allowing you to use any LLM provider while handling the prompt engineering, file parsing, and response processing for you.

Edit formats inspired by [Aider](https://aider.chat/). See [Aider: Edit Formats](https://aider.chat/docs/more/edit-formats.html) for details.

## Installation

```bash
npm install editcodewithai
```

## Usage

Here's a basic example of how to use `performAiEdit` to update a file:

```typescript
import { performAiEdit, LlmFunction } from "editcodewithai";
import { VizFiles } from "@vizhub/viz-types";

// Your function to call the LLM
const myLlmFunction: LlmFunction = async (prompt: string) => {
  // ... call your LLM API with the prompt
  const llmResponse = "...";
  return {
    content: llmResponse, // The raw string response from the LLM
    generationId: "some-generation-id", // Optional, for cost tracking with OpenRouter
  };
};

const files: VizFiles = {
  file1: {
    name: "index.js",
    text: 'console.log("Hello, World!");',
  },
};

const prompt = 'Change the greeting to "Hello, Universe!"';

async function main() {
  const result = await performAiEdit({
    prompt,
    files,
    llmFunction: myLlmFunction,
    editFormat: "diff", // Specify the desired edit format
  });

  console.log(result.changedFiles["file1"].text);
  // Expected output: console.log("Hello, Universe!");
}

main();
```

## Edit Formats

This library supports several "edit formats" that instruct the LLM on how to specify file changes. Different models may perform better with different formats. You can specify the format using the `editFormat` parameter in `performAiEdit`.

### `whole` (default)

The LLM returns the complete, updated content for each file that needs changes. This is simple but can be inefficient for large files with small changes.

**Example:**

````
**index.js**

```js
console.log("Hello, Universe!");
````

### `diff`

The LLM returns a series of search-and-replace blocks. This is efficient as it only includes the changed portions of the files.

**Example:**

````
index.js
```
<<<<<<< SEARCH
console.log("Hello, World!");

### performAiEdit(params)

The main function that processes files with an AI model and returns edited code.

#### Parameters

| Parameter     | Type          | Description                                                       |
| ------------- | ------------- | ----------------------------------------------------------------- |
| `prompt`      | `string`      | Instructions for the AI on how to modify the code                 |
| `files`       | `VizFiles`    | Object containing file information (see below)                    |
| `llmFunction` | `LlmFunction` | Function that sends the prompt to an LLM and returns the response |
| `apiKey`      | `string`      | OpenRouter API key for retrieving cost metadata                   |

The `VizFiles` type is a map of file IDs to file objects, where each file object has:

- `name`: The filename (e.g., "index.js")
- `text`: The file contents as a string

The `LlmFunction` type is a function that takes a prompt string and returns a Promise with:

- `content`: The LLM's response text
- `generationId`: A unique ID for the generation (used for cost tracking)

#### Return Value

The function returns an object with:

| Property                 | Type       | Description                                |
| ------------------------ | ---------- | ------------------------------------------ |
| `changedFiles`           | `VizFiles` | Updated files with AI modifications        |
| `openRouterGenerationId` | `string`   | ID of the generation from the LLM provider |
| `upstreamCostCents`      | `number`   | Cost of the API call in cents              |
| `provider`               | `string`   | The AI provider used (e.g., "openai")      |
| `inputTokens`            | `number`   | Number of input tokens used                |
| `outputTokens`           | `number`   | Number of output tokens generated          |
| `promptTemplateVersion`  | `number`   | Version of the prompt template used        |

### File Operations

The library handles several file operations automatically:

- **Updating existing files**: When the AI modifies a file's content
- **Creating new files**: When the AI suggests new files to add
- **Deleting files**: When the AI returns empty content for a file

## Similar Projects

- **Aider**: An AI pair programming tool that integrates with your terminal to assist in code editing within your local git repository. [https://aider.chat/](https://aider.chat/)

- **Bolt.new / Bolt.diy**: A platform that allows users to prompt, run, edit, and deploy full-stack web and mobile applications. [https://bolt.new/](https://bolt.new/)

- **Cline**: An AI-powered code assistant designed to help developers write and debug code more efficiently. [https://cline.ai/](https://cline.ai/)

- **Cerebras Coder**: A code generation tool developed by Cerebras Systems, leveraging advanced AI models to assist in coding tasks. [https://www.cerebras.net/](https://www.cerebras.net/)

- **Pear AI**: An open-source AI code editor that accelerates the development process by integrating features like AI chat, code generation, and debugging assistance. [https://trypear.ai/](https://trypear.ai/)

- **Void**: An open-source alternative to proprietary AI code editors, offering AI-assisted coding features while prioritizing user privacy and control. [https://void.dev/](https://void.dev/)

- **Cody**: An advanced AI coding assistant developed by Sourcegraph, integrating seamlessly with popular IDEs to provide features like AI-driven chat, code autocompletion, and inline editing. [https://github.com/sourcegraph/cody](https://github.com/sourcegraph/cody)

## Contributing

To contribute to this project:

```bash
# Clone the repository
git clone https://github.com/yourusername/editcodewithai.git

# Navigate to project directory
cd editcodewithai

# Install dependencies
npm install
```

Run tests to ensure everything is working correctly:

```bash
npm test
```

Please submit pull requests with clear descriptions of changes and ensure all tests pass. Protocol for wrapping up a PR:

```
npm test
npm run typecheck
npm run prettier
# Verify the README is up to date
```

Please create an issue first before creating a PR to discuss the changes you want to make. This helps ensure that your contributions align with the project's goals and vision.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
````
