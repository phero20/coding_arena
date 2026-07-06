import type { LLMCanvasActionUpdate } from "@/types/chat";
import { ICON_SIZE, FRAME_PADDING, DAGRE_RANKSEP } from "./constants";
import {
  safeCreateShapeId,
  isFrameRelativeShape,
  getShapeRichTextValue,
  extractSemanticId,
  isConnectorShape,
  collectDescendants,
  getShapePageBoundsBox,
  expandBounds,
} from "./utils";
import { runDagre, computeGroupBounds } from "./layout";
import { buildEdgeShapes, buildGroupShapes } from "./builders";

export async function handleUpdate(
  actions: LLMCanvasActionUpdate,
  tldrawEditor: any,
  semanticMap: Map<string, string>,
  framePrefixMap: Map<string, string>
) {
  const targetFrameId = safeCreateShapeId(actions.targetFrameId);
  let currentShapes: any[] = tldrawEditor.getCurrentPageShapes() || [];

  // Validate target frame exists
  const frameShape = currentShapes.find((s: any) => s.id === targetFrameId);
  if (!frameShape) {
    console.warn(
      `[useChat] UPDATE targetFrameId="${actions.targetFrameId}" not found on canvas.`
    );
    return;
  }

  const bindingRecords: any[] = tldrawEditor.store
    .allRecords()
    .filter((r: any) => r.typeName === "binding");

  // Ungroup native tldraw groups first so we can manipulate child shapes
  const nativeGroupShapes = currentShapes.filter(
    (s: any) => s.parentId === targetFrameId && s.type === "group"
  );
  if (nativeGroupShapes.length > 0) {
    tldrawEditor.ungroupShapes(nativeGroupShapes.map((s: any) => s.id));
    currentShapes = tldrawEditor.getCurrentPageShapes() || [];
  }

  // ── Robust prefix detection (Bug fix: never fall back to a new timestamp) ────
  let framePrefix = framePrefixMap.get(targetFrameId);
  if (!framePrefix) {
    const existingIconsForPrefix = currentShapes.filter(
      (s: any) => s.parentId === targetFrameId && s.type === "system-icon"
    );
    for (const icon of existingIconsForPrefix) {
      const stripped = icon.id.replace(/^shape:/, "");
      const m = stripped.match(/^(diag_\d+_)/);
      if (m) { framePrefix = m[1]; break; }
    }
    // Last resort — generate a new prefix only if the frame is truly empty
    if (!framePrefix) framePrefix = `diag_${Date.now()}_`;
  }

  // ── BUG #3 FIX: Save all group metadata BEFORE deleting group shapes ──────
  const savedGroupMeta = new Map<string, { id: string; title: string }>();
  const existingGroupShapes = currentShapes.filter(
    (s: any) => isFrameRelativeShape(s, targetFrameId) && s.meta?.isGroup
  );
  for (const g of existingGroupShapes) {
    const gId = (g.meta?.groupId as string) || g.id;
    if (savedGroupMeta.has(gId)) continue;
    const title = g.type === "text" ? getShapeRichTextValue(g) || "Group" : "Group";
    savedGroupMeta.set(gId, { id: gId, title });
  }

  // Delete ALL existing group visual shapes (they'll be redrawn after re-layout)
  if (existingGroupShapes.length > 0) {
    tldrawEditor.deleteShapes(existingGroupShapes.map((s: any) => s.id));
  }

  // ── BUG #4 FIX: Build clean semanticMap (icons only) for deletion ─────────
  const cleanSemanticMap = new Map<string, string>();
  const allCurrentIcons = currentShapes.filter(
    (s: any) =>
      isFrameRelativeShape(s, targetFrameId) && s.type === "system-icon"
  );
  for (const icon of allCurrentIcons) {
    cleanSemanticMap.set(extractSemanticId(icon.id), icon.id);
  }

  if (actions.deleteNodeIds?.length) {
    const toDelete = actions.deleteNodeIds
      .map((semId) => cleanSemanticMap.get(semId))
      .filter(Boolean) as string[];
    if (toDelete.length > 0) {
      tldrawEditor.deleteShapes(toDelete.map((id) => safeCreateShapeId(id)));
      // Also delete arrows connected to deleted nodes
      const deletedSet = new Set(toDelete.map((id) => safeCreateShapeId(id)));
      const connectorsToDelete = new Set<string>();

      currentShapes
        .filter((s: any) => isConnectorShape(s))
        .forEach((connector: any) => {
          const startBind = bindingRecords.find(
            (b: any) => b.fromId === connector.id && b.props?.terminal === "start"
          );
          const endBind = bindingRecords.find(
            (b: any) => b.fromId === connector.id && b.props?.terminal === "end"
          );

          const boundIds = [startBind?.toId, endBind?.toId].filter(Boolean) as string[];
          const touchesDeletedNode = boundIds.some(
            (boundId) => deletedSet.has(boundId) || deletedSet.has(safeCreateShapeId(boundId))
          );

          if (touchesDeletedNode) {
            connectorsToDelete.add(connector.id);
          }
        });

      if (connectorsToDelete.size > 0) {
        tldrawEditor.deleteShapes(Array.from(connectorsToDelete));
      }
    }
  }

  if (actions.deleteEdgeIds?.length) {
    const deleteEdgeSet = new Set(
      actions.deleteEdgeIds.map((id) => extractSemanticId(safeCreateShapeId(id)))
    );
    const edgeShapesToDelete = currentShapes
      .filter((s: any) => isConnectorShape(s))
      .filter((connector: any) => {
        const connectorSemanticId = extractSemanticId(connector.id);
        return deleteEdgeSet.has(connectorSemanticId) || deleteEdgeSet.has(connector.id);
      })
      .map((s: any) => s.id);

    if (edgeShapesToDelete.length > 0) {
      tldrawEditor.deleteShapes(edgeShapesToDelete.map((id: string) => safeCreateShapeId(id)));
    }
  }

  // Re-read shapes after all deletions
  currentShapes = tldrawEditor.getCurrentPageShapes() || [];

  // ── Build idMap (semanticId → namespacedId) ──────────────────────────────
  const idMap = new Map<string, string>(semanticMap);
  for (const node of actions.addNodes || []) {
    const namespacedId = `${framePrefix}${node.semanticId}`;
    idMap.set(node.semanticId, namespacedId);
  }

  // ── FRONTEND DEDUPLICATION GUARD ───────────────────
  const existingShapeIds = new Set(
    currentShapes
      .filter((s: any) => isFrameRelativeShape(s, targetFrameId) && s.type === "system-icon")
      .map((s: any) => s.id as string)
  );
  const existingSemanticIdsOnFrame = new Set(
    currentShapes
      .filter((s: any) => isFrameRelativeShape(s, targetFrameId) && s.type === "system-icon")
      .map((s: any) => extractSemanticId(s.id as string))
  );

  const dedupedAddNodes = (actions.addNodes || []).filter((node) => {
    const namespacedId = idMap.get(node.semanticId)!;
    const fullShapeId = safeCreateShapeId(namespacedId) as unknown as string;
    if (existingShapeIds.has(fullShapeId)) {
      console.warn(`[handleUpdate] Skipping duplicate node "${node.semanticId}" — shape already exists on frame.`);
      return false;
    }
    if (existingSemanticIdsOnFrame.has(node.semanticId)) {
      console.warn(`[handleUpdate] Skipping duplicate node "${node.semanticId}" — semanticId already on frame.`);
      return false;
    }
    return true;
  });

  if (dedupedAddNodes.length === 0 && !actions.addEdges?.length) {
    console.info("[handleUpdate] All nodes in addNodes were duplicates. Redrawing groups only.");
    _redrawGroupsAndResize(tldrawEditor, targetFrameId, frameShape, currentShapes, savedGroupMeta, framePrefix, actions.addGroups || []);
    return;
  }

  // ── BUG #2 + #5 FIX: Run Dagre ONLY on new nodes ─────────────────────────
  const newNodeDagreEntries = dedupedAddNodes.map((node) => ({
    id: idMap.get(node.semanticId)!,
    groupId: node.groupId ? `${framePrefix}${node.groupId}` : undefined,
  }));

  const newNodeIds = new Set(newNodeDagreEntries.map((n) => n.id));

  let flowScore = 0;
  for (const edge of actions.addEdges || []) {
    const fromNamespaced = idMap.get(edge.from) ?? edge.from;
    const toNamespaced = idMap.get(edge.to) ?? edge.to;
    
    const isFromNew = newNodeIds.has(fromNamespaced);
    const isToNew = newNodeIds.has(toNamespaced);
    
    if (isFromNew && !isToNew) flowScore -= 1;
    if (!isFromNew && isToNew) flowScore += 1;
  }

  const newOnlyEdges = (actions.addEdges || [])
    .map((e) => ({
      from: idMap.get(e.from) ?? e.from,
      to: idMap.get(e.to) ?? e.to,
    }))
    .filter((e) => newNodeIds.has(e.from) && newNodeIds.has(e.to));

  let newNodePosMap = new Map<string, { x: number; y: number }>();
  if (newNodeDagreEntries.length > 0) {
    const rawNewPosMap = runDagre(newNodeDagreEntries, newOnlyEdges);

    const frameBoundsBox = getShapePageBoundsBox(tldrawEditor, targetFrameId);
    const framePageX = frameBoundsBox ? frameBoundsBox.minX : 0;

    const existingDescendants = collectDescendants(currentShapes, targetFrameId);
    let rightEdge = -Infinity;
    let leftEdge = Infinity;
    for (const shape of existingDescendants) {
      const bounds = getShapePageBoundsBox(tldrawEditor, shape.id);
      if (bounds) {
        const relativeMaxX = bounds.maxX - framePageX;
        if (relativeMaxX > rightEdge) rightEdge = relativeMaxX;
        
        const relativeMinX = bounds.minX - framePageX;
        if (relativeMinX < leftEdge) leftEdge = relativeMinX;
      }
    }
    if (rightEdge === -Infinity) {
      const existingIconsNow = currentShapes.filter(
        (s: any) => isFrameRelativeShape(s, targetFrameId) && s.type === "system-icon"
      );
      for (const icon of existingIconsNow) {
        const r = icon.x + ICON_SIZE;
        if (r > rightEdge) rightEdge = r;
        if (icon.x < leftEdge) leftEdge = icon.x;
      }
    }
    if (leftEdge === Infinity) leftEdge = 0;

    let minRawX = Infinity, minRawY = Infinity, maxRawX = -Infinity;
    for (const p of rawNewPosMap.values()) {
      if (p.x < minRawX) minRawX = p.x;
      if (p.y < minRawY) minRawY = p.y;
      if (p.x > maxRawX) maxRawX = p.x;
    }
    if (minRawX === Infinity) minRawX = 0;
    if (minRawY === Infinity) minRawY = 0;
    if (maxRawX === -Infinity) maxRawX = ICON_SIZE;

    const newGraphWidth = maxRawX - minRawX + ICON_SIZE;

    let offsetX = 0;
    if (flowScore < 0 && leftEdge !== Infinity) {
      offsetX = leftEdge - DAGRE_RANKSEP - newGraphWidth;
    } else {
      offsetX = rightEdge > -Infinity ? rightEdge + DAGRE_RANKSEP : 0;
    }

    for (const [id, pos] of rawNewPosMap) {
      newNodePosMap.set(id, {
        x: pos.x - minRawX + offsetX,
        y: pos.y - minRawY,
      });
    }
  }

  // ── Create new icon shapes ────────────────────
  const newShapesToCreate: any[] = [];
  for (const node of dedupedAddNodes) {
    const namespacedId = idMap.get(node.semanticId)!;
    const pos = newNodePosMap.get(namespacedId) ?? { x: 100, y: 100 };
    newShapesToCreate.push({
      id: safeCreateShapeId(namespacedId),
      parentId: targetFrameId,
      type: "system-icon",
      x: pos.x,
      y: pos.y,
      props: {
        assetId: node.techType || "linux",
        label: node.label || "",
        w: ICON_SIZE,
        h: ICON_SIZE,
      },
      meta: {
        groupId: node.groupId ? `${framePrefix}${node.groupId}` : undefined,
      },
    });
  }
  if (newShapesToCreate.length > 0) {
    tldrawEditor.createShapes(newShapesToCreate);
  }

  currentShapes = tldrawEditor.getCurrentPageShapes() || [];

  // ── Create new arrows ────────────────────
  const allBindingsNow: any[] = tldrawEditor.store
    .allRecords()
    .filter((r: any) => r.typeName === "binding");
  const existingArrows = currentShapes.filter(
    (s: any) => isFrameRelativeShape(s, targetFrameId) && s.type === "arrow"
  );
  const connectionCount = new Map<string, number>();
  const existingEdgeKeys = new Set<string>();

  for (const arrow of existingArrows) {
    const startBind = allBindingsNow.find(
      (b: any) => b.fromId === arrow.id && b.props?.terminal === "start"
    );
    const endBind = allBindingsNow.find(
      (b: any) => b.fromId === arrow.id && b.props?.terminal === "end"
    );
    const from = startBind?.toId || arrow.props?.start?.boundShapeId || "";
    const to = endBind?.toId || arrow.props?.end?.boundShapeId || "";
    if (from && to) {
      const key = [from, to].sort().join("<->");
      connectionCount.set(key, (connectionCount.get(key) ?? 0) + 1);
      existingEdgeKeys.add(`${from}->${to}`);
    }
  }

  const iconPosMap = new Map<string, { x: number; y: number }>();
  const allIconsNow = currentShapes.filter(
    (s: any) => isFrameRelativeShape(s, targetFrameId) && s.type === "system-icon"
  );
  for (const icon of allIconsNow) {
    iconPosMap.set(icon.id, { x: icon.x, y: icon.y });
  }

  const newEdgesToDraw: Array<{
    id: string;
    from: string;
    to: string;
    label?: string;
  }> = [];
  for (const edge of actions.addEdges || []) {
    const from = idMap.get(edge.from) ?? edge.from;
    const to = idMap.get(edge.to) ?? edge.to;
    const key = `${from}->${to}`;
    if (!existingEdgeKeys.has(key)) {
      newEdgesToDraw.push({
        id: `${framePrefix}${edge.semanticId}`,
        from,
        to,
        label: edge.label,
      });
      existingEdgeKeys.add(key);
    }
  }

  const { edgesToCreate, bindingsToCreate } = buildEdgeShapes(
    newEdgesToDraw,
    iconPosMap,
    targetFrameId,
    connectionCount
  );
  if (edgesToCreate.length > 0) tldrawEditor.createShapes(edgesToCreate);
  if (bindingsToCreate.length > 0) tldrawEditor.createBindings(bindingsToCreate);

  // ── Rebuild group visuals + resize frame ──────────────────────────────────
  currentShapes = tldrawEditor.getCurrentPageShapes() || [];
  _redrawGroupsAndResize(
    tldrawEditor,
    targetFrameId,
    frameShape,
    currentShapes,
    savedGroupMeta,
    framePrefix,
    actions.addGroups || []
  );

  // Scroll to diagram without changing zoom
  tldrawEditor.select(targetFrameId);
  const bounds = tldrawEditor.getShapePageBounds(targetFrameId);
  if (bounds) {
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    tldrawEditor.centerOnPoint({ x: cx, y: cy }, { animation: { duration: 400 } });
  }
}

function _redrawGroupsAndResize(
  tldrawEditor: any,
  targetFrameId: any,
  frameShape: any,
  currentShapes: any[],
  savedGroupMeta: Map<string, { id: string; title: string }>,
  framePrefix: string,
  newGroups: Array<{ groupId: string; title: string }>
) {
  const allGroupMeta = new Map<string, { id: string; title: string }>(
    savedGroupMeta
  );
  for (const g of newGroups) {
    const namespacedId = `${framePrefix}${g.groupId}`;
    allGroupMeta.set(namespacedId, { id: namespacedId, title: g.title });
  }

  const descendantShapes = collectDescendants(currentShapes, targetFrameId);
  const iconShapes = descendantShapes.filter(
    (s: any) => s.type === "system-icon"
  );
  const nodeEntries: Array<{ id: string; groupId?: string }> = iconShapes.map(
    (s: any) => ({
      id: s.id,
      groupId: s.meta?.groupId as string | undefined,
    })
  );
  const frameBoundsBox = getShapePageBoundsBox(tldrawEditor, targetFrameId);
  const framePageX = frameBoundsBox ? frameBoundsBox.minX : 0;
  const framePageY = frameBoundsBox ? frameBoundsBox.minY : 0;

  const framePosMap = new Map<string, { x: number; y: number }>();
  for (const s of iconShapes) {
    const bounds = getShapePageBoundsBox(tldrawEditor, s.id);
    if (bounds) {
      framePosMap.set(s.id, { 
        x: bounds.minX - framePageX, 
        y: bounds.minY - framePageY 
      });
    } else {
      framePosMap.set(s.id, { x: s.x, y: s.y });
    }
  }

  const groupBounds = computeGroupBounds(
    nodeEntries,
    framePosMap,
    Array.from(allGroupMeta.values())
  );

  const groupShapes = buildGroupShapes(groupBounds, targetFrameId);
  if (groupShapes.length > 0) {
    tldrawEditor.createShapes(groupShapes);
    tldrawEditor.sendToBack(groupShapes.map((s: any) => s.id));
  }

  const liveShapes = tldrawEditor.getCurrentPageShapes() || [];
  const allChildren = collectDescendants(liveShapes, targetFrameId);
  
  let contentBounds: { minX: number; minY: number; maxX: number; maxY: number } | null = null;
  
  for (const c of allChildren) {
    const cBounds = getShapePageBoundsBox(tldrawEditor, c.id);
    if (cBounds) {
      contentBounds = expandBounds(contentBounds, {
        minX: cBounds.minX - framePageX,
        minY: cBounds.minY - framePageY,
        maxX: cBounds.maxX - framePageX,
        maxY: cBounds.maxY - framePageY,
      });
    }
  }
  for (const gb of groupBounds.values()) {
    contentBounds = expandBounds(contentBounds, {
      minX: gb.x,
      minY: gb.y,
      maxX: gb.x + gb.width,
      maxY: gb.y + gb.height,
    });
  }
  if (contentBounds) {
    let shiftX = 0;
    let shiftY = 0;
    
    if (contentBounds.minX < FRAME_PADDING) {
      shiftX = FRAME_PADDING - contentBounds.minX;
    }
    if (contentBounds.minY < FRAME_PADDING) {
      shiftY = FRAME_PADDING - contentBounds.minY;
    }

    if (shiftX > 0 || shiftY > 0) {
      const directChildren = liveShapes.filter((s: any) => s.parentId === targetFrameId);
      tldrawEditor.updateShapes(
        directChildren.map((s: any) => ({
          id: s.id,
          type: s.type,
          x: s.x + shiftX,
          y: s.y + shiftY,
        }))
      );
      
      contentBounds.maxX += shiftX;
      contentBounds.maxY += shiftY;
    }

    tldrawEditor.updateShape({
      id: targetFrameId,
      props: {
        w: Math.max(200, contentBounds.maxX + FRAME_PADDING),
        h: Math.max(200, contentBounds.maxY + FRAME_PADDING),
      },
    });
  }

  const groupsMap = new Map<string, string[]>();
  for (const [namespacedGroupId, gb] of groupBounds) {
    const geoId = safeCreateShapeId(namespacedGroupId);
    const bgId = safeCreateShapeId(`${namespacedGroupId}-bg`);
    groupsMap.set(namespacedGroupId, [geoId, bgId]);
    if (gb.title) {
      groupsMap
        .get(namespacedGroupId)!
        .push(safeCreateShapeId(`${namespacedGroupId}-label`));
    }
  }
  for (const icon of iconShapes) {
    const gId = icon.meta?.groupId as string | undefined;
    if (gId && groupsMap.has(gId)) {
      groupsMap.get(gId)!.push(icon.id);
    }
  }
  for (const shapeIds of groupsMap.values()) {
    if (shapeIds.length > 1) {
      tldrawEditor.groupShapes(shapeIds);
    }
  }

  // Zoom to updated frame
  tldrawEditor.select(targetFrameId);
  const bounds = tldrawEditor.getShapePageBounds(targetFrameId);
  if (bounds) {
    setTimeout(() => {
      // Re-fetch bounds after render tick
      const updatedBounds = tldrawEditor.getShapePageBounds(targetFrameId);
      if (updatedBounds) {
        tldrawEditor.zoomToBounds(updatedBounds, { animation: { duration: 500 } });
      }
    }, 150);
  }
}
