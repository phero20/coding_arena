import type { LLMCanvasActionCreate } from "@/types/chat";
import { ICON_SIZE, FRAME_PADDING } from "./constants";
import { safeCreateShapeId } from "./utils";
import { runDagre, computeGroupBounds } from "./layout";
import { buildEdgeShapes, buildGroupShapes } from "./builders";

export async function handleCreate(actions: LLMCanvasActionCreate, tldrawEditor: any) {
  // Guard: never create an empty frame — abort if there are no nodes to place
  if (!actions.addNodes?.length) {
    console.warn("[handleCreate] Received CREATE with no addNodes — aborting to prevent empty frame.");
    return;
  }

  const prefix = `diag_${Date.now()}_`;
  const currentShapes = tldrawEditor.getCurrentPageShapes() || [];

  // 1. Map semanticId → namespaced Tldraw ID
  const idMap = new Map<string, string>();
  for (const node of actions.addNodes || []) {
    idMap.set(node.semanticId, `${prefix}${node.semanticId}`);
  }

  // 2. Run flat Dagre (Bug #1 fix: no compound mode)
  const dagreNodes = (actions.addNodes || []).map((n) => ({
    id: idMap.get(n.semanticId)!,
    groupId: n.groupId ? `${prefix}${n.groupId}` : undefined,
  }));
  const dagreEdges = (actions.addEdges || []).map((e) => ({
    from: idMap.get(e.from) ?? e.from,
    to: idMap.get(e.to) ?? e.to,
  }));
  const dagreGroups = (actions.addGroups || []).map((g) => ({
    id: `${prefix}${g.groupId}`,
    title: g.title,
  }));

  const rawPosMap = runDagre(dagreNodes, dagreEdges);
  // Bug #1 fix: compute group bounds manually from node positions
  const rawGroupBounds = computeGroupBounds(dagreNodes, rawPosMap, dagreGroups);

  // 3. Determine spawn offset so new diagram appears below existing content
  const viewportBounds = tldrawEditor.getViewportPageBounds();
  const vpCx = viewportBounds ? (viewportBounds.minX + viewportBounds.maxX) / 2 : 0;
  const vpCy = viewportBounds ? (viewportBounds.minY + viewportBounds.maxY) / 2 : 0;

  let maxExistingY = -Infinity;
  let minExistingX = Infinity;
  let maxExistingX = -Infinity;
  for (const s of currentShapes) {
    if (s.parentId && !s.parentId.startsWith("page")) continue;
    const w = s.props?.w || ICON_SIZE;
    const h = s.props?.h || ICON_SIZE;
    if (viewportBounds) {
      if (s.y > viewportBounds.maxY || s.y + h < viewportBounds.minY) continue;
    }
    if (s.x < minExistingX) minExistingX = s.x;
    if (s.x + w > maxExistingX) maxExistingX = s.x + w;
    if (s.y + h > maxExistingY) maxExistingY = s.y + h;
  }

  let minRawX = Infinity, minRawY = Infinity, maxRawX = -Infinity;
  for (const pos of rawPosMap.values()) {
    if (pos.x < minRawX) minRawX = pos.x;
    if (pos.y < minRawY) minRawY = pos.y;
    if (pos.x > maxRawX) maxRawX = pos.x;
  }
  const layoutCx = minRawX === Infinity ? 0 : (minRawX + maxRawX) / 2;

  const offsetX =
    minExistingX !== Infinity
      ? (minExistingX + maxExistingX) / 2 - layoutCx
      : vpCx - layoutCx;
  const offsetY =
    maxExistingY > -Infinity ? maxExistingY + 460 - (minRawY ?? 0) : vpCy;

  // 4. Apply offset to get absolute positions
  const absPositions = new Map<string, { x: number; y: number }>();
  for (const [id, pos] of rawPosMap) {
    absPositions.set(id, { x: pos.x + offsetX, y: pos.y + offsetY });
  }
  const absGroupBounds = new Map<
    string,
    { x: number; y: number; width: number; height: number; title: string }
  >();
  for (const [id, gb] of rawGroupBounds) {
    absGroupBounds.set(id, { ...gb, x: gb.x + offsetX, y: gb.y + offsetY });
  }

  // 5. Frame bounding box
  let pMinX = Infinity, pMinY = Infinity, pMaxX = -Infinity, pMaxY = -Infinity;
  for (const pos of absPositions.values()) {
    if (pos.x < pMinX) pMinX = pos.x;
    if (pos.y < pMinY) pMinY = pos.y;
    if (pos.x + ICON_SIZE > pMaxX) pMaxX = pos.x + ICON_SIZE;
    if (pos.y + ICON_SIZE > pMaxY) pMaxY = pos.y + ICON_SIZE;
  }
  for (const gb of absGroupBounds.values()) {
    if (gb.x < pMinX) pMinX = gb.x;
    if (gb.y < pMinY) pMinY = gb.y;
    if (gb.x + gb.width > pMaxX) pMaxX = gb.x + gb.width;
    if (gb.y + gb.height > pMaxY) pMaxY = gb.y + gb.height;
  }
  if (pMinX === Infinity) pMinX = 0;
  if (pMinY === Infinity) pMinY = 0;
  if (pMaxX === -Infinity) pMaxX = 200;
  if (pMaxY === -Infinity) pMaxY = 200;

  const frameX = pMinX - FRAME_PADDING;
  const frameY = pMinY - FRAME_PADDING;
  const frameWidth = pMaxX - pMinX + 2 * FRAME_PADDING;
  const frameHeight = pMaxY - pMinY + 2 * FRAME_PADDING;
  const frameId = safeCreateShapeId(`frame-${Date.now()}`);

  // 6. Create frame
  tldrawEditor.createShapes([
    {
      id: frameId,
      type: "frame",
      x: frameX,
      y: frameY,
      props: {
        w: frameWidth,
        h: frameHeight,
        name: actions.frameTitle || "Architecture Flow",
      },
    },
  ]);

  // 6.5 Create group layer visuals (positions are frame-relative)
  const frameRelGroupBounds = new Map<
    string,
    { x: number; y: number; width: number; height: number; title: string }
  >();
  for (const [id, gb] of absGroupBounds) {
    frameRelGroupBounds.set(id, {
      ...gb,
      x: gb.x - frameX,
      y: gb.y - frameY,
    });
  }

  const groupShapes = buildGroupShapes(frameRelGroupBounds, frameId);
  if (groupShapes.length > 0) {
    tldrawEditor.createShapes(groupShapes);
    tldrawEditor.sendToBack(groupShapes.map((s) => s.id));
  }

  // 7. Create icon shapes (frame-relative coordinates)
  const shapesToCreate = (actions.addNodes || []).map((node) => {
    const namespacedId = idMap.get(node.semanticId)!;
    const absPos = absPositions.get(namespacedId) ?? { x: 0, y: 0 };
    return {
      id: safeCreateShapeId(namespacedId),
      parentId: frameId,
      type: "system-icon",
      x: absPos.x - frameX,
      y: absPos.y - frameY,
      props: {
        assetId: node.techType || "linux",
        label: node.label || "",
        w: ICON_SIZE,
        h: ICON_SIZE,
      },
      meta: { groupId: node.groupId ? `${prefix}${node.groupId}` : undefined },
    };
  });

  if (shapesToCreate.length > 0) {
    tldrawEditor.createShapes(shapesToCreate);
  }

  // 8. Frame-relative position map for arrow drawing
  const frameRelPosMap = new Map<string, { x: number; y: number }>();
  for (const node of actions.addNodes || []) {
    const namespacedId = idMap.get(node.semanticId)!;
    const absPos = absPositions.get(namespacedId) ?? { x: 0, y: 0 };
    frameRelPosMap.set(namespacedId, {
      x: absPos.x - frameX,
      y: absPos.y - frameY,
    });
  }

  // 9. Create arrows
  const connectionCount = new Map<string, number>();
  const edgeData = (actions.addEdges || []).map((e) => ({
    id: `${prefix}${e.semanticId}`,
    from: idMap.get(e.from) ?? e.from,
    to: idMap.get(e.to) ?? e.to,
    label: e.label,
  }));

  const { edgesToCreate, bindingsToCreate } = buildEdgeShapes(
    edgeData,
    frameRelPosMap,
    frameId,
    connectionCount
  );

  if (edgesToCreate.length > 0) tldrawEditor.createShapes(edgesToCreate);
  if (bindingsToCreate.length > 0) tldrawEditor.createBindings(bindingsToCreate);

  // 10. Group shapes into tldraw native groups by architectural layer
  const groupsMap = new Map<string, string[]>();
  for (const [namespacedGroupId, gb] of frameRelGroupBounds) {
    const geoId = safeCreateShapeId(namespacedGroupId);
    const bgId = safeCreateShapeId(`${namespacedGroupId}-bg`);
    groupsMap.set(namespacedGroupId, [geoId, bgId]);
    if (gb.title) {
      groupsMap.get(namespacedGroupId)!.push(
        safeCreateShapeId(`${namespacedGroupId}-label`)
      );
    }
  }
  for (const node of actions.addNodes || []) {
    if (node.groupId) {
      const namespacedGroupId = `${prefix}${node.groupId}`;
      const namespacedId = idMap.get(node.semanticId)!;
      if (groupsMap.has(namespacedGroupId)) {
        groupsMap.get(namespacedGroupId)!.push(safeCreateShapeId(namespacedId));
      }
    }
  }
  for (const shapeIds of groupsMap.values()) {
    if (shapeIds.length > 1) {
      tldrawEditor.groupShapes(shapeIds);
    }
  }

  // 11. Zoom to new frame
  // 11. Center camera without changing zoom (just scroll there)
  tldrawEditor.select(frameId);
  const bounds = tldrawEditor.getShapePageBounds(frameId);
  if (bounds) {
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    tldrawEditor.centerOnPoint({ x: cx, y: cy }, { animation: { duration: 400 } });
  }

}
