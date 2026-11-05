## Why

Peter Chen's Entity-Relationship (ER) modeling is widely taught in universities and used in software engineering across Portuguese-speaking countries. Offering full PT-BR localization — including both the visual playground interface and native bilingual keywords in the `chenER` DSL — significantly reduces cognitive friction, enhances accessibility, and provides a localized experience while maintaining English compatibility.

## What Changes

- **Bilingual DSL Keywords**: Extend the DSL parser in `src/parser.ts` to recognize Portuguese aliases transparently alongside English keywords (`entidade`/`entity`, `entidade_fraca`/`weak_entity`, `relacionamento`/`relationship`, `relacionamento_identificador`/`ident_relationship`, `especializacao`/`specialization`, `chave`/`key`, `chave_parcial`/`partial_key`, `multivalorado`/`multivalued`, `derivado`/`derived`, `disjunta`/`disjoint`, `sobreposta`/`overlapping`, `total`, `parcial`/`partial`).
- **Playground i18n Subsystem**: Introduce a dedicated translation module (`playground/i18n.ts`) providing full string dictionaries for `pt-br` (default) and `en`.
- **Language Selector UI**: Add a language selection dropdown in the playground header allowing real-time switching between PT-BR and EN, persisted in `localStorage`.
- **Localized Default Diagram**: Provide an initial example diagram in Portuguese when PT-BR is selected.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `chen-er-core`: Add recognition for Portuguese DSL keywords in lexer and parser.
- `visual-creator`: Implement bilingual UI localization (PT-BR default / EN) with dynamic switching, localized initial template, and persistent language preferences.

## Impact

- Core compiler: `src/parser.ts` (keyword tokenization and rule matching).
- Tests: `src/parser.test.ts`.
- Playground files: `playground/index.html`, `playground/app.ts`, `playground/i18n.ts`.
