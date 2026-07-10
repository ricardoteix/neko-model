import { describe, test, expect } from "vitest";
import { parseDSL, ParseError } from "./parser";

describe("Chen ER DSL Parser Tests", () => {
  test("Should parse a simple diagram", () => {
    const dsl = `
      chenER
      theme dark
      layout default
      attribute_layout zigzag

      entity Customer {
        id key
        name
      }

      relationship Places

      Customer -- Places : "1"
    `;

    const ast = parseDSL(dsl);

    expect(ast.config.theme).toBe("dark");
    expect(ast.config.layout).toBe("default");
    expect(ast.config.attribute_layout).toBe("zigzag");
    expect(ast.entities).toHaveLength(1);
    expect(ast.entities[0].id).toBe("Customer");
    expect(ast.entities[0].attributes).toHaveLength(2);
    expect(ast.entities[0].attributes[0].id).toBe("id");
    expect(ast.entities[0].attributes[0].isKey).toBe(true);
    expect(ast.entities[0].attributes[1].id).toBe("name");
    expect(ast.entities[0].attributes[1].isKey).toBe(false);

    expect(ast.relationships).toHaveLength(1);
    expect(ast.relationships[0].id).toBe("Places");

    expect(ast.connections).toHaveLength(1);
    expect(ast.connections[0].from).toBe("Customer");
    expect(ast.connections[0].to).toBe("Places");
    expect(ast.connections[0].cardinality).toBe("1");
    expect(ast.connections[0].participation).toBe("partial");
  });

  test("Should parse weak entities and identifying relationships", () => {
    const dsl = `
      chenER
      weak_entity Dependent {
        dep_name weak_key
      }
      identifying_relationship Has
      Dependent == Has : "N"
    `;

    const ast = parseDSL(dsl);

    expect(ast.entities).toHaveLength(1);
    expect(ast.entities[0].id).toBe("Dependent");
    expect(ast.entities[0].isWeak).toBe(true);
    expect(ast.entities[0].attributes[0].isWeakKey).toBe(true);

    expect(ast.relationships).toHaveLength(1);
    expect(ast.relationships[0].id).toBe("Has");
    expect(ast.relationships[0].isIdentifying).toBe(true);

    expect(ast.connections).toHaveLength(1);
    expect(ast.connections[0].participation).toBe("total");
    expect(ast.connections[0].cardinality).toBe("N");
  });

  test("Should parse attribute modifiers and composite structures", () => {
    const dsl = `
      chenER
      entity Customer {
        age derived
        phones multivalued
        address composite(street, number, zipcode)
      }
    `;

    const ast = parseDSL(dsl);
    const attrs = ast.entities[0].attributes;

    expect(attrs).toHaveLength(3);
    expect(attrs[0].id).toBe("age");
    expect(attrs[0].isDerived).toBe(true);

    expect(attrs[1].id).toBe("phones");
    expect(attrs[1].isMultivalued).toBe(true);

    expect(attrs[2].id).toBe("address");
    expect(attrs[2].isComposite).toBe(true);
    expect(attrs[2].children).toHaveLength(3);
    expect(attrs[2].children[0].id).toBe("street");
    expect(attrs[2].children[1].id).toBe("number");
    expect(attrs[2].children[2].id).toBe("zipcode");
  });

  test("Should parse bracket metadata (offsets and custom styling)", () => {
    const dsl = `
      chenER
      entity Customer [offset: 10, -50, fill: red, stroke: "#333"] {
        name [offset: -20, 20, fill: "blue", text: "#fff"]
      }
      relationship Places [offset: 0, 100]
      Customer -- Places [offset: 5, 5, stroke: "#ff0000"]
    `;

    const ast = parseDSL(dsl);

    const entity = ast.entities[0];
    expect(entity.offset).toEqual([10, -50]);
    expect(entity.style?.fill).toBe("red");
    expect(entity.style?.stroke).toBe("#333");

    const attr = entity.attributes[0];
    expect(attr.offset).toEqual([-20, 20]);
    expect(attr.style?.fill).toBe("blue");
    expect(attr.style?.text).toBe("#fff");

    const rel = ast.relationships[0];
    expect(rel.offset).toEqual([0, 100]);

    const conn = ast.connections[0];
    expect(conn.labelOffset).toEqual([5, 5]);
    expect(conn.style?.stroke).toBe("#ff0000");
  });

  test("Should parse specializations", () => {
    const dsl = `
      chenER
      specialization EmployeeType {
        type: disjoint
        participation: total
        superclass: Employee
        subclasses: Manager, Technician, Secretary
      }
    `;

    const ast = parseDSL(dsl);
    expect(ast.specializations).toHaveLength(1);
    
    const spec = ast.specializations[0];
    expect(spec.id).toBe("EmployeeType");
    expect(spec.type).toBe("disjoint");
    expect(spec.participation).toBe("total");
    expect(spec.superclass).toBe("Employee");
    expect(spec.subclasses).toEqual(["Manager", "Technician", "Secretary"]);
  });

  test("Should throw syntax errors with correct line and column info", () => {
    const dsl = `
      chenER
      entity Customer {
        name key :
      }
    `;

    expect(() => parseDSL(dsl)).toThrow(ParseError);
    try {
      parseDSL(dsl);
    } catch (e: any) {
      expect(e).toBeInstanceOf(ParseError);
      expect(e.line).toBe(4);
      expect(e.col).toBe(18); // columns around the colon
    }
  });
});
