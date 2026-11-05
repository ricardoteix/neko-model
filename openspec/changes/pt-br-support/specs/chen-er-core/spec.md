## ADDED Requirements

### Requirement: Bilingual DSL Keyword Support
The DSL parser SHALL support Portuguese keywords as direct aliases for existing English keywords for all structural elements, attributes, and specialization constraints.

#### Scenario: Parsing an entity defined with Portuguese keywords
- **WHEN** the DSL contains `entidade Cliente { id chave; telefones multivalorado; endereco { rua } }`
- **THEN** the parser SHALL generate an entity AST node named `Cliente` with primary key attribute `id`, multivalued attribute `telefones`, and composite attribute `endereco`.

#### Scenario: Parsing a specialization with Portuguese keywords
- **WHEN** the DSL contains `especializacao TipoFuncionario { superclasse: Funcionario; subclasses: Gerente; tipo: disjunta; participacao: total }`
- **THEN** the parser SHALL construct a specialization AST node with disjoint type and total participation.
