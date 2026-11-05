import { PositionedGraph, PositionedNode, PositionedEdge, RenderOptions, StyleOverride } from "./types";

// Themes definitions
const THEMES: Record<string, string> = {
  default: `
    :root {
      --chen-bg: #ffffff;
      --chen-entity-fill: #e3f2fd;
      --chen-entity-stroke: #1e88e5;
      --chen-entity-text: #0d47a1;
      --chen-weak-entity-fill: #e3f2fd;
      --chen-weak-entity-stroke: #1e88e5;
      --chen-relationship-fill: #fff3e0;
      --chen-relationship-stroke: #fb8c00;
      --chen-relationship-text: #e65100;
      --chen-ident-relationship-fill: #fff3e0;
      --chen-ident-relationship-stroke: #fb8c00;
      --chen-attribute-fill: #f1f8e9;
      --chen-attribute-stroke: #7cb342;
      --chen-attribute-key-fill: #c5e1a5;
      --chen-attribute-text: #33691e;
      --chen-line: #37474f;
      --chen-line-text: #263238;
      --chen-spec-fill: #ffffff;
      --chen-spec-stroke: #37474f;
      --chen-spec-text: #263238;
    }
  `,
  dark: `
    :root {
      --chen-bg: #121212;
      --chen-entity-fill: #1e1e1e;
      --chen-entity-stroke: #FF5A43;
      --chen-entity-text: #e0f7fa;
      --chen-weak-entity-fill: #1e1e1e;
      --chen-weak-entity-stroke: #FF5A43;
      --chen-relationship-fill: #1e1e1e;
      --chen-relationship-stroke: #ffa090;
      --chen-relationship-text: #fce4ec;
      --chen-ident-relationship-fill: #1e1e1e;
      --chen-ident-relationship-stroke: #ffa090;
      --chen-attribute-fill: #1e1e1e;
      --chen-attribute-stroke: #b388ff;
      --chen-attribute-key-fill: #7c4dff;
      --chen-attribute-text: #f3e5f5;
      --chen-line: #90a4ae;
      --chen-line-text: #cfd8dc;
      --chen-spec-fill: #1e1e1e;
      --chen-spec-stroke: #FF5A43;
      --chen-spec-text: #cfd8dc;
    }
  `,
  forest: `
    :root {
      --chen-bg: #f4f6f0;
      --chen-entity-fill: #e8f5e9;
      --chen-entity-stroke: #2e7d32;
      --chen-entity-text: #1b5e20;
      --chen-weak-entity-fill: #e8f5e9;
      --chen-weak-entity-stroke: #2e7d32;
      --chen-relationship-fill: #efebe9;
      --chen-relationship-stroke: #6d4c41;
      --chen-relationship-text: #3e2723;
      --chen-ident-relationship-fill: #efebe9;
      --chen-ident-relationship-stroke: #6d4c41;
      --chen-attribute-fill: #fcfbe3;
      --chen-attribute-stroke: #fbc02d;
      --chen-attribute-key-fill: #f0e68c;
      --chen-attribute-text: #f57f17;
      --chen-line: #4e342e;
      --chen-line-text: #3e2723;
      --chen-spec-fill: #f4f6f0;
      --chen-spec-stroke: #4e342e;
      --chen-spec-text: #3e2723;
    }
  `,
  neutral: `
    :root {
      --chen-bg: #ffffff;
      --chen-entity-fill: #ffffff;
      --chen-entity-stroke: #000000;
      --chen-entity-text: #000000;
      --chen-weak-entity-fill: #ffffff;
      --chen-weak-entity-stroke: #000000;
      --chen-relationship-fill: #ffffff;
      --chen-relationship-stroke: #000000;
      --chen-relationship-text: #000000;
      --chen-ident-relationship-fill: #ffffff;
      --chen-ident-relationship-stroke: #000000;
      --chen-attribute-fill: #ffffff;
      --chen-attribute-stroke: #000000;
      --chen-attribute-key-fill: #e0e0e0;
      --chen-attribute-text: #000000;
      --chen-line: #000000;
      --chen-line-text: #000000;
      --chen-spec-fill: #ffffff;
      --chen-spec-stroke: #000000;
      --chen-spec-text: #000000;
    }
  `
};

const BASE_STYLES = `
  svg.chen-er-diagram {
    background-color: var(--chen-bg);
    font-family: 'Outfit', 'Inter', 'Segoe UI', Roboto, sans-serif;
  }
  .chen-text {
    font-size: 13px;
    font-weight: 500;
    text-anchor: middle;
    dominant-baseline: middle;
    user-select: none;
  }
  .chen-entity {
    fill: var(--chen-entity-fill);
    stroke: var(--chen-entity-stroke);
    stroke-width: 2px;
  }
  .chen-entity-text {
    fill: var(--chen-entity-text);
    font-weight: 600;
  }
  .chen-weak-entity-outer {
    fill: var(--chen-weak-entity-fill);
    stroke: var(--chen-weak-entity-stroke);
    stroke-width: 2px;
  }
  .chen-weak-entity-inner {
    fill: none;
    stroke: var(--chen-weak-entity-stroke);
    stroke-width: 1.5px;
  }
  .chen-relationship {
    fill: var(--chen-relationship-fill);
    stroke: var(--chen-relationship-stroke);
    stroke-width: 2px;
  }
  .chen-relationship-text {
    fill: var(--chen-relationship-text);
    font-weight: 600;
  }
  .chen-ident-relationship-outer {
    fill: var(--chen-ident-relationship-fill);
    stroke: var(--chen-ident-relationship-stroke);
    stroke-width: 2px;
  }
  .chen-ident-relationship-inner {
    fill: none;
    stroke: var(--chen-ident-relationship-stroke);
    stroke-width: 1.5px;
  }
  .chen-attribute {
    fill: var(--chen-attribute-fill);
    stroke: var(--chen-attribute-stroke);
    stroke-width: 1.5px;
  }
  .chen-attribute-key {
    fill: var(--chen-attribute-key-fill);
    stroke: var(--chen-attribute-stroke);
    stroke-width: 1.8px;
  }
  .chen-attribute-text {
    fill: var(--chen-attribute-text);
  }
  .chen-attribute-key-text {
    fill: var(--chen-attribute-text);
    font-weight: 700;
  }
  .chen-attribute-dashed-ellipse {
    fill: var(--chen-attribute-fill);
    stroke: var(--chen-attribute-stroke);
    stroke-width: 1.5px;
    stroke-dasharray: 4,3;
  }
  .chen-attribute-double-outer {
    fill: var(--chen-attribute-fill);
    stroke: var(--chen-attribute-stroke);
    stroke-width: 1.5px;
  }
  .chen-attribute-double-inner {
    fill: none;
    stroke: var(--chen-attribute-stroke);
    stroke-width: 1px;
  }
  .chen-line {
    stroke: var(--chen-line);
    stroke-width: 1.5px;
    fill: none;
  }
  .chen-line-text {
    fill: var(--chen-line-text);
    font-size: 11px;
    font-weight: 600;
  }
  .chen-spec-triangle {
    fill: var(--chen-spec-fill);
    stroke: var(--chen-spec-stroke);
    stroke-width: 2px;
  }
  .chen-spec-text {
    fill: var(--chen-spec-text);
    font-size: 14px;
    font-weight: bold;
  }

  /* Interactive Mode Styles */
  .node-group.interactive {
    cursor: grab;
  }
  .node-group.interactive:active {
    cursor: grabbing;
  }
  .node-group.interactive.selected .chen-entity,
  .node-group.interactive.selected .chen-weak-entity-outer,
  .node-group.interactive.selected .chen-relationship,
  .node-group.interactive.selected .chen-ident-relationship-outer,
  .node-group.interactive.selected .chen-spec-triangle,
  .node-group.interactive.selected .chen-attribute,
  .node-group.interactive.selected .chen-attribute-key,
  .node-group.interactive.selected .chen-attribute-double-outer,
  .node-group.interactive.selected .chen-attribute-dashed-ellipse {
    stroke: #FF5A43 !important;
    stroke-width: 3px !important;
  }
  .node-group.interactive .conn-port {
    fill: #ffffff;
    stroke: #FF5A43;
    stroke-width: 1.5px;
    opacity: 0;
    transition: opacity 0.15s ease;
    cursor: crosshair;
  }
  .node-group.interactive:hover .conn-port,
  .node-group.interactive .conn-port:hover {
    opacity: 0.8;
  }
`;

// Helper to construct custom element style overrides
function getCustomStyle(override: StyleOverride | null, defaultClass: string): string {
  if (!override) return "";
  let styles = "";
  if (override.fill) styles += `fill: ${override.fill};`;
  if (override.stroke) styles += `stroke: ${override.stroke};`;
  if (override.text) styles += `color: ${override.text};`; // color mapped to text class via style
  return styles ? `style="${styles}"` : "";
}

// Helper to get text color override
function getTextStyleOverride(override: StyleOverride | null): string {
  if (override && override.text) {
    return `style="fill: ${override.text};"`;
  }
  return "";
}

export function renderSVG(graph: PositionedGraph, options: RenderOptions = {}): string {
  const themeName = options.theme || "default";
  const themeCSS = THEMES[themeName] || THEMES.default;

  const minX = graph.minX ?? 0;
  const minY = graph.minY ?? 0;
  let output = `<svg class="chen-er-diagram" xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${graph.width} ${graph.height}" width="100%" height="100%">\n`;
  
  // Inject stylesheets
  output += `  <style>\n${themeCSS}\n${BASE_STYLES}\n  </style>\n\n`;

  // Inject defs and arrowhead markers
  output += `  <defs>\n`;
  output += `    <marker id="chen-arrow" viewBox="0 0 10 10" refX="42" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">\n`;
    output += `      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--chen-line)" />\n`;
  output += `    </marker>\n`;
  output += `  </defs>\n\n`;

  // Draw connection edges first so they lay behind node boxes
  for (const edge of graph.edges) {
    output += drawEdge(edge, graph.nodes);
  }

  // Draw node shapes
  for (const node of graph.nodes.values()) {
    output += drawNode(node, options.interactive || false);
  }

  output += `</svg>`;
  return output;
}

function drawInteractivePorts(node: PositionedNode, interactive: boolean): string {
  if (!interactive || node.type === "attribute") return "";
  const x = node.x;
  const y = node.y;
  const w = node.width;
  const h = node.height;
  return `    <circle cx="${x}" cy="${y - h / 2}" r="6" class="conn-port port-top" data-port="top" />
    <circle cx="${x + w / 2}" cy="${y}" r="6" class="conn-port port-right" data-port="right" />
    <circle cx="${x}" cy="${y + h / 2}" r="6" class="conn-port port-bottom" data-port="bottom" />
    <circle cx="${x - w / 2}" cy="${y}" r="6" class="conn-port port-left" data-port="left" />\n`;
}

function drawNode(node: PositionedNode, interactive: boolean = false): string {
  const x = node.x;
  const y = node.y;
  const w = node.width;
  const h = node.height;
  const label = node.label;
  const styleAttr = getCustomStyle(node.style, "");
  const textStyleAttr = getTextStyleOverride(node.style);

  const gAttr = `class="node-group${interactive ? " interactive" : ""}" data-id="${node.id}" data-type="${node.type}"`;
  const ports = drawInteractivePorts(node, interactive);

  switch (node.type) {
    case "entity":
      return `  <g id="node_${node.id}" ${gAttr}>
    <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="3" class="chen-entity" ${styleAttr} />
    <text x="${x}" y="${y}" class="chen-text chen-entity-text" ${textStyleAttr}>${label}</text>
    ${ports}  </g>\n`;
  
    case "weak_entity":
      return `  <g id="node_${node.id}" ${gAttr}>
    <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="3" class="chen-weak-entity-outer" ${styleAttr} />
    <rect x="${x - w / 2 + 4}" y="${y - h / 2 + 4}" width="${w - 8}" height="${h - 8}" rx="2" class="chen-weak-entity-inner" ${styleAttr} />
    <text x="${x}" y="${y}" class="chen-text chen-entity-text" ${textStyleAttr}>${label}</text>
    ${ports}  </g>\n`;
  
    case "relationship":
      const pStr = `${x},${y - h / 2}  ${x + w / 2},${y}  ${x},${y + h / 2}  ${x - w / 2},${y}`;
      return `  <g id="node_${node.id}" ${gAttr}>
    <polygon points="${pStr}" class="chen-relationship" ${styleAttr} />
    <text x="${x}" y="${y}" class="chen-text chen-relationship-text" ${textStyleAttr}>${label}</text>
    ${ports}  </g>\n`;
  
    case "identifying_relationship":
      const outerP = `${x},${y - h / 2}  ${x + w / 2},${y}  ${x},${y + h / 2}  ${x - w / 2},${y}`;
      const innerP = `${x},${y - h / 2 + 6}  ${x + w / 2 - 6},${y}  ${x},${y + h / 2 - 6}  ${x - w / 2 + 6},${y}`;
      return `  <g id="node_${node.id}" ${gAttr}>
    <polygon points="${outerP}" class="chen-ident-relationship-outer" ${styleAttr} />
    <polygon points="${innerP}" class="chen-ident-relationship-inner" ${styleAttr} />
    <text x="${x}" y="${y}" class="chen-text chen-relationship-text" ${textStyleAttr}>${label}</text>
    ${ports}  </g>\n`;
  
    case "specialization":
      const triPoints = `${x},${y - h / 2}  ${x + w / 2},${y + h / 2}  ${x - w / 2},${y + h / 2}`;
      const p = node.participation === "total" ? "t" : "p";
      const s = node.specializationType === "overlapping" ? "o" : "d";
      const shorthand = `(${p}, ${s})`;
      return `  <g id="node_${node.id}" ${gAttr}>
    <polygon points="${triPoints}" class="chen-spec-triangle" />
    <text x="${x}" y="${y + 13}" class="chen-text chen-spec-text">${shorthand}</text>
    ${ports}  </g>\n`;
  
    case "attribute":
      const rx = w / 2;
      const ry = h / 2;
      const tStyle = node.style?.text ? `style="fill: ${node.style.text};"` : "";
  
      if (node.attributeType === "key") {
        return `  <g id="node_${node.id}" ${gAttr}>
    <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" class="chen-attribute-key" ${styleAttr} />
    <text x="${x}" y="${y}" class="chen-text chen-attribute-key-text" ${textStyleAttr}>${label}</text>
    ${ports}  </g>\n`;
      } else if (node.attributeType === "weak_key") {
        // SVG text-decoration does not support dashed underlines easily.
        // We draw an ellipse and standard text, then add a manual dashed line below the text.
        const fontSize = 13;
        const approxWidth = label.length * fontSize * 0.55;
        const ly = y + fontSize / 2 + 1;
        const lx1 = x - approxWidth / 2;
        const lx2 = x + approxWidth / 2;
        const strokeColor = node.style?.text || "var(--chen-attribute-text)";
  
        return `  <g id="node_${node.id}" ${gAttr}>
    <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" class="chen-attribute" ${styleAttr} />
    <text x="${x}" y="${y}" class="chen-text chen-attribute-text" ${textStyleAttr}>${label}</text>
    <line x1="${lx1}" y1="${ly}" x2="${lx2}" y2="${ly}" stroke="${strokeColor}" stroke-width="1.5" stroke-dasharray="3,2" />
    ${ports}  </g>\n`;
      } else if (node.attributeType === "derived") {
        return `  <g id="node_${node.id}" ${gAttr}>
    <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" class="chen-attribute-dashed-ellipse" ${styleAttr} />
    <text x="${x}" y="${y}" class="chen-text chen-attribute-text" ${textStyleAttr}>${label}</text>
    ${ports}  </g>\n`;
      } else if (node.attributeType === "multivalued") {
        return `  <g id="node_${node.id}" ${gAttr}>
    <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" class="chen-attribute-double-outer" ${styleAttr} />
    <ellipse cx="${x}" cy="${y}" rx="${rx - 4}" ry="${ry - 4}" class="chen-attribute-double-inner" ${styleAttr} />
    <text x="${x}" y="${y}" class="chen-text chen-attribute-text" ${textStyleAttr}>${label}</text>
    ${ports}  </g>\n`;
      } else {
        // Regular Attribute
        return `  <g id="node_${node.id}" ${gAttr}>
    <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" class="chen-attribute" ${styleAttr} />
    <text x="${x}" y="${y}" class="chen-text chen-attribute-text" ${textStyleAttr}>${label}</text>
    ${ports}  </g>\n`;
      }

    default:
      return "";
  }
}

function drawEdge(edge: PositionedEdge, nodes: Map<string, PositionedNode>): string {
  const p1 = edge.points[0];
  const p2 = edge.points[edge.points.length - 1];
  
  const isDouble = edge.participation === "total";
  
  let lineStrokeOverride = "";
  if (edge.style && edge.style.stroke) {
    lineStrokeOverride = `style="stroke: ${edge.style.stroke};"`;
  }

  // Draw arrow markers for connections to specialization triangles
  const toNode = nodes.get(edge.to);
  const isToSpec = toNode && toNode.type === "specialization";
  const markerAttr = isToSpec ? `marker-end="url(#chen-arrow)"` : "";

  let linesStr = "";

  if (!isDouble) {
    linesStr = `    <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" class="chen-line" ${markerAttr} ${lineStrokeOverride} />`;
  } else {
    // Total participation: render parallel lines offset by normal vector
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    if (len > 0) {
      const nx = -dy / len;
      const ny = dx / len;
      const offset = 2.5; // space between double lines
      
      const lx1 = p1.x + nx * offset;
      const ly1 = p1.y + ny * offset;
      const lx2 = p2.x + nx * offset;
      const ly2 = p2.y + ny * offset;
      
      const rx1 = p1.x - nx * offset;
      const ry1 = p1.y - ny * offset;
      const rx2 = p2.x - nx * offset;
      const ry2 = p2.y - ny * offset;
      
      linesStr = `    <line x1="${lx1}" y1="${ly1}" x2="${lx2}" y2="${ly2}" class="chen-line" ${markerAttr} ${lineStrokeOverride} />
    <line x1="${rx1}" y1="${ry1}" x2="${rx2}" y2="${ry2}" class="chen-line" ${markerAttr} ${lineStrokeOverride} />`;
    } else {
      linesStr = `    <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" class="chen-line" ${markerAttr} ${lineStrokeOverride} />`;
    }
  }

  // Draw Cardinality/Role Label if present
  let labelStr = "";
  const displayLabel = edge.cardinality || edge.role;
  if (displayLabel) {
    // Find midpoint
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    
    // Perpendicular vector for text label placement offset
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    let lx = mx;
    let ly = my;

    if (len > 0) {
      const nx = -dy / len;
      const ny = dx / len;
      const push = 12; // distance to push label from connection line
      lx += nx * push;
      ly += ny * push;
    }

    // Apply manual label offsets
    if (edge.labelOffset) {
      lx += edge.labelOffset[0];
      ly += edge.labelOffset[1];
    }

    labelStr = `\n    <text x="${lx}" y="${ly}" class="chen-text chen-line-text">${displayLabel}</text>`;
  }

  return `  <g id="edge_${edge.from}_to_${edge.to}" class="edge-group" data-from="${edge.from}" data-to="${edge.to}">
${linesStr}${labelStr}
  </g>\n`;
}
