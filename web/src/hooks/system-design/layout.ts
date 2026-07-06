import dagre from "@dagrejs/dagre";
import { ICON_SIZE, DAGRE_NODESEP, DAGRE_RANKSEP, GROUP_PADDING_X, GROUP_PADDING_TOP, GROUP_PADDING_BOTTOM } from "./constants";
import { estimateTextWidth, estimateTextHeight } from "./utils";

/**
 * Run Dagre WITHOUT compound mode.
 * Compound mode in Dagre breaks rankdir:"LR" when clusters are disconnected —
 * it stacks everything vertically. Instead we run a flat LR layout on the
 * actual icon nodes and then compute group bounding boxes ourselves from the
 * resulting node positions.
 */
export function runDagre(
  nodes: Array<{ id: string; groupId?: string }>,
  edges: Array<{ from: string; to: string }>
): Map<string, { x: number; y: number }> {
  if (edges.length === 0) {
    const posMap = new Map<string, { x: number; y: number }>();
    const marginX = 60;
    const marginY = 60;
    const xGap = ICON_SIZE + DAGRE_RANKSEP;
    const yGap = ICON_SIZE + DAGRE_NODESEP;

    const groupedNodes = nodes.filter((n) => n.groupId);
    const hasGroups = groupedNodes.length > 0;

    if (hasGroups) {
      const groupOrder: string[] = [];
      for (const n of nodes) {
        if (n.groupId && !groupOrder.includes(n.groupId)) {
          groupOrder.push(n.groupId);
        }
      }

      const nodesByGroup = new Map<string, Array<{ id: string; groupId?: string }>>();
      for (const groupId of groupOrder) nodesByGroup.set(groupId, []);
      for (const n of nodes) {
        if (n.groupId) {
          nodesByGroup.get(n.groupId)?.push(n);
        }
      }

      let col = 0;
      for (const groupId of groupOrder) {
        const groupNodes = nodesByGroup.get(groupId) || [];
        let row = 0;
        for (const node of groupNodes) {
          posMap.set(node.id, {
            x: marginX + col * xGap,
            y: marginY + row * yGap,
          });
          row++;
        }
        col++;
      }

      const ungrouped = nodes.filter((n) => !n.groupId);
      let row = 0;
      for (const node of ungrouped) {
        posMap.set(node.id, {
          x: marginX + col * xGap,
          y: marginY + row * yGap,
        });
        row++;
      }

      return posMap;
    }

    const columns = Math.max(2, Math.min(4, Math.ceil(Math.sqrt(nodes.length || 1))));
    for (let i = 0; i < nodes.length; i++) {
      const col = i % columns;
      const row = Math.floor(i / columns);
      posMap.set(nodes[i].id, {
        x: marginX + col * xGap,
        y: marginY + row * yGap,
      });
    }

    return posMap;
  }

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "LR",
    nodesep: DAGRE_NODESEP,
    ranksep: DAGRE_RANKSEP,
    marginx: 60,
    marginy: 60,
  });
  g.setDefaultEdgeLabel(() => ({}));

  const nodeIds = new Set(nodes.map((n) => n.id));
  
  // 1. Add regular nodes
  for (const n of nodes) {
    g.setNode(n.id, { width: ICON_SIZE, height: ICON_SIZE });
  }

  // 2. Add edges
  for (const e of edges) {
    if (nodeIds.has(e.from) && nodeIds.has(e.to)) {
      g.setEdge(e.from, e.to);
    }
  }

  dagre.layout(g);

  const posMap = new Map<string, { x: number; y: number }>();
  for (const n of nodes) {
    const node = g.node(n.id);
    if (node) {
      const isInvalid = isNaN(node.x) || isNaN(node.y);
      posMap.set(n.id, {
        x: isInvalid ? 0 : node.x - ICON_SIZE / 2,
        y: isInvalid ? 0 : node.y - ICON_SIZE / 2,
      });
    } else {
      posMap.set(n.id, { x: 0, y: 0 });
    }
  }

  return posMap;
}

/**
 * Manually compute group bounding boxes from
 * the actual positions of the nodes that belong to each group.
 */
export function computeGroupBounds(
  nodeEntries: Array<{ id: string; groupId?: string }>,
  posMap: Map<string, { x: number; y: number }>,
  groups: Array<{ id: string; title: string }>
): Map<string, { x: number; y: number; width: number; height: number; title: string }> {
  const bounds = new Map<
    string,
    { x: number; y: number; width: number; height: number; title: string }
  >();

  for (const gr of groups) {
    const children = nodeEntries.filter((n) => n.groupId === gr.id);
    if (children.length === 0) continue;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const child of children) {
      const p = posMap.get(child.id);
      if (p) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x + ICON_SIZE > maxX) maxX = p.x + ICON_SIZE;
        if (p.y + ICON_SIZE > maxY) maxY = p.y + ICON_SIZE;
      }
    }

    if (minX === Infinity) continue;

    const titleWidth = estimateTextWidth(gr.title, 12);
    const titleHeight = estimateTextHeight(gr.title, 12);
    const contentWidth = maxX - minX + 2 * GROUP_PADDING_X;
    const contentHeight = maxY - minY + GROUP_PADDING_TOP + GROUP_PADDING_BOTTOM;

    bounds.set(gr.id, {
      x: minX - GROUP_PADDING_X,
      y: minY - GROUP_PADDING_TOP,
      width: Math.max(contentWidth, titleWidth + 32),
      height: Math.max(contentHeight, titleHeight + GROUP_PADDING_TOP + 24),
      title: gr.title,
    });
  }

  return bounds;
}
