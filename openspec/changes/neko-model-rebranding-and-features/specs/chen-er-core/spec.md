## ADDED Requirements

### Requirement: Direct Cardinality Syntax
The parser SHALL support defining connection cardinalities directly without quotes using integers, alphabetic identifiers, and parenthesized coordinate ranges.

#### Scenario: Parsing direct cardinality
- **WHEN** the DSL string contains `Customer -- Places : 1` or `Places == Order : N` or `Order == Has : (1,1)`
- **THEN** the parser successfully parses the cardinality values into the AST as `cardinality: "1"`, `cardinality: "N"`, and `cardinality: "(1,1)"` respectively.
