import { ChenAST, Entity, Relationship, Specialization, Connection, Attribute, StyleOverride } from "./types";

function stringifyBracketMetadata(
  offset: [number, number] | null,
  style: any | null,
  dir: string | null,
  pos: { x: number; y: number } | null
): string {
  const parts: string[] = [];
  if (pos) {
    parts.push(`pos: ${pos.x}, ${pos.y}`);
  }
  if (offset) {
    parts.push(`offset: ${offset[0]}, ${offset[1]}`);
  }
  if (dir) {
    parts.push(`dir: ${dir}`);
  }
  if (style) {
    if (style.fill) {
      const f = String(style.fill);
      parts.push(f.startsWith('"') ? `fill: ${f}` : `fill: "${f}"`);
    }
    if (style.stroke) {
      const s = String(style.stroke);
      parts.push(s.startsWith('"') ? `stroke: ${s}` : `stroke: "${s}"`);
    }
    if (style.text) {
      const t = String(style.text);
      parts.push(t.startsWith('"') ? `text: ${t}` : `text: "${t}"`);
    }
    if (style.strokeWidth) parts.push(`strokeWidth: ${style.strokeWidth}`);
  }
  if (parts.length === 0) return "";
  return ` [${parts.join(", ")}]`;
}

function stringifyAttribute(attr: Attribute): string {
  let res = attr.id;
  if (attr.isKey) {
    res += " key";
  } else if (attr.isWeakKey) {
    res += " weak_key";
  } else if (attr.isMultivalued) {
    res += " multivalued";
  } else if (attr.isDerived) {
    res += " derived";
  } else if (attr.isComposite) {
    const childNames = attr.children.map(c => c.id).join(", ");
    res += ` composite(${childNames})`;
  }
  res += stringifyBracketMetadata(attr.offset, attr.style, null, null);
  return res;
}

export function stringifyAST(ast: ChenAST): string {
  const lines: string[] = ["chenER"];

  // 1. Configs
  if (ast.config) {
    for (const [key, value] of Object.entries(ast.config)) {
      if (value) {
        lines.push(`${key} ${value}`);
      }
    }
  }

  lines.push(""); // empty line after header/config

  // 2. Entities
  for (const ent of ast.entities) {
    let decl = ent.isWeak ? "weak_entity" : "entity";
    decl += ` ${ent.id}`;
    decl += stringifyBracketMetadata(ent.offset, ent.style, null, ent.pos || null);

    if (ent.attributes && ent.attributes.length > 0) {
      decl += " {\n" + ent.attributes.map(a => `  ${stringifyAttribute(a)}`).join("\n") + "\n}";
    }
    lines.push(decl);
  }

  if (ast.entities.length > 0) lines.push("");

  // 3. Relationships
  for (const rel of ast.relationships) {
    let decl = rel.isIdentifying ? "identifying_relationship" : "relationship";
    decl += ` ${rel.id}`;
    decl += stringifyBracketMetadata(rel.offset, rel.style, null, rel.pos || null);

    if (rel.attributes && rel.attributes.length > 0) {
      decl += " {\n" + rel.attributes.map(a => `  ${stringifyAttribute(a)}`).join("\n") + "\n}";
    }
    lines.push(decl);
  }

  if (ast.relationships.length > 0) lines.push("");

  // 4. Specializations
  for (const spec of ast.specializations) {
    let decl = `specialization ${spec.id}`;
    decl += stringifyBracketMetadata(null, null, null, spec.pos || null);
    decl += " {\n";
    decl += `  type: ${spec.type}\n`;
    decl += `  participation: ${spec.participation}\n`;
    if (spec.superclass) {
      decl += `  superclass: ${spec.superclass}\n`;
    }
    if (spec.subclasses && spec.subclasses.length > 0) {
      decl += `  subclasses: ${spec.subclasses.join(", ")}\n`;
    }
    decl += "}";
    lines.push(decl);
  }

  if (ast.specializations.length > 0) lines.push("");

  // 5. Connections
  for (const conn of ast.connections) {
    const op = conn.participation === "total" ? "==" : "--";
    let decl = `${conn.from} ${op} ${conn.to}`;
    
    if (conn.cardinality) {
      decl += ` : ${conn.cardinality}`;
    } else if (conn.role) {
      decl += ` : "${conn.role}"`;
    }
    
    decl += stringifyBracketMetadata(conn.labelOffset, conn.style, conn.dir || null, null);
    lines.push(decl);
  }

  return lines.join("\n").trim() + "\n";
}
