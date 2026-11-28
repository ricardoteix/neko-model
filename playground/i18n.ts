export type Language = "pt-br" | "en";

export const translations = {
  "pt-br": {
    header: {
      langLabel: "Idioma:",
      themeLabel: "Tema:",
      themeDefault: "Padrão (Claro)",
      themeDark: "Modo Escuro",
      themeForest: "Verde Floresta",
      themeNeutral: "Neutro (P&B)",
      spacingLabel: "Espaçamento de Atributos:",
      spacingManual: "Manual (Padrão)",
      spacingDefault: "Dinâmico",
      spacingZigzag: "Zigue-zague Alternado",
      spacingClassic: "Clássico (Legado)",
      copyCode: "Copiar Código",
      copied: "Copiado!",
      exportNkm: "Exportar .nkm",
      exportSvg: "Exportar SVG",
    },
    toolbox: {
      title: "Ferramentas",
      select: "Selecionar",
      selectTitle: "Ferramenta de Seleção (Esc)",
      pan: "Mover",
      panTitle: "Ferramenta de Mover / Pan (H)",
      entity: "Entidade",
      entityTitle: "Adicionar Entidade",
      rel: "Relac.",
      relTitle: "Adicionar Relacionamento",
      spec: "Espec.",
      specTitle: "Adicionar Especialização",
      attr: "Atributo",
      attrTitle: "Adicionar Atributo",
    },
    editor: {
      title: "Código DSL",
      fileName: "diagrama.nkm",
      toggle: "Código",
    },
    visualizer: {
      title: "Visualização",
      undoTitle: "Desfazer (Ctrl+Z)",
      redoTitle: "Refazer (Ctrl+Y)",
      zoomOutTitle: "Diminuir Zoom",
      zoomInTitle: "Aumentar Zoom",
      zoomReset: "Resetar",
      alignH: "Alinhar H",
      alignHTitle: "Alinhar Horizontalmente",
      alignV: "Alinhar V",
      alignVTitle: "Alinhar Verticalmente",
      snap: "Grade",
    },
    inspector: {
      title: "Propriedades",
      emptyState: "Selecione um elemento ou linha para editar suas propriedades",
      name: "Nome",
      weakEntity: "Entidade Fraca",
      attributes: "Atributos",
      noAttributes: "Nenhum atributo",
      addAttribute: "+ Adicionar Atributo",
      deleteEntity: "Excluir Entidade",
      deleteRelationship: "Excluir Relacionamento",
      deleteSpecialization: "Excluir Especialização",
      deleteAttribute: "Excluir Atributo",
      deleteLink: "Excluir Conexão",
      identifyingRel: "Relacionamento Identificador",
      disjunctionConstraint: "Restrição de Disjunção",
      disjoint: "Disjunta (d)",
      overlapping: "Sobreposta (o)",
      participation: "Participação",
      partial: "Parcial (--)",
      total: "Total (==)",
      superclass: "Superclasse",
      none: "-- Nenhuma --",
      subclasses: "Subclasses",
      noEntitiesAvailable: "Nenhuma entidade disponível",
      constraints: "Restrições",
      primaryKey: "Chave Primária (🔑)",
      partialKey: "Chave Parcial (🗝️)",
      multivalued: "Multivalorado (◯)",
      derived: "Derivado (╌)",
      cardinalityRole: "Cardinalidade / Papel",
      cardinalityPlaceholder: "ex: 1, N, M, ou papel",
      layoutDirection: "Direção do Layout (dir)",
      dirNone: "Nenhuma (Auto)",
      dirRight: "Direita (➔)",
      dirLeft: "Esquerda (↞)",
      dirDown: "Abaixo (▼)",
      dirUp: "Acima (▲)",
      compilationError: "Erro de Compilação",
    }
  },
  "en": {
    header: {
      langLabel: "Language:",
      themeLabel: "Theme:",
      themeDefault: "Default (Light)",
      themeDark: "Dark Mode",
      themeForest: "Forest Green",
      themeNeutral: "Neutral (B&W)",
      spacingLabel: "Attribute Spacing:",
      spacingManual: "Manual (Default)",
      spacingDefault: "Dynamic",
      spacingZigzag: "Zigzag Alternating",
      spacingClassic: "Classic (Legacy)",
      copyCode: "Copy Code",
      copied: "Copied!",
      exportNkm: "Export .nkm",
      exportSvg: "Export SVG",
    },
    toolbox: {
      title: "Tools",
      select: "Select",
      selectTitle: "Selection Tool (Esc)",
      pan: "Pan",
      panTitle: "Pan Tool (H)",
      entity: "Entity",
      entityTitle: "Add Entity",
      rel: "Rel",
      relTitle: "Add Relationship",
      spec: "Spec",
      specTitle: "Add Specialization",
      attr: "Attr",
      attrTitle: "Add Attribute",
    },
    editor: {
      title: "DSL Source",
      fileName: "diagram.nkm",
      toggle: "Toggle Code",
    },
    visualizer: {
      title: "Live Preview",
      undoTitle: "Undo (Ctrl+Z)",
      redoTitle: "Redo (Ctrl+Y)",
      zoomOutTitle: "Zoom Out",
      zoomInTitle: "Zoom In",
      zoomReset: "Reset",
      alignH: "Align H",
      alignHTitle: "Align Horizontally",
      alignV: "Align V",
      alignVTitle: "Align Vertically",
      snap: "Snap",
    },
    inspector: {
      title: "Properties",
      emptyState: "Select a node or connection line to inspect properties",
      name: "Name",
      weakEntity: "Weak Entity",
      attributes: "Attributes",
      noAttributes: "No attributes",
      addAttribute: "+ Add Attribute",
      deleteEntity: "Delete Entity",
      deleteRelationship: "Delete Relationship",
      deleteSpecialization: "Delete Specialization",
      deleteAttribute: "Delete Attribute",
      deleteLink: "Delete Link",
      identifyingRel: "Identifying Relationship",
      disjunctionConstraint: "Disjunction Constraint",
      disjoint: "Disjoint (d)",
      overlapping: "Overlapping (o)",
      participation: "Participation",
      partial: "Partial (--)",
      total: "Total (==)",
      superclass: "Superclass",
      none: "-- None --",
      subclasses: "Subclasses",
      noEntitiesAvailable: "No entities available",
      constraints: "Constraints",
      primaryKey: "Primary Key (🔑)",
      partialKey: "Partial Key (🗝️)",
      multivalued: "Multivalued (◯)",
      derived: "Derived (╌)",
      cardinalityRole: "Cardinality / Role",
      cardinalityPlaceholder: "e.g. 1, N, M, or role",
      layoutDirection: "Layout Direction (dir)",
      dirNone: "None (Auto)",
      dirRight: "Right (➔)",
      dirLeft: "Left (↞)",
      dirDown: "Down (▼)",
      dirUp: "Up (▲)",
      compilationError: "Compilation Error",
    }
  }
};

export const DEFAULT_DIAGRAM_PT = `chenER
tema default
layout_atributos manual

entidade Cliente {
  id chave
  nome
  telefones multivalorado [offset: 0, 15]
  endereco composto(rua, cidade, cep)
}

entidade_fraca Pedido {
  numero_pedido chave_parcial
  data_pedido
}

relacionamento Realiza {
  data_compra
}

relacionamento_identificador Possui

entidade Item {
  codigo_item chave
  preco
}

Cliente -- Realiza : 1
Realiza == Pedido : N

Pedido == Possui : 1
Possui == Item : M

especializacao TipoFuncionario {
  tipo: disjunta
  participacao: total
  superclasse: Funcionario
  subclasses: Gerente, Tecnico
}

entidade Funcionario {
  cpf chave
}
entidade Gerente
entidade Tecnico
`;

export const DEFAULT_DIAGRAM_EN = `chenER
theme default
attribute_layout manual

entity Customer {
  id key
  name
  phones multivalued [offset: 0, 15]
  address composite(street, city, zip)
}

weak_entity Order {
  order_no weak_key
  order_date
}

relationship Places {
  purchase_date
}

identifying_relationship Has

entity Item {
  item_code key
  price
}

Customer -- Places : 1
Places == Order : N

Order == Has : 1
Has == Item : M

specialization EmployeeType {
  type: disjoint
  participation: total
  superclass: Employee
  subclasses: Manager, Technician
}

entity Employee {
  ssn key
}
entity Manager
entity Technician
`;

let currentLang: Language = "pt-br";

export function initLanguage(): Language {
  const saved = localStorage.getItem("neko_model_lang");
  if (saved === "en" || saved === "pt-br") {
    currentLang = saved;
  } else {
    currentLang = "pt-br";
  }
  return currentLang;
}

export function getLanguage(): Language {
  return currentLang;
}

export function setLanguage(lang: Language): void {
  currentLang = lang;
  localStorage.setItem("neko_model_lang", lang);
}

export function getTranslation(): typeof translations["pt-br"] {
  return translations[currentLang] || translations["pt-br"];
}
