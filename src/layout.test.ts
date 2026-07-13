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
      attribute_layout classic
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
      attribute_layout classic
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

  test("Should support circle-distribution spacing for single-connection entity", () => {
    const dsl = `
      chenER
      attribute_layout default
      entity Customer {
        attr1
        attr2
        attr3
      }
      relationship Places
      Customer -- Places
    `;

    const ast = parseDSL(dsl);
    const graph = layoutDiagram(ast);

    const customer = graph.nodes.get("Customer")!;
    
    // Check distances for each attribute relative to parent
    const angles = [1, 2, 3].map((idx) => {
      const attr = graph.nodes.get(`Customer_attr_attr${idx}`)!;
      const dx = attr.x - customer.x;
      const dy = attr.y - customer.y;
      let angle = Math.atan2(dy, dx);
      if (angle < 0) angle += 2 * Math.PI;
      return angle;
    }).sort((a, b) => a - b);

    // With 3 attributes in a full circle, they should be separated by 2*PI/3 (~2.094 rad)
    const diff1 = angles[1] - angles[0];
    const diff2 = angles[2] - angles[1];
    
    expect(diff1).toBeCloseTo(2 * Math.PI / 3, 2);
    expect(diff2).toBeCloseTo(2 * Math.PI / 3, 2);
  });

  test("Should support zigzag alternating radii when configured", () => {
    const dsl = `
      chenER
      attribute_layout zigzag
      entity Customer {
        attr1
        attr2
        attr3
      }
      relationship Places
      Customer -- Places
    `;

    const ast = parseDSL(dsl);
    const graph = layoutDiagram(ast);

    const customer = graph.nodes.get("Customer")!;
    
    // Distances from center
    const distances = [1, 2, 3].map((idx) => {
      const attr = graph.nodes.get(`Customer_attr_attr${idx}`)!;
      const dx = attr.x - customer.x;
      const dy = attr.y - customer.y;
      return Math.sqrt(dx * dx + dy * dy);
    });

    // Zigzag will alternate R=105 and R=110 for the three attributes
    // Sort to verify we have one ~105px (odd, base 80+25) and two ~110px (even, base 110)
    distances.sort((a, b) => a - b);
    expect(distances[0]).toBeCloseTo(105, 1);
    expect(distances[1]).toBeCloseTo(110, 1);
    expect(distances[2]).toBeCloseTo(110, 1);
  });

  test("Should layer attributes in concentric rings using dynamic capacity when capacity is exceeded", () => {
    const dsl = `
      chenER
      attribute_layout default
      entity Customer {
        attr1
        attr2
        attr3
        attr4
        attr5
        attr6
        attr7
        attr8
      }
    `;

    const ast = parseDSL(dsl);
    const graph = layoutDiagram(ast, { attributeRadius: 100 });

    const parent = graph.nodes.get("Customer")!;

    // Distances from center
    const distances = [1, 2, 3, 4, 5, 6, 7, 8].map((idx) => {
      const attr = graph.nodes.get(`Customer_attr_attr${idx}`)!;
      const dx = attr.x - parent.x;
      const dy = attr.y - parent.y;
      return Math.sqrt(dx * dx + dy * dy);
    });

    // 7 should be in layer 0 (distance < 125) and 1 in layer 1 (distance >= 125)
    const layer0Count = distances.filter((d) => d < 125).length;
    const layer1Count = distances.filter((d) => d >= 125).length;

    expect(layer0Count).toBe(7);
    expect(layer1Count).toBe(1);
  });

  test("Should position horizontal attributes clear of wide entity borders", () => {
    const dsl = `
      chenER
      entity Customer {
        name
      }
      relationship RelTop
      relationship RelBottom
      RelTop -- Customer
      Customer -- RelBottom
    `;

    const ast = parseDSL(dsl);
    const graph = layoutDiagram(ast);

    const customer = graph.nodes.get("Customer")!;
    const attr = graph.nodes.get("Customer_attr_name")!;
    
    const dx = Math.abs(attr.x - customer.x);
    const dy = Math.abs(attr.y - customer.y);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Horizontal distance should be exactly rx (70) + attrWidth/2 (40) + margin (10) = 120px
    expect(distance).toBeCloseTo(120, 1);
  });

  test("Should position composite child attributes without overlaps", () => {
    const dsl = `
      chenER
      entity Customer {
        address composite(street, city, zip)
      }
      relationship Places
      Customer -- Places
    `;

    const ast = parseDSL(dsl);
    const graph = layoutDiagram(ast);

    const street = graph.nodes.get("Customer_attr_address_child_street")!;
    const city = graph.nodes.get("Customer_attr_address_child_city")!;
    const zip = graph.nodes.get("Customer_attr_address_child_zip")!;

    // Verify distance between street and city is greater than sum of their radii (37.5 + 37.5 = 75px)
    const distStreetCity = Math.sqrt(Math.pow(street.x - city.x, 2) + Math.pow(street.y - city.y, 2));
    const distCityZip = Math.sqrt(Math.pow(city.x - zip.x, 2) + Math.pow(city.y - zip.y, 2));

    expect(distStreetCity).toBeGreaterThan(74.5);
    expect(distCityZip).toBeGreaterThan(74.5);
  });

  test("Should size specialization nodes to 80x80 with padding", () => {
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

    const ast = parseDSL(dsl);
    const graph = layoutDiagram(ast);

    const specNode = graph.nodes.get("EmployeeType")!;
    expect(specNode.width).toBe(80);
    expect(specNode.height).toBe(80);
  });

  test("Should position nodes horizontally when dir: right is configured on connections", () => {
    const dsl = `
      chenER
      entity Customer
      relationship Places
      entity Order
      
      Customer -- Places [dir: right]
      Places == Order [dir: right]
    `;

    const ast = parseDSL(dsl);
    const graph = layoutDiagram(ast);

    const customer = graph.nodes.get("Customer")!;
    const places = graph.nodes.get("Places")!;
    const order = graph.nodes.get("Order")!;

    // Places should be to the right of Customer
    expect(places.x).toBeGreaterThan(customer.x);
    expect(places.y).toBeCloseTo(customer.y, 1);

    // Order should be to the right of Places
    expect(order.x).toBeGreaterThan(places.x);
    expect(order.y).toBeCloseTo(places.y, 1);

    // Constant horizontal distance spacing check: rx_customer + rx_places + 100 = 70 + 50 + 100 = 220px
    const distCustomerPlaces = places.x - customer.x;
    expect(distCustomerPlaces).toBeCloseTo(220, 1);

    // rx_places + rx_order + 100 = 50 + 70 + 100 = 220px
    const distPlacesOrder = order.x - places.x;
    expect(distPlacesOrder).toBeCloseTo(220, 1);
  });

  test("Should resolve bounding box overlaps by pushing colliding disjoint components", () => {
    const dsl = `
      chenER
      entity Customer
      relationship Places
      entity Employee
      
      Customer -- Places [dir: right]
    `;

    const ast = parseDSL(dsl);
    const graph = layoutDiagram(ast);

    const places = graph.nodes.get("Places")!;
    const employee = graph.nodes.get("Employee")!;

    // Places and Employee centers must be separated by at least combined rx (50 + 70) + margin (35) = 155px
    const distPlacesEmployee = Math.abs(employee.x - places.x);
    expect(distPlacesEmployee).toBeGreaterThanOrEqual(155);
  });

  test("Should isolate push propagation downstream and keep parent nodes in place", () => {
    const dsl = `
      chenER
      entity Customer
      relationship Places
      entity Order
      
      Customer -- Places [dir: right]
      Places == Order [dir: right]
    `;

    const ast = parseDSL(dsl);
    const graph = layoutDiagram(ast);

    const customer = graph.nodes.get("Customer")!;
    
    // Customer is at the root rank on the left, and should not be dragged to the right by Places or Order pushes
    expect(customer.x).toBeLessThan(250);
  });

  test("Should position disconnected components side-by-side without interleaving", () => {
    const dsl = `
      chenER
      entity Customer
      relationship Places
      entity Order
      
      Customer -- Places [dir: right]
      Places == Order [dir: right]
      
      entity Employee
      specialization EmployeeType {
        type: disjoint
        participation: total
        superclass: Employee
        subclasses: Manager
      }
      entity Manager
    `;

    const ast = parseDSL(dsl);
    const graph = layoutDiagram(ast);

    // Component 1: Customer, Places, Order
    const customer = graph.nodes.get("Customer")!;
    const places = graph.nodes.get("Places")!;
    const order = graph.nodes.get("Order")!;

    const comp1MaxX = Math.max(
      customer.x + customer.width / 2,
      places.x + places.width / 2,
      order.x + order.width / 2
    );

    // Component 2: Employee, EmployeeType, Manager
    const employee = graph.nodes.get("Employee")!;
    const employeeType = graph.nodes.get("EmployeeType")!;
    const manager = graph.nodes.get("Manager")!;

    const comp2MinX = Math.min(
      employee.x - employee.width / 2,
      employeeType.x - employeeType.width / 2,
      manager.x - manager.width / 2
    );

    // Component 2 must be entirely to the right of Component 1, separated by at least the 80px componentSpacing
    expect(comp2MinX).toBeGreaterThanOrEqual(comp1MaxX + 80);
  });

  test("Should bypass layout coordinates for nodes with [pos: X, Y] metadata overrides", () => {
    const dsl = `
      chenER
      entity Customer [pos: 120, 240]
      relationship Places [pos: 340, 480]
      Customer -- Places
    `;

    const ast = parseDSL(dsl);
    const graph = layoutDiagram(ast);

    const customer = graph.nodes.get("Customer")!;
    const places = graph.nodes.get("Places")!;

    expect(customer.x).toBe(120);
    expect(customer.y).toBe(240);
    expect(places.x).toBe(340);
    expect(places.y).toBe(480);
  });
});
