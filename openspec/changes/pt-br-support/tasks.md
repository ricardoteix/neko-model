## 1. Bilingual DSL Keyword Parser

- [x] 1.1 Map Portuguese keywords in tokenizer and parsing rules in `src/parser.ts` (entidade, chave, multivalorado, especializacao, etc.).
- [x] 1.2 Add unit tests in `src/parser.test.ts` verifying parsing of diagrams written with Portuguese keywords.

## 2. Internationalization (i18n) Module

- [x] 2.1 Create `playground/i18n.ts` with full translation dictionaries for `pt-br` (default) and `en`.
- [x] 2.2 Define localized starter example diagrams for both Portuguese and English in `playground/i18n.ts`.

## 3. Playground UI & Integration

- [x] 3.1 Add language dropdown `#lang-select` in `playground/index.html` defaulting to `pt-br`.
- [x] 3.2 Connect language switching in `playground/app.ts`, syncing all UI texts, tooltips, properties inspector, and persisting preference in `localStorage`.

## 4. Verification & Build

- [x] 4.1 Run unit tests with `npm test` to verify all parser and layout tests pass.
- [x] 4.2 Run `npm run build` to ensure error-free library and playground production bundles.
