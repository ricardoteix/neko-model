import { describe, test, expect } from "vitest";
import { parseDSL } from "./parser";
import { stringifyAST } from "./serializer";

describe("Chen ER DSL Serializer Tests", () => {
  test("Should serialize simple entity and relationship", () => {
    const dsl = `chenER
theme dark
layout default

entity Customer {
  id key
  name
}

relationship Places

Customer -- Places : "1"`;

    const ast = parseDSL(dsl);
    const serialized = stringifyAST(ast);

    // Round-trip parse check
    const ast2 = parseDSL(serialized);
    expect(ast2.config.theme).toBe("dark");
    expect(ast2.config.layout).toBe("default");
    expect(ast2.entities).toHaveLength(1);
    expect(ast2.entities[0].id).toBe("Customer");
    expect(ast2.entities[0].attributes).toHaveLength(2);
    expect(ast2.relationships).toHaveLength(1);
    expect(ast2.relationships[0].id).toBe("Places");
    expect(ast2.connections).toHaveLength(1);
  });

  test("Should serialize pos overrides on nodes", () => {
    const dsl = `chenER

entity Customer [pos: 100, 200] {
  id key
}

relationship Places [pos: -50, 60]

specialization EmployeeType [pos: 300, 400] {
  type: disjoint
  participation: total
  superclass: Employee
  subclasses: Manager, Technician
}

Customer -- Places`;

    const ast = parseDSL(dsl);
    const serialized = stringifyAST(ast);

    expect(serialized).toContain("entity Customer [pos: 100, 200]");
    expect(serialized).toContain("relationship Places [pos: -50, 60]");
    expect(serialized).toContain("specialization EmployeeType [pos: 300, 400]");

    const ast2 = parseDSL(serialized);
    expect(ast2.entities[0].pos).toEqual({ x: 100, y: 200 });
    expect(ast2.relationships[0].pos).toEqual({ x: -50, y: 60 });
    expect(ast2.specializations[0].pos).toEqual({ x: 300, y: 400 });
  });

  test("Should serialize connections and specializations details", () => {
    const dsl = `chenER

specialization Job {
  type: overlapping
  participation: total
  superclass: Employee
  subclasses: Intern, Hourly
}

Employee == Job [stroke: "#000", strokeWidth: 2]`;

    const ast = parseDSL(dsl);
    const serialized = stringifyAST(ast);

    expect(serialized).toContain("type: overlapping");
    expect(serialized).toContain("participation: total");
    expect(serialized).toContain("superclass: Employee");
    expect(serialized).toContain("subclasses: Intern, Hourly");
    expect(serialized).toContain('Employee == Job [stroke: "#000", strokeWidth: 2]');

    const ast2 = parseDSL(serialized);
    expect(ast2.specializations[0].type).toBe("overlapping");
    expect(ast2.specializations[0].participation).toBe("total");
    expect(ast2.connections[0].participation).toBe("total");
    expect(ast2.connections[0].style?.strokeWidth).toBe(2);
  });

  test("Should serialize cardinalities without quotes and roles with quotes", () => {
    const dsl = `chenER
entity Customer
relationship Places
Customer -- Places : 1 [dir: right]
Places == Customer : "manages"`;

    const ast = parseDSL(dsl);
    const serialized = stringifyAST(ast);

    expect(serialized).toContain("Customer -- Places : 1 [dir: right]");
    expect(serialized).toContain('Places == Customer : "manages"');

    const ast2 = parseDSL(serialized);
    expect(ast2.connections[0].cardinality).toBe("1");
    expect(ast2.connections[1].role).toBe("manages");
  });

  test("Should serialize attribute pos and offset in manual layout mode", () => {
    const dsl = `chenER
attribute_layout manual

entity Customer [pos: 100, 200] {
  id key [offset: 0, -80]
  email [pos: 150, 250]
}`;

    const ast = parseDSL(dsl);
    const serialized = stringifyAST(ast);

    expect(serialized).toContain("attribute_layout manual");
    expect(serialized).toContain("id key [offset: 0, -80]");
    expect(serialized).toContain("email [pos: 150, 250]");

    const ast2 = parseDSL(serialized);
    expect(ast2.config.attribute_layout).toBe("manual");
    expect(ast2.entities[0].attributes[0].offset).toEqual([0, -80]);
    expect(ast2.entities[0].attributes[1].pos).toEqual({ x: 150, y: 250 });
  });
});
