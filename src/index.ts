import { ChenAST, PositionedGraph, LayoutOptions, RenderOptions } from "./types";
import { parseDSL } from "./parser";
import { layoutDiagram } from "./layout";
import { renderSVG } from "./renderer";

/**
 * Parses, lays out, and renders a Chen ER diagram DSL code string into an SVG string.
 * @param code The Chen ER diagram DSL string.
 * @param options Combined options for layout and rendering overrides.
 * @returns The generated SVG document as a string.
 */
export function render(code: string, options?: LayoutOptions & RenderOptions): string {
  const ast = parseDSL(code);
  
  const layoutOpt: LayoutOptions = {
    layout: ast.config.layout || options?.layout || "default",
    ...options
  };
  
  const renderOpt: RenderOptions = {
    theme: ast.config.theme || options?.theme || "default",
    ...options
  };
  
  const graph = layoutDiagram(ast, layoutOpt);
  return renderSVG(graph, renderOpt);
}

export { parseDSL } from "./parser";
export { layoutDiagram } from "./layout";
export { renderSVG } from "./renderer";
export { stringifyAST } from "./serializer";
export * from "./types";
