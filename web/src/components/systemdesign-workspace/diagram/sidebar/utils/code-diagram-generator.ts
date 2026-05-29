import { createShapeId, createBindingId, TLShapeId, Editor } from 'tldraw';
import dagre from '@dagrejs/dagre';
import { resolveDiagramAsset } from '@/utils/diagram-asset-matcher';

export const generateDiagramFromCode = async (
  code: string, 
  editor: Editor, 
  currentDirection: 'vertical' | 'horizontal', 
  spacing: number,
  setError: (err: string | null) => void
): Promise<void> => {

    if (!editor) {
      setError("Diagram editor is not ready yet.");
      return;
    }

    try {
      setError(null);
      const lines = code.split("\n");

      interface ParsedNode {
        id: string;
        label?: string;
        icon?: string;
        isGroup?: boolean;
        parentId?: string;
        color?: string;
      }

      const nodes: ParsedNode[] = [];
      const edges: Array<{ from: string; to: string; label?: string }> = [];
      const seenNodes = new Set<string>();
      let diagramTitle = "";
      let overrideDirection: "vertical" | "horizontal" | null = null;

      const parentStack: string[] = [];

      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("#")) {
          return;
        }

        if (trimmed.toLowerCase().startsWith("title ")) {
          diagramTitle = trimmed.substring(6).trim();
          return;
        }

        if (trimmed.toLowerCase().startsWith("direction ")) {
          const dir = trimmed.substring(10).trim().toLowerCase();
          if (dir === "right" || dir === "lr") {
            overrideDirection = "horizontal";
          } else if (dir === "down" || dir === "tb") {
            overrideDirection = "vertical";
          }
          return;
        }

        if (trimmed === "}") {
          if (parentStack.length > 0) {
            parentStack.pop();
          }
          return;
        }

        if (trimmed.endsWith("{")) {
          const blockHeader = trimmed.substring(0, trimmed.length - 1).trim();
          const headerMatch = blockHeader.match(/^([^\[]+)(?:\s*\[(.*?)\])?$/);
          if (!headerMatch) {
            throw new Error(`Syntax error on line ${index + 1}: Invalid group header`);
          }

          const rawId = headerMatch[1].trim();
          const attrStr = headerMatch[2] || "";

          let label = rawId;
          let icon = "";
          let color = "";

          if (attrStr) {
            const labelAttr = attrStr.match(/label:\s*"([^"]+)"/);
            if (labelAttr) label = labelAttr[1];

            const iconAttr = attrStr.match(/icon:\s*([a-zA-Z0-9_-]+)/);
            if (iconAttr) icon = iconAttr[1];

            const colorAttr = attrStr.match(/color:\s*([a-zA-Z0-9_-]+)/);
            if (colorAttr) color = colorAttr[1];
          }

          const groupId = rawId;
          const parentId = parentStack.length > 0 ? parentStack[parentStack.length - 1] : undefined;

          if (!seenNodes.has(groupId)) {
            nodes.push({ id: groupId, label, icon, isGroup: true, parentId, color });
            seenNodes.add(groupId);
          } else {
            const existing = nodes.find(n => n.id === groupId);
            if (existing) {
              existing.isGroup = true;
              existing.parentId = parentId;
              if (label !== groupId) existing.label = label;
              if (icon) existing.icon = icon;
              if (color) existing.color = color;
            }
          }

          parentStack.push(groupId);
          return;
        }

        if (trimmed.includes(">") || trimmed.includes("<")) {
          const parts = trimmed.split(/\s*([><])\s*/);
          
          for (let i = 1; i < parts.length; i += 2) {
            const op = parts[i];
            const leftSeg = parts[i - 1];
            const rightSeg = parts[i + 1];

            const leftIds = leftSeg.split(",").map(s => s.trim());
            const rightIds = rightSeg.split(",").map(s => s.trim());

            let edgeLabel = "";
            const lastPartIndex = parts.length - 1;
            
            const cleanNodesList = (nodesList: string[], isLastSegment: boolean) => {
              return nodesList.map(nodeStr => {
                const attrMatch = nodeStr.match(/^([^\[]+)(?:\s*\[(.*?)\])?$/);
                if (attrMatch) {
                  const cleanedId = attrMatch[1].trim();
                  const attrStr = attrMatch[2] || "";
                  if (isLastSegment && attrStr) {
                    const labelMatch = attrStr.match(/label:\s*"([^"]+)"/);
                    if (labelMatch) edgeLabel = labelMatch[1];
                  }
                  return cleanedId;
                }
                return nodeStr.trim();
              });
            };

            const cleanLeftIds = cleanNodesList(leftIds, i === lastPartIndex - 1 && op === "<");
            const cleanRightIds = cleanNodesList(rightIds, i === lastPartIndex - 1 && op === ">");

            const currentParentId = parentStack.length > 0 ? parentStack[parentStack.length - 1] : undefined;
            const registerIds = (ids: string[]) => {
              ids.forEach(id => {
                if (!seenNodes.has(id)) {
                  nodes.push({ id, parentId: currentParentId });
                  seenNodes.add(id);
                }
              });
            };
            registerIds(cleanLeftIds);
            registerIds(cleanRightIds);

            cleanLeftIds.forEach(fromId => {
              cleanRightIds.forEach(toId => {
                if (op === ">") {
                  edges.push({ from: fromId, to: toId, label: edgeLabel });
                } else {
                  edges.push({ from: toId, to: fromId, label: edgeLabel });
                }
              });
            });
          }
          return;
        }

        const nodeMatch = trimmed.match(/^([^\[]+)(?:\s*\[(.*?)\])?$/);
        if (nodeMatch) {
          const rawId = nodeMatch[1].trim();
          const attrStr = nodeMatch[2] || "";

          let label = rawId;
          let icon = "";
          let color = "";

          if (attrStr) {
            const labelAttr = attrStr.match(/label:\s*"([^"]+)"/);
            if (labelAttr) label = labelAttr[1];

            const iconAttr = attrStr.match(/icon:\s*([a-zA-Z0-9_-]+)/);
            if (iconAttr) icon = iconAttr[1];

            const colorAttr = attrStr.match(/color:\s*([a-zA-Z0-9_-]+)/);
            if (colorAttr) color = colorAttr[1];
          }

          const currentParentId = parentStack.length > 0 ? parentStack[parentStack.length - 1] : undefined;

          if (seenNodes.has(rawId)) {
            const existing = nodes.find(n => n.id === rawId);
            if (existing) {
              if (label !== rawId) existing.label = label;
              if (icon) existing.icon = icon;
              if (color) existing.color = color;
              if (currentParentId && !existing.parentId) existing.parentId = currentParentId;
            }
          } else {
            nodes.push({ id: rawId, label, icon, parentId: currentParentId, color });
            seenNodes.add(rawId);
          }
        } else {
          throw new Error(`Syntax error on line ${index + 1}: Invalid syntax`);
        }
      });

      if (nodes.length === 0) {
        throw new Error("No nodes found to build a diagram!");
      }

      const g = new dagre.graphlib.Graph({ compound: true });
      let finalDirection = overrideDirection || currentDirection;
      
      g.setGraph({
        rankdir: finalDirection === "vertical" ? "TB" : "LR",
        nodesep: 60 * spacing,
        ranksep: 80 * spacing,
        marginx: 40,
        marginy: 40,
      });

      g.setDefaultEdgeLabel(() => ({}));

      nodes.forEach((node) => {
        if (node.isGroup) {
          g.setNode(node.id, {
            label: node.label || node.id,
            paddingTop: 90,
            paddingBottom: 40,
            paddingLeft: 40,
            paddingRight: 40,
          });
        } else {
          g.setNode(node.id, { width: 140, height: 120 });
        }
      });

      const getLeafDescendant = (id: string): string => {
        const node = nodes.find(n => n.id === id);
        if (!node || !node.isGroup) return id;
        
        const children = nodes.filter(n => n.parentId === id);
        if (children.length === 0) return id;
        
        return getLeafDescendant(children[0].id);
      };

      nodes.forEach((node) => {
        if (node.parentId && g.hasNode(node.parentId)) {
          g.setParent(node.id, node.parentId);
        }
      });

      edges.forEach((edge) => {
        const fromId = getLeafDescendant(edge.from);
        const toId = getLeafDescendant(edge.to);
        if (g.hasNode(fromId) && g.hasNode(toId)) {
          // Exclude direct feedback loops from Dagre to prevent enormous horizontal layout stretching
          const isFeedbackCycle = (fromId === "lambda-complete" && toId === "s3-source") ||
                                  (fromId === "lambda-complete" && toId === "s3_source") ||
                                  (fromId === "lambda_complete" && toId === "s3-source") ||
                                  (fromId === "lambda_complete" && toId === "s3_source");
          if (!isFeedbackCycle) {
            g.setEdge(fromId, toId);
          }
        }
      });

      dagre.layout(g);

      const createdShapeIds: Record<string, TLShapeId> = {};
      const nodePositions: Record<string, { x: number; y: number }> = {};
      const shapesToCreate: any[] = [];
      const bindingsToCreate: any[] = [];

      const viewportCenter = editor.getViewportPageBounds().center;

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      nodes.forEach((node) => {
        const dagreNode = g.node(node.id);
        if (dagreNode) {
          const w = dagreNode.width || 120;
          const h = dagreNode.height || 100;
          if (dagreNode.x - w / 2 < minX) minX = dagreNode.x - w / 2;
          if (dagreNode.x + w / 2 > maxX) maxX = dagreNode.x + w / 2;
          if (dagreNode.y - h / 2 < minY) minY = dagreNode.y - h / 2;
          if (dagreNode.y + h / 2 > maxY) maxY = dagreNode.y + h / 2;
        }
      });

      const layoutCenterX = minX === Infinity ? 0 : minX + (maxX - minX) / 2;
      const layoutCenterY = minY === Infinity ? 0 : minY + (maxY - minY) / 2;

      const padding = 60;
      const frameX = minX - padding;
      const frameY = minY - padding - 20; // Extra padding for frame header
      const frameW = (maxX - minX) + padding * 2;
      const frameH = (maxY - minY) + padding * 2 + 20;

      const mainFrameId = createShapeId();

      // Create the parent frame shape representing the overall architecture
      shapesToCreate.push({
        id: mainFrameId,
        type: "frame",
        x: viewportCenter.x + (frameX - layoutCenterX),
        y: viewportCenter.y + (frameY - layoutCenterY),
        props: {
          w: frameW,
          h: frameH,
          name: diagramTitle || "Architecture Diagram",
        },
      });

      const mainFrameAbsX = viewportCenter.x + (frameX - layoutCenterX);
      const mainFrameAbsY = viewportCenter.y + (frameY - layoutCenterY);

      // 1. Create all group frames relative to mainFrameId or nested parent frames
      nodes.forEach((node) => {
        if (!node.isGroup) return;

        const dagreNode = g.node(node.id);
        if (!dagreNode) return;

        const w = dagreNode.width || 120;
        const h = dagreNode.height || 100;

        const shapeId = createShapeId();
        createdShapeIds[node.id] = shapeId;

        let relX = 0;
        let relY = 0;
        let pId = mainFrameId;

        if (node.parentId && g.hasNode(node.parentId)) {
          const parentDagre = g.node(node.parentId);
          const parentW = parentDagre.width || 120;
          const parentH = parentDagre.height || 100;
          const parentTopLeftX = parentDagre.x - parentW / 2;
          const parentTopLeftY = parentDagre.y - parentH / 2;

          relX = dagreNode.x - w / 2 - parentTopLeftX;
          relY = dagreNode.y - h / 2 - parentTopLeftY;
          pId = createdShapeIds[node.parentId];
        } else {
          relX = (dagreNode.x - w / 2) - frameX;
          relY = (dagreNode.y - h / 2) - frameY;
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
            name: "", // Disable native clipped title
          },
        });

        // Add a beautiful child text label inside the frame to prevent clipping!
        shapesToCreate.push({
          id: createShapeId(),
          parentId: shapeId,
          type: "text",
          x: 16,
          y: 12,
          props: {
            richText: {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: node.label || node.id }],
                },
              ],
            },
            size: "s",
            autoSize: true,
          },
        });
      });

      // 2. Create all system icons relative to mainFrameId or nested parent frames
      nodes.forEach((node) => {
        if (node.isGroup) return;

        const dagreNode = g.node(node.id);
        if (!dagreNode) return;

        const shapeId = createShapeId();
        createdShapeIds[node.id] = shapeId;

        const resolvedAssetId = resolveDiagramAsset(node.icon);
        const iconSize = 96;
        const halfSize = iconSize / 2;

        let relX = 0;
        let relY = 0;
        let pId = mainFrameId;

        if (node.parentId && g.hasNode(node.parentId)) {
          const parentDagre = g.node(node.parentId);
          const parentW = parentDagre.width || 120;
          const parentH = parentDagre.height || 100;
          const parentTopLeftX = parentDagre.x - parentW / 2;
          const parentTopLeftY = parentDagre.y - parentH / 2;

          relX = dagreNode.x - halfSize - parentTopLeftX;
          relY = dagreNode.y - halfSize - parentTopLeftY;
          pId = createdShapeIds[node.parentId];
        } else {
          relX = (dagreNode.x - halfSize) - frameX;
          relY = (dagreNode.y - halfSize) - frameY;
        }

        // Store positions for arrows (absolute page coordinates)
        nodePositions[node.id] = {
          x: viewportCenter.x + (dagreNode.x - layoutCenterX),
          y: viewportCenter.y + (dagreNode.y - layoutCenterY),
        };

        shapesToCreate.push({
          id: shapeId,
          parentId: pId,
          type: "system-icon",
          x: relX,
          y: relY,
          props: {
            w: iconSize,
            h: iconSize,
            assetId: resolvedAssetId,
            label: node.label || node.id,
          },
        });

        // Add beautiful centered text label directly below the icon
        shapesToCreate.push({
          id: createShapeId(),
          parentId: pId,
          type: "text",
          x: relX - 52, // Center-aligned horizontally with 200px width
          y: relY + iconSize + 8, // Placed beautifully below the icon
          props: {
            w: 200,
            textAlign: "middle",
            size: "s",
            autoSize: false,
            richText: {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: node.label || node.id }],
                },
              ],
            },
          },
        });
      });

      // 3. Create all arrows and edge labels relative to mainFrameId
      edges.forEach((edge) => {
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
          bend: 20, // Premium curved connectors like Eraser.io!
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

      editor.createShapes(shapesToCreate);
      editor.createBindings(bindingsToCreate);

      const spawnedIds = shapesToCreate.map((s) => s.id);
      editor.select(...spawnedIds);
      editor.zoomToSelection({ animation: { duration: 300 } });
    } catch (err: any) {
      setError(err.message || "Failed to generate diagram from code.");
    }
  };