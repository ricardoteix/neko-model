import { StreamLanguage, HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";

// Keywords for Chen ER / Neko Model DSL (English & Portuguese)
const ROOT_CONFIG_KEYWORDS = new Set([
  "chenER", "theme", "tema", "layout", "attribute_layout", "layout_atributos"
]);

const DECLARATION_KEYWORDS = new Set([
  "entity", "entidade",
  "weak_entity", "entidade_fraca",
  "relationship", "relacionamento",
  "identifying_relationship", "relacionamento_identificador",
  "specialization", "especializacao"
]);

const MODIFIER_KEYWORDS = new Set([
  "key", "chave",
  "weak_key", "chave_parcial",
  "multivalued", "multivalorado",
  "derived", "derivado",
  "composite", "composto"
]);

const VALUE_KEYWORDS = new Set([
  "disjoint", "disjunta",
  "overlapping", "sobreposta",
  "total", "partial", "parcial",
  "manual", "dynamic", "dinamico", "zigzag", "classic", "classico",
  "dark", "light", "default", "padrao",
  "true", "false"
]);

export const nekoLanguage = StreamLanguage.define({
  name: "neko-dsl",
  startState() {
    return {
      inBrackets: false,
      inSpecialization: false
    };
  },
  token(stream, state) {
    // 1. Whitespace
    if (stream.eatSpace()) return null;

    // 2. Comments: # or //
    if (stream.match(/^#.*/) || stream.match(/^\/\/.*/)) {
      return "lineComment";
    }

    // 3. Strings: "..." or '...'
    if (stream.match(/^"(?:[^"\\]|\\.)*"/) || stream.match(/^'(?:[^'\\]|\\.)*'/)) {
      return "string";
    }

    // 4. Bracket open/close
    if (stream.eat("[")) {
      state.inBrackets = true;
      return "bracket";
    }
    if (stream.eat("]")) {
      state.inBrackets = false;
      return "bracket";
    }
    if (stream.match(/^[{}()]/)) {
      return "bracket";
    }

    // 5. Connectors / Links: -- or ==
    if (stream.match(/^--/) || stream.match(/^==/)) {
      return "operator";
    }

    // 6. Colons & Commas
    if (stream.eat(":")) {
      return "operator";
    }
    if (stream.eat(",")) {
      return "punctuation";
    }

    // 7. Numbers (including negative coordinates like -50)
    if (stream.match(/^-?\d+(\.\d+)?/)) {
      return "number";
    }

    // 8. Properties with colons: e.g. type:, superclass:, pos:, offset:
    const propMatch = stream.match(/^[a-zA-Z_][a-zA-Z0-9_-]*(?=:)/);
    if (propMatch) {
      if (state.inBrackets) {
        return "definitionKeyword"; // pos, offset, dir, fill, etc.
      }
      return "propertyName"; // type, superclass, participation, etc.
    }

    // 9. Words / Identifiers
    const wordMatch = stream.match(/^[a-zA-Z_][a-zA-Z0-9_-]*/);
    if (wordMatch) {
      const word = Array.isArray(wordMatch) ? wordMatch[0] : stream.current();

      if (ROOT_CONFIG_KEYWORDS.has(word)) {
        return "heading";
      }
      if (DECLARATION_KEYWORDS.has(word)) {
        return "keyword";
      }
      if (MODIFIER_KEYWORDS.has(word)) {
        return "modifier";
      }
      if (VALUE_KEYWORDS.has(word)) {
        return "atom";
      }
      // Hex colors inside brackets like #ff0000
      if (state.inBrackets && /^[0-9a-fA-F]{3,8}$/.test(word)) {
        return "color";
      }

      return "variableName";
    }

    // Fallback: advance single char
    stream.next();
    return null;
  }
});

// Syntax Highlighting Styles (Dark Theme)
export const nekoHighlightDark = HighlightStyle.define([
  { tag: t.heading, color: "#f43f5e", fontWeight: "bold" },         // Root configs (chenER, layout)
  { tag: t.keyword, color: "#c084fc", fontWeight: "600" },          // entity, relationship, specialization
  { tag: t.modifier, color: "#fb923c", fontWeight: "600" },         // key, multivalued, derived
  { tag: t.propertyName, color: "#22d3ee" },                        // type, superclass, subclasses
  { tag: t.definitionKeyword, color: "#a5b4fc" },                   // pos, offset inside brackets
  { tag: t.atom, color: "#a78bfa" },                                // disjoint, total, manual
  { tag: t.operator, color: "#34d399", fontWeight: "bold" },        // --, ==, :
  { tag: t.string, color: "#facc15" },                              // "1", "N", "manages"
  { tag: t.number, color: "#67e8f9" },                              // 100, 200, -30
  { tag: t.bracket, color: "#94a3b8" },                             // [], {}, ()
  { tag: t.punctuation, color: "#94a3b8" },                         // ,
  { tag: t.lineComment, color: "#64748b", fontStyle: "italic" },    // # comment
  { tag: t.variableName, color: "#f8fafc" },                        // Customer, Places, name
  { tag: t.color, color: "#f472b6" }
]);

// Syntax Highlighting Styles (Light Theme)
export const nekoHighlightLight = HighlightStyle.define([
  { tag: t.heading, color: "#e11d48", fontWeight: "bold" },
  { tag: t.keyword, color: "#7c3aed", fontWeight: "600" },
  { tag: t.modifier, color: "#ea580c", fontWeight: "600" },
  { tag: t.propertyName, color: "#0891b2" },
  { tag: t.definitionKeyword, color: "#4f46e5" },
  { tag: t.atom, color: "#6366f1" },
  { tag: t.operator, color: "#059669", fontWeight: "bold" },
  { tag: t.string, color: "#ca8a04" },
  { tag: t.number, color: "#0284c7" },
  { tag: t.bracket, color: "#64748b" },
  { tag: t.punctuation, color: "#64748b" },
  { tag: t.lineComment, color: "#94a3b8", fontStyle: "italic" },
  { tag: t.variableName, color: "#0f172a" },
  { tag: t.color, color: "#db2777" }
]);

// Base Editor Theme
export function createEditorTheme(isDark: boolean): Extension {
  return EditorView.theme({
    "&": {
      height: "100%",
      fontSize: "14px",
      fontFamily: "var(--font-mono)",
      backgroundColor: "transparent",
      color: isDark ? "#f8fafc" : "#0f172a"
    },
    ".cm-scroller": {
      overflow: "auto",
      fontFamily: "inherit",
      lineHeight: "1.6"
    },
    ".cm-content": {
      padding: "16px 20px"
    },
    ".cm-gutters": {
      backgroundColor: "transparent",
      color: isDark ? "#475569" : "#94a3b8",
      border: "none",
      borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
      paddingRight: "6px"
    },
    ".cm-lineNumbers .cm-gutterElement": {
      padding: "0 8px 0 12px",
      minWidth: "30px",
      textAlign: "right"
    },
    ".cm-activeLineGutter": {
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
      color: isDark ? "#38bdf8" : "#0284c7"
    },
    ".cm-activeLine": {
      backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"
    },
    ".cm-cursor": {
      borderLeftColor: isDark ? "#38bdf8" : "#0284c7",
      borderLeftWidth: "2px"
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: isDark ? "rgba(56, 189, 248, 0.22)" : "rgba(2, 132, 199, 0.18)"
    },
    ".cm-matchingBracket": {
      backgroundColor: isDark ? "rgba(56, 189, 248, 0.25)" : "rgba(2, 132, 199, 0.2)",
      outline: `1px solid ${isDark ? "#38bdf8" : "#0284c7"}`
    }
  }, { dark: isDark });
}

export function getNekoEditorExtensions(isDark: boolean): Extension[] {
  return [
    nekoLanguage,
    syntaxHighlighting(isDark ? nekoHighlightDark : nekoHighlightLight),
    createEditorTheme(isDark)
  ];
}
