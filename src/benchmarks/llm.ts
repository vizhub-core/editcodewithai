import { LlmFunction } from "../types";
import { ChatOpenAI, ChatOpenAIFields } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { LocalFileCache } from "langchain/cache/file_system";

/**
 * Creates an LLM function that connects to OpenRouter
 * @param model The model identifier to use
 * @param apiKey OpenRouter API key
 * @param cache Optional local file cache to avoid duplicate requests
 * @returns A function that can be used with performAiEdit
 */
export function createOpenRouterLlmFunction(model: string, apiKey: string, cache?: LocalFileCache): LlmFunction {
  return async (prompt: string) => {
    // Create OpenAI chat model with OpenRouter configuration
    const chatModel = new ChatOpenAI(<ChatOpenAIFields>{
      modelName: model, 
      configuration: { apiKey, baseURL: "https://openrouter.ai/api/v1" },
      streaming: false,
      cache,
    });

    // Invoke the model
    const result = await chatModel.invoke(prompt);

    // Parse to string
    const parser = new StringOutputParser();
    const resultString = await parser.invoke(result);

    return { content: resultString, generationId: result.lc_kwargs.id };
  };
}
