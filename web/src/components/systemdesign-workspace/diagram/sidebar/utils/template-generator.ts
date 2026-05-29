import { createShapeId, createBindingId, TLShapeId, Editor } from "tldraw";
import dagre from "@dagrejs/dagre";
import { PrebuiltTemplate } from "@/constants/diagram-templates";
import { resolveDiagramAsset } from "@/utils/diagram-asset-matcher";

export const generateTemplateShapes = async (
  template: PrebuiltTemplate,
  editor: Editor
) => {
  if (template.category === "Sequence Diagram") {
    return generateSequenceDiagramShapes(template, editor);
  }

  // 1. Initialize Dagre graph layout
  const g = new dagre.graphlib.Graph({ compound: true });
  g.setGraph({
    rankdir: "LR", // Beautiful Left-to-Right layout
    nodesep: 100, // Spacious vertical node separation
    ranksep: 140, // Spacious horizontal column separation
    marginx: 50,
    marginy: 50,
  });

  g.setDefaultEdgeLabel(() => ({}));

  // Register compound group frames
  template.groups.forEach((group) => {
    g.setNode(group.id, {
      label: group.label,
      paddingTop: 50, // Compact internal buffer for Tldraw Frame Title
      paddingBottom: 30,
      paddingLeft: 30,
      paddingRight: 30,
    });
  });

  // Register leaf nodes (System Icons & Tables)
  template.nodes.forEach((node) => {
    let w = 180;
    let h = 160;

    if ((node as any).align === "start") {
      // Dynamic sizing for ERD Tables based on row count
      const lines = node.label.split("\n").length;
      w = 260; // Wide enough for table schema
      h = Math.max(140, lines * 22 + 50); // Height scales perfectly with rows
    }

    g.setNode(node.id, { width: w, height: h }); // Scaled zone
  });

  // Parent-Child group hierarchy bindings
  template.groups.forEach((group) => {
    if (group.parentId) {
      g.setParent(group.id, group.parentId);
    }
  });
  template.nodes.forEach((node) => {
    if (node.parentId) {
      g.setParent(node.id, node.parentId);
    }
  });

  // Register flow connectors (edges)
  template.edges.forEach((edge) => {
    // Exclude feedback loops from Dagre layout ranking to prevent enormous horizontal stretching
    const isFeedbackCycle =
      edge.from === "lambda-complete" && edge.to === "s3-source";
    if (!isFeedbackCycle) {
      g.setEdge(edge.from, edge.to);
    }
  });

  // Calculate layout coordinates
  dagre.layout(g);

  const createdShapeIds: Record<string, TLShapeId> = {};
  const shapesToCreate: any[] = [];
  const bindingsToCreate: any[] = [];

  // Determine viewport center for injection placement
  const viewportCenter = editor.getViewportPageBounds().center;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  template.groups.forEach((group) => {
    const dNode = g.node(group.id);
    if (dNode) {
      if (dNode.x - dNode.width / 2 < minX) minX = dNode.x - dNode.width / 2;
      if (dNode.x + dNode.width / 2 > maxX) maxX = dNode.x + dNode.width / 2;
      if (dNode.y - dNode.height / 2 < minY) minY = dNode.y - dNode.height / 2;
      if (dNode.y + dNode.height / 2 > maxY) maxY = dNode.y + dNode.height / 2;
    }
  });

  template.nodes.forEach((node) => {
    const dNode = g.node(node.id);
    if (dNode) {
      const w = dNode.width || 140;
      const h = dNode.height || 120;
      if (dNode.x - w / 2 < minX) minX = dNode.x - w / 2;
      if (dNode.x + w / 2 > maxX) maxX = dNode.x + w / 2;
      if (dNode.y - h / 2 < minY) minY = dNode.y - h / 2;
      if (dNode.y + h / 2 > maxY) maxY = dNode.y + h / 2;
    }
  });

  const layoutCenterX = minX === Infinity ? 0 : minX + (maxX - minX) / 2;
  const layoutCenterY = minY === Infinity ? 0 : minY + (maxY - minY) / 2;

  const padding = 60;
  const frameX = minX - padding;
  const frameY = minY - padding - 20;
  const frameW = maxX - minX + padding * 2;
  const frameH = maxY - minY + padding * 2 + 20;

  const mainFrameId = createShapeId();

  // Create primary overall diagram framing wrapper
  shapesToCreate.push({
    id: mainFrameId,
    type: "frame",
    x: viewportCenter.x + (frameX - layoutCenterX),
    y: viewportCenter.y + (frameY - layoutCenterY),
    props: {
      w: frameW,
      h: frameH,
      name: template.name,
    },
  });

  // 2. Generate group frames with nested relative coordinate bindings
  template.groups.forEach((group) => {
    const dagreNode = g.node(group.id);
    if (!dagreNode) return;

    const w = dagreNode.width || 120;
    const h = dagreNode.height || 100;

    const shapeId = createShapeId();
    createdShapeIds[group.id] = shapeId;

    let relX = 0;
    let relY = 0;
    let pId = mainFrameId;

    if (group.parentId && g.hasNode(group.parentId)) {
      const parentDagre = g.node(group.parentId);
      const parentW = parentDagre.width || 120;
      const parentH = parentDagre.height || 100;
      const parentTopLeftX = parentDagre.x - parentW / 2;
      const parentTopLeftY = parentDagre.y - parentH / 2;

      relX = dagreNode.x - w / 2 - parentTopLeftX;
      relY = dagreNode.y - h / 2 - parentTopLeftY;
      pId = createdShapeIds[group.parentId];
    } else {
      relX = dagreNode.x - w / 2 - frameX;
      relY = dagreNode.y - h / 2 - frameY;
    }

    shapesToCreate.push({
      id: shapeId,
      parentId: pId,
      type: "frame",
      x: relX,
      y: relY,
      props: {
        w: w,
        h: h,
        name: group.label, // Use actual label for Tldraw's native premium header tab!
      },
    });
  });

  // 3. Generate system icons or table boxes with parent frame context aware placement
  template.nodes.forEach((node) => {
    const dagreNode = g.node(node.id);
    if (!dagreNode) return;

    const shapeId = createShapeId();
    createdShapeIds[node.id] = shapeId;

    const isTable = (node as any).align === "start";

    let relX = 0;
    let relY = 0;
    let pId = mainFrameId;

    if (node.parentId && g.hasNode(node.parentId)) {
      const parentDagre = g.node(node.parentId);
      const parentW = parentDagre.width || 120;
      const parentH = parentDagre.height || 100;
      const parentTopLeftX = parentDagre.x - parentW / 2;
      const parentTopLeftY = parentDagre.y - parentH / 2;

      relX = dagreNode.x - dagreNode.width / 2 - parentTopLeftX;
      relY = dagreNode.y - dagreNode.height / 2 - parentTopLeftY;
      pId = createdShapeIds[node.parentId];
    } else {
      relX = dagreNode.x - dagreNode.width / 2 - frameX;
      relY = dagreNode.y - dagreNode.height / 2 - frameY;
    }

    if (isTable) {
      // Create the UML Table Box
      shapesToCreate.push({
        id: shapeId,
        parentId: pId,
        type: "geo",
        x: relX,
        y: relY,
        props: {
          w: dagreNode.width,
          h: dagreNode.height,
          geo: "rectangle",
          color: "black",
          fill: "solid",
          size: "s",
        },
      });

      // Add Text inside the box!
      shapesToCreate.push({
        id: createShapeId(),
        parentId: pId,
        type: "text",
        x: relX + 16, // Padding left
        y: relY + 16, // Padding top
        props: {
          w: dagreNode.width - 32,
          textAlign: "start",
          size: "s",
          font: "mono",
          autoSize: false,
          richText: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: node.label }],
              },
            ],
          },
        },
      });

      // Add a minimal icon to the top right of the table
      if (node.icon) {
        shapesToCreate.push({
          id: createShapeId(),
          parentId: pId,
          type: "system-icon",
          x: relX + dagreNode.width - 24 - 10,
          y: relY + 10,
          props: {
            w: 24,
            h: 24,
            assetId: resolveDiagramAsset(node.icon),
            label: "",
          },
        });
      }
    } else {
      // Create standard Icon + Label
      const resolvedAssetId = resolveDiagramAsset(node.icon);
      const iconSize = 96;

      const iconRelX = relX + (dagreNode.width - iconSize) / 2;
      const iconRelY = relY + (dagreNode.height - iconSize) / 2 - 20;

      shapesToCreate.push({
        id: shapeId,
        parentId: pId,
        type: "system-icon",
        x: iconRelX,
        y: iconRelY,
        props: {
          w: iconSize,
          h: iconSize,
          assetId: resolvedAssetId,
          label: node.label,
        },
      });

      shapesToCreate.push({
        id: createShapeId(),
        parentId: pId,
        type: "text",
        x: iconRelX - 52, // Center-aligned with 200px width
        y: iconRelY + iconSize + 6,
        props: {
          w: 200,
          textAlign: "middle",
          size: "s",
          font: "sans",
          autoSize: false,
          richText: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: node.label }],
              },
            ],
          },
        },
      });
    }
  });

  // 4. Generate premium curved arrows and flow annotations
  template.edges.forEach((edge) => {
    const fromShapeId = createdShapeIds[edge.from];
    const toShapeId = createdShapeIds[edge.to];
    if (!fromShapeId || !toShapeId) return;

    const fromDagre = g.node(edge.from);
    const toDagre = g.node(edge.to);
    if (!fromDagre || !toDagre) return;

    const arrowId = createShapeId();

    const startX = fromDagre.x - frameX;
    const startY = fromDagre.y - frameY;
    const endX = toDagre.x - frameX;
    const endY = toDagre.y - frameY;

    const arrowProps: any = {
      start: { x: 0, y: 0 },
      end: { x: endX - startX, y: endY - startY },
      bend: 20, // Curved connection joints like Eraser.io
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

    shapesToCreate.push({
      id: arrowId,
      parentId: mainFrameId,
      type: "arrow",
      x: startX,
      y: startY,
      props: arrowProps,
    });

    bindingsToCreate.push({
      id: createBindingId(),
      type: "arrow",
      fromId: arrowId,
      toId: fromShapeId,
      props: {
        terminal: "start",
        normalizedAnchor: { x: 0.5, y: 0.5 },
        isExact: false,
        isPrecise: false,
      },
    });

    bindingsToCreate.push({
      id: createBindingId(),
      type: "arrow",
      fromId: arrowId,
      toId: toShapeId,
      props: {
        terminal: "end",
        normalizedAnchor: { x: 0.5, y: 0.5 },
        isExact: false,
        isPrecise: false,
      },
    });
  });

  // Inject shapes & bindings onto whiteboard canvas
  editor.createShapes(shapesToCreate);
  editor.createBindings(bindingsToCreate);

  // Select all created objects and smoothly zoom Selection to Fit!
  const spawnedIds = shapesToCreate.map((s) => s.id);
  editor.select(...spawnedIds);
  editor.zoomToSelection({ animation: { duration: 300 } });
};

const generateSequenceDiagramShapes = async (
  template: PrebuiltTemplate,
  editor: Editor
) => {
  const shapesToCreate: any[] = [];
  const bindingsToCreate: any[] = [];
  const createdShapeIds: Record<string, TLShapeId> = {};

  const viewportCenter = editor.getViewportPageBounds().center;

  const ACTOR_WIDTH = 140;
  const ACTOR_HEIGHT = 50;
  const X_SPACING = 240;
  const Y_START = 50;
  const Y_STEP = 100;
  
  const numActors = template.nodes.length;
  const totalWidth = (numActors - 1) * X_SPACING + ACTOR_WIDTH;
  const startX = viewportCenter.x - totalWidth / 2;
  const startY = viewportCenter.y - ((template.edges.length * Y_STEP) / 2);

  const actorXPositions: Record<string, number> = {};

  const mainFrameId = createShapeId();
  const totalHeight = Y_START + template.edges.length * Y_STEP + 100;

  shapesToCreate.push({
    id: mainFrameId,
    type: "frame",
    x: startX - 100,
    y: startY - 100,
    props: {
      w: totalWidth + 200,
      h: totalHeight + 200,
      name: template.name,
    },
  });

  // Create Actors and Lifelines
  template.nodes.forEach((node, index) => {
    const xPos = index * X_SPACING;
    actorXPositions[node.id] = xPos;
    const actorShapeId = createShapeId();
    createdShapeIds[node.id] = actorShapeId;

    // Actor Box (Header)
    shapesToCreate.push({
      id: actorShapeId,
      parentId: mainFrameId,
      type: "geo",
      x: xPos,
      y: Y_START,
      props: {
        w: ACTOR_WIDTH,
        h: ACTOR_HEIGHT,
        geo: "rectangle",
        color: "black",
        fill: "none",
        size: "s",
      },
    });

    shapesToCreate.push({
      id: createShapeId(),
      parentId: mainFrameId,
      type: "text",
      x: xPos,
      y: Y_START + 12,
      props: {
        w: ACTOR_WIDTH,
        textAlign: "middle",
        size: "s",
        font: "sans",
        autoSize: false,
        richText: {
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: node.label }] }],
        },
      },
    });

    // Top icon if available
    if (node.icon) {
      shapesToCreate.push({
        id: createShapeId(),
        parentId: mainFrameId,
        type: "system-icon",
        x: xPos - 12 + 10,
        y: Y_START + 13,
        props: {
          w: 24,
          h: 24,
          assetId: resolveDiagramAsset(node.icon),
          label: "",
        },
      });
      // Need to pad text to the right? Let's just adjust it using an overlapping logic or simple text.
      // But standard geo shape centering is fine.
    }

    // Actor Box (Footer)
    shapesToCreate.push({
      id: createShapeId(),
      parentId: mainFrameId,
      type: "geo",
      x: xPos,
      y: Y_START + totalHeight - 50,
      props: {
        w: ACTOR_WIDTH,
        h: ACTOR_HEIGHT,
        geo: "rectangle",
        color: "black",
        fill: "none",
        size: "s",
      },
    });

    shapesToCreate.push({
      id: createShapeId(),
      parentId: mainFrameId,
      type: "text",
      x: xPos,
      y: Y_START + totalHeight - 50 + 12,
      props: {
        w: ACTOR_WIDTH,
        textAlign: "middle",
        size: "s",
        font: "sans",
        autoSize: false,
        richText: {
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: node.label }] }],
        },
      },
    });

    // Lifeline (Vertical line down)
    shapesToCreate.push({
      id: createShapeId(),
      parentId: mainFrameId,
      type: "line",
      x: xPos + ACTOR_WIDTH / 2,
      y: Y_START + ACTOR_HEIGHT,
      props: {
        points: {
          a1: { id: "a1", index: "a1", x: 0, y: 0 },
          a2: { id: "a2", index: "a2", x: 0, y: totalHeight - 50 - (Y_START + ACTOR_HEIGHT) }
        },
        color: "grey",
        dash: "dashed",
        size: "s"
      }
    });
  });

  // Create Edges (Messages) and Activations
  template.edges.forEach((edge, index) => {
    const fromX = actorXPositions[edge.from];
    const toX = actorXPositions[edge.to];
    if (fromX === undefined || toX === undefined) return;

    const yPos = Y_START + ACTOR_HEIGHT + 40 + (index * Y_STEP);
    const isReturn = edge.label?.toLowerCase().includes("return") || toX < fromX;

    const arrowId = createShapeId();
    
    // Draw activation box for receiver
    const ACTIVATION_WIDTH = 12;
    shapesToCreate.push({
      id: createShapeId(),
      parentId: mainFrameId,
      type: "geo",
      x: toX + ACTOR_WIDTH / 2 - ACTIVATION_WIDTH / 2,
      y: yPos - 10,
      props: {
        w: ACTIVATION_WIDTH,
        h: Math.max(80, Y_STEP - 20),
        geo: "rectangle",
        color: "grey",
        fill: "solid",
        size: "s",
      },
    });

    if (fromX === toX) {
      // Self-loop message
      const LOOP_WIDTH = 60;
      const arrowProps: any = {
        start: { x: 0, y: 0 },
        end: { x: 0, y: 30 },
        bend: LOOP_WIDTH, // Curving out and back
        dash: isReturn ? "dashed" : "draw",
        size: "s",
      };
      
      if (edge.label) {
        arrowProps.richText = {
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: edge.label }] }],
        };
      }

      shapesToCreate.push({
        id: arrowId,
        parentId: mainFrameId,
        type: "arrow",
        x: fromX + ACTOR_WIDTH / 2 + ACTIVATION_WIDTH / 2,
        y: yPos,
        props: arrowProps,
      });
    } else {
      const arrowProps: any = {
        start: { x: 0, y: 0 },
        end: { x: toX - fromX - (fromX < toX ? ACTIVATION_WIDTH : -ACTIVATION_WIDTH), y: 0 },
        dash: isReturn ? "dashed" : "draw",
        size: "s",
      };

      if (edge.label) {
        arrowProps.richText = {
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: edge.label }] }],
        };
      }

      shapesToCreate.push({
        id: arrowId,
        parentId: mainFrameId,
        type: "arrow",
        x: fromX + ACTOR_WIDTH / 2 + (fromX < toX ? ACTIVATION_WIDTH / 2 : -ACTIVATION_WIDTH / 2),
        y: yPos,
        props: arrowProps,
      });
    }
  });

  editor.createShapes(shapesToCreate);
  editor.createBindings(bindingsToCreate);

  const spawnedIds = shapesToCreate.map((s) => s.id);
  editor.select(...spawnedIds);
  editor.zoomToSelection({ animation: { duration: 300 } });
};
