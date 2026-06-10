import { useEffect, useMemo, useState } from "react";
import { useBlocker } from "@tanstack/react-router";

export type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Generic dirty-state form helper for admin settings:
 * - keeps a local draft (initialized from `initial`)
 * - reports dirty when draft !== baseline
 * - blocks navigation while dirty and exposes a modal-resolver
 * - warns on tab close via beforeunload
 */
export function useDirtyForm<T extends object>(initial: T, onPersist: (v: T) => void) {
  const [baseline, setBaseline] = useState<T>(initial);
  const [draft, setDraft] = useState<T>(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(baseline),
    [draft, baseline],
  );

  // External initial sync (e.g. when store changes outside this form)
  useEffect(() => {
    setBaseline(initial);
    setDraft(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initial)]);

  // beforeunload warning
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const blocker = useBlocker({
    shouldBlockFn: () => dirty,
    enableBeforeUnload: false,
    withResolver: true,
  });
  const blocked = blocker.status === "blocked";
  const pendingPath = blocked ? blocker.next.pathname : null;

  const save = () => {
    setSaveState("saving");
    try {
      onPersist(draft);
      setBaseline(draft);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2200);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 2500);
    }
  };

  const reset = () => setDraft(baseline);

  const set = <K extends keyof T>(key: K, value: T[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const patch = (p: Partial<T>) => setDraft((d) => ({ ...d, ...p }));

  // Modal actions
  const stay = () => {
    if (blocker.status === "blocked") blocker.reset();
  };
  const discardAndGo = () => {
    setDraft(baseline);
    if (blocker.status === "blocked") blocker.proceed();
  };
  const saveAndGo = () => {
    onPersist(draft);
    setBaseline(draft);
    if (blocker.status === "blocked") blocker.proceed();
  };

  return {
    draft,
    dirty,
    saveState,
    set,
    patch,
    save,
    reset,
    blocked,
    pendingPath,
    stay,
    discardAndGo,
    saveAndGo,
  };
}
