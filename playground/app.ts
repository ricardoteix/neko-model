import { render, parseDSL, stringifyAST, layoutDiagram } from "../src/index";
import { StyleOverride, Attribute } from "../src/types";
import { initLanguage, getLanguage, setLanguage, getTranslation, DEFAULT_DIAGRAM_PT, DEFAULT_DIAGRAM_EN } from "./i18n";
import { EditorView, basicSetup } from "codemirror";
import { Compartment } from "@codemirror/state";
import { getNekoEditorExtensions } from "./neko-lang";

document.addEventListener("DOMContentLoaded", () => {
  const langSelect = document.getElementById("lang-select") as HTMLSelectElement;
  const editorContainer = document.getElementById("dsl-editor") as HTMLDivElement;
  const preview = document.getElementById("canvas-preview") as HTMLDivElement;
  const themeSelect = document.getElementById("theme-select") as HTMLSelectElement;
  const spacingSelect = document.getElementById("spacing-select") as HTMLSelectElement;
  const btnCopy = document.getElementById("btn-copy") as HTMLButtonElement;
  const btnOpenNkm = document.getElementById("btn-open-nkm") as HTMLButtonElement;
  const inputOpenNkm = document.getElementById("input-open-nkm") as HTMLInputElement;
  const btnExportNkm = document.getElementById("btn-export-nkm") as HTMLButtonElement;
  const btnExportImg = document.getElementById("btn-export-img") as HTMLButtonElement;
  const exportDropdownMenu = document.getElementById("export-dropdown-menu") as HTMLDivElement;
  const btnExportSvg = document.getElementById("btn-export-svg") as HTMLButtonElement;
  const btnExportPng = document.getElementById("btn-export-png") as HTMLButtonElement;
  
  const btnZoomIn = document.getElementById("btn-zoom-in") as HTMLButtonElement;
  const btnZoomOut = document.getElementById("btn-zoom-out") as HTMLButtonElement;
  const btnZoomReset = document.getElementById("btn-zoom-reset") as HTMLButtonElement;
  
  const btnAlignH = document.getElementById("btn-align-h") as HTMLButtonElement;
  const btnAlignV = document.getElementById("btn-align-v") as HTMLButtonElement;
  
  const btnUndo = document.getElementById("btn-undo") as HTMLButtonElement;
  const btnRedo = document.getElementById("btn-redo") as HTMLButtonElement;
  const chkSnap = document.getElementById("chk-snap") as HTMLInputElement;
  const selectSnapSize = document.getElementById("select-snap-size") as HTMLSelectElement;
  
  const btnToggleEditor = document.getElementById("btn-toggle-editor") as HTMLButtonElement;
  const editorPanel = document.getElementById("editor-panel") as HTMLElement;
  const inspectorContent = document.getElementById("inspector-content") as HTMLDivElement;
  const errorFooter = document.getElementById("error-footer") as HTMLElement;
  const btnCloseError = document.getElementById("btn-close-error") as HTMLButtonElement;
  const errorMessage = document.getElementById("error-message") as HTMLElement;

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const themeCompartment = new Compartment();
  const isDarkInit = document.body.classList.contains("dark") || themeSelect?.value === "dark";

  const cmEditor = new EditorView({
    parent: editorContainer,
    extensions: [
      basicSetup,
      themeCompartment.of(getNekoEditorExtensions(isDarkInit)),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(compileDiagram, 250);
        }
      })
    ]
  });

  const editor = {
    get value(): string {
      return cmEditor.state.doc.toString();
    },
    set value(newVal: string) {
      if (cmEditor.state.doc.toString() === newVal) return;
      cmEditor.dispatch({
        changes: { from: 0, to: cmEditor.state.doc.length, insert: newVal }
      });
    }
  };
  
  // Viewport Transform State (Panning and Zooming)
  let currentZoom = 1.0;
  let panX = 0;
  let panY = 0;
  let isPanning = false;
  let panStartX = 0;
  let panStartY = 0;
  let isSpacePressed = false;

  // Undo/Redo Stacks
  const undoStack: string[] = [];
  const redoStack: string[] = [];

  // Visual Editor State
  let activeTool = "select";
  let selectedId: string | null = null;
  let selectedType: string | null = null;
  const selectedIds = new Set<string>();
  let selectedEdge: { from: string; to: string } | null = null;
  let parsedAST: any = null;

  function findAttributeByNodeId(nodeId: string): { 
    attr: Attribute; 
    parentEntityOrRel: any; 
    parentAttr?: Attribute;
    parentNodeId: string; 
  } | null {
    if (!parsedAST) return null;
    for (const ent of parsedAST.entities) {
      for (const attr of ent.attributes) {
        const fullId = `${ent.id}_attr_${attr.id}`;
        if (nodeId === fullId || nodeId === attr.id) {
          return { attr, parentEntityOrRel: ent, parentNodeId: ent.id };
        }
        if (attr.children) {
          for (const child of attr.children) {
            const childFullId = `${fullId}_child_${child.id}`;
            if (nodeId === childFullId || nodeId === child.id) {
              return { attr: child, parentEntityOrRel: ent, parentAttr: attr, parentNodeId: fullId };
            }
          }
        }
      }
    }
    for (const rel of parsedAST.relationships) {
      for (const attr of rel.attributes) {
        const fullId = `${rel.id}_attr_${attr.id}`;
        if (nodeId === fullId || nodeId === attr.id) {
          return { attr, parentEntityOrRel: rel, parentNodeId: rel.id };
        }
        if (attr.children) {
          for (const child of attr.children) {
            const childFullId = `${fullId}_child_${child.id}`;
            if (nodeId === childFullId || nodeId === child.id) {
              return { attr: child, parentEntityOrRel: rel, parentAttr: attr, parentNodeId: fullId };
            }
          }
        }
      }
    }
    return null;
  }

  // Collect all descendant attribute IDs for any parent nodes in rootIds
  function getDescendantAttributeIds(rootIds: Set<string>): Set<string> {
    const descendants = new Set<string>();
    if (!parsedAST) return descendants;

    function addAttrDescendants(prefixId: string, attr: any) {
      const fullAttrId = `${prefixId}_attr_${attr.id}`;
      descendants.add(fullAttrId);
      if (attr.children && Array.isArray(attr.children)) {
        for (const child of attr.children) {
          descendants.add(`${fullAttrId}_child_${child.id}`);
        }
      }
    }

    for (const ent of parsedAST.entities || []) {
      if (rootIds.has(ent.id)) {
        for (const attr of ent.attributes || []) {
          addAttrDescendants(ent.id, attr);
        }
      } else {
        for (const attr of ent.attributes || []) {
          const fullAttrId = `${ent.id}_attr_${attr.id}`;
          if (rootIds.has(fullAttrId) || rootIds.has(attr.id)) {
            if (attr.children && Array.isArray(attr.children)) {
              for (const child of attr.children) {
                descendants.add(`${fullAttrId}_child_${child.id}`);
              }
            }
          }
        }
      }
    }

    for (const rel of parsedAST.relationships || []) {
      if (rootIds.has(rel.id)) {
        for (const attr of rel.attributes || []) {
          addAttrDescendants(rel.id, attr);
        }
      } else {
        for (const attr of rel.attributes || []) {
          const fullAttrId = `${rel.id}_attr_${attr.id}`;
          if (rootIds.has(fullAttrId) || rootIds.has(attr.id)) {
            if (attr.children && Array.isArray(attr.children)) {
              for (const child of attr.children) {
                descendants.add(`${fullAttrId}_child_${child.id}`);
              }
            }
          }
        }
      }
    }

    return descendants;
  }

  // Marquee Selection State
  let isMarquee = false;
  let marqueeStartPt = { x: 0, y: 0 };
  let marqueeRectEl: SVGRectElement | null = null;
  let marqueeInitialSelectedIds = new Set<string>();

  // Multi-drag State
  interface DraggedNodeInfo {
    id: string;
    group: SVGGElement;
    initialX: number;
    initialY: number;
    type: string;
    parent?: string;
    initialOffset?: [number, number] | null;
    isSatellite?: boolean;
  }
  let draggedNodes: DraggedNodeInfo[] = [];

  interface DraggedEdgeInfo {
    element: SVGLineElement;
    from: string;
    to: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    isFromDragged: boolean;
    isToDragged: boolean;
    isInternal: boolean;
  }
  let multiDraggedLines: DraggedEdgeInfo[] = [];

  interface DraggedTextInfo {
    element: SVGTextElement;
    from: string;
    to: string;
    initialX: number;
    initialY: number;
    isInternal: boolean;
    isFromDragged: boolean;
  }
  let multiDraggedTexts: DraggedTextInfo[] = [];

  let isDragging = false;
  let dragId = "";
  let dragType = "";
  let dragStartX = 0;
  let dragStartY = 0;
  let currentDx = 0;
  let currentDy = 0;

  // Connection Drawing Variables
  let isDrawingLink = false;
  let linkSourceId = "";
  let guideLine: SVGLineElement | null = null;

  let gridSize = 20;

  // 1. Undo/Redo state recorders
  function recordState() {
    if (undoStack.length === 0 || undoStack[undoStack.length - 1] !== editor.value) {
      undoStack.push(editor.value);
      if (undoStack.length > 50) undoStack.shift();
      redoStack.length = 0; // Clear redo on new action
      updateUndoRedoButtons();
    }
  }

  function updateUndoRedoButtons() {
    if (btnUndo) btnUndo.disabled = undoStack.length === 0;
    if (btnRedo) btnRedo.disabled = redoStack.length === 0;
  }

  function undo() {
    if (undoStack.length > 0) {
      redoStack.push(editor.value);
      editor.value = undoStack.pop()!;
      compileDiagram();
      updateUndoRedoButtons();
    }
  }

  function redo() {
    if (redoStack.length > 0) {
      undoStack.push(editor.value);
      editor.value = redoStack.pop()!;
      compileDiagram();
      updateUndoRedoButtons();
    }
  }

  // Bind undo/redo keyboard actions
  document.addEventListener("keydown", (e) => {
    const target = e.target as HTMLElement;
    if (target.nodeName === "INPUT" || target.nodeName === "TEXTAREA" || target.isContentEditable) {
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      undo();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
      e.preventDefault();
      redo();
    }
  });

  if (btnUndo) btnUndo.addEventListener("click", undo);
  if (btnRedo) btnRedo.addEventListener("click", redo);

  // Apply snapping if option checked
  function snapVal(val: number): number {
    if (chkSnap && chkSnap.checked) {
      return Math.round(val / gridSize) * gridSize;
    }
    return Math.round(val);
  }

  // 2. Compile and Render the diagram
  function compileDiagram(skipInspectorUpdate = false) {
    const code = editor.value;
    const theme = themeSelect.value as any;
    const attribute_layout = spacingSelect.value as any;

    try {
      // Parse AST to keep visual state in sync
      parsedAST = parseDSL(code);

      // Render to SVG in interactive mode
      const svg = render(code, { theme, attribute_layout, interactive: true });
      
      // Update DOM
      preview.innerHTML = svg;
      
      // Wrap canvas content in viewport `<g>` group for panning and zooming
      wrapSVGViewport();

      // Hide error footer on success
      errorFooter.classList.add("hidden");
      
      // Add zoom state to newly rendered SVG
      applyTransform();
      
      // Sync spacingSelect dropdown if specified in AST
      if (parsedAST && parsedAST.config && parsedAST.config.attribute_layout) {
        spacingSelect.value = parsedAST.config.attribute_layout;
      }

      // Bind event listeners to new SVG elements
      bindCanvasEvents();

      // Highlight selected node if any
      updateVisualSelection();

      if (!skipInspectorUpdate) {
        renderInspector();
      }
    } catch (err: any) {
      // Show compiler error in the drawer
      errorMessage.textContent = err.message || String(err);
      errorFooter.classList.remove("hidden");
    }
  }

  // Wrap SVG shapes inside a dedicated viewport group for matrix translations
  function wrapSVGViewport() {
    const svgEl = preview.querySelector("svg");
    if (!svgEl) return;

    let viewportG = svgEl.querySelector("#viewport-g");
    if (!viewportG) {
      viewportG = document.createElementNS("http://www.w3.org/2000/svg", "g");
      viewportG.setAttribute("id", "viewport-g");
      
      const children = Array.from(svgEl.childNodes);
      children.forEach(child => {
        if (child.nodeName !== "style" && child.nodeName !== "defs" && !(child as Element).classList?.contains("conn-guide-line")) {
          viewportG!.appendChild(child);
        }
      });
      svgEl.appendChild(viewportG);
    }
  }

  // Generate DSL from updated AST
  function serializeAndSync(skipInspectorUpdate = false) {
    if (!parsedAST) return;
    const newCode = stringifyAST(parsedAST);
    
    // Maintain theme/layout configurations in DSL
    const lines = newCode.split("\n");
    if (lines[0] === "chenER") {
      const layoutVal = spacingSelect.value;
      if (layoutVal && !newCode.includes("attribute_layout") && !newCode.includes("layout_atributos")) {
        const isPt = getLanguage() === "pt-br";
        lines.splice(1, 0, isPt ? `layout_atributos ${layoutVal}` : `attribute_layout ${layoutVal}`);
      }
    }
    
    editor.value = lines.join("\n");
    compileDiagram(skipInspectorUpdate);
  }

  function updateBodyThemeClass() {
    const val = themeSelect.value;
    document.body.classList.remove("dark", "forest", "neutral");
    if (val !== "default") {
      document.body.classList.add(val);
    }
    const isDark = val === "dark";
    cmEditor.dispatch({
      effects: themeCompartment.reconfigure(getNekoEditorExtensions(isDark))
    });
  }

  themeSelect.addEventListener("change", () => {
    updateBodyThemeClass();
    compileDiagram();
  });
  updateBodyThemeClass();
  spacingSelect.addEventListener("change", () => {
    if (parsedAST) {
      parsedAST.config.attribute_layout = spacingSelect.value;
      serializeAndSync();
    } else {
      compileDiagram();
    }
  });

  if (selectSnapSize) {
    selectSnapSize.addEventListener("change", () => {
      gridSize = parseInt(selectSnapSize.value) || 20;
      const gridBg = document.querySelector(".grid-background") as HTMLElement;
      if (gridBg) {
        gridBg.style.backgroundSize = `${gridSize}px ${gridSize}px`;
      }
    });
  }

  // Close/Minimize Error overlay panel
  if (btnCloseError) {
    btnCloseError.addEventListener("click", () => {
      errorFooter.classList.add("hidden");
    });
  }

  // Toggle Code Editor Panel
  btnToggleEditor.addEventListener("click", () => {
    editorPanel.classList.toggle("collapsed");
    const isCollapsed = editorPanel.classList.contains("collapsed");
    btnToggleEditor.textContent = isCollapsed ? "Show Code" : "Toggle Code";
  });

  // Toolbox actions
  const toolBtns = document.querySelectorAll(".tool-btn");
  toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      toolBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeTool = btn.getAttribute("data-tool") || "select";
      
      if (activeTool === "pan") {
        preview.style.cursor = "grab";
        preview.parentElement?.classList.add("tool-pan");
      } else {
        preview.style.cursor = "default";
        preview.parentElement?.classList.remove("tool-pan");
      }

      // Reset selected states if adding new items
      if (activeTool !== "select" && activeTool !== "pan") {
        clearSelection();
      }
    });
  });

  // Spacebar and Tool Keyboard Shortcuts
  window.addEventListener("keydown", (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.nodeName === "INPUT" || target.nodeName === "TEXTAREA" || target.isContentEditable) {
      return;
    }

    if (e.code === "Space" && !isSpacePressed) {
      isSpacePressed = true;
      preview.style.cursor = "grab";
      preview.parentElement?.classList.add("tool-pan");
      e.preventDefault();
    } else if (e.key === "h" || e.key === "H") {
      toolBtns.forEach(b => b.classList.remove("active"));
      const panBtn = document.querySelector('[data-tool="pan"]') as HTMLButtonElement;
      if (panBtn) panBtn.classList.add("active");
      activeTool = "pan";
      preview.style.cursor = "grab";
      preview.parentElement?.classList.add("tool-pan");
    } else if (e.key === "v" || e.key === "V" || e.key === "Escape") {
      toolBtns.forEach(b => b.classList.remove("active"));
      const selectBtn = document.querySelector('[data-tool="select"]') as HTMLButtonElement;
      if (selectBtn) selectBtn.classList.add("active");
      activeTool = "select";
      preview.style.cursor = "default";
      preview.parentElement?.classList.remove("tool-pan");
      
      if (isDrawingLink && guideLine) {
        guideLine.remove();
        guideLine = null;
        isDrawingLink = false;
      }
      if (isMarquee && marqueeRectEl) {
        marqueeRectEl.remove();
        marqueeRectEl = null;
        isMarquee = false;
      }
      isDragging = false;
      if (e.key === "Escape") {
        clearSelection();
      }
    }
  });

  window.addEventListener("keyup", (e: KeyboardEvent) => {
    if (e.code === "Space" && isSpacePressed) {
      isSpacePressed = false;
      if (activeTool !== "pan") {
        preview.style.cursor = "default";
        preview.parentElement?.classList.remove("tool-pan");
      }
    }
  });

  // Keyboard Delete / Backspace key triggers visual deletions
  window.addEventListener("keydown", (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.nodeName === "INPUT" || target.nodeName === "TEXTAREA" || target.isContentEditable) {
      return;
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      if (selectedIds.size > 0) {
        recordState();
        selectedIds.forEach(id => {
          const ent = parsedAST.entities.find((x: any) => x.id === id);
          const rel = parsedAST.relationships.find((x: any) => x.id === id);
          const spec = parsedAST.specializations.find((x: any) => x.id === id);
          
          if (ent) {
            parsedAST.entities = parsedAST.entities.filter((x: any) => x.id !== id);
            parsedAST.connections = parsedAST.connections.filter((c: any) => c.from !== id && c.to !== id);
            parsedAST.specializations = parsedAST.specializations.filter((s: any) => s.superclass !== id && !s.subclasses.includes(id));
          } else if (rel) {
            parsedAST.relationships = parsedAST.relationships.filter((x: any) => x.id !== id);
            parsedAST.connections = parsedAST.connections.filter((c: any) => c.from !== id && c.to !== id);
          } else if (spec) {
            parsedAST.specializations = parsedAST.specializations.filter((s: any) => s.id !== id);
            parsedAST.connections = parsedAST.connections.filter((c: any) => c.from !== id && c.to !== id);
          } else {
            const attrInfo = findAttributeByNodeId(id);
            if (attrInfo) {
              if (attrInfo.parentAttr && attrInfo.parentAttr.children) {
                attrInfo.parentAttr.children = attrInfo.parentAttr.children.filter((c: any) => c.id !== attrInfo.attr.id);
              } else if (attrInfo.parentEntityOrRel && attrInfo.parentEntityOrRel.attributes) {
                attrInfo.parentEntityOrRel.attributes = attrInfo.parentEntityOrRel.attributes.filter((a: any) => a.id !== attrInfo.attr.id);
              }
            }
          }
        });
        clearSelection();
        serializeAndSync();
        e.preventDefault();
      } else if (selectedEdge) {
        recordState();
        parsedAST.connections = parsedAST.connections.filter((c: any) => !(c.from === selectedEdge?.from && c.to === selectedEdge?.to));
        clearSelection();
        serializeAndSync();
        e.preventDefault();
      }
    }
  });

  // Clear selections
  function clearSelection() {
    selectedId = null;
    selectedType = null;
    selectedEdge = null;
    selectedIds.clear();
    updateVisualSelection();
    renderInspector();
  }

  function updateVisualSelection() {
    const svgEl = preview.querySelector("svg");
    if (!svgEl) return;

    svgEl.querySelectorAll(".node-group").forEach(g => {
      const id = g.getAttribute("data-id");
      if (id && selectedIds.has(id)) {
        g.classList.add("selected");
      } else {
        g.classList.remove("selected");
      }
    });

    svgEl.querySelectorAll(".edge-group").forEach(g => {
      const from = g.getAttribute("data-from");
      const to = g.getAttribute("data-to");
      if (selectedEdge && selectedEdge.from === from && selectedEdge.to === to) {
        g.querySelectorAll("line").forEach(l => {
          l.style.stroke = "#FF5A43";
          l.style.strokeWidth = "3px";
        });
      } else {
        g.querySelectorAll("line").forEach(l => {
          l.style.stroke = "";
          l.style.strokeWidth = "";
        });
      }
    });
  }

  // Store initial coordinates of lines and labels connected to all dragged nodes in selectedIds
  function storeInitialConnectedLineCoordinatesForSelection(nodeIds: Set<string>) {
    multiDraggedLines = [];
    multiDraggedTexts = [];
    
    const svgEl = preview.querySelector("svg");
    if (!svgEl) return;

    const seenEdges = new Set<SVGElement>();

    nodeIds.forEach(nodeId => {
      const edges = svgEl.querySelectorAll(`.edge-group[data-from="${nodeId}"], .edge-group[data-to="${nodeId}"]`);
      
      edges.forEach(edgeGroup => {
        if (seenEdges.has(edgeGroup as SVGElement)) return;
        seenEdges.add(edgeGroup as SVGElement);

        const from = edgeGroup.getAttribute("data-from") || "";
        const to = edgeGroup.getAttribute("data-to") || "";
        const isFromDragged = nodeIds.has(from);
        const isToDragged = nodeIds.has(to);
        const isInternal = isFromDragged && isToDragged;
        
        edgeGroup.querySelectorAll("line").forEach((line: SVGLineElement) => {
          multiDraggedLines.push({
            element: line,
            from,
            to,
            x1: parseFloat(line.getAttribute("x1") || "0"),
            y1: parseFloat(line.getAttribute("y1") || "0"),
            x2: parseFloat(line.getAttribute("x2") || "0"),
            y2: parseFloat(line.getAttribute("y2") || "0"),
            isFromDragged,
            isToDragged,
            isInternal
          });
        });
        
        edgeGroup.querySelectorAll("text").forEach((text: SVGTextElement) => {
          const x = parseFloat(text.getAttribute("x") || "0");
          const y = parseFloat(text.getAttribute("y") || "0");
          multiDraggedTexts.push({
            element: text,
            from,
            to,
            initialX: x,
            initialY: y,
            isInternal,
            isFromDragged
          });
        });
      });
    });
  }

  // Update line and label positions during mousemove drag
  function updateConnectedLinesDuringDrag(dx: number, dy: number) {
    for (const dl of multiDraggedLines) {
      if (dl.isInternal) {
        dl.element.setAttribute("x1", (dl.x1 + dx).toString());
        dl.element.setAttribute("y1", (dl.y1 + dy).toString());
        dl.element.setAttribute("x2", (dl.x2 + dx).toString());
        dl.element.setAttribute("y2", (dl.y2 + dy).toString());
      } else if (dl.isFromDragged) {
        dl.element.setAttribute("x1", (dl.x1 + dx).toString());
        dl.element.setAttribute("y1", (dl.y1 + dy).toString());
      } else if (dl.isToDragged) {
        dl.element.setAttribute("x2", (dl.x2 + dx).toString());
        dl.element.setAttribute("y2", (dl.y2 + dy).toString());
      }
    }
    
    for (const dt of multiDraggedTexts) {
      if (dt.isInternal) {
        dt.element.setAttribute("x", (dt.initialX + dx).toString());
        dt.element.setAttribute("y", (dt.initialY + dy).toString());
      } else {
        dt.element.setAttribute("x", (dt.initialX + dx / 2).toString());
        dt.element.setAttribute("y", (dt.initialY + dy / 2).toString());
      }
    }
  }

  // SVG coordinate transformation accounting for zoom and pan levels
  function getSVGPoint(e: MouseEvent): { x: number; y: number } {
    const target = preview.querySelector("#viewport-g") || preview.querySelector("svg");
    if (!target) return { x: 0, y: 0 };
    
    const svgEl = preview.querySelector("svg")!;
    const pt = svgEl.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    
    const svgPoint = pt.matrixTransform((target as SVGGraphicsElement).getScreenCTM()!.inverse());
    return { x: svgPoint.x, y: svgPoint.y };
  }

  // Calculate a smart initial offset for newly created attributes to freeze in manual mode
  function computeInitialAttributeOffset(parent: any, ast: any): [number, number] {
    const graph = layoutDiagram(ast);
    const parentNode = graph.nodes.get(parent.id);
    if (!parentNode) return [0, -85];

    const occupiedAngles: number[] = [];

    // Edges connected to parent
    for (const edge of graph.edges) {
      if (edge.from === parent.id) {
        const target = graph.nodes.get(edge.to);
        if (target) occupiedAngles.push(Math.atan2(target.y - parentNode.y, target.x - parentNode.x));
      } else if (edge.to === parent.id) {
        const source = graph.nodes.get(edge.from);
        if (source) occupiedAngles.push(Math.atan2(source.y - parentNode.y, source.x - parentNode.x));
      }
    }

    // Existing attributes of parent
    if (parent.attributes) {
      for (const a of parent.attributes) {
        const attrNode = graph.nodes.get(`${parent.id}_attr_${a.id}`);
        if (attrNode) {
          occupiedAngles.push(Math.atan2(attrNode.y - parentNode.y, attrNode.x - parentNode.x));
        } else if (a.offset) {
          occupiedAngles.push(Math.atan2(a.offset[1], a.offset[0]));
        }
      }
    }

    // Normalize occupied angles to [0, 2*PI]
    const sorted = occupiedAngles.map(a => a < 0 ? a + 2 * Math.PI : a).sort((a, b) => a - b);
    let bestAngle = -Math.PI / 2; // Default upwards

    if (sorted.length === 0) {
      bestAngle = -Math.PI / 2;
    } else {
      let maxGap = 0;
      for (let i = 0; i < sorted.length; i++) {
        const start = sorted[i];
        const end = i === sorted.length - 1 ? sorted[0] + 2 * Math.PI : sorted[i + 1];
        const gap = end - start;
        if (gap > maxGap) {
          maxGap = gap;
          bestAngle = start + gap / 2;
        }
      }
    }

    const baseR = (parentNode.width / 2 + parentNode.height / 2) / 2 + 55;
    const dx = Math.round(baseR * Math.cos(bestAngle));
    const dy = Math.round(baseR * Math.sin(bestAngle));
    return [dx, dy];
  }

  // Bind Mouse & Drag Events to SVG Canvas Elements
  function bindCanvasEvents() {
    const svgEl = preview.querySelector("svg");
    if (!svgEl) return;

    // Canvas click (to add new nodes)
    svgEl.addEventListener("mousedown", (e: MouseEvent) => {
      const target = e.target as SVGElement;
      
      // If clicking inside a node or connection port, let their handlers handle it
      if (target.closest(".node-group") || target.closest(".edge-group")) {
        return;
      }

      if (activeTool !== "select" && activeTool !== "pan") {
        recordState();
        const pt = getSVGPoint(e);
        const uniqueNum = Date.now().toString().slice(-4);
        const finalX = snapVal(pt.x);
        const finalY = snapVal(pt.y);
        
        if (activeTool === "entity") {
          parsedAST.entities.push({
            id: `Entity_${uniqueNum}`,
            isWeak: false,
            attributes: [],
            offset: null,
            style: null,
            pos: { x: finalX, y: finalY }
          });
        } else if (activeTool === "relationship") {
          parsedAST.relationships.push({
            id: `Rel_${uniqueNum}`,
            isIdentifying: false,
            attributes: [],
            offset: null,
            style: null,
            pos: { x: finalX, y: finalY }
          });
        } else if (activeTool === "specialization") {
          parsedAST.specializations.push({
            id: `Spec_${uniqueNum}`,
            type: "disjoint",
            participation: "total",
            superclass: "",
            subclasses: [],
            pos: { x: finalX, y: finalY }
          });
        }
        
        // Reset tool to selection
        toolBtns.forEach(b => b.classList.remove("active"));
        const selectBtn = document.querySelector('[data-tool="select"]') as HTMLButtonElement;
        if (selectBtn) selectBtn.classList.add("active");
        activeTool = "select";

        serializeAndSync();
      } else if (activeTool === "pan" || isSpacePressed || e.button === 1) {
        // Handle canvas background drag panning initialization
        isPanning = true;
        panStartX = e.clientX - panX;
        panStartY = e.clientY - panY;
        preview.parentElement?.classList.add("is-panning");
        preview.style.cursor = "grabbing";
        e.preventDefault();
      } else if (activeTool === "select") {
        // Start Marquee Selection Box
        isMarquee = true;
        const pt = getSVGPoint(e);
        marqueeStartPt = pt;
        marqueeInitialSelectedIds = e.shiftKey ? new Set(selectedIds) : new Set();

        if (!e.shiftKey) {
          selectedIds.clear();
          selectedId = null;
          selectedType = null;
          updateVisualSelection();
          renderInspector();
        }

        marqueeRectEl = document.createElementNS("http://www.w3.org/2000/svg", "rect") as SVGRectElement;
        marqueeRectEl.setAttribute("class", "selection-marquee");
        marqueeRectEl.setAttribute("x", pt.x.toString());
        marqueeRectEl.setAttribute("y", pt.y.toString());
        marqueeRectEl.setAttribute("width", "0");
        marqueeRectEl.setAttribute("height", "0");

        const container = svgEl.querySelector("#viewport-g") || svgEl;
        container.appendChild(marqueeRectEl);
        e.preventDefault();
      }
    });

    // Node drag and drop + click inspect
    svgEl.querySelectorAll(".node-group").forEach(g => {
      const nodeGroup = g as SVGGElement;
      const id = nodeGroup.getAttribute("data-id") || "";
      const type = nodeGroup.getAttribute("data-type") || "";

      nodeGroup.addEventListener("mousedown", (e: MouseEvent) => {
        e.stopPropagation();
        const target = e.target as SVGElement;
        
        // If in Pan tool or spacebar held, allow canvas panning even when clicking nodes
        if (activeTool === "pan" || isSpacePressed || e.button === 1) {
          isPanning = true;
          panStartX = e.clientX - panX;
          panStartY = e.clientY - panY;
          preview.parentElement?.classList.add("is-panning");
          preview.style.cursor = "grabbing";
          e.preventDefault();
          return;
        }

        // Check if clicking on connection port handle
        if (target.classList.contains("conn-port")) {
          isDrawingLink = true;
          linkSourceId = id;
          
          const pt = getSVGPoint(e);
          guideLine = document.createElementNS("http://www.w3.org/2000/svg", "line") as SVGLineElement;
          guideLine.setAttribute("x1", pt.x.toString());
          guideLine.setAttribute("y1", pt.y.toString());
          guideLine.setAttribute("x2", pt.x.toString());
          guideLine.setAttribute("y2", pt.y.toString());
          guideLine.setAttribute("class", "conn-guide-line");
          
          const container = svgEl.querySelector("#viewport-g") || svgEl;
          container.appendChild(guideLine);
          return;
        }

        // Selection & Dragging initialization
        if (activeTool === "select") {
          const isCtrl = e.ctrlKey || e.metaKey;
          if (isCtrl) {
            if (selectedIds.has(id)) {
              selectedIds.delete(id);
              if (selectedId === id) {
                if (selectedIds.size > 0) {
                  selectedId = Array.from(selectedIds)[selectedIds.size - 1];
                  const ent = parsedAST.entities.find((x: any) => x.id === selectedId);
                  const rel = parsedAST.relationships.find((x: any) => x.id === selectedId);
                  const spec = parsedAST.specializations.find((x: any) => x.id === selectedId);
                  if (ent) selectedType = "entity";
                  else if (rel) selectedType = "relationship";
                  else if (spec) selectedType = "specialization";
                  else selectedType = selectedId.includes("_attr_") ? "attribute" : null;
                } else {
                  selectedId = null;
                  selectedType = null;
                }
              }
            } else {
              selectedIds.add(id);
              selectedId = id;
              selectedType = type;
            }
          } else {
            // If clicking on a node that is NOT in the selection, clear and select it.
            // If clicking on a node that IS ALREADY in the selection, KEEP multi-selection intact!
            if (!selectedIds.has(id)) {
              selectedIds.clear();
              selectedIds.add(id);
              selectedId = id;
              selectedType = type;
            }
          }
          selectedEdge = null;
          updateVisualSelection();
          renderInspector();

          // Initialize group dragging
          if (selectedIds.size > 0) {
            isDragging = true;
            dragId = id;
            dragType = type;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            currentDx = 0;
            currentDy = 0;

            draggedNodes = [];
            const graph = layoutDiagram(parsedAST);
            
            // Collect satellite attributes attached to dragged parents for smooth real-time cascade
            const satelliteIds = getDescendantAttributeIds(selectedIds);
            const allNodesToDrag = new Set(selectedIds);
            satelliteIds.forEach(satId => allNodesToDrag.add(satId));

            allNodesToDrag.forEach(sId => {
              const nodeEl = svgEl.querySelector(`.node-group[data-id="${sId}"]`) as SVGGElement;
              const nodePos = graph.nodes.get(sId);
              if (nodeEl && nodePos) {
                let initialOffset: [number, number] | null = null;
                if (nodePos.type === "attribute") {
                  const attrInfo = findAttributeByNodeId(sId);
                  if (attrInfo && attrInfo.attr.offset) {
                    initialOffset = [attrInfo.attr.offset[0], attrInfo.attr.offset[1]];
                  }
                }
                draggedNodes.push({
                  id: sId,
                  group: nodeEl,
                  initialX: nodePos.x,
                  initialY: nodePos.y,
                  type: nodePos.type,
                  parent: nodePos.parent,
                  initialOffset,
                  isSatellite: !selectedIds.has(sId)
                });
              }
            });

            storeInitialConnectedLineCoordinatesForSelection(allNodesToDrag);
          }
        } else if (activeTool === "attribute" && type !== "attribute" && type !== "specialization") {
          // Add attribute tool click on parent
          recordState();
          const uniqueNum = Date.now().toString().slice(-3);
          const parent = parsedAST.entities.find((x: any) => x.id === id) || 
                         parsedAST.relationships.find((x: any) => x.id === id);
          if (parent) {
            const initialOffset = computeInitialAttributeOffset(parent, parsedAST);
            parent.attributes.push({
              id: `attr_${uniqueNum}`,
              isKey: false,
              isWeakKey: false,
              isMultivalued: false,
              isDerived: false,
              isComposite: false,
              children: [],
              offset: initialOffset,
              style: null
            });
            serializeAndSync();
          }
        }
      });
    });

    // Connection edge click inspect
    svgEl.querySelectorAll(".edge-group").forEach(g => {
      const edgeGroup = g as SVGGElement;
      const from = edgeGroup.getAttribute("data-from") || "";
      const to = edgeGroup.getAttribute("data-to") || "";

      edgeGroup.addEventListener("mousedown", (e: MouseEvent) => {
        e.stopPropagation();
        selectedEdge = { from, to };
        selectedId = null;
        selectedType = null;
        updateVisualSelection();
        renderInspector();
      });
    });
  }

  // Global mouse move Listener for drag translations and link guide lines
  window.addEventListener("mousemove", (e: MouseEvent) => {
    if (isDragging && draggedNodes.length > 0) {
      const rawDx = (e.clientX - dragStartX) / currentZoom;
      const rawDy = (e.clientY - dragStartY) / currentZoom;
      
      const anchorNode = draggedNodes.find(n => n.id === dragId) || draggedNodes[0];
      if (anchorNode) {
        const rawX = anchorNode.initialX + rawDx;
        const rawY = anchorNode.initialY + rawDy;
        const snappedX = snapVal(rawX);
        const snappedY = snapVal(rawY);
        
        currentDx = snappedX - anchorNode.initialX;
        currentDy = snappedY - anchorNode.initialY;
      } else {
        currentDx = snapVal(rawDx);
        currentDy = snapVal(rawDy);
      }
      
      for (const dn of draggedNodes) {
        dn.group.setAttribute("transform", `translate(${currentDx}, ${currentDy})`);
      }
      updateConnectedLinesDuringDrag(currentDx, currentDy);
    }
    
    if (isMarquee && marqueeRectEl) {
      const pt = getSVGPoint(e);
      const minX = Math.min(marqueeStartPt.x, pt.x);
      const minY = Math.min(marqueeStartPt.y, pt.y);
      const width = Math.abs(pt.x - marqueeStartPt.x);
      const height = Math.abs(pt.y - marqueeStartPt.y);

      marqueeRectEl.setAttribute("x", minX.toString());
      marqueeRectEl.setAttribute("y", minY.toString());
      marqueeRectEl.setAttribute("width", width.toString());
      marqueeRectEl.setAttribute("height", height.toString());

      // Check intersections with node bounding boxes
      const graph = layoutDiagram(parsedAST);
      const newSelected = new Set(marqueeInitialSelectedIds);

      graph.nodes.forEach((node, id) => {
        const nodeMinX = node.x - node.width / 2;
        const nodeMaxX = node.x + node.width / 2;
        const nodeMinY = node.y - node.height / 2;
        const nodeMaxY = node.y + node.height / 2;

        const intersects = !(nodeMaxX < minX || nodeMinX > minX + width || nodeMaxY < minY || nodeMinY > minY + height);
        if (intersects) {
          newSelected.add(id);
        }
      });

      selectedIds.clear();
      newSelected.forEach(id => selectedIds.add(id));
      if (selectedIds.size > 0 && (!selectedId || !selectedIds.has(selectedId))) {
        selectedId = Array.from(selectedIds)[0];
        const n = graph.nodes.get(selectedId);
        selectedType = n ? n.type : null;
      }
      updateVisualSelection();
    }

    if (isDrawingLink && guideLine) {
      const pt = getSVGPoint(e);
      guideLine.setAttribute("x2", pt.x.toString());
      guideLine.setAttribute("y2", pt.y.toString());
    }

    if (isPanning) {
      panX = e.clientX - panStartX;
      panY = e.clientY - panStartY;
      applyTransform();
    }
  });

  // Global mouse up Listener to finalize drags and links
  window.addEventListener("mouseup", (e: MouseEvent) => {
    if (isDragging && draggedNodes.length > 0) {
      isDragging = false;
      for (const dn of draggedNodes) {
        dn.group.removeAttribute("transform");
      }
      
      if (Math.abs(currentDx) > 1 || Math.abs(currentDy) > 1) {
        recordState();
        
        // Track moved parents to avoid double-offsetting child attributes
        const movedParentIds = new Set(draggedNodes.map(n => n.id));
        const currentGraph = layoutDiagram(parsedAST);

        for (const dn of draggedNodes) {
          const finalX = snapVal(dn.initialX + currentDx);
          const finalY = snapVal(dn.initialY + currentDy);

          // Update position in AST
          const ent = parsedAST.entities.find((n: any) => n.id === dn.id);
          if (ent) ent.pos = { x: finalX, y: finalY };

          const rel = parsedAST.relationships.find((n: any) => n.id === dn.id);
          if (rel) rel.pos = { x: finalX, y: finalY };

          const spec = parsedAST.specializations.find((n: any) => n.id === dn.id);
          if (spec) spec.pos = { x: finalX, y: finalY };

          // Handle attribute dragging
          if (dn.type === "attribute") {
            const attrInfo = findAttributeByNodeId(dn.id);
            if (attrInfo) {
              const { attr, parentNodeId } = attrInfo;
              if (dn.isSatellite) {
                // If the attribute was dragged as a satellite of its parent:
                if (attr.pos) {
                  attr.pos = {
                    x: Math.round(dn.initialX + currentDx),
                    y: Math.round(dn.initialY + currentDy)
                  };
                }
                // If relative offset or dynamic placement, parent moved, so relative offset remains unchanged
              } else {
                // Attribute was directly dragged
                if (attr.pos) {
                  attr.pos = { x: finalX, y: finalY };
                } else if (!movedParentIds.has(parentNodeId)) {
                  const parentNode = currentGraph.nodes.get(parentNodeId);
                  const pX = parentNode ? parentNode.x : 0;
                  const pY = parentNode ? parentNode.y : 0;
                  attr.offset = [
                    Math.round(finalX - pX),
                    Math.round(finalY - pY)
                  ];
                }
              }
            }
          }
        }

        serializeAndSync();
      }
      draggedNodes = [];
    }

    if (isMarquee && marqueeRectEl) {
      marqueeRectEl.remove();
      marqueeRectEl = null;
      isMarquee = false;
      renderInspector();
    }

    if (isDrawingLink && guideLine) {
      guideLine.remove();
      guideLine = null;
      isDrawingLink = false;

      const targetEl = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      const targetGroup = targetEl ? targetEl.closest(".node-group") : null;
      
      if (targetGroup) {
        const targetId = targetGroup.getAttribute("data-id") || "";
        
        if (targetId && targetId !== linkSourceId) {
          recordState();
          // Append connection link
          parsedAST.connections.push({
            from: linkSourceId,
            to: targetId,
            cardinality: null,
            participation: "partial",
            role: null,
            labelOffset: null,
            style: null
          });
          serializeAndSync();
        }
      }
    }

    if (isPanning) {
      isPanning = false;
      preview.parentElement?.classList.remove("is-panning");
      if (activeTool === "pan" || isSpacePressed) {
        preview.style.cursor = "grab";
      } else {
        preview.style.cursor = "default";
      }
    }
  });

  // 4. Render Properties Inspector
  function applyI18n() {
    const t = getTranslation();
    const lang = getLanguage();

    if (langSelect) langSelect.value = lang;

    // Header
    const lblLang = document.getElementById("lbl-lang-select");
    if (lblLang) lblLang.textContent = t.header.langLabel;

    const lblTheme = document.getElementById("lbl-theme-select");
    if (lblTheme) lblTheme.textContent = t.header.themeLabel;

    const optDefault = document.getElementById("opt-theme-default");
    if (optDefault) optDefault.textContent = t.header.themeDefault;
    const optDark = document.getElementById("opt-theme-dark");
    if (optDark) optDark.textContent = t.header.themeDark;
    const optForest = document.getElementById("opt-theme-forest");
    if (optForest) optForest.textContent = t.header.themeForest;
    const optNeutral = document.getElementById("opt-theme-neutral");
    if (optNeutral) optNeutral.textContent = t.header.themeNeutral;

    const lblSpacing = document.getElementById("lbl-spacing-select");
    if (lblSpacing) lblSpacing.textContent = t.header.spacingLabel;
    const optSpManual = document.getElementById("opt-spacing-manual");
    if (optSpManual) optSpManual.textContent = (t.header as any).spacingManual || "Manual (Padrão)";
    const optSpDefault = document.getElementById("opt-spacing-default");
    if (optSpDefault) optSpDefault.textContent = t.header.spacingDefault;
    const optSpZigzag = document.getElementById("opt-spacing-zigzag");
    if (optSpZigzag) optSpZigzag.textContent = t.header.spacingZigzag;
    const optSpClassic = document.getElementById("opt-spacing-classic");
    if (optSpClassic) optSpClassic.textContent = t.header.spacingClassic;

    if (btnCopy) {
      btnCopy.textContent = t.header.copyCode;
      btnCopy.title = t.header.copyCode;
    }
    if (btnOpenNkm) {
      btnOpenNkm.textContent = (t.header as any).openNkm || "Abrir .nkm";
      btnOpenNkm.title = (t.header as any).openNkmTitle || "Abrir arquivo .nkm";
    }
    if (btnExportNkm) {
      btnExportNkm.textContent = t.header.exportNkm;
      btnExportNkm.title = t.header.exportNkm;
    }
    const lblExportImg = document.getElementById("lbl-export-img");
    if (lblExportImg) lblExportImg.textContent = (t.header as any).exportImage || "Exportar Imagem";
    if (btnExportImg) btnExportImg.title = (t.header as any).exportImage || "Exportar Imagem";

    const lblExportSvg = document.getElementById("lbl-export-svg");
    if (lblExportSvg) lblExportSvg.textContent = t.header.exportSvg;
    if (btnExportSvg) btnExportSvg.title = t.header.exportSvg;

    const lblExportPng = document.getElementById("lbl-export-png");
    if (lblExportPng) lblExportPng.textContent = (t.header as any).exportPng || "Exportar PNG";
    if (btnExportPng) btnExportPng.title = (t.header as any).exportPng || "Exportar PNG";

    // Toolbox
    const toolboxTitle = document.getElementById("toolbox-title");
    if (toolboxTitle) toolboxTitle.textContent = t.toolbox.title;

    const toolBtnSelect = document.getElementById("tool-btn-select");
    if (toolBtnSelect) toolBtnSelect.title = t.toolbox.selectTitle;
    const toolLblSelect = document.getElementById("tool-lbl-select");
    if (toolLblSelect) toolLblSelect.textContent = t.toolbox.select;

    const toolBtnPan = document.getElementById("tool-btn-pan");
    if (toolBtnPan) toolBtnPan.title = (t.toolbox as any).panTitle || "Ferramenta de Mover / Pan (H)";
    const toolLblPan = document.getElementById("tool-lbl-pan");
    if (toolLblPan) toolLblPan.textContent = (t.toolbox as any).pan || "Mover";

    const toolBtnEntity = document.getElementById("tool-btn-entity");
    if (toolBtnEntity) toolBtnEntity.title = t.toolbox.entityTitle;
    const toolLblEntity = document.getElementById("tool-lbl-entity");
    if (toolLblEntity) toolLblEntity.textContent = t.toolbox.entity;

    const toolBtnRel = document.getElementById("tool-btn-relationship");
    if (toolBtnRel) toolBtnRel.title = t.toolbox.relTitle;
    const toolLblRel = document.getElementById("tool-lbl-relationship");
    if (toolLblRel) toolLblRel.textContent = t.toolbox.rel;

    const toolBtnSpec = document.getElementById("tool-btn-specialization");
    if (toolBtnSpec) toolBtnSpec.title = t.toolbox.specTitle;
    const toolLblSpec = document.getElementById("tool-lbl-specialization");
    if (toolLblSpec) toolLblSpec.textContent = t.toolbox.spec;

    const toolBtnAttr = document.getElementById("tool-btn-attribute");
    if (toolBtnAttr) toolBtnAttr.title = t.toolbox.attrTitle;
    const toolLblAttr = document.getElementById("tool-lbl-attribute");
    if (toolLblAttr) toolLblAttr.textContent = t.toolbox.attr;

    // Editor
    const editorTitle = document.getElementById("editor-title");
    if (editorTitle) editorTitle.textContent = t.editor.title;
    const editorFileName = document.getElementById("editor-file-name");
    if (editorFileName) editorFileName.textContent = t.editor.fileName;

    // Visualizer actions
    const visualizerTitle = document.getElementById("visualizer-title");
    if (visualizerTitle) visualizerTitle.textContent = t.visualizer.title;
    if (btnUndo) btnUndo.title = t.visualizer.undoTitle;
    if (btnRedo) btnRedo.title = t.visualizer.redoTitle;
    if (btnZoomOut) btnZoomOut.title = t.visualizer.zoomOutTitle;
    if (btnZoomIn) btnZoomIn.title = t.visualizer.zoomInTitle;
    if (btnZoomReset) btnZoomReset.textContent = t.visualizer.zoomReset;
    if (btnAlignH) {
      btnAlignH.textContent = t.visualizer.alignH;
      btnAlignH.title = t.visualizer.alignHTitle;
    }
    if (btnAlignV) {
      btnAlignV.textContent = t.visualizer.alignV;
      btnAlignV.title = t.visualizer.alignVTitle;
    }
    const lblSnap = document.getElementById("lbl-snap");
    if (lblSnap) lblSnap.textContent = t.visualizer.snap;
    if (btnToggleEditor) btnToggleEditor.textContent = t.editor.toggle;

    // Inspector
    const inspectorTitle = document.getElementById("inspector-title");
    if (inspectorTitle) inspectorTitle.textContent = t.inspector.title;
    const inspectorEmptyState = document.getElementById("inspector-empty-state");
    if (inspectorEmptyState) inspectorEmptyState.textContent = t.inspector.emptyState;

    renderInspector();
  }

  function renderInspector() {
    inspectorContent.innerHTML = "";
    const t = getTranslation().inspector;

    // A. Inspector for Nodes (Entity, Relationship, Specialization, Attribute)
    if (selectedId && selectedType) {
      if (selectedType === "entity" || selectedType === "weak_entity") {
        const ent = parsedAST.entities.find((e: any) => e.id === selectedId);
        if (!ent) return;

        let attributesHTML = ent.attributes.map((a: Attribute, idx: number) => {
          return `
            <div class="inspector-group" style="padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 8px; background: rgba(255,255,255,0.01);">
              <div class="inspector-row">
                <input type="text" class="attr-name-input" data-index="${idx}" value="${a.id}" style="flex: 1;" />
                <button class="btn btn-sm btn-delete-attr" data-index="${idx}" style="color: var(--error); border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05);">✕</button>
              </div>
              <label class="inspector-checkbox">
                <input type="checkbox" class="attr-key-checkbox" data-index="${idx}" ${a.isKey ? "checked" : ""} /> ${t.primaryKey}
              </label>
              <label class="inspector-checkbox">
                <input type="checkbox" class="attr-weak-checkbox" data-index="${idx}" ${a.isWeakKey ? "checked" : ""} /> ${t.partialKey}
              </label>
              <label class="inspector-checkbox">
                <input type="checkbox" class="attr-multi-checkbox" data-index="${idx}" ${a.isMultivalued ? "checked" : ""} /> ${t.multivalued}
              </label>
              <label class="inspector-checkbox">
                <input type="checkbox" class="attr-derived-checkbox" data-index="${idx}" ${a.isDerived ? "checked" : ""} /> ${t.derived}
              </label>
            </div>
          `;
        }).join("");

        inspectorContent.innerHTML = `
          <div class="inspector-group">
            <label>${t.name}</label>
            <input type="text" id="node-name" value="${ent.id}" />
          </div>
          <div class="inspector-group">
            <label class="inspector-checkbox">
              <input type="checkbox" id="entity-weak-chk" ${ent.isWeak ? "checked" : ""} /> ${t.weakEntity}
            </label>
          </div>
          <div class="tool-divider" style="margin: 10px 0;"></div>
          <div class="inspector-group">
            <label>${t.attributes}</label>
            <div id="inspector-attrs" style="max-height: 250px; overflow-y: auto; margin-bottom: 8px;">
              ${attributesHTML || `<p style="font-size: 12px; color: var(--color-muted); text-align: center; margin: 10px 0;">${t.noAttributes}</p>`}
            </div>
            <button id="btn-add-attr-panel" class="btn btn-sm btn-primary">${t.addAttribute}</button>
          </div>
          <div class="tool-divider" style="margin: 15px 0;"></div>
          <button id="btn-delete-node" class="btn btn-sm" style="color: var(--error); border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.05); width: 100%;">${t.deleteEntity}</button>
        `;

        // Bind events for Entity Inspector (renaming inputs update with key input directly)
        const nameInput = document.getElementById("node-name") as HTMLInputElement;
        nameInput.addEventListener("input", () => {
          const oldId = ent.id;
          const newId = nameInput.value.trim();
          if (newId && newId !== oldId) {
            recordState();
            ent.id = newId;
            parsedAST.connections.forEach((c: any) => {
              if (c.from === oldId) c.from = newId;
              if (c.to === oldId) c.to = newId;
            });
            parsedAST.specializations.forEach((s: any) => {
              if (s.superclass === oldId) s.superclass = newId;
              const subIdx = s.subclasses.indexOf(oldId);
              if (subIdx !== -1) s.subclasses[subIdx] = newId;
            });
            selectedId = newId;
            serializeAndSync(true); // Skip rebuilding properties to maintain keyboard focus
          }
        });

        const weakChk = document.getElementById("entity-weak-chk") as HTMLInputElement;
        weakChk.addEventListener("change", () => {
          recordState();
          ent.isWeak = weakChk.checked;
          serializeAndSync();
        });

        document.getElementById("btn-add-attr-panel")?.addEventListener("click", () => {
          recordState();
          const uniqueNum = Date.now().toString().slice(-3);
          const initialOffset = computeInitialAttributeOffset(ent, parsedAST);
          ent.attributes.push({
            id: `attr_${uniqueNum}`,
            isKey: false,
            isWeakKey: false,
            isMultivalued: false,
            isDerived: false,
            isComposite: false,
            children: [],
            offset: initialOffset,
            style: null
          });
          serializeAndSync();
        });

        inspectorContent.querySelectorAll(".attr-name-input").forEach(input => {
          input.addEventListener("input", (e) => {
            const idx = parseInt((e.target as HTMLInputElement).getAttribute("data-index") || "0");
            const newName = (e.target as HTMLInputElement).value.trim();
            if (newName) {
              recordState();
              ent.attributes[idx].id = newName;
              serializeAndSync(true);
            }
          });
        });

        inspectorContent.querySelectorAll(".attr-key-checkbox").forEach(chk => {
          chk.addEventListener("change", (e) => {
            recordState();
            const idx = parseInt((e.target as HTMLInputElement).getAttribute("data-index") || "0");
            ent.attributes[idx].isKey = (e.target as HTMLInputElement).checked;
            if (ent.attributes[idx].isKey) {
              ent.attributes[idx].isWeakKey = false;
              ent.attributes[idx].isMultivalued = false;
              ent.attributes[idx].isDerived = false;
            }
            serializeAndSync();
          });
        });

        inspectorContent.querySelectorAll(".attr-weak-checkbox").forEach(chk => {
          chk.addEventListener("change", (e) => {
            recordState();
            const idx = parseInt((e.target as HTMLInputElement).getAttribute("data-index") || "0");
            ent.attributes[idx].isWeakKey = (e.target as HTMLInputElement).checked;
            if (ent.attributes[idx].isWeakKey) {
              ent.attributes[idx].isKey = false;
              ent.attributes[idx].isMultivalued = false;
              ent.attributes[idx].isDerived = false;
            }
            serializeAndSync();
          });
        });

        inspectorContent.querySelectorAll(".attr-multi-checkbox").forEach(chk => {
          chk.addEventListener("change", (e) => {
            recordState();
            const idx = parseInt((e.target as HTMLInputElement).getAttribute("data-index") || "0");
            ent.attributes[idx].isMultivalued = (e.target as HTMLInputElement).checked;
            if (ent.attributes[idx].isMultivalued) {
              ent.attributes[idx].isKey = false;
              ent.attributes[idx].isWeakKey = false;
              ent.attributes[idx].isDerived = false;
            }
            serializeAndSync();
          });
        });

        inspectorContent.querySelectorAll(".attr-derived-checkbox").forEach(chk => {
          chk.addEventListener("change", (e) => {
            recordState();
            const idx = parseInt((e.target as HTMLInputElement).getAttribute("data-index") || "0");
            ent.attributes[idx].isDerived = (e.target as HTMLInputElement).checked;
            if (ent.attributes[idx].isDerived) {
              ent.attributes[idx].isKey = false;
              ent.attributes[idx].isWeakKey = false;
              ent.attributes[idx].isMultivalued = false;
            }
            serializeAndSync();
          });
        });

        inspectorContent.querySelectorAll(".btn-delete-attr").forEach(btn => {
          btn.addEventListener("click", (e) => {
            recordState();
            const idx = parseInt((e.target as HTMLButtonElement).getAttribute("data-index") || "0");
            ent.attributes.splice(idx, 1);
            serializeAndSync();
          });
        });

        document.getElementById("btn-delete-node")?.addEventListener("click", () => {
          recordState();
          parsedAST.entities = parsedAST.entities.filter((e: any) => e.id !== selectedId);
          parsedAST.connections = parsedAST.connections.filter((c: any) => c.from !== selectedId && c.to !== selectedId);
          parsedAST.specializations = parsedAST.specializations.filter((s: any) => s.superclass !== selectedId && !s.subclasses.includes(selectedId));
          clearSelection();
          serializeAndSync();
        });
      }

      if (selectedType === "relationship" || selectedType === "identifying_relationship") {
        const rel = parsedAST.relationships.find((r: any) => r.id === selectedId);
        if (!rel) return;

        inspectorContent.innerHTML = `
          <div class="inspector-group">
            <label>${t.name}</label>
            <input type="text" id="node-name" value="${rel.id}" />
          </div>
          <div class="inspector-group">
            <label class="inspector-checkbox">
              <input type="checkbox" id="rel-ident-chk" ${rel.isIdentifying ? "checked" : ""} /> ${t.identifyingRel}
            </label>
          </div>
          <div class="tool-divider" style="margin: 15px 0;"></div>
          <button id="btn-delete-node" class="btn btn-sm" style="color: var(--error); border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.05); width: 100%;">${t.deleteRelationship}</button>
        `;

        const nameInput = document.getElementById("node-name") as HTMLInputElement;
        nameInput.addEventListener("input", () => {
          const oldId = rel.id;
          const newId = nameInput.value.trim();
          if (newId && newId !== oldId) {
            recordState();
            rel.id = newId;
            parsedAST.connections.forEach((c: any) => {
              if (c.from === oldId) c.from = newId;
              if (c.to === oldId) c.to = newId;
            });
            selectedId = newId;
            serializeAndSync(true);
          }
        });

        const identChk = document.getElementById("rel-ident-chk") as HTMLInputElement;
        identChk.addEventListener("change", () => {
          recordState();
          rel.isIdentifying = identChk.checked;
          serializeAndSync();
        });

        document.getElementById("btn-delete-node")?.addEventListener("click", () => {
          recordState();
          parsedAST.relationships = parsedAST.relationships.filter((r: any) => r.id !== selectedId);
          parsedAST.connections = parsedAST.connections.filter((c: any) => c.from !== selectedId && c.to !== selectedId);
          clearSelection();
          serializeAndSync();
        });
      }

      if (selectedType === "specialization") {
        const spec = parsedAST.specializations.find((s: any) => s.id === selectedId);
        if (!spec) return;

        // Superclass list dropdown
        const hasSuperclass = !!spec.superclass;
        const emptySelected = !hasSuperclass ? "selected" : "";
        const superclassOptions = `
          <option value="" ${emptySelected}>${t.none}</option>
          ${parsedAST.entities.map((ent: any) => {
            const isSelected = ent.id === spec.superclass ? "selected" : "";
            return `<option value="${ent.id}" ${isSelected}>${ent.id}</option>`;
          }).join("")}
        `;

        // Subclass checkboxes
        const subclassChecklist = parsedAST.entities.map((ent: any) => {
          if (ent.id === spec.superclass) return "";
          const isChecked = spec.subclasses.includes(ent.id) ? "checked" : "";
          return `
            <label class="inspector-checkbox">
              <input type="checkbox" class="spec-subclass-chk" value="${ent.id}" ${isChecked} /> ${ent.id}
            </label>
          `;
        }).join("");

        inspectorContent.innerHTML = `
          <div class="inspector-group">
            <label>${t.name}</label>
            <input type="text" id="node-name" value="${spec.id}" />
          </div>
          <div class="inspector-group">
            <label>${t.disjunctionConstraint}</label>
            <select id="spec-type-select">
              <option value="disjoint" ${spec.type === "disjoint" ? "selected" : ""}>${t.disjoint}</option>
              <option value="overlapping" ${spec.type === "overlapping" ? "selected" : ""}>${t.overlapping}</option>
            </select>
          </div>
          <div class="inspector-group">
            <label>${t.participation}</label>
            <select id="spec-part-select">
              <option value="partial" ${spec.participation === "partial" ? "selected" : ""}>${t.partial}</option>
              <option value="total" ${spec.participation === "total" ? "selected" : ""}>${t.total}</option>
            </select>
          </div>
          <div class="inspector-group">
            <label>${t.superclass}</label>
            <select id="spec-superclass-select">
              ${superclassOptions}
            </select>
          </div>
          <div class="inspector-group">
            <label>${t.subclasses}</label>
            <div style="max-height: 120px; overflow-y: auto; padding: 6px; border: 1px solid var(--border-color); border-radius: 6px; background: rgba(0,0,0,0.15)">
              ${subclassChecklist || `<p style="font-size:12px; color:var(--color-muted)">${t.noEntitiesAvailable}</p>`}
            </div>
          </div>
          <div class="tool-divider" style="margin: 15px 0;"></div>
          <button id="btn-delete-node" class="btn btn-sm" style="color: var(--error); border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.05); width: 100%;">${t.deleteSpecialization}</button>
        `;

        const nameInput = document.getElementById("node-name") as HTMLInputElement;
        nameInput.addEventListener("input", () => {
          const oldId = spec.id;
          const newId = nameInput.value.trim();
          if (newId && newId !== oldId) {
            recordState();
            spec.id = newId;
            parsedAST.connections.forEach((c: any) => {
              if (c.from === oldId) c.from = newId;
              if (c.to === oldId) c.to = newId;
            });
            selectedId = newId;
            serializeAndSync(true);
          }
        });

        document.getElementById("spec-type-select")?.addEventListener("change", (e) => {
          recordState();
          spec.type = (e.target as HTMLSelectElement).value;
          serializeAndSync();
        });

        document.getElementById("spec-part-select")?.addEventListener("change", (e) => {
          recordState();
          spec.participation = (e.target as HTMLSelectElement).value;
          serializeAndSync();
        });

        document.getElementById("spec-superclass-select")?.addEventListener("change", (e) => {
          recordState();
          spec.superclass = (e.target as HTMLSelectElement).value;
          // Clean subclasses checklist (superclass cannot be subclass)
          spec.subclasses = spec.subclasses.filter((sub: string) => sub !== spec.superclass);
          serializeAndSync();
        });

        inspectorContent.querySelectorAll(".spec-subclass-chk").forEach(chk => {
          chk.addEventListener("change", () => {
            recordState();
            const updatedSubs: string[] = [];
            inspectorContent.querySelectorAll(".spec-subclass-chk").forEach(c => {
              if ((c as HTMLInputElement).checked) {
                updatedSubs.push((c as HTMLInputElement).value);
              }
            });
            spec.subclasses = updatedSubs;
            serializeAndSync();
          });
        });

        document.getElementById("btn-delete-node")?.addEventListener("click", () => {
          recordState();
          parsedAST.specializations = parsedAST.specializations.filter((s: any) => s.id !== selectedId);
          parsedAST.connections = parsedAST.connections.filter((c: any) => c.from !== selectedId && c.to !== selectedId);
          clearSelection();
          serializeAndSync();
        });
      }

      if (selectedType === "attribute") {
        const attrInfo = findAttributeByNodeId(selectedId);
        if (!attrInfo) return;
        const attr = attrInfo.attr;
        const parentId = attrInfo.parentNodeId;

        inspectorContent.innerHTML = `
          <div class="inspector-group">
            <label>${t.name}</label>
            <input type="text" id="node-name" value="${attr.id}" />
          </div>
          <div class="inspector-group">
            <label>${t.constraints}</label>
            <label class="inspector-checkbox">
              <input type="checkbox" id="attr-key-chk" ${attr.isKey ? "checked" : ""} /> ${t.primaryKey}
            </label>
            <label class="inspector-checkbox">
              <input type="checkbox" id="attr-weak-chk" ${attr.isWeakKey ? "checked" : ""} /> ${t.partialKey}
            </label>
            <label class="inspector-checkbox">
              <input type="checkbox" id="attr-multi-chk" ${attr.isMultivalued ? "checked" : ""} /> ${t.multivalued}
            </label>
            <label class="inspector-checkbox">
              <input type="checkbox" id="attr-derived-chk" ${attr.isDerived ? "checked" : ""} /> ${t.derived}
            </label>
          </div>
          <div class="tool-divider" style="margin: 15px 0;"></div>
          <button id="btn-delete-node" class="btn btn-sm" style="color: var(--error); border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.05); width: 100%;">${t.deleteAttribute}</button>
        `;

        const nameInput = document.getElementById("node-name") as HTMLInputElement;
        nameInput.addEventListener("input", () => {
          const newName = nameInput.value.trim();
          if (newName && attr) {
            recordState();
            attr.id = newName;
            // Update selected qualified ID
            selectedId = `${parentId}_attr_${newName}`;
            serializeAndSync(true);
          }
        });

        const keyChk = document.getElementById("attr-key-chk") as HTMLInputElement;
        keyChk.addEventListener("change", () => {
          if (attr) {
            recordState();
            attr.isKey = keyChk.checked;
            if (attr.isKey) {
              attr.isWeakKey = false;
              attr.isMultivalued = false;
              attr.isDerived = false;
            }
            serializeAndSync();
          }
        });

        const weakChk = document.getElementById("attr-weak-chk") as HTMLInputElement;
        weakChk.addEventListener("change", () => {
          if (attr) {
            recordState();
            attr.isWeakKey = weakChk.checked;
            if (attr.isWeakKey) {
              attr.isKey = false;
              attr.isMultivalued = false;
              attr.isDerived = false;
            }
            serializeAndSync();
          }
        });

        const multiChk = document.getElementById("attr-multi-chk") as HTMLInputElement;
        multiChk.addEventListener("change", () => {
          if (attr) {
            recordState();
            attr.isMultivalued = multiChk.checked;
            if (attr.isMultivalued) {
              attr.isKey = false;
              attr.isWeakKey = false;
              attr.isDerived = false;
            }
            serializeAndSync();
          }
        });

        const derivedChk = document.getElementById("attr-derived-chk") as HTMLInputElement;
        derivedChk.addEventListener("change", () => {
          if (attr) {
            recordState();
            attr.isDerived = derivedChk.checked;
            if (attr.isDerived) {
              attr.isKey = false;
              attr.isWeakKey = false;
              attr.isMultivalued = false;
            }
            serializeAndSync();
          }
        });

        document.getElementById("btn-delete-node")?.addEventListener("click", () => {
          recordState();
          if (attrInfo.parentAttr && attrInfo.parentAttr.children) {
            attrInfo.parentAttr.children = attrInfo.parentAttr.children.filter((c: any) => c.id !== attr.id);
          } else if (attrInfo.parentEntityOrRel && attrInfo.parentEntityOrRel.attributes) {
            attrInfo.parentEntityOrRel.attributes = attrInfo.parentEntityOrRel.attributes.filter((a: any) => a.id !== attr.id);
          }
          clearSelection();
          serializeAndSync();
        });
      }
    } else if (selectedEdge) {
      // B. Inspector for Connections (Edges)
      const conn = parsedAST.connections.find((c: any) => c.from === selectedEdge?.from && c.to === selectedEdge?.to);
      if (!conn) return;

      inspectorContent.innerHTML = `
        <div class="inspector-group">
          <label>${t.cardinalityRole}</label>
          <input type="text" id="conn-label" value="${conn.cardinality || conn.role || ""}" placeholder="${t.cardinalityPlaceholder}" />
        </div>
        <div class="inspector-group">
          <label>${t.participation}</label>
          <select id="conn-part-select">
            <option value="partial" ${conn.participation === "partial" ? "selected" : ""}>${t.partial}</option>
            <option value="total" ${conn.participation === "total" ? "selected" : ""}>${t.total}</option>
          </select>
        </div>
        <div class="inspector-group">
          <label>${t.layoutDirection}</label>
          <select id="conn-dir-select">
            <option value="" ${!conn.dir ? "selected" : ""}>${t.dirNone}</option>
            <option value="right" ${conn.dir === "right" ? "selected" : ""}>${t.dirRight}</option>
            <option value="left" ${conn.dir === "left" ? "selected" : ""}>${t.dirLeft}</option>
            <option value="down" ${conn.dir === "down" ? "selected" : ""}>${t.dirDown}</option>
            <option value="up" ${conn.dir === "up" ? "selected" : ""}>${t.dirUp}</option>
          </select>
        </div>
        <div class="tool-divider" style="margin: 15px 0;"></div>
        <button id="btn-delete-edge" class="btn btn-sm" style="color: var(--error); border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.05); width: 100%;">${t.deleteLink}</button>
      `;

      const labelInput = document.getElementById("conn-label") as HTMLInputElement;
      labelInput.addEventListener("input", () => {
        const val = labelInput.value.trim();
        recordState();
        if (val === "") {
          conn.cardinality = null;
          conn.role = null;
        } else if (/^[\dNM1:,\s()]+$/i.test(val)) {
          conn.cardinality = val;
          conn.role = null;
        } else {
          conn.role = val;
          conn.cardinality = null;
        }
        serializeAndSync(true); // Skip properties inspector refresh to maintain focus
      });

      document.getElementById("conn-part-select")?.addEventListener("change", (e) => {
        recordState();
        conn.participation = (e.target as HTMLSelectElement).value;
        serializeAndSync();
      });

      document.getElementById("conn-dir-select")?.addEventListener("change", (e) => {
        recordState();
        const val = (e.target as HTMLSelectElement).value;
        conn.dir = val === "" ? null : val;
        serializeAndSync();
      });

      document.getElementById("btn-delete-edge")?.addEventListener("click", () => {
        recordState();
        parsedAST.connections = parsedAST.connections.filter((c: any) => !(c.from === selectedEdge?.from && c.to === selectedEdge?.to));
        clearSelection();
        serializeAndSync();
      });
    } else {
      inspectorContent.innerHTML = `<p class="empty-state">${t.emptyState}</p>`;
    }
  }

  // 5. Transform Viewport (Zoom and Panning)
  function applyTransform() {
    const viewportG = preview.querySelector("#viewport-g");
    if (viewportG) {
      viewportG.setAttribute("transform", `translate(${panX}, ${panY}) scale(${currentZoom})`);
    }
  }

  btnZoomIn.addEventListener("click", () => {
    currentZoom = Math.min(2.5, currentZoom + 0.1);
    applyTransform();
  });

  btnZoomOut.addEventListener("click", () => {
    currentZoom = Math.max(0.5, currentZoom - 0.1);
    applyTransform();
  });

  btnZoomReset.addEventListener("click", () => {
    currentZoom = 1.0;
    panX = 0;
    panY = 0;
    applyTransform();
  });

  // Mouse wheel zoom listener (Direct Scroll Zoom)
  preview.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = 0.08;
    if (e.deltaY < 0) {
      currentZoom = Math.min(2.5, currentZoom + zoomFactor);
    } else {
      currentZoom = Math.max(0.5, currentZoom - zoomFactor);
    }
    applyTransform();
  }, { passive: false });

  // Copy code to clipboard
  btnCopy.addEventListener("click", () => {
    navigator.clipboard.writeText(editor.value).then(() => {
      const originalText = btnCopy.textContent;
      btnCopy.textContent = getTranslation().header.copied;
      btnCopy.classList.add("btn-primary");
      
      setTimeout(() => {
        btnCopy.textContent = originalText;
        btnCopy.classList.remove("btn-primary");
      }, 1500);
    });
  });

  // Open / Import diagram DSL code from local .nkm file
  function loadFileContent(file: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        recordState();
        editor.value = content;
        compileDiagram();
        const editorFileName = document.getElementById("editor-file-name");
        if (editorFileName) {
          editorFileName.textContent = file.name;
        }
      }
    };
    reader.onerror = () => {
      alert("Falha ao ler o arquivo selecionado.");
    };
    reader.readAsText(file);
  }

  btnOpenNkm?.addEventListener("click", () => {
    inputOpenNkm?.click();
  });

  inputOpenNkm?.addEventListener("change", () => {
    if (inputOpenNkm.files && inputOpenNkm.files.length > 0) {
      loadFileContent(inputOpenNkm.files[0]);
      inputOpenNkm.value = ""; // allow reopening same file if modified externally
    }
  });

  // Drag-and-drop support on editor panel for .nkm files
  if (editorPanel) {
    editorPanel.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    editorPanel.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.name.endsWith(".nkm") || file.name.endsWith(".txt") || file.type.includes("text")) {
          loadFileContent(file);
        }
      }
    });
  }

  // Export diagram DSL code as .nkm file download
  btnExportNkm?.addEventListener("click", () => {
    try {
      const code = editor.value;
      const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "model.nkm";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Failed to export .nkm: " + err.message);
    }
  });

  // Toggle export dropdown menu
  btnExportImg?.addEventListener("click", (e) => {
    e.stopPropagation();
    exportDropdownMenu?.classList.toggle("hidden");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!exportDropdownMenu?.classList.contains("hidden")) {
      const target = e.target as HTMLElement;
      if (!target.closest("#dropdown-export-wrapper")) {
        exportDropdownMenu?.classList.add("hidden");
      }
    }
  });

  // Export diagram as static SVG file download
  btnExportSvg?.addEventListener("click", () => {
    exportDropdownMenu?.classList.add("hidden");
    try {
      const code = editor.value;
      const theme = themeSelect.value as any;
      const attribute_layout = spacingSelect.value as any;
      const svgContent = render(code, { theme, attribute_layout });
      
      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = "chen-er-diagram.svg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Failed to export SVG: " + err.message);
    }
  });

  // Export diagram as high-resolution PNG file download
  btnExportPng?.addEventListener("click", () => {
    exportDropdownMenu?.classList.add("hidden");
    try {
      const code = editor.value;
      const theme = themeSelect.value as any;
      const attribute_layout = spacingSelect.value as any;
      const svgContent = render(code, { theme, attribute_layout });

      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) throw new Error("Could not parse SVG document");

      const viewBoxAttr = svgEl.getAttribute("viewBox");
      let vbWidth = 1000;
      let vbHeight = 700;
      if (viewBoxAttr) {
        const parts = viewBoxAttr.trim().split(/[\s,]+/);
        if (parts.length === 4) {
          vbWidth = parseFloat(parts[2]) || 1000;
          vbHeight = parseFloat(parts[3]) || 700;
        }
      }

      // Scale factor 2x (Retina) for ultra-sharp text and lines
      const scale = 2;
      const width = Math.max(800, Math.round(vbWidth * scale));
      const height = Math.max(600, Math.round(vbHeight * scale));

      // Set explicit dimensions on SVG element so browser decodes Image at full resolution
      svgEl.setAttribute("width", width.toString());
      svgEl.setAttribute("height", height.toString());
      const fullSvgContent = new XMLSerializer().serializeToString(svgEl);

      const svgBlob = new Blob([fullSvgContent], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(svgUrl);
          throw new Error("Could not initialize canvas context");
        }

        // Fill background matching theme
        if (theme === "dark") {
          ctx.fillStyle = "#0f172a";
        } else if (theme === "forest") {
          ctx.fillStyle = "#064e3b";
        } else {
          ctx.fillStyle = "#ffffff";
        }
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(svgUrl);

        canvas.toBlob((pngBlob) => {
          if (!pngBlob) return;
          const pngUrl = URL.createObjectURL(pngBlob);
          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = "chen-er-diagram.png";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pngUrl);
        }, "image/png");
      };
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        alert("Failed to render PNG image from diagram");
      };
      img.src = svgUrl;
    } catch (err: any) {
      alert("Failed to export PNG: " + err.message);
    }
  });

  // Draggable Splitter Handle logic
  // Alignment logic for selected nodes
  function alignSelectedNodes(direction: "horizontal" | "vertical") {
    if (selectedIds.size < 2 || !parsedAST) return;

    recordState();

    const graph = layoutDiagram(parsedAST);
    const selectedList = Array.from(selectedIds);
    const referenceNodeId = selectedList[0];
    const referencePos = graph.nodes.get(referenceNodeId);
    if (!referencePos) return;

    const alignValue = direction === "horizontal" ? referencePos.y : referencePos.x;

    selectedList.forEach(id => {
      const currentPos = graph.nodes.get(id);
      if (!currentPos) return;

      const ent = parsedAST.entities.find((n: any) => n.id === id);
      if (ent) {
        if (!ent.pos) ent.pos = { x: currentPos.x, y: currentPos.y };
        if (direction === "horizontal") ent.pos.y = snapVal(alignValue);
        else ent.pos.x = snapVal(alignValue);
      }

      const rel = parsedAST.relationships.find((n: any) => n.id === id);
      if (rel) {
        if (!rel.pos) rel.pos = { x: currentPos.x, y: currentPos.y };
        if (direction === "horizontal") rel.pos.y = snapVal(alignValue);
        else rel.pos.x = snapVal(alignValue);
      }

      const spec = parsedAST.specializations.find((n: any) => n.id === id);
      if (spec) {
        if (!spec.pos) spec.pos = { x: currentPos.x, y: currentPos.y };
        if (direction === "horizontal") spec.pos.y = snapVal(alignValue);
        else spec.pos.x = snapVal(alignValue);
      }
    });

    serializeAndSync();
  }

  if (btnAlignH) {
    btnAlignH.addEventListener("click", () => alignSelectedNodes("horizontal"));
  }
  if (btnAlignV) {
    btnAlignV.addEventListener("click", () => alignSelectedNodes("vertical"));
  }

  const splitter = document.getElementById("workspace-splitter") as HTMLDivElement;
  if (splitter && editorPanel) {
    let isSplitterDragging = false;
    
    splitter.addEventListener("mousedown", (e) => {
      isSplitterDragging = true;
      splitter.classList.add("dragging");
      document.body.style.cursor = "col-resize";
      e.preventDefault();
    });

    window.addEventListener("mousemove", (e) => {
      if (!isSplitterDragging) return;
      const workspace = document.querySelector(".workspace") as HTMLElement;
      if (workspace) {
        const rect = workspace.getBoundingClientRect();
        const offsetLeft = e.clientX - rect.left;
        const newWidth = Math.max(200, Math.min(800, offsetLeft));
        editorPanel.style.flex = `0 0 ${newWidth}px`;
      }
    });

    window.addEventListener("mouseup", () => {
      if (isSplitterDragging) {
        isSplitterDragging = false;
        splitter.classList.remove("dragging");
        document.body.style.cursor = "";
      }
    });
  }

  // Language Initialization
  const currentLang = initLanguage();
  if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener("change", () => {
      const newLang = langSelect.value as "pt-br" | "en";
      const oldLang = getLanguage();
      setLanguage(newLang);
      applyI18n();

      // If the editor still has the initial starter diagram of the other language, switch it
      const currentCode = editor.value.trim();
      if (oldLang === "pt-br" && (currentCode === DEFAULT_DIAGRAM_PT.trim() || !currentCode)) {
        editor.value = DEFAULT_DIAGRAM_EN;
        compileDiagram();
      } else if (oldLang === "en" && (currentCode === DEFAULT_DIAGRAM_EN.trim() || !currentCode)) {
        editor.value = DEFAULT_DIAGRAM_PT;
        compileDiagram();
      }
    });
  }

  // Load starter diagram if editor is empty
  if (!editor.value.trim()) {
    editor.value = currentLang === "pt-br" ? DEFAULT_DIAGRAM_PT : DEFAULT_DIAGRAM_EN;
  }

  applyI18n();

  // Initial compile run
  compileDiagram();
});
