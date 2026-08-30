import { useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ask } from "@tauri-apps/plugin-dialog";
import { useFlowStore } from "./useFlowStore";

export function useUnsavedGuard() {
  // Fix C3: Use ref to always read fresh state, never stale closure
  const hasUnsavedRef = useRef(false);

  useEffect(() => {
    // Subscribe to store changes — always updates ref
    const unsub = useFlowStore.subscribe((state) => {
      hasUnsavedRef.current = state.hasUnsavedChanges;
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handler = async () => {
      if (hasUnsavedRef.current) {
        const confirmed = await ask("You have unsaved changes. Discard?", {
          title: "Unsaved Changes",
          kind: "warning",
        });
        if (confirmed) {
          hasUnsavedRef.current = false;
          await getCurrentWindow().close();
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__ARCHMIND_PROMPT_CLOSE__ = handler;
  }, []); // Empty deps — reads from ref, never stale
}
