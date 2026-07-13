import { render, parseDSL, stringifyAST, layoutDiagram } from "../src/index";
import { StyleOverride, Attribute } from "../src/types";

document.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("dsl-editor") as HTMLTextAreaElement;
  const preview = document.getElementById("canvas-preview") as HTMLDivElement;
  const themeSelect = document.getElementById("theme-select") as HTMLSelectElement;
  const spacingSelect = document.getElementById("spacing-select") as HTMLSelectElement;
  const btnCopy = document.getElementById("btn-copy") as HTMLButtonElement;
  const btnExportSvg = document.getElementById("btn-export-svg") as HTMLButtonElement;
  
  const btnZoomIn = document.getElementById("btn-zoom-in") as HTMLButtonElement;
  const btnZoomOut = document.getElementById("btn-zoom-out") as HTMLButtonElement;
  const btnZoomReset = document.getElementById("btn-zoom-reset") as HTMLButtonElement;
  
  const btnUndo = document.getElementById("btn-undo") as HTMLButtonElement;
  const btnRedo = document.getElementById("btn-redo") as HTMLButtonElement;
  const chkSnap = document.getElementById("chk-snap") as HTMLInputElement;
  
  const btnToggleEditor = document.getElementById("btn-toggle-editor") as HTMLButtonElement;
  const editorPanel = document.getElementById("editor-panel") as HTMLElement;
  const inspectorContent = document.getElementById("inspector-content") as HTMLDivElement;
  const errorFooter = document.getElementById("error-footer") as HTMLElement;
  const btnCloseError = document.getElementById("btn-close-error") as HTMLButtonElement;
  const errorMessage = document.getElementById("error-message") as HTMLElement;

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  
  // Viewport Transform State (Panning and Zooming)
  let currentZoom = 1.0;
  let panX = 0;
  let panY = 0;
  let isPanning = false;
  let panStartX = 0;
  let panStartY = 0;

  // Undo/Redo Stacks
  const undoStack: string[] = [];
  const redoStack: string[] = [];

  // Visual Editor State
  let activeTool = "select";
  let selectedId: string | null = null;
  let selectedType: string | null = null;
  let selectedEdge: { from: string; to: string } | null = null;
  let parsedAST: any = null;

  // Drag-and-Drop Variables
  let isDragging = false;
  let dragGroup: SVGGElement | null = null;
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

  const gridSize = 20;

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
      if (layoutVal !== "default" && !newCode.includes("attribute_layout")) {
        lines.splice(1, 0, `attribute_layout ${layoutVal}`);
      }
    }
    
    editor.value = lines.join("\n");
    compileDiagram(skipInspectorUpdate);
  }

  // Input listener with a 250ms debounce
  editor.addEventListener("input", () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(compileDiagram, 250);
  });

  themeSelect.addEventListener("change", () => compileDiagram());
  spacingSelect.addEventListener("change", () => compileDiagram());

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
      
      // Reset selected states if adding new items
      if (activeTool !== "select") {
        clearSelection();
      }
    });
  });

  // Escape key cancels current tool or dragging
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      toolBtns.forEach(b => b.classList.remove("active"));
      const selectBtn = document.querySelector('[data-tool="select"]') as HTMLButtonElement;
      if (selectBtn) selectBtn.classList.add("active");
      activeTool = "select";
      
      if (isDrawingLink && guideLine) {
        guideLine.remove();
        guideLine = null;
        isDrawingLink = false;
      }
      isDragging = false;
      clearSelection();
    }
  });

  // Keyboard Delete / Backspace key triggers visual deletions
  window.addEventListener("keydown", (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.nodeName === "INPUT" || target.nodeName === "TEXTAREA" || target.isContentEditable) {
      return;
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      if (selectedId && selectedType) {
        recordState();
        if (selectedType === "entity" || selectedType === "weak_entity") {
          parsedAST.entities = parsedAST.entities.filter((x: any) => x.id !== selectedId);
          parsedAST.connections = parsedAST.connections.filter((c: any) => c.from !== selectedId && c.to !== selectedId);
          parsedAST.specializations = parsedAST.specializations.filter((s: any) => s.superclass !== selectedId && !s.subclasses.includes(selectedId));
        } else if (selectedType === "relationship" || selectedType === "identifying_relationship") {
          parsedAST.relationships = parsedAST.relationships.filter((x: any) => x.id !== selectedId);
          parsedAST.connections = parsedAST.connections.filter((c: any) => c.from !== selectedId && c.to !== selectedId);
        } else if (selectedType === "specialization") {
          parsedAST.specializations = parsedAST.specializations.filter((s: any) => s.id !== selectedId);
          parsedAST.connections = parsedAST.connections.filter((c: any) => c.from !== selectedId && c.to !== selectedId);
        } else if (selectedType === "attribute") {
          let parentId = "";
          let attrId = "";
          if (selectedId.includes("_attr_")) {
            const parts = selectedId.split("_attr_");
            parentId = parts[0];
            attrId = parts[1];
          }
          if (parentId && attrId) {
            const parent = parsedAST.entities.find((x: any) => x.id === parentId) || 
                           parsedAST.relationships.find((x: any) => x.id === parentId);
            if (parent) {
              parent.attributes = parent.attributes.filter((a: any) => a.id !== attrId);
            }
          }
        }
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
    updateVisualSelection();
    renderInspector();
  }

  function updateVisualSelection() {
    const svgEl = preview.querySelector("svg");
    if (!svgEl) return;

    svgEl.querySelectorAll(".node-group").forEach(g => {
      const id = g.getAttribute("data-id");
      if (id === selectedId) {
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
          l.style.stroke = "#00bcd4";
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

      if (activeTool !== "select") {
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
          const firstEnt = parsedAST.entities[0]?.id || "";
          parsedAST.specializations.push({
            id: `Spec_${uniqueNum}`,
            type: "disjoint",
            participation: "total",
            superclass: firstEnt,
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
      } else {
        // Handle canvas background drag panning initialization
        if (target === svgEl || target.id === "viewport-g" || target.classList.contains("grid-background") || target.nodeName === "svg") {
          isPanning = true;
          panStartX = e.clientX - panX;
          panStartY = e.clientY - panY;
          preview.style.cursor = "grabbing";
          e.preventDefault();
        }
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
          selectedId = id;
          selectedType = type;
          selectedEdge = null;
          updateVisualSelection();
          renderInspector();

          isDragging = true;
          dragGroup = nodeGroup;
          dragId = id;
          dragType = type;
          dragStartX = e.clientX;
          dragStartY = e.clientY;
          currentDx = 0;
          currentDy = 0;
        } else if (activeTool === "attribute" && type !== "attribute" && type !== "specialization") {
          // Add attribute tool click on parent
          recordState();
          const uniqueNum = Date.now().toString().slice(-3);
          const parent = parsedAST.entities.find((x: any) => x.id === id) || 
                         parsedAST.relationships.find((x: any) => x.id === id);
          if (parent) {
            parent.attributes.push({
              id: `attr_${uniqueNum}`,
              isKey: false,
              isWeakKey: false,
              isMultivalued: false,
              isDerived: false,
              isComposite: false,
              children: [],
              offset: null,
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
    if (isDragging && dragGroup) {
      currentDx = (e.clientX - dragStartX) / currentZoom;
      currentDy = (e.clientY - dragStartY) / currentZoom;
      dragGroup.setAttribute("transform", `translate(${currentDx}, ${currentDy})`);
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
    if (isDragging && dragGroup) {
      isDragging = false;
      dragGroup.removeAttribute("transform");
      
      if (Math.abs(currentDx) > 1 || Math.abs(currentDy) > 1) {
        recordState();
        
        // Retrieve layout positions to offset
        const graph = layoutDiagram(parsedAST);
        const positioned = graph.nodes.get(dragId);
        
        if (positioned) {
          const finalX = snapVal(positioned.x + currentDx);
          const finalY = snapVal(positioned.y + currentDy);

          // Update position in AST
          const ent = parsedAST.entities.find((n: any) => n.id === dragId);
          if (ent) ent.pos = { x: finalX, y: finalY };

          const rel = parsedAST.relationships.find((n: any) => n.id === dragId);
          if (rel) rel.pos = { x: finalX, y: finalY };

          const spec = parsedAST.specializations.find((n: any) => n.id === dragId);
          if (spec) spec.pos = { x: finalX, y: finalY };

          // Handle attribute offset dragging
          if (dragType === "attribute" && positioned.parent) {
            const parent = parsedAST.entities.find((n: any) => n.id === positioned.parent) || 
                           parsedAST.relationships.find((n: any) => n.id === positioned.parent);
            if (parent) {
              const attr = parent.attributes.find((a: any) => a.id === dragId);
              if (attr) {
                const currOffset = attr.offset || [0, 0];
                attr.offset = [
                  Math.round(currOffset[0] + currentDx),
                  Math.round(currOffset[1] + currentDy)
                ];
              }
            }
          }

          serializeAndSync();
        }
      }
      dragGroup = null;
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
      preview.style.cursor = "grab";
    }
  });

  // 4. Render Properties Inspector
  function renderInspector() {
    inspectorContent.innerHTML = "";

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
                <input type="checkbox" class="attr-key-checkbox" data-index="${idx}" ${a.isKey ? "checked" : ""} /> Key (🔑)
              </label>
              <label class="inspector-checkbox">
                <input type="checkbox" class="attr-weak-checkbox" data-index="${idx}" ${a.isWeakKey ? "checked" : ""} /> Weak Key
              </label>
              <label class="inspector-checkbox">
                <input type="checkbox" class="attr-multi-checkbox" data-index="${idx}" ${a.isMultivalued ? "checked" : ""} /> Multivalued
              </label>
              <label class="inspector-checkbox">
                <input type="checkbox" class="attr-derived-checkbox" data-index="${idx}" ${a.isDerived ? "checked" : ""} /> Derived
              </label>
            </div>
          `;
        }).join("");

        inspectorContent.innerHTML = `
          <div class="inspector-group">
            <label>Name</label>
            <input type="text" id="node-name" value="${ent.id}" />
          </div>
          <div class="inspector-group">
            <label class="inspector-checkbox">
              <input type="checkbox" id="entity-weak-chk" ${ent.isWeak ? "checked" : ""} /> Weak Entity
            </label>
          </div>
          <div class="tool-divider" style="margin: 10px 0;"></div>
          <div class="inspector-group">
            <label>Attributes</label>
            <div id="inspector-attrs" style="max-height: 250px; overflow-y: auto; margin-bottom: 8px;">
              ${attributesHTML || '<p style="font-size: 12px; color: var(--color-muted); text-align: center; margin: 10px 0;">No attributes</p>'}
            </div>
            <button id="btn-add-attr-panel" class="btn btn-sm btn-primary">+ Add Attribute</button>
          </div>
          <div class="tool-divider" style="margin: 15px 0;"></div>
          <button id="btn-delete-node" class="btn btn-sm" style="color: var(--error); border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.05); width: 100%;">Delete Entity</button>
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
          ent.attributes.push({
            id: `attr_${uniqueNum}`,
            isKey: false,
            isWeakKey: false,
            isMultivalued: false,
            isDerived: false,
            isComposite: false,
            children: [],
            offset: null,
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
            <label>Name</label>
            <input type="text" id="node-name" value="${rel.id}" />
          </div>
          <div class="inspector-group">
            <label class="inspector-checkbox">
              <input type="checkbox" id="rel-ident-chk" ${rel.isIdentifying ? "checked" : ""} /> Identifying Relationship
            </label>
          </div>
          <div class="tool-divider" style="margin: 15px 0;"></div>
          <button id="btn-delete-node" class="btn btn-sm" style="color: var(--error); border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.05); width: 100%;">Delete Relationship</button>
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
        const superclassOptions = parsedAST.entities.map((ent: any) => {
          const isSelected = ent.id === spec.superclass ? "selected" : "";
          return `<option value="${ent.id}" ${isSelected}>${ent.id}</option>`;
        }).join("");

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
            <label>Name</label>
            <input type="text" id="node-name" value="${spec.id}" />
          </div>
          <div class="inspector-group">
            <label>Disjunction Constraint</label>
            <select id="spec-type-select">
              <option value="disjoint" ${spec.type === "disjoint" ? "selected" : ""}>Disjoint (d)</option>
              <option value="overlapping" ${spec.type === "overlapping" ? "selected" : ""}>Overlapping (o)</option>
            </select>
          </div>
          <div class="inspector-group">
            <label>Participation</label>
            <select id="spec-part-select">
              <option value="partial" ${spec.participation === "partial" ? "selected" : ""}>Partial</option>
              <option value="total" ${spec.participation === "total" ? "selected" : ""}>Total (==)</option>
            </select>
          </div>
          <div class="inspector-group">
            <label>Superclass</label>
            <select id="spec-superclass-select">
              ${superclassOptions}
            </select>
          </div>
          <div class="inspector-group">
            <label>Subclasses</label>
            <div style="max-height: 120px; overflow-y: auto; padding: 6px; border: 1px solid var(--border-color); border-radius: 6px; background: rgba(0,0,0,0.15)">
              ${subclassChecklist || '<p style="font-size:12px; color:var(--color-muted)">No entities available</p>'}
            </div>
          </div>
          <div class="tool-divider" style="margin: 15px 0;"></div>
          <button id="btn-delete-node" class="btn btn-sm" style="color: var(--error); border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.05); width: 100%;">Delete Specialization</button>
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
        // Resolve attribute context dynamically mapping using qualified ID
        let parentId = "";
        let attrId = "";
        if (selectedId.includes("_attr_")) {
          const parts = selectedId.split("_attr_");
          parentId = parts[0];
          attrId = parts[1];
        }

        let attrParent: any = null;
        let attr: Attribute | null = null;

        if (parentId && attrId) {
          attrParent = parsedAST.entities.find((e: any) => e.id === parentId) || 
                       parsedAST.relationships.find((r: any) => r.id === parentId);
          if (attrParent) {
            attr = attrParent.attributes.find((a: any) => a.id === attrId);
          }
        }

        if (!attr) return;

        inspectorContent.innerHTML = `
          <div class="inspector-group">
            <label>Name</label>
            <input type="text" id="node-name" value="${attr.id}" />
          </div>
          <div class="inspector-group">
            <label>Constraints</label>
            <label class="inspector-checkbox">
              <input type="checkbox" id="attr-key-chk" ${attr.isKey ? "checked" : ""} /> Primary Key (🔑)
            </label>
            <label class="inspector-checkbox">
              <input type="checkbox" id="attr-weak-chk" ${attr.isWeakKey ? "checked" : ""} /> Partial Key (🗝️)
            </label>
            <label class="inspector-checkbox">
              <input type="checkbox" id="attr-multi-chk" ${attr.isMultivalued ? "checked" : ""} /> Multivalued (◯)
            </label>
            <label class="inspector-checkbox">
              <input type="checkbox" id="attr-derived-chk" ${attr.isDerived ? "checked" : ""} /> Derived (╌)
            </label>
          </div>
          <div class="tool-divider" style="margin: 15px 0;"></div>
          <button id="btn-delete-node" class="btn btn-sm" style="color: var(--error); border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.05); width: 100%;">Delete Attribute</button>
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
          if (attrParent && attr) {
            recordState();
            attrParent.attributes = attrParent.attributes.filter((a: any) => a.id !== attrId);
            clearSelection();
            serializeAndSync();
          }
        });
      }
    } else if (selectedEdge) {
      // B. Inspector for Connections (Edges)
      const conn = parsedAST.connections.find((c: any) => c.from === selectedEdge?.from && c.to === selectedEdge?.to);
      if (!conn) return;

      inspectorContent.innerHTML = `
        <div class="inspector-group">
          <label>Cardinality / Role</label>
          <input type="text" id="conn-label" value="${conn.cardinality || conn.role || ""}" placeholder="e.g. 1, N, M, or role" />
        </div>
        <div class="inspector-group">
          <label>Participation</label>
          <select id="conn-part-select">
            <option value="partial" ${conn.participation === "partial" ? "selected" : ""}>Partial (--)</option>
            <option value="total" ${conn.participation === "total" ? "selected" : ""}>Total (==)</option>
          </select>
        </div>
        <div class="inspector-group">
          <label>Layout Direction (dir)</label>
          <select id="conn-dir-select">
            <option value="" ${!conn.dir ? "selected" : ""}>None (Auto)</option>
            <option value="right" ${conn.dir === "right" ? "selected" : ""}>Right (➔)</option>
            <option value="left" ${conn.dir === "left" ? "selected" : ""}>Left (↞)</option>
            <option value="down" ${conn.dir === "down" ? "selected" : ""}>Down (▼)</option>
            <option value="up" ${conn.dir === "up" ? "selected" : ""}>Up (▲)</option>
          </select>
        </div>
        <div class="tool-divider" style="margin: 15px 0;"></div>
        <button id="btn-delete-edge" class="btn btn-sm" style="color: var(--error); border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.05); width: 100%;">Delete Link</button>
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
      inspectorContent.innerHTML = `<p class="empty-state">Select a node or connection line to inspect properties</p>`;
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

  // Mouse wheel zoom listener (Ctrl + Wheel)
  preview.addEventListener("wheel", (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const zoomFactor = 0.08;
      if (e.deltaY < 0) {
        currentZoom = Math.min(2.5, currentZoom + zoomFactor);
      } else {
        currentZoom = Math.max(0.5, currentZoom - zoomFactor);
      }
      applyTransform();
    }
  }, { passive: false });

  // Copy code to clipboard
  btnCopy.addEventListener("click", () => {
    navigator.clipboard.writeText(editor.value).then(() => {
      const originalText = btnCopy.textContent;
      btnCopy.textContent = "Copied!";
      btnCopy.classList.add("btn-primary");
      
      setTimeout(() => {
        btnCopy.textContent = originalText;
        btnCopy.classList.remove("btn-primary");
      }, 1500);
    });
  });

  // Export diagram as static SVG file download
  btnExportSvg.addEventListener("click", () => {
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

  // Initial compile run
  compileDiagram();
});
