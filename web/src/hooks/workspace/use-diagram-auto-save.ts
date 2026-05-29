import { useState, useEffect, useRef, useCallback } from "react";
import { useUpdateDiagram } from "../mutations/use-workspace.mutations";
import { useDiagramStore } from "@/store/use-diagram-store";
import { IndexedDBHelper } from "@/lib/indexed-db";
import { useDebouncedCallback } from "use-debounce";

/**
 * useDiagramAutoSave Hook
 * Integrates hybrid offline-first synchronization under slavecode.
 * Combines 0ms local IndexedDB backups with a highly relaxed 1-minute cloud sync interval
 * and full exit-intent / internet-restoration safety triggers.
 */
export function useDiagramAutoSave(
  editor: any,
  diagramId: string | undefined,
  workspaceId: string,
  diagramData: any
) {
  const { setSaveStatus, setLastSavedAt } = useDiagramStore();
  const updateDiagramMutation = useUpdateDiagram(workspaceId);
  
  // Using standard React state so that complete hydration triggers listener binding
  const [isInitialStateLoaded, setIsInitialStateLoaded] = useState(false);
  const isDirtyRef = useRef(false);

  const isOwner = diagramData?.isOwner === true;

  // 1. Initial State Hydration (IndexedDB local recovery + Cloud reconciliation)
  useEffect(() => {
    if (!editor || isInitialStateLoaded || !diagramData || !diagramId) return;

    const hydrateStore = async () => {
      let snapshotToLoad = diagramData.documentState;

      if (isOwner) {
        try {
          // Query client IndexedDB for newer local changes
          const localSnapshot = await IndexedDBHelper.get(diagramId);
          if (localSnapshot && localSnapshot.updatedAt && localSnapshot.documentState) {
            const cloudUpdatedAt = diagramData.updatedAt;

            // Restore local snapshot if it carries a newer timestamp
            if (new Date(localSnapshot.updatedAt) > new Date(cloudUpdatedAt)) {
              snapshotToLoad = localSnapshot.documentState;
              isDirtyRef.current = true;
            }
          }
        } catch (err) {
          console.error("[Auto-Save Engine] IndexedDB recovery error:", err);
        }
      }

      if (snapshotToLoad) {
        try {
          editor.loadSnapshot(snapshotToLoad);
        } catch (err) {
          console.error("[Auto-Save Engine] Tldraw hydration failure:", err);
        }
      }
      setIsInitialStateLoaded(true);
    };

    hydrateStore();
  }, [editor, diagramData, diagramId, isInitialStateLoaded, isOwner]);

  // 2. Force Immediate Cloud Sync (Flush saves on exit intent or online recovery)
  const flushSave = useCallback(async () => {
    if (!editor || !isDirtyRef.current || !diagramId || !isOwner) return;
    const snapshot = editor.getSnapshot();
    try {
      setSaveStatus("saving");
      await updateDiagramMutation.mutateAsync({
        id: diagramId,
        data: { documentState: snapshot },
      });
      isDirtyRef.current = false;
      setSaveStatus("saved");
      setLastSavedAt(new Date());
    } catch (err) {
      console.error("[Auto-Save Engine] Flush save failure:", err);
      setSaveStatus("error");
    }
  }, [editor, diagramId, updateDiagramMutation, setSaveStatus, setLastSavedAt, isOwner]);

  // 3. Debounced Cloud Autosave Trigger (1-minute interval)
  const debouncedCloudSave = useDebouncedCallback(async (snapshot: any) => {
    if (!diagramId || !isOwner) return;
    try {
      setSaveStatus("saving");
      await updateDiagramMutation.mutateAsync({
        id: diagramId,
        data: { documentState: snapshot },
      });
      isDirtyRef.current = false;
      setSaveStatus("saved");
      setLastSavedAt(new Date());
    } catch (err) {
      console.error("[Auto-Save Engine] Cloud auto-save failure:", err);
      setSaveStatus("error");
    }
  }, 60000);

  // 4. Listen to local changes inside Tldraw store (Instant Local DB + Cloud Debounce)
  useEffect(() => {
    if (!editor || !isInitialStateLoaded || !diagramId || !isOwner) return;

    const cleanup = editor.store.listen((event: any) => {
      // Only auto-save changes originating from local user input
      if (event.source !== "user") return;

      // Filter to only trigger autosave if actual shapes or relations changed
      const hasShapeChanges =
        Object.keys(event.changes.added).some((id) => id.startsWith("shape:")) ||
        Object.keys(event.changes.updated).some((id) => id.startsWith("shape:")) ||
        Object.keys(event.changes.removed).some((id) => id.startsWith("shape:"));

      if (hasShapeChanges) {
        const snapshot = editor.getSnapshot();
        const now = new Date().toISOString();

        // 1. Instantly save snapshot to slavecode-db locally (0ms lag!)
        setSaveStatus("saving");
        IndexedDBHelper.set(diagramId, {
          documentState: snapshot,
          updatedAt: now,
         }).then(() => {
          // Smooth, brief organic visual transition (400ms)
          setTimeout(() => {
            setSaveStatus("saved");
          }, 400);
        });

        isDirtyRef.current = true;

        // 2. Sync to cloud in the background (debounced)
        debouncedCloudSave(snapshot);
      }
    });

    return () => {
      cleanup();
      debouncedCloudSave.cancel();
    };
  }, [editor, diagramId, isInitialStateLoaded, debouncedCloudSave, setSaveStatus, isOwner]);

  // 5. Exit-Intent & Online Recovery Safety Event Handlers (Tab closed / Visibility minimized / Online restored)
  useEffect(() => {
    if (!isOwner) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        flushSave();
        e.preventDefault();
        e.returnValue = "Saving diagram changes to slavecode server, please wait.";
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && isDirtyRef.current) {
        flushSave();
      }
    };

    const handleOnline = () => {
      if (isDirtyRef.current) {
        flushSave();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
    };
  }, [flushSave, isOwner]);

  return { flushSave };
}
