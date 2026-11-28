import { ChenAST, Entity, Relationship, Attribute, Connection, Specialization, StyleOverride, DiagramConfig } from "./types";

export class ParseError extends Error {
  constructor(
    public message: string,
    public line: number,
    public col: number
  ) {
    super(`Syntax Error: ${message} at line ${line}, column ${col}`);
    this.name = "ParseError";
  }
}

export interface Token {
  type:
    | "HEADER"
    | "CONFIG"
    | "ENTITY"
    | "WEAK_ENTITY"
    | "RELATIONSHIP"
    | "IDENTIFYING_RELATIONSHIP"
    | "SPECIALIZATION"
    | "KEY"
    | "WEAK_KEY"
    | "MULTIVALUED"
    | "DERIVED"
    | "COMPOSITE"
    | "IDENTIFIER"
    | "STRING"
    | "NUMBER"
    | "COLON"
    | "COMMA"
    | "BRACE_OPEN"
    | "BRACE_CLOSE"
    | "BRACKET_OPEN"
    | "BRACKET_CLOSE"
    | "PAREN_OPEN"
    | "PAREN_CLOSE"
    | "LINK_PARTIAL"
    | "LINK_TOTAL"
    | "EOF";
  value: string;
  line: number;
  col: number;
}

export class Lexer {
  private pos = 0;
  private line = 1;
  private col = 1;

  constructor(private input: string) {}

  private peek(offset = 0): string {
    const idx = this.pos + offset;
    return idx < this.input.length ? this.input[idx] : "";
  }

  private advance(count = 1) {
    for (let i = 0; i < count; i++) {
      if (this.pos >= this.input.length) break;
      const char = this.input[this.pos];
      this.pos++;
      if (char === "\n") {
        this.line++;
        this.col = 1;
      } else {
        this.col++;
      }
    }
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.pos < this.input.length) {
      const char = this.peek();

      // Skip whitespace
      if (/\s/.test(char)) {
        this.advance();
        continue;
      }

      // Skip line comments
      if (char === "%" && this.peek(1) === "%") {
        this.advance(2);
        while (this.pos < this.input.length && this.peek() !== "\n" && this.peek() !== "\r") {
          this.advance();
        }
        continue;
      }

      const startLine = this.line;
      const startCol = this.col;

      // Braces, Brackets, Parentheses, Punctuation
      if (char === "{") {
        tokens.push({ type: "BRACE_OPEN", value: "{", line: startLine, col: startCol });
        this.advance();
        continue;
      }
      if (char === "}") {
        tokens.push({ type: "BRACE_CLOSE", value: "}", line: startLine, col: startCol });
        this.advance();
        continue;
      }
      if (char === "[") {
        tokens.push({ type: "BRACKET_OPEN", value: "[", line: startLine, col: startCol });
        this.advance();
        continue;
      }
      if (char === "]") {
        tokens.push({ type: "BRACKET_CLOSE", value: "]", line: startLine, col: startCol });
        this.advance();
        continue;
      }
      if (char === "(") {
        tokens.push({ type: "PAREN_OPEN", value: "(", line: startLine, col: startCol });
        this.advance();
        continue;
      }
      if (char === ")") {
        tokens.push({ type: "PAREN_CLOSE", value: ")", line: startLine, col: startCol });
        this.advance();
        continue;
      }
      if (char === ":") {
        tokens.push({ type: "COLON", value: ":", line: startLine, col: startCol });
        this.advance();
        continue;
      }
      if (char === ",") {
        tokens.push({ type: "COMMA", value: ",", line: startLine, col: startCol });
        this.advance();
        continue;
      }

      // Multi-character link operators: partial (--) and total (==)
      if (char === "-") {
        let len = 0;
        while (this.peek(len) === "-") {
          len++;
        }
        if (len >= 2) {
          const val = this.input.slice(this.pos, this.pos + len);
          tokens.push({ type: "LINK_PARTIAL", value: val, line: startLine, col: startCol });
          this.advance(len);
          continue;
        }
        // If it's a single '-' followed by a number, parse it as a negative number
        if (/\d/.test(this.peek(1))) {
          // Fall through to number parsing
        } else {
          throw new ParseError(`Unexpected character '-'`, startLine, startCol);
        }
      }

      if (char === "=") {
        let len = 0;
        while (this.peek(len) === "=") {
          len++;
        }
        if (len >= 2) {
          const val = this.input.slice(this.pos, this.pos + len);
          tokens.push({ type: "LINK_TOTAL", value: val, line: startLine, col: startCol });
          this.advance(len);
          continue;
        }
        throw new ParseError(`Unexpected character '='`, startLine, startCol);
      }

      // Numbers (integers, possibly negative)
      if (char === "-" || /\d/.test(char)) {
        let numStr = "";
        if (char === "-") {
          numStr += "-";
          this.advance();
        }
        while (/\d/.test(this.peek())) {
          numStr += this.peek();
          this.advance();
        }
        tokens.push({ type: "NUMBER", value: numStr, line: startLine, col: startCol });
        continue;
      }

      // Strings (double quoted or single quoted)
      if (char === '"' || char === "'") {
        const quoteChar = char;
        let strVal = "";
        this.advance(); // Skip open quote
        while (this.pos < this.input.length && this.peek() !== quoteChar) {
          strVal += this.peek();
          this.advance();
        }
        if (this.peek() !== quoteChar) {
          throw new ParseError("Unclosed string literal", startLine, startCol);
        }
        this.advance(); // Skip close quote
        tokens.push({ type: "STRING", value: strVal, line: startLine, col: startCol });
        continue;
      }

      // Identifiers and Keywords
      if (/[a-zA-Z_]/.test(char)) {
        let ident = "";
        while (/[a-zA-Z0-9_-]/.test(this.peek())) {
          ident += this.peek();
          this.advance();
        }

        // Map keywords to specific token types
        let type: Token["type"] = "IDENTIFIER";
        if (ident === "chenER") type = "HEADER";
        else if (ident === "theme" || ident === "layout" || ident === "attribute_layout" || ident === "tema" || ident === "layout_atributos") type = "CONFIG";
        else if (ident === "entity" || ident === "entidade") type = "ENTITY";
        else if (ident === "weak_entity" || ident === "entidade_fraca") type = "WEAK_ENTITY";
        else if (ident === "relationship" || ident === "relacionamento") type = "RELATIONSHIP";
        else if (
          ident === "identifying_relationship" ||
          ident === "ident_relationship" ||
          ident === "relacionamento_identificador" ||
          ident === "relacionamento_identificacao"
        ) type = "IDENTIFYING_RELATIONSHIP";
        else if (ident === "specialization" || ident === "especializacao") type = "SPECIALIZATION";
        else if (ident === "key" || ident === "chave") type = "KEY";
        else if (ident === "weak_key" || ident === "partial_key" || ident === "chave_parcial" || ident === "chave_fraca") type = "WEAK_KEY";
        else if (ident === "multivalued" || ident === "multivalorado") type = "MULTIVALUED";
        else if (ident === "derived" || ident === "derivado") type = "DERIVED";
        else if (ident === "composite" || ident === "composto") type = "COMPOSITE";

        tokens.push({ type, value: ident, line: startLine, col: startCol });
        continue;
      }

      throw new ParseError(`Unexpected character '${char}'`, startLine, startCol);
    }

    tokens.push({ type: "EOF", value: "", line: this.line, col: this.col });
    return tokens;
  }
}

export class Parser {
  private tokens: Token[] = [];
  private currentIdx = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.currentIdx];
  }

  private advance(): Token {
    const tok = this.peek();
    if (tok.type !== "EOF") {
      this.currentIdx++;
    }
    return tok;
  }

  private match(type: Token["type"]): Token {
    const tok = this.peek();
    if (tok.type !== type) {
      throw new ParseError(`Expected token '${type}' but found '${tok.type}' (${tok.value})`, tok.line, tok.col);
    }
    return this.advance();
  }

  public parse(): ChenAST {
    const ast: ChenAST = {
      config: {},
      entities: [],
      relationships: [],
      specializations: [],
      connections: []
    };

    // Require 'chenER' header
    this.match("HEADER");

    while (this.peek().type !== "EOF") {
      const tok = this.peek();

      if (tok.type === "CONFIG") {
        const configTok = this.advance();
        const valueTok = this.match("IDENTIFIER");
        let cfgKey = configTok.value;
        if (cfgKey === "tema") cfgKey = "theme";
        if (cfgKey === "layout_atributos") cfgKey = "attribute_layout";
        ast.config[cfgKey] = valueTok.value;
      } else if (tok.type === "ENTITY" || tok.type === "WEAK_ENTITY") {
        const isWeak = tok.type === "WEAK_ENTITY";
        this.advance(); // consume keyword
        
        const idTok = this.match("IDENTIFIER");
        const metadata = this.parseBracketMetadata();
        
        let attributes: Attribute[] = [];
        if (this.peek().type === "BRACE_OPEN") {
          this.advance(); // consume '{'
          while (this.peek().type !== "BRACE_CLOSE" && this.peek().type !== "EOF") {
            attributes.push(this.parseAttribute());
          }
          this.match("BRACE_CLOSE");
        }

        ast.entities.push({
          id: idTok.value,
          isWeak,
          attributes,
          offset: metadata.offset,
          style: metadata.style,
          pos: metadata.pos
        });
      } else if (tok.type === "RELATIONSHIP" || tok.type === "IDENTIFYING_RELATIONSHIP") {
        const isIdentifying = tok.type === "IDENTIFYING_RELATIONSHIP";
        this.advance(); // consume keyword
        
        const idTok = this.match("IDENTIFIER");
        const metadata = this.parseBracketMetadata();

        let attributes: Attribute[] = [];
        if (this.peek().type === "BRACE_OPEN") {
          this.advance(); // consume '{'
          while (this.peek().type !== "BRACE_CLOSE" && this.peek().type !== "EOF") {
            attributes.push(this.parseAttribute());
          }
          this.match("BRACE_CLOSE");
        }

        ast.relationships.push({
          id: idTok.value,
          isIdentifying,
          attributes,
          offset: metadata.offset,
          style: metadata.style,
          pos: metadata.pos
        });
      } else if (tok.type === "SPECIALIZATION") {
        this.advance(); // consume keyword
        
        const idTok = this.match("IDENTIFIER");
        const metadata = this.parseBracketMetadata();
        this.match("BRACE_OPEN");

        let type: "disjoint" | "overlapping" = "disjoint";
        let participation: "partial" | "total" = "partial";
        let superclass = "";
        let subclasses: string[] = [];

        while (this.peek().type !== "BRACE_CLOSE" && this.peek().type !== "EOF") {
          const propTok = this.match("IDENTIFIER");
          this.match("COLON");

          if (propTok.value === "type" || propTok.value === "tipo") {
            const val = this.match("IDENTIFIER").value;
            if (val === "disjoint" || val === "disjunta") {
              type = "disjoint";
            } else if (val === "overlapping" || val === "sobreposta") {
              type = "overlapping";
            } else {
              throw new ParseError("Specialization type must be 'disjoint'/'disjunta' or 'overlapping'/'sobreposta'", propTok.line, propTok.col);
            }
          } else if (propTok.value === "participation" || propTok.value === "participacao") {
            const val = this.match("IDENTIFIER").value;
            if (val === "partial" || val === "parcial") {
              participation = "partial";
            } else if (val === "total") {
              participation = "total";
            } else {
              throw new ParseError("Specialization participation must be 'partial'/'parcial' or 'total'", propTok.line, propTok.col);
            }
          } else if (propTok.value === "superclass" || propTok.value === "superclasse") {
            superclass = this.match("IDENTIFIER").value;
          } else if (propTok.value === "subclasses") {
            subclasses.push(this.match("IDENTIFIER").value);
            while (this.peek().type === "COMMA") {
              this.advance(); // skip comma
              subclasses.push(this.match("IDENTIFIER").value);
            }
          } else {
            throw new ParseError(`Unknown property '${propTok.value}' in specialization`, propTok.line, propTok.col);
          }
        }

        this.match("BRACE_CLOSE");
        ast.specializations.push({
          id: idTok.value,
          type,
          participation,
          superclass,
          subclasses,
          pos: metadata.pos
        });
      } else if (tok.type === "IDENTIFIER") {
        // Connection statement: Source ID LinkOperator Target ID
        const fromTok = this.advance();
        const linkTok = this.peek();
        
        if (linkTok.type !== "LINK_PARTIAL" && linkTok.type !== "LINK_TOTAL") {
          throw new ParseError(`Expected relationship connection operator (-- or ==) after '${fromTok.value}'`, linkTok.line, linkTok.col);
        }
        
        this.advance(); // consume connection operator
        const participation = linkTok.type === "LINK_TOTAL" ? "total" : "partial";
        
        const toTok = this.match("IDENTIFIER");

        let cardinality: string | null = null;
        let role: string | null = null;

        // Parse optional cardinality/role label : "label" or unquoted literal
        if (this.peek().type === "COLON") {
          this.advance(); // consume ':'
          let labelValue = "";
          if (this.peek().type === "STRING") {
            labelValue = this.advance().value;
          } else if (this.peek().type === "PAREN_OPEN") {
            labelValue += this.match("PAREN_OPEN").value;
            const firstTok = this.advance();
            if (firstTok.type !== "NUMBER" && firstTok.type !== "IDENTIFIER") {
              throw new ParseError(`Expected number or identifier in cardinality but found '${firstTok.type}'`, firstTok.line, firstTok.col);
            }
            labelValue += firstTok.value;
            labelValue += this.match("COMMA").value;
            const secondTok = this.advance();
            if (secondTok.type !== "NUMBER" && secondTok.type !== "IDENTIFIER") {
              throw new ParseError(`Expected number or identifier in cardinality but found '${secondTok.type}'`, secondTok.line, secondTok.col);
            }
            labelValue += secondTok.value;
            labelValue += this.match("PAREN_CLOSE").value;
          } else {
            const tok = this.advance();
            if (tok.type !== "NUMBER" && tok.type !== "IDENTIFIER") {
              throw new ParseError(`Expected string, number, identifier or parenthesized cardinality but found '${tok.type}'`, tok.line, tok.col);
            }
            labelValue = tok.value;
          }

          // If label contains only simple alphanumeric or (min,max), treat as cardinality, otherwise role
          if (/^[\dNM1:,\s()]+$/i.test(labelValue)) {
            cardinality = labelValue;
          } else {
            role = labelValue;
          }
        }

        const metadata = this.parseBracketMetadata();

        ast.connections.push({
          from: fromTok.value,
          to: toTok.value,
          cardinality,
          participation,
          role,
          labelOffset: metadata.offset,
          style: metadata.style ? { stroke: metadata.style.stroke, strokeWidth: metadata.style.strokeWidth } : null,
          dir: (metadata.dir === "left" || metadata.dir === "right" || metadata.dir === "up" || metadata.dir === "down") ? metadata.dir : null
        });
      } else {
        throw new ParseError(`Unexpected statement starting with token '${tok.type}' (${tok.value})`, tok.line, tok.col);
      }
    }

    return ast;
  }

  private parseAttribute(): Attribute {
    const idTok = this.match("IDENTIFIER");

    let isKey = false;
    let isWeakKey = false;
    let isMultivalued = false;
    let isDerived = false;
    let isComposite = false;
    let children: Attribute[] = [];

    // Parse modifiers (key, weak_key, multivalued, derived, composite)
    const tok = this.peek();
    if (tok.type === "KEY") {
      this.advance();
      isKey = true;
    } else if (tok.type === "WEAK_KEY") {
      this.advance();
      isWeakKey = true;
    } else if (tok.type === "MULTIVALUED") {
      this.advance();
      isMultivalued = true;
    } else if (tok.type === "DERIVED") {
      this.advance();
      isDerived = true;
    } else if (tok.type === "COMPOSITE") {
      this.advance();
      isComposite = true;
      this.match("PAREN_OPEN");
      
      // Parse composite child names (comma separated list of identifiers)
      const childId = this.match("IDENTIFIER").value;
      children.push({
        id: childId,
        isKey: false,
        isWeakKey: false,
        isMultivalued: false,
        isDerived: false,
        isComposite: false,
        children: [],
        offset: null,
        style: null
      });

      while (this.peek().type === "COMMA") {
        this.advance(); // skip comma
        const nextChildId = this.match("IDENTIFIER").value;
        children.push({
          id: nextChildId,
          isKey: false,
          isWeakKey: false,
          isMultivalued: false,
          isDerived: false,
          isComposite: false,
          children: [],
          offset: null,
          style: null
        });
      }
      this.match("PAREN_CLOSE");
    }

    const metadata = this.parseBracketMetadata();

    return {
      id: idTok.value,
      isKey,
      isWeakKey,
      isMultivalued,
      isDerived,
      isComposite,
      children,
      offset: metadata.offset,
      style: metadata.style,
      pos: metadata.pos
    };
  }

  private parseBracketMetadata(): { 
    offset: [number, number] | null; 
    style: StyleOverride | null; 
    dir: string | null;
    pos: { x: number; y: number } | null;
  } {
    let offset: [number, number] | null = null;
    let style: StyleOverride | null = null;
    let dir: string | null = null;
    let pos: { x: number; y: number } | null = null;

    if (this.peek().type === "BRACKET_OPEN") {
      this.advance(); // consume '['

      while (this.peek().type !== "BRACKET_CLOSE" && this.peek().type !== "EOF") {
        const keyTok = this.match("IDENTIFIER");
        this.match("COLON");

        if (keyTok.value === "offset" || keyTok.value === "label_offset") {
          // Parse number comma number
          const xTok = this.match("NUMBER");
          this.match("COMMA");
          const yTok = this.match("NUMBER");
          offset = [parseFloat(xTok.value), parseFloat(yTok.value)];
        } else if (keyTok.value === "pos") {
          const xTok = this.match("NUMBER");
          this.match("COMMA");
          const yTok = this.match("NUMBER");
          pos = { x: parseFloat(xTok.value), y: parseFloat(yTok.value) };
        } else if (keyTok.value === "dir") {
          let val = "";
          if (this.peek().type === "STRING") {
            val = this.advance().value;
          } else {
            val = this.match("IDENTIFIER").value;
          }
          dir = val;
        } else if (keyTok.value === "fill" || keyTok.value === "stroke" || keyTok.value === "text" || keyTok.value === "strokeWidth") {
          if (!style) style = {};
          
          let val: any = "";
          if (keyTok.value === "strokeWidth") {
            const numTok = this.match("NUMBER");
            val = parseFloat(numTok.value);
          } else if (this.peek().type === "STRING") {
            val = this.advance().value;
          } else {
            val = this.match("IDENTIFIER").value;
          }
          style[keyTok.value as keyof StyleOverride] = val as any;
        } else {
          // Allow unknown metadata to be ignored silently
          this.advance();
        }

        if (this.peek().type === "COMMA") {
          this.advance(); // consume comma
        }
      }

      this.match("BRACKET_CLOSE");
    }

    return { offset, style, dir, pos };
  }
}

export function parseDSL(code: string): ChenAST {
  const lexer = new Lexer(code);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}
