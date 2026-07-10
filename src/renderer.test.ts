import { describe, test, expect } from "vitest";
import { render } from "./index";

describe("Chen ER Renderer Tests", () => {
  test("Should render a full diagram from DSL to SVG with CSS variables", () => {
    const dsl = `
      chenER
      theme dark
      
      entity Customer [fill: red] {
        name key
        phones multivalued
      }
      
      weak_entity Order
      relationship Places
      
      Customer == Places : "1"
      Places -- Order : "N"
    `;

    const svg = render(dsl);

    // Should output a valid SVG document
    expect(svg).toContain("<svg");
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain("</svg>");

    // Should contain styling stylesheet
    expect(svg).toContain("<style>");
    expect(svg).toContain("--chen-bg");

    // Should render Customer entity with custom fill inline style override
    expect(svg).toContain('class="chen-entity" style="fill: red;"');

    // Should contain primary key styles and class
    expect(svg).toContain('class="chen-attribute-key"');
    expect(svg).toContain('class="chen-text chen-attribute-key-text"');

    // Should contain multivalued double-border ellipses
    expect(svg).toContain('class="chen-attribute-double-outer"');
    expect(svg).toContain('class="chen-attribute-double-inner"');

    // Should contain weak entity rectangles
    expect(svg).toContain('class="chen-weak-entity-outer"');
    expect(svg).toContain('class="chen-weak-entity-inner"');

    // Should contain relationship polygon
    expect(svg).toContain('class="chen-relationship"');

    // Should render double line (total participation) for Customer == Places
    // Expecting multiple line elements under edge group
    expect(svg).toContain('<line x1="');
  });

  test("Should render specialization disjoint and total participation as a triangle polygon with shorthand labels", () => {
    const dsl = `
      chenER
      specialization EmployeeType {
        type: disjoint
        participation: total
        superclass: Employee
        subclasses: Manager
      }
      entity Employee
      entity Manager
    `;

    const svg = render(dsl);

    // Should contain a polygon (representing the triangle) for the specialization node
    expect(svg).toContain("<polygon points=");
    // Should contain the shorthand constraint label (t, d)
    expect(svg).toContain("(t, d)");
    
    // Should contain defs arrow definition
    expect(svg).toContain('<marker id="chen-arrow"');
    // Should contain lines with marker-end attribute pointing to specialization triangle
    expect(svg).toContain('marker-end="url(#chen-arrow)"');
  });

  test("Should inject theme variables correctly based on selected theme", () => {
    const dsl = `
      chenER
      theme forest
      entity Employee
    `;

    const svg = render(dsl);
    
    // Forest theme should inject specific forest colors
    expect(svg).toContain("--chen-entity-fill: #e8f5e9");
    expect(svg).toContain("--chen-entity-stroke: #2e7d32");
    expect(svg).toContain("--chen-attribute-key-fill: #f0e68c");
  });
});
