import { render } from "../src/index";

document.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("dsl-editor") as HTMLTextAreaElement;
  const preview = document.getElementById("canvas-preview") as HTMLDivElement;
  const themeSelect = document.getElementById("theme-select") as HTMLSelectElement;
  const btnCopy = document.getElementById("btn-copy") as HTMLButtonElement;
  const btnExportSvg = document.getElementById("btn-export-svg") as HTMLButtonElement;
  const btnZoomReset = document.getElementById("btn-zoom-reset") as HTMLButtonElement;
  const errorFooter = document.getElementById("error-footer") as HTMLElement;
  const errorMessage = document.getElementById("error-message") as HTMLElement;

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Initialize Zoom state
  let currentZoom = 1.0;

  // Compile and render the diagram
  function compileDiagram() {
    const code = editor.value;
    const theme = themeSelect.value as any;

    try {
      // Render to SVG
      const svg = render(code, { theme });
      
      // Update DOM
      preview.innerHTML = svg;
      
      // Hide error footer on success
      errorFooter.classList.add("hidden");
      
      // Add zoom state to newly rendered SVG
      applyZoom();
    } catch (err: any) {
      // Show compiler error in the drawer
      errorMessage.textContent = err.message || String(err);
      errorFooter.classList.remove("hidden");
    }
  }

  // Input listener with a 250ms debounce
  editor.addEventListener("input", () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(compileDiagram, 250);
  });

  // Theme dropdown change listener
  themeSelect.addEventListener("change", compileDiagram);

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
      const svgContent = render(code, { theme });
      
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

  // Zoom manipulation
  function applyZoom() {
    const svgEl = preview.querySelector("svg");
    if (svgEl) {
      svgEl.style.transform = `scale(${currentZoom})`;
    }
  }

  // Zoom reset
  btnZoomReset.addEventListener("click", () => {
    currentZoom = 1.0;
    applyZoom();
  });

  // Canvas Mouse wheel zoom listener
  preview.addEventListener("wheel", (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const zoomFactor = 0.08;
      if (e.deltaY < 0) {
        currentZoom = Math.min(2.5, currentZoom + zoomFactor);
      } else {
        currentZoom = Math.max(0.5, currentZoom - zoomFactor);
      }
      applyZoom();
    }
  }, { passive: false });

  // Initial compile run
  compileDiagram();
});
