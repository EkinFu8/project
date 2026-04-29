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

interface SharedEngineState {
  engine: webllm.MLCEngineInterface | null;
  hasGpu: boolean;
  initPromise: Promise<webllm.MLCEngineInterface> | null;
  listeners: Set<() => void>;
  modelId: string;
  progress: number;
  status: AssistantStatus;
}

interface AssistantSnapshot {
  hasGpu: boolean;
  progress: number;
  status: AssistantStatus;
}

const sharedEngines = new Map<string, SharedEngineState>();

// Keep WebLLM warm across chat switches and component remounts in this tab.
function supportsWebGpu(): boolean {
  return (
    typeof navigator !== "undefined" && Boolean((navigator as Navigator & { gpu?: unknown }).gpu)
  );
}

function getSharedEngine(modelId: string) {
  const existing = sharedEngines.get(modelId);
  if (existing) return existing;

  const shared: SharedEngineState = {
    engine: null,
    hasGpu: true,
    initPromise: null,
    listeners: new Set(),
    modelId,
    progress: 0,
    status: "loading",
  };
  sharedEngines.set(modelId, shared);
  return shared;
}

function snapshot(shared: SharedEngineState): AssistantSnapshot {
  return {
    hasGpu: shared.hasGpu,
    progress: shared.progress,
    status: shared.status,
  };
}

function notify(shared: SharedEngineState) {
  for (const listener of shared.listeners) listener();
}

function startEngine(shared: SharedEngineState) {
  if (shared.engine || shared.initPromise) {
    return shared.initPromise ?? Promise.resolve(shared.engine);
  }

  if (!supportsWebGpu()) {
    shared.hasGpu = false;
    shared.status = "error";
    notify(shared);
    return null;
  }

  shared.hasGpu = true;
  shared.status = "loading";
  notify(shared);

  shared.initPromise = webllm
    .CreateMLCEngine(shared.modelId, {
      initProgressCallback: ({ progress }) => {
        shared.progress = Math.round(progress * 100);
        notify(shared);
      },
    })
    .then((engine) => {
      shared.engine = engine;
      shared.progress = 100;
      shared.status = "ready";
      notify(shared);
      return engine;
    })
    .catch((error) => {
      console.error("WebLLM init error:", error);
      shared.engine = null;
      shared.status = "error";
      notify(shared);
      throw error;
    })
    .finally(() => {
      shared.initPromise = null;
    });

  return shared.initPromise;
}

export function useWebLlmAssistant({ modelId, onReady, enabled }: UseWebLlmAssistantInput) {
  const sharedRef = useRef(getSharedEngine(modelId));
  const readyNotifiedRef = useRef(false);
  const [state, setState] = useState<AssistantSnapshot>(() => snapshot(sharedRef.current));

  useEffect(() => {
    sharedRef.current = getSharedEngine(modelId);
    readyNotifiedRef.current = false;
    setState(snapshot(sharedRef.current));
  }, [modelId]);

  useEffect(() => {
    if (!enabled) return;

    const shared = getSharedEngine(modelId);
    sharedRef.current = shared;
    const listener = () => setState(snapshot(shared));
    shared.listeners.add(listener);
    listener();
    void startEngine(shared)?.catch(() => undefined);

    return () => {
      shared.listeners.delete(listener);
    };
  }, [enabled, modelId]);

  useEffect(() => {
    if (state.status === "ready" && !readyNotifiedRef.current) {
      readyNotifiedRef.current = true;
      onReady();
    }
  }, [onReady, state.status]);

  const complete = useCallback(async ({ messages, onToken }: CompletionInput) => {
    const shared = sharedRef.current;
    const engine = shared.engine ?? (shared.initPromise ? await shared.initPromise : null);
    if (!engine) {
      throw new Error("Assistant model is not ready.");
    }

    shared.status = "generating";
    notify(shared);

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
      shared.status = "ready";
      notify(shared);
    }
  }, []);

  return {
    complete,
    hasGpu: state.hasGpu,
    progress: state.progress,
    status: state.status,
  };
}
