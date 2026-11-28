## 1. Types & Core Parser/Serializer Support

- [x] 1.1 Add `"manual"` to `attribute_layout` in `src/types.ts` and add `pos?: { x: number; y: number } | null` to `Attribute` interface
- [x] 1.2 Update `src/parser.ts` to extract `pos` metadata for attributes and recognize `manual` config
- [x] 1.3 Update `src/serializer.ts` to serialize `pos` on attributes and support `manual` layout config

## 2. Layout Engine Updates

- [x] 2.1 Implement `manual` attribute layout in `src/layout.ts` calculating direct position from parent center + `offset`
- [x] 2.2 Support absolute `pos` positioning on attributes in `src/layout.ts`
- [x] 2.3 Provide fallback dynamic placement for unpositioned attributes in `manual` mode

## 3. Playground Integration

- [x] 3.1 Update Attribute Spacing dropdown in `playground/index.html` to add "Manual (Default)" and make it the selected default
- [x] 3.2 Update i18n translations in `playground/i18n.ts` for Manual spacing mode in English and Portuguese
- [x] 3.3 Implement dynamic-to-manual freezing when attributes are added in `playground/app.ts`
- [x] 3.4 Ensure dragging attributes updates their relative `offset` cleanly in manual mode

## 4. Testing & Validation

- [x] 4.1 Add unit tests for `manual` attribute layout, relative offset, and absolute pos
- [x] 4.2 Run test suite (`npm test`) and playground build (`npm run build`)
