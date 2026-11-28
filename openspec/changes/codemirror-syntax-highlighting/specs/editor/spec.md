# Spec: CodeMirror 6 DSL Editor

## Requirements

### Requirement 1: Neko DSL Syntax Highlighting
- The editor MUST highlight DSL keywords in both English (`entity`, `weak_entity`, `relationship`, `identifying_relationship`, `specialization`, `attribute_layout`, `theme`) and Portuguese (`entidade`, `entidade_fraca`, `relacionamento`, `relacionamento_identificador`, `especializacao`, `layout_atributos`, `tema`).
- The editor MUST highlight attribute modifiers: `key`/`chave`, `weak_key`/`chave_parcial`, `multivalued`/`multivalorado`, `derived`/`derivado`, `composite`/`composto`.
- The editor MUST highlight connectors (`--`, `==`), roles/cardinalities, comments, and bracket metadata (`[offset: ...]`, `[pos: ...]`).

### Requirement 2: Visual Experience & Themes
- The editor MUST include line numbers (*gutter*).
- The editor MUST support Dark and Light themes that switch dynamically when the playground theme changes.
- The editor MUST provide bracket matching and monospaced font rendering.

### Requirement 3: Bi-directional Canvas & History Sync
- Edits in the editor MUST trigger debounced diagram recompilation.
- Actions on the visual canvas (adding nodes, moving attributes, inspector edits) MUST update the CodeMirror document without cursor jumping or visual glitches.
- Undo/redo actions MUST stay synchronized.
