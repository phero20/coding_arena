import { createBindingId } from "tldraw";
import { ICON_SIZE, LAYER_COLORS } from "./constants";
import { safeCreateShapeId } from "./utils";

/**
 * Build arrow shapes and bindings for a list of edges.
 * Returns { edgesToCreate, bindingsToCreate }.
 */
export function buildEdgeShapes(
  rawEdges: Array<{
    id: string;
    from: string; // full TLShapeId (namespaced)
    to: string;   // full TLShapeId (namespaced)
    label?: string;
  }>,
  positionMap: Map<string, { x: number; y: number }>,
  parentId: any,
  connectionCount: Map<string, number>
): { edgesToCreate: any[]; bindingsToCreate: any[] } {
  const edgesToCreate: any[] = [];
  const bindingsToCreate: any[] = [];

  for (const edge of rawEdges) {
    if (!edge.from || !edge.to) continue;

    const fromShapeId = safeCreateShapeId(edge.from);
    const toShapeId = safeCreateShapeId(edge.to);
    const arrowId = safeCreateShapeId(edge.id);

    const fromPos = positionMap.get(edge.from) ?? { x: 0, y: 0 };
    const toPos = positionMap.get(edge.to) ?? { x: 200, y: 0 };

    const half = ICON_SIZE / 2;
    const sx = fromPos.x + half;
    const sy = fromPos.y + half;
    const ex = toPos.x + half;
    const ey = toPos.y + half;

    const key = [edge.from, edge.to].sort().join("<->");
    const count = connectionCount.get(key) ?? 0;
    connectionCount.set(key, count + 1);

    let bendVal = -25;
    if (count > 0) {
      const sign = count % 2 === 0 ? -1 : 1;
      bendVal = sign * (25 + Math.floor(count / 2) * 20);
    }

    const arrowProps: any = {
      start: { x: 0, y: 0 },
      end: { x: ex - sx, y: ey - sy },
      color: "grey",
      dash: "solid",
      size: "s",
      bend: bendVal,
      font: "sans",
    };

    if (edge.label) {
      arrowProps.richText = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: edge.label }],
          },
        ],
      };
    }

    edgesToCreate.push({
      id: arrowId,
      parentId,
      type: "arrow",
      x: sx,
      y: sy,
      props: arrowProps,
    });

    bindingsToCreate.push(
      {
        id: createBindingId(),
        type: "arrow",
        fromId: arrowId,
        toId: fromShapeId,
        props: {
          terminal: "start",
          isExact: false,
          isPrecise: true,
        },
      },
      {
        id: createBindingId(),
        type: "arrow",
        fromId: arrowId,
        toId: toShapeId,
        props: {
          terminal: "end",
          isExact: false,
          isPrecise: true,
        },
      }
    );
  }

  return { edgesToCreate, bindingsToCreate };
}

export function buildGroupShapes(
  groupBounds: Map<string, { x: number; y: number; width: number; height: number; title: string }>,
  parentId: any
): any[] {
  const shapes: any[] = [];
  let colorIdx = 0;

  for (const [namespacedGroupId, gb] of groupBounds) {
    const color = LAYER_COLORS[colorIdx % LAYER_COLORS.length];
    colorIdx++;

    // Semitransparent background fill
    shapes.push({
      id: safeCreateShapeId(`${namespacedGroupId}-bg`),
      parentId,
      type: "geo",
      x: gb.x,
      y: gb.y,
      opacity: 0.55,
      props: {
        geo: "rectangle",
        w: gb.width,
        h: gb.height,
        color,
        fill: "solid",
      },
      meta: { isGroup: true, groupId: namespacedGroupId },
    });

    // Solid border
    shapes.push({
      id: safeCreateShapeId(namespacedGroupId),
      parentId,
      type: "geo",
      x: gb.x,
      y: gb.y,
      opacity: 1,
      props: {
        geo: "rectangle",
        w: gb.width,
        h: gb.height,
        color,
        fill: "none",
        dash: "solid",
      },
      meta: { isGroup: true, groupId: namespacedGroupId },
    });

    // Label text — uses richText (Tldraw v5 requirement, plain "text" prop is rejected)
    if (gb.title) {
      shapes.push({
        id: safeCreateShapeId(`${namespacedGroupId}-label`),
        parentId,
        type: "text",
        x: gb.x + 16,
        y: gb.y + 16,
        props: {
          color,
          size: "s",
          font: "sans",
          autoSize: true,
          richText: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: gb.title }],
              },
            ],
          },
        },
        meta: { isGroup: true, groupId: namespacedGroupId },
      });
    }
  }

  return shapes;
}
