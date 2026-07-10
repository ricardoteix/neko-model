import { describe, test, expect } from "vitest";
import { parseDSL } from "./parser";
import { layoutDiagram } from "./layout";

describe("Chen ER Layout Manager Tests", () => {
  test("Should compute coordinates for core nodes and normalize to positive boundaries", () => {
    const dsl = `
      chenER
      entity Customer
      relationship Places
      Customer -- Places
    `;

    const ast = parseDSL(dsl);
    const graph = layoutDiagram(ast);

    // Should have Customer and Places
    expect(graph.nodes.has("Customer")).toBe(true);
    expect(graph.nodes.has("Places")).toBe(true);

    const entNode = graph.nodes.get("Customer")!;
    const relNode = graph.nodes.get("Places")!;

    // Coordinates should be valid numbers
    expect(typeof entNode.x).toBe("number");
    expect(typeof entNode.y).toBe("number");
    expect(typeof relNode.x).toBe("number");
    expect(typeof relNode.y).toBe("number");

    // Graph bounds should be initialized and contain padding
    expect(graph.width).toBeGreaterThan(200);
    expect(graph.height).toBeGreaterThan(200);

    // Coordinates should be normalized (all positive and within boundaries)
    for (const node of graph.nodes.values()) {
      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.y).toBeGreaterThanOrEqual(0);
      expect(node.x).toBeLessThanOrEqual(graph.width);
      expect(node.y).toBeLessThanOrEqual(graph.height);
    }
  });

  test("Should position attribute satellites radially around parent node", () => {
    const dsl = `
      chenER
      entity Customer {
        name
      }
    `;

    const ast = parseDSL(dsl);
    const graph = layoutDiagram(ast, { attributeRadius: 100 });

    const parentId = "Customer";
    const attrId = "Customer_attr_name";

    expect(graph.nodes.has(parentId)).toBe(true);
    expect(graph.nodes.has(attrId)).toBe(true);

    const parent = graph.nodes.get(parentId)!;
    const attr = graph.nodes.get(attrId)!;

    // Distance between attribute and its parent should equal the attributeRadius (100)
    const dx = attr.x - parent.x;
    const dy = attr.y - parent.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Expect distance to be approximately 100px (accounting for floating point precision)
    expect(distance).toBeCloseTo(100, 1);
  });

  test("Should apply post-processing offset offsets to nodes", () => {
    const dsl = `
      chenER
      entity Customer [offset: 50, -30] {
        name [offset: 10, 15]
      }
    `;

    const ast = parseDSL(dsl);

    // Let's first run the layout
    const graph = layoutDiagram(ast);

    const customer = graph.nodes.get("Customer")!;
    const name = graph.nodes.get("Customer_attr_name")!;

    // We can also compute a layout manually to compare, but since we know the offsets:
    // the node has an offset: [50, -30]
    expect(customer.offset).toEqual([50, -30]);
    expect(name.offset).toEqual([10, 15]);
  });

  test("Should layer attributes in concentric rings if count exceeds 3", () => {
    const dsl = `
      chenER
      entity Customer {
        attr1
        attr2
        attr3
        attr4
        attr5
      }
    `;

    const ast = parseDSL(dsl);
    const graph = layoutDiagram(ast, { attributeRadius: 100 });

    const parent = graph.nodes.get("Customer")!;

    // Calculate distances from parent for each attribute
    const distances = [1, 2, 3, 4, 5].map((idx) => {
      const attr = graph.nodes.get(`Customer_attr_attr${idx}`)!;
      const dx = attr.x - parent.x;
      const dy = attr.y - parent.y;
      return Math.sqrt(dx * dx + dy * dy);
    });

    // Check that we have 3 attributes at distance ~100 (layer 0)
    // and 2 attributes at distance ~135 (layer 1)
    const layer0Count = distances.filter((d) => Math.abs(d - 100) < 1).length;
    const layer1Count = distances.filter((d) => Math.abs(d - 135) < 1).length;

    expect(layer0Count).toBe(3);
    expect(layer1Count).toBe(2);
  });

  test("Should update connection line endpoints to match final offset-adjusted node positions", () => {
    const dsl = `
      chenER
      entity Customer [offset: 50, -30]
      relationship Places
      Customer -- Places
    `;

    const ast = parseDSL(dsl);
    const graph = layoutDiagram(ast);

    const customer = graph.nodes.get("Customer")!;
    const places = graph.nodes.get("Places")!;
    
    // Find the edge Customer -- Places
    const edge = graph.edges.find((e) => e.from === "Customer" && e.to === "Places")!;
    
    // The line start and end should match exactly the final shifted centers of the nodes
    expect(edge.points[0].x).toBeCloseTo(customer.x, 1);
    expect(edge.points[0].y).toBeCloseTo(customer.y, 1);
    expect(edge.points[1].x).toBeCloseTo(places.x, 1);
    expect(edge.points[1].y).toBeCloseTo(places.y, 1);
  });

  test("Should calculate dynamic attribute oval widths based on label text length", () => {
    const dsl = `
      chenER
      entity Customer {
        short
        very_long_attribute_name_to_test_dynamic_width
      }
    `;

    const ast = parseDSL(dsl);
    const graph = layoutDiagram(ast);

    const shortAttr = graph.nodes.get("Customer_attr_short")!;
    const longAttr = graph.nodes.get("Customer_attr_very_long_attribute_name_to_test_dynamic_width")!;

    // Normal attribute width base is 80 (since 'short' has length 5, max(80, 5*8+15) is 80)
    expect(shortAttr.width).toBe(80);
    // Long attribute width should scale up (46 characters * 8 + 15 = 383)
    expect(longAttr.width).toBeGreaterThan(150);
  });
});
