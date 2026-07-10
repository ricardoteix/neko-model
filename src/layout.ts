import dagre from "dagre";
import {
  ChenAST,
  PositionedGraph,
  PositionedNode,
  PositionedEdge,
  LayoutOptions,
  Attribute,
  StyleOverride
} from "./types";

// Base interface for layout engines
export interface LayoutEngine {
  layout(ast: ChenAST, options: LayoutOptions): PositionedGraph;
}

// Default implementation: Dagre for core, Radial for attributes
export class DagreRadialLayoutEngine implements LayoutEngine {
  public layout(ast: ChenAST, options: LayoutOptions): PositionedGraph {
    const nodes = new Map<string, PositionedNode>();
    const edges: PositionedEdge[] = [];

    // 1. Initialize Dagre Graph for core elements (Entities, Relationships, Specializations)
    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: "TB",
      nodesep: 120,
      edgesep: 80,
      ranksep: 120
    });
    g.setDefaultEdgeLabel(() => ({}));

    // Add Entities to core layout
    for (const ent of ast.entities) {
      g.setNode(ent.id, { width: 140, height: 60 });
    }

    // Add Relationships to core layout
    for (const rel of ast.relationships) {
      g.setNode(rel.id, { width: 100, height: 100 });
    }

    // Add Specializations to core layout
    for (const spec of ast.specializations) {
      g.setNode(spec.id, { width: 50, height: 50 });
    }

    // Add Core Edges (Entities connected to Relationships, and Specialization connections)
    for (const conn of ast.connections) {
      g.setEdge(conn.from, conn.to);
    }

    for (const spec of ast.specializations) {
      g.setEdge(spec.superclass, spec.id);
      for (const sub of spec.subclasses) {
        g.setEdge(spec.id, sub);
      }
    }

    // Run Dagre Layout
    dagre.layout(g);

    // Retrieve computed coordinates for core nodes
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // Helper to register node bounding box
    const updateBounds = (x: number, y: number, w: number, h: number) => {
      minX = Math.min(minX, x - w / 2);
      minY = Math.min(minY, y - h / 2);
      maxX = Math.max(maxX, x + w / 2);
      maxY = Math.max(maxY, y + h / 2);
    };

    // Store Entities
    for (const ent of ast.entities) {
      const dNode = g.node(ent.id);
      const x = dNode.x;
      const y = dNode.y;
      nodes.set(ent.id, {
        id: ent.id,
        type: ent.isWeak ? "weak_entity" : "entity",
        x,
        y,
        width: 140,
        height: 60,
        label: ent.id,
        offset: ent.offset,
        style: ent.style
      });
      updateBounds(x, y, 140, 60);
    }

    // Store Relationships
    for (const rel of ast.relationships) {
      const dNode = g.node(rel.id);
      const x = dNode.x;
      const y = dNode.y;
      nodes.set(rel.id, {
        id: rel.id,
        type: rel.isIdentifying ? "identifying_relationship" : "relationship",
        x,
        y,
        width: 100,
        height: 100,
        label: rel.id,
        offset: rel.offset,
        style: rel.style
      });
      updateBounds(x, y, 100, 100);
    }

    // Store Specializations
    for (const spec of ast.specializations) {
      const dNode = g.node(spec.id);
      const x = dNode.x;
      const y = dNode.y;
      const label = spec.type === "disjoint" ? "d" : "o";
      nodes.set(spec.id, {
        id: spec.id,
        type: "specialization",
        x,
        y,
        width: 50,
        height: 50,
        label,
        offset: null,
        style: null,
        specializationType: spec.type,
        participation: spec.participation
      });
      updateBounds(x, y, 50, 50);
    }

    // Build Positioned Edges for core graph
    for (const conn of ast.connections) {
      const edgeData = g.edge(conn.from, conn.to);
      const fromNode = nodes.get(conn.from);
      const toNode = nodes.get(conn.to);

      if (fromNode && toNode) {
        // Fallback points: straight line between nodes if dagre did not provide points
        const points = edgeData?.points || [
          { x: fromNode.x, y: fromNode.y },
          { x: toNode.x, y: toNode.y }
        ];

        edges.push({
          from: conn.from,
          to: conn.to,
          points,
          cardinality: conn.cardinality,
          participation: conn.participation,
          role: conn.role,
          labelOffset: conn.labelOffset,
          style: conn.style
        });
      }
    }

    // Connect Specializations in Edges
    for (const spec of ast.specializations) {
      const superNode = nodes.get(spec.superclass);
      const specNode = nodes.get(spec.id);
      if (superNode && specNode) {
        edges.push({
          from: spec.superclass,
          to: spec.id,
          points: [
            { x: superNode.x, y: superNode.y },
            { x: specNode.x, y: specNode.y }
          ],
          cardinality: null,
          participation: spec.participation, // Can be total (double line) to specialization circle
          role: null,
          labelOffset: null,
          style: null
        });
      }

      for (const sub of spec.subclasses) {
        const subNode = nodes.get(sub);
        if (specNode && subNode) {
          edges.push({
            from: sub,
            to: spec.id,
            points: [
              { x: subNode.x, y: subNode.y },
              { x: specNode.x, y: specNode.y }
            ],
            cardinality: null,
            participation: "partial",
            role: null,
            labelOffset: null,
            style: null
          });
        }
      }
    }

    // 2. Radial Satellite Placement for Attributes
    const attributeRadius = options.attributeRadius || 90;
    
    // Helper to position attributes around a core node
    const placeAttributes = (parentId: string, attrs: Attribute[]) => {
      if (attrs.length === 0) return;

      const parentNode = nodes.get(parentId);
      if (!parentNode) return;

      // Helper to calculate the parent node's boundary distance at a given angle
      const getParentRadiusAtAngle = (node: PositionedNode, angle: number): number => {
        const cos = Math.abs(Math.cos(angle));
        const sin = Math.abs(Math.sin(angle));
        const rx = node.width / 2;
        const ry = node.height / 2;
        
        if (node.type === "relationship" || node.type === "identifying_relationship") {
          return 1 / ((cos / rx) + (sin / ry));
        }
        return Math.min(
          cos > 0.0001 ? rx / cos : Infinity,
          sin > 0.0001 ? ry / sin : Infinity
        );
      };

      // Find all connection angles relative to this parent center to determine blocked sectors
      const blockedAngles: number[] = [];
      
      // Check edges connected to this parent
      for (const edge of edges) {
        if (edge.from === parentId) {
          const target = nodes.get(edge.to);
          if (target) {
            blockedAngles.push(Math.atan2(target.y - parentNode.y, target.x - parentNode.x));
          }
        } else if (edge.to === parentId) {
          const source = nodes.get(edge.from);
          if (source) {
            blockedAngles.push(Math.atan2(source.y - parentNode.y, source.x - parentNode.x));
          }
        }
      }

      // Sort and normalize blocked angles to [0, 2*PI]
      const sortedAngles = blockedAngles
        .map((a) => (a < 0 ? a + 2 * Math.PI : a))
        .sort((a, b) => a - b);

      // Identify free angular sectors (gaps)
      const gaps: { start: number; end: number; size: number }[] = [];
      if (sortedAngles.length === 0) {
        // Full circle is free
        gaps.push({ start: 0, end: 2 * Math.PI, size: 2 * Math.PI });
      } else {
        for (let i = 0; i < sortedAngles.length; i++) {
          const start = sortedAngles[i];
          const end = i === sortedAngles.length - 1 ? sortedAngles[0] + 2 * Math.PI : sortedAngles[i + 1];
          const size = end - start;
          if (size > 0.05) {
            gaps.push({ start, end, size });
          }
        }
      }

      // Distribute attributes among gaps proportionally to gap size
      const totalGapSize = gaps.reduce((sum, g) => sum + g.size, 0);
      const allocatedCounts = gaps.map((gap) => {
        return Math.max(0, Math.floor((attrs.length * gap.size) / totalGapSize));
      });

      // Adjust allocation counts to ensure sum === attrs.length
      let allocatedSum = allocatedCounts.reduce((a, b) => a + b, 0);
      while (allocatedSum < attrs.length) {
        // Find gap with largest remaining size fraction and add 1
        let maxIdx = -1;
        let maxSize = -1;
        for (let i = 0; i < gaps.length; i++) {
          if (gaps[i].size > maxSize) {
            maxSize = gaps[i].size;
            maxIdx = i;
          }
        }
        if (maxIdx !== -1) {
          allocatedCounts[maxIdx]++;
          allocatedSum++;
        }
      }

      // Place attributes in their allocated gaps
      let attrIdx = 0;
      const spacingMode = options.attribute_layout || ast.config.attribute_layout || "default";

      for (let i = 0; i < gaps.length; i++) {
        const gap = gaps[i];
        const count = allocatedCounts[i];
        if (count === 0) continue;

        const gapAttrs = attrs.slice(attrIdx, attrIdx + count);
        attrIdx += count;

        // Partition into layers based on spacing mode
        const layers: { r: number; attrs: Attribute[] }[] = [];
        if (spacingMode === "classic") {
          const maxPerOrbit = 3;
          const numLayers = Math.ceil(gapAttrs.length / maxPerOrbit);
          for (let L = 0; L < numLayers; L++) {
            const slice = gapAttrs.slice(L * maxPerOrbit, (L + 1) * maxPerOrbit);
            layers.push({ r: attributeRadius + L * 35, attrs: slice });
          }
        } else {
          // default and zigzag use dynamic capacity
          let currentLayer: Attribute[] = [];
          let L = 0;
          let r = (parentNode.width / 2 + parentNode.height / 2) / 2 + 50;
          let idx = 0;
          while (idx < gapAttrs.length) {
            const capacity = Math.max(1, Math.floor((r * gap.size) / 85));
            if (currentLayer.length < capacity) {
              currentLayer.push(gapAttrs[idx]);
              idx++;
            } else {
              layers.push({ r, attrs: currentLayer });
              currentLayer = [];
              L++;
              r = attributeRadius + L * 35;
            }
          }
          if (currentLayer.length > 0) {
            layers.push({ r, attrs: currentLayer });
          }
        }

        // Project and position attributes inside each layer
        for (let L = 0; L < layers.length; L++) {
          const layer = layers[L];
          const layerCount = layer.attrs.length;
          let currentRadius = layer.r;

          for (let j = 0; j < layerCount; j++) {
            const attr = layer.attrs[j];
            
            // Calculate target angle inside the gap
            let angle = 0;
            const isFullCircle = gap.size > 6.2;
            if (spacingMode !== "classic" && isFullCircle) {
              if (sortedAngles.length === 1) {
                angle = gap.start + (2 * Math.PI * (j + 0.5)) / layerCount;
              } else {
                angle = gap.start + (2 * Math.PI * j) / layerCount;
              }
            } else {
              const margin = layerCount === 1 ? 0.0 : 0.25;
              const usableSize = gap.size - 2 * margin;
              angle = layerCount === 1 
                ? gap.start + gap.size / 2
                : gap.start + margin + (usableSize * j) / (layerCount - 1);
            }

            // Save Positioned Attribute with dynamic width to compute base radius
            const attrWidth = Math.max(80, attr.id.length * 8 + 15);

            let finalRadius = currentRadius;
            if (spacingMode !== "classic") {
              // Calculate dynamic base radius clear of parent borders
              const parentBorderDist = getParentRadiusAtAngle(parentNode, angle);
              const dynamicBaseRadius = parentBorderDist + attrWidth / 2 + 10;
              finalRadius = dynamicBaseRadius + L * 35;

              if (spacingMode === "zigzag") {
                const zigzagOffset = (j % 2 === 0) ? 0 : 25;
                finalRadius += zigzagOffset;
              }
            }

            // Attribute position relative to parent center
            const ax = parentNode.x + finalRadius * Math.cos(angle);
            const ay = parentNode.y + finalRadius * Math.sin(angle);

            const attrId = `${parentId}_attr_${attr.id}`;
            const attrType = attr.isKey 
              ? "key" 
              : attr.isWeakKey 
              ? "weak_key" 
              : attr.isMultivalued 
              ? "multivalued" 
              : attr.isDerived 
              ? "derived" 
              : "regular";

            // Save Positioned Attribute with dynamic width
            nodes.set(attrId, {
              id: attrId,
              type: "attribute",
              x: ax,
              y: ay,
              width: attrWidth,
              height: 40,
              label: attr.id,
              parent: parentId,
              attributeType: attrType,
              offset: attr.offset,
              style: attr.style
            });
            updateBounds(ax, ay, attrWidth, 40);

            // Add Edge from parent to attribute
            edges.push({
              from: parentId,
              to: attrId,
              points: [
                { x: parentNode.x, y: parentNode.y },
                { x: ax, y: ay }
              ],
              cardinality: null,
              participation: "partial",
              role: null,
              labelOffset: null,
              style: null
            });

            // Handle composite children
            if (attr.isComposite && attr.children.length > 0) {
              // Position child attributes in a larger sub-radial fan out from parent attribute
              const childRadius = 80;
              // Fan centered away from parent entity
              const parentAngle = angle; 
              const startAngle = parentAngle - Math.PI * 0.35;
              const sizeAngle = Math.PI * 0.7;

              for (let c = 0; c < attr.children.length; c++) {
                const child = attr.children[c];
                const childAngle = attr.children.length === 1
                  ? parentAngle
                  : startAngle + (sizeAngle * c) / (attr.children.length - 1);

                const cx = ax + childRadius * Math.cos(childAngle);
                const cy = ay + childRadius * Math.sin(childAngle);
                const childId = `${attrId}_child_${child.id}`;

                const childWidth = Math.max(75, child.id.length * 7.5 + 15);
                nodes.set(childId, {
                  id: childId,
                  type: "attribute",
                  x: cx,
                  y: cy,
                  width: childWidth,
                  height: 35,
                  label: child.id,
                  parent: attrId,
                  attributeType: "regular",
                  offset: child.offset,
                  style: child.style
                });
                updateBounds(cx, cy, childWidth, 35);

                edges.push({
                  from: attrId,
                  to: childId,
                  points: [
                    { x: ax, y: ay },
                    { x: cx, y: cy }
                  ],
                  cardinality: null,
                  participation: "partial",
                  role: null,
                  labelOffset: null,
                  style: null
                });
              }
            }
          }
        }
      }
    };

    // Position attributes for each entity
    for (const ent of ast.entities) {
      placeAttributes(ent.id, ent.attributes);
    }

    // Position attributes for each relationship
    for (const rel of ast.relationships) {
      placeAttributes(rel.id, rel.attributes);
    }

    // Apply offset metadata translations (post-processing)
    for (const node of nodes.values()) {
      if (node.offset) {
        node.x += node.offset[0];
        node.y += node.offset[1];
        // Re-evaluate bounding boxes with offsets
        updateBounds(node.x, node.y, node.width, node.height);
      }
    }

    // Recalibrate edge start/end points using final offset-adjusted node coordinates
    for (const edge of edges) {
      const fromNode = nodes.get(edge.from);
      const toNode = nodes.get(edge.to);
      if (fromNode && toNode) {
        edge.points = [
          { x: fromNode.x, y: fromNode.y },
          { x: toNode.x, y: toNode.y }
        ];
      }
    }

    // Normalize all coordinates so they fit snugly in a positive viewport
    const padding = 60;
    const offsetX = minX === Infinity ? 0 : -minX + padding;
    const offsetY = minY === Infinity ? 0 : -minY + padding;
    const width = minX === Infinity ? 800 : maxX - minX + 2 * padding;
    const height = minY === Infinity ? 600 : maxY - minY + 2 * padding;

    // Shift nodes
    for (const node of nodes.values()) {
      node.x += offsetX;
      node.y += offsetY;
    }

    // Shift edge points
    for (const edge of edges) {
      for (const p of edge.points) {
        p.x += offsetX;
        p.y += offsetY;
      }
    }

    return {
      width,
      height,
      nodes,
      edges
    };
  }
}

// Pluggable Layout selection wrapper
export function layoutDiagram(ast: ChenAST, options: LayoutOptions = {}): PositionedGraph {
  const engineName = options.layout || ast.config.layout || "default";

  let engine: LayoutEngine;
  if (engineName === "default") {
    engine = new DagreRadialLayoutEngine();
  } else {
    // If user requests a different layout type (like force), we default to DagreRadial but log warning or fall back.
    // In the future, this allows registering new LayoutEngine subclasses dynamically.
    engine = new DagreRadialLayoutEngine();
  }

  return engine.layout(ast, options);
}
