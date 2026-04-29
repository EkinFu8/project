import * as webllm from "@mlc-ai/web-llm";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AssistantStatus } from "./types";

interface UseWebLlmAssistantInput {
  modelId: string;
  onReady: () => void;
  enabled: boolean;
}

interface CompletionInput {
  messages: webllm.ChatCompletionMessageParam[];
  onToken: (content: string) => void;
}

function supportsWebGpu(): boolean {
  return Boolean((navigator as Navigator & { gpu?: unknown }).gpu);
}

export function useWebLlmAssistant({ modelId, onReady, enabled }: UseWebLlmAssistantInput) {
  const [status, setStatus] = useState<AssistantStatus>("loading");
  const [progress, setProgress] = useState(0);
  const [hasGpu, setHasGpu] = useState(true);
  const engineRef = useRef<webllm.MLCEngineInterface | null>(null);
  const readyNotifiedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    readyNotifiedRef.current = false;
    setStatus("loading");
    setProgress(0);

    async function initEngine() {
      if (!supportsWebGpu()) {
        setHasGpu(false);
        setStatus("error");
        return;
      }

      setHasGpu(true);

      try {
        const engine = await webllm.CreateMLCEngine(modelId, {
          initProgressCallback: ({ progress: nextProgress }) => {
            if (!cancelled) {
              setProgress(Math.round(nextProgress * 100));
            }
          },
        });

        if (cancelled) {
          engine.unload();
          return;
        }

        engineRef.current = engine;
        setProgress(100);
        setStatus("ready");
      } catch (error) {
        if (!cancelled) {
          console.error("WebLLM init error:", error);
          setStatus("error");
        }
      }
    }

    initEngine();

    return () => {
      cancelled = true;
      engineRef.current?.unload();
      engineRef.current = null;
    };
  }, [enabled, modelId]);

  useEffect(() => {
    if (status === "ready" && !readyNotifiedRef.current) {
      readyNotifiedRef.current = true;
      onReady();
    }
  }, [onReady, status]);

  const complete = useCallback(async ({ messages, onToken }: CompletionInput) => {
    const engine = engineRef.current;
    if (!engine) {
      throw new Error("Assistant model is not ready.");
    }

    setStatus("generating");

    try {
      const stream = await engine.chat.completions.create({
        messages,
        stream: true,
        temperature: 0.2,
        top_p: 0.85,
      });

      let accumulated = "";
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? "";
        accumulated += delta;
        onToken(accumulated);
      }
    } finally {
      setStatus("ready");
    }
  }, []);

  return {
    complete,
    hasGpu,
    progress,
    status,
  };
}
