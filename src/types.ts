export interface StyleOverride {
  fill?: string;
  stroke?: string;
  text?: string;
  strokeWidth?: number;
}

export interface Attribute {
  id: string;
  isKey: boolean;
  isWeakKey: boolean;
  isMultivalued: boolean;
  isDerived: boolean;
  isComposite: boolean;
  children: Attribute[];
  offset: [number, number] | null;
  style: StyleOverride | null;
  pos?: { x: number; y: number } | null;
}

export interface Entity {
  id: string;
  isWeak: boolean;
  attributes: Attribute[];
  offset: [number, number] | null;
  style: StyleOverride | null;
  pos?: { x: number; y: number } | null;
}

export interface Relationship {
  id: string;
  isIdentifying: boolean;
  attributes: Attribute[];
  offset: [number, number] | null;
  style: StyleOverride | null;
  pos?: { x: number; y: number } | null;
}

export interface Specialization {
  id: string;
  type: "disjoint" | "overlapping";
  participation: "partial" | "total";
  superclass: string;
  subclasses: string[];
  pos?: { x: number; y: number } | null;
}

export interface Connection {
  from: string;
  to: string;
  cardinality: string | null;
  participation: "partial" | "total";
  role: string | null;
  labelOffset: [number, number] | null;
  style: { stroke?: string; strokeWidth?: number } | null;
  dir?: "left" | "right" | "up" | "down" | null;
}

export interface DiagramConfig {
  theme?: "default" | "dark" | "forest" | "neutral";
  layout?: "default" | "force";
  attribute_layout?: "default" | "zigzag" | "classic" | "manual";
  [key: string]: any;
}

export interface ChenAST {
  config: DiagramConfig;
  entities: Entity[];
  relationships: Relationship[];
  specializations: Specialization[];
  connections: Connection[];
}

// Positioned layouts structure
export interface PositionedNode {
  id: string;
  type: "entity" | "weak_entity" | "relationship" | "identifying_relationship" | "specialization" | "attribute";
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  offset: [number, number] | null;
  style: StyleOverride | null;
  
  // Specific properties
  parent?: string; // For attributes (points to parent Entity or Relationship)
  attributeType?: "regular" | "key" | "weak_key" | "multivalued" | "derived";
  specializationType?: "disjoint" | "overlapping";
  participation?: "partial" | "total";
}

export interface PositionedEdge {
  from: string;
  to: string;
  points: { x: number; y: number }[];
  cardinality: string | null;
  participation: "partial" | "total";
  role: string | null;
  labelOffset: [number, number] | null;
  style: { stroke?: string; strokeWidth?: number } | null;
}

export interface PositionedGraph {
  minX?: number;
  minY?: number;
  width: number;
  height: number;
  nodes: Map<string, PositionedNode>;
  edges: PositionedEdge[];
}

export interface LayoutOptions {
  layout?: "default" | "force";
  attributeRadius?: number;
  attributeSpacing?: number;
  attribute_layout?: "default" | "zigzag" | "classic" | "manual";
}

export interface RenderOptions {
  theme?: "default" | "dark" | "forest" | "neutral";
  interactive?: boolean;
}
