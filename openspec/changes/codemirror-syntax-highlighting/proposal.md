# Change Proposal: CodeMirror 6 Syntax Highlighting

## Why

Currently, the Neko Model playground uses a plain HTML `<textarea>` styled with a single uniform color (`#38bdf8`). As diagrams grow in complexity, reading and editing DSL text is tedious because there is no visual distinction between entity declarations, attribute modifiers, connectors, strings, numbers, brackets, or comments. In contrast, tools like Mermaid Live Editor provide rich syntax highlighting that dramatically improves readability and developer experience.

## What

Replace the raw `<textarea id="dsl-editor">` with a modern **CodeMirror 6** editor featuring:
1. Custom syntax highlighting for Chen ER / Neko Model DSL supporting both English and Portuguese keywords.
2. Distinct visual styling for keywords, node identifiers, attribute modifiers (`key`, `multivalued`, etc.), connectors (`--`, `==`), strings, and metadata brackets.
3. Line numbers (*gutter*), bracket matching, and auto-indentation.
4. Dynamic Dark / Light theme synchronization matching the playground's theme selector.
5. Bi-directional synchronization with the visual diagram canvas and undo/redo history.

## Impact

- **Playground Bundle:** Adds modular CodeMirror 6 dependencies (`codemirror`, `@codemirror/language`, `@lezer/highlight`).
- **Core Library (`dist/`):** Zero impact; core parser, layout, and renderer remain standalone without editor dependencies.
- **User Experience:** Syntax-highlighted code matching Mermaid Live Editor aesthetics.
