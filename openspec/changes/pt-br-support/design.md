## Context

Neko Model is an interactive modeling tool and diagram-as-code DSL compiler based on Peter Chen's ER notation. While the codebase originally used English keywords and UI texts, Portuguese localization is required to make the tool accessible to Brazilian and Portuguese students, professors, and database engineers.

## Goals / Non-Goals

**Goals:**
- Make Portuguese (PT-BR) the default interface language of the playground, while providing an instant toggle to English (EN).
- Enable the `chenER` DSL compiler to parse both Portuguese and English keywords interchangeably without breaking backwards compatibility.
- Localize all static and dynamic UI elements (header, tools, canvas buttons, properties inspector, alerts).
- Persist user language choice in browser `localStorage`.
- Provide localized starter code in Portuguese for the default playground experience.

**Non-Goals:**
- Machine translation API integration (all strings are pre-compiled and typed in a lightweight dictionary).
- Multi-dialect Portuguese separation (PT-BR covers standard Portuguese ER nomenclature).

## Decisions

- **Decision 1: Tokenizer Keyword Mapping in `src/parser.ts`**:
  - Map Portuguese terms (`entidade`, `chave`, `multivalorado`, etc.) to the same token types as English terms (`ENTITY`, `KEY`, `MULTIVALUED`, etc.).
  - *Rationale*: Cleanest architecture; AST remains uniform regardless of input language.
- **Decision 2: Centralized i18n Dictionary in `playground/i18n.ts`**:
  - Structure an object with strongly-typed keys mapping to Portuguese and English translations.
  - Expose a `t(key)` helper and an active language state.
  - *Rationale*: Zero runtime dependencies, tiny footprint, easy to extend.
- **Decision 3: Header Language Selector (`#lang-select`)**:
  - Add a select dropdown with options `pt-br` ("Português") and `en` ("English") with `pt-br` selected by default.

## Risks / Trade-offs

- [Risk: DSL serializer output language] → *Mitigation*: The serializer continues to produce clean, valid DSL. Users can write in either language, and AST round-trips seamlessly.
