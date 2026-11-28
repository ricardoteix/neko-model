# Design: CodeMirror 6 Syntax Highlighting

## Architecture

We introduce a dedicated module `playground/neko-lang.ts` that defines:
1. `StreamLanguage` tokenizer using CodeMirror 6's `@codemirror/language` package.
2. Token classification rules mapping Neko DSL keywords to standard `@lezer/highlight` tags:
   - Root config & declarations (`chenER`, `theme`, `layout`, `entity`, `weak_entity`, `relationship`, etc., and PT-BR equivalents `entidade`, `relacionamento`, etc.) -> `tags.keyword`
   - Modifiers (`key`, `weak_key`, `multivalued`, `derived`, `composite`, and PT-BR equivalents) -> `tags.modifier`
   - Properties in specializations (`type:`, `participation:`, `superclass:`, `subclasses:`) -> `tags.propertyName`
   - Strings (cardinalities, roles, quotes) -> `tags.string`
   - Numbers -> `tags.number`
   - Connectors (`--`, `==`, `:`) -> `tags.operator`
   - Brackets and punctuation -> `tags.bracket` / `tags.punctuation`
   - Metadata keys in colchetes (`pos:`, `offset:`, `dir:`, `fill:`, etc.) -> `tags.definitionKeyword`
   - Comments (`# ...` and `// ...`) -> `tags.lineComment`
3. Custom Dark and Light editor themes aligning with the playground design system (`var(--font-mono)`, `var(--bg-panel)`, etc.).

## Integration in `playground/app.ts`

- The raw `<textarea id="dsl-editor">` is hidden or replaced by a container div `#dsl-editor-container`.
- An `EditorView` is instantiated inside `#dsl-editor-container`.
- An editor bridge abstraction is created providing:
  - `getCode(): string`
  - `setCode(code: string): void`
  - `onCodeChange(callback: (code: string) => void): void`
  - `setTheme(theme: "dark" | "light" | "default"): void`
- Sinks seamlessly with the existing `compileDiagram()`, `serializeAndSync()`, and history undo/redo stack.
