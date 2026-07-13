# Chen ER - Playground de Diagramas Conceituais

Um parser, renderizador e editor visual bidirecional para Diagramas Entidade-Relacionamento (DER) baseados na notação de Peter Chen. Este projeto fornece uma linguagem específica de domínio (DSL) robusta chamada **`chenER`** para definir diagramas como código, acoplada a uma interface visual interativa para arrastar, conectar e editar elementos com sincronização automática do código.

🎮 **Acesse o Playground Online:** [https://ricardoteix.github.io/neko-model/](https://ricardoteix.github.io/neko-model/)

---

## 🚀 Recursos Principais

- **DSL `chenER`**: Linguagem declarativa simples e expressiva para codificar entidades, relacionamentos, atributos, especializações e conexões.
- **Editor Visual Bidirecional**: Arraste elementos no canvas, desenhe novas conexões e edite propriedades em tempo real com sincronização bidirecional instantânea com o código-fonte.
- **Posicionamento Preciso**: Suporte para metadados de coordenadas manuais (`[pos: X, Y]`) para fixar nós no canvas e preservar layouts personalizados.
- **Direções de Conexão Relativas**: Controle fino de fluxo usando direções (`[dir: left|right|up|down]`) para ajustar o layout relativo de nós conectados.
- **Customização de Atributos**: Suporte para atributos chave primária, chave parcial (fraco), multivalorados, derivados e compostos, com suporte a layouts clássicos, em zigue-zague e offsets manuais (`[offset: dx, dy]`).
- **Layout Inteligente (Dagre + Força)**: Layout automático híbrido que respeita tanto os algoritmos de grafos quanto os posicionamentos manuais definidos pelo usuário.
- **Recursos da Interface**:
  - Zoom e pan controlados por botões ou scroll do mouse (Ctrl + Wheel).
  - Snap-to-grid para alinhamento preciso.
  - Painel inspetor de propriedades dinâmico e contextual.
  - Histórico de desfazer/refazer (Undo/Redo) para alterações visuais.
  - Exportação de diagramas diretamente em formato SVG pronto para produção.

---

## 🛠️ Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 18 ou superior recomendada para rodar a suíte de testes do Vitest)
- npm ou gerenciador de pacotes equivalente

### Instalação de Dependências
```bash
npm install
```

### Executar em Ambiente de Desenvolvimento
Inicia o servidor de desenvolvimento do Vite com hot reload no playground interativo:
```bash
npm run dev
```

### Compilar para Produção
Compila a biblioteca principal e o playground da aplicação para distribuição:
```bash
npm run build
```

### Executar Testes
Executa a suíte de testes unitários com o Vitest:
```bash
npm test
```

---

## 📝 Documentação da Linguagem `chenER`

O código escrito em `chenER` deve sempre iniciar com o cabeçalho obrigatório `chenER`. A seguir estão os detalhes de sintaxe para estruturar seu diagrama conceitual.

### 1. Cabeçalho e Configurações Globais
No topo do arquivo, você pode definir metadados globais de estilo e comportamento do layout:
```chenER
chenER
theme dark                   %% Opções: default (claro), dark (escuro), forest (verde), neutral (P&B)
layout default               %% Opções: default, force
attribute_layout default     %% Opções: default (dinâmico), zigzag (alternado), classic (legado)
```

---

### 2. Entidades (`entity` e `weak_entity`)
Entidades representam objetos do mundo real. Entidades fracas (`weak_entity`) dependem de outra entidade para sua identificação.

**Sintaxe:**
```chenER
entity NomeDaEntidade [pos: X, Y, fill: "cor", stroke: "cor", text: "cor", strokeWidth: N] {
  atributo_comum
  atributo_chave key
}

weak_entity NomeDaEntidadeFraca [pos: X, Y] {
  atributo_chave_parcial weak_key
}
```

*Nota: Os blocos de atributos `{ ... }` e as propriedades de estilo entre colchetes `[...]` são opcionais.*

---

### 3. Atributos e Modificadores
Atributos são colocados dentro das chaves de entidades ou relacionamentos.

- **Atributo Comum**: Apenas o nome do identificador.
  `nome`
- **Chave Primária (`key`)**: Identificador único (renderizado sublinhado).
  `id key`
- **Chave Parcial (`weak_key`)**: Identificador parcial de entidade fraca (renderizado com linha pontilhada abaixo).
  `numero weak_key`
- **Multivalorado (`multivalued`)**: Atributos que aceitam múltiplos valores (renderizado com elipse dupla).
  `telefones multivalued`
- **Derivado (`derived`)**: Atributos calculados a partir de outros (renderizado com linha tracejada).
  `idade derived`
- **Composto (`composite`)**: Atributo composto de sub-atributos (representado hierarquicamente).
  `endereco composite(rua, cidade, cep)`
- **Offset e Estilo Manual**: É possível passar coordenadas relativas e cores personalizadas:
  `telefones multivalued [offset: 0, 15, fill: "blue"]`

---

### 4. Relacionamentos (`relationship` e `identifying_relationship`)
Descrevem associações entre entidades. Relacionamentos identificadores (`identifying_relationship`) associam entidades fracas às suas entidades proprietárias.

**Sintaxe:**
```chenER
relationship NomeDoRelacionamento [pos: X, Y] {
  atributo_do_relacionamento
}

identifying_relationship NomeDoRelacionamentoFraco [pos: X, Y]
```

---

### 5. Especializações (`specialization`)
Representam heranças e categorizações de superclasses para subclasses.

**Sintaxe:**
```chenER
specialization NomeDaEspecializacao [pos: X, Y] {
  type: disjoint             %% Opções: disjoint (d) ou overlapping (o)
  participation: partial     %% Opções: partial (linha simples) ou total (linha dupla)
  superclass: NomeSuperclasse
  subclasses: Subclasse1, Subclasse2
}
```

---

### 6. Conexões e Relacionamento de Linhas
Conecta entidades, relacionamentos e especializações.

**Operadores de Conectividade:**
- `--` : Participação Parcial (linha simples)
- `==` : Participação Total (linha dupla)

**Sintaxe Completa:**
```chenER
Origem -- Destino : "cardinalidade_ou_funcao" [dir: DIRECAO, label_offset: dx, dy, stroke: "cor", strokeWidth: N]
```

- **Rótulos (`: "texto"`)**:
  - Se o texto contiver apenas números/caracteres de cardinalidade (como `"1"`, `"N"`, `"M"`, `"(0,1)"`), será renderizado como **cardinalidade**.
  - Caso contrário, será tratado como a **função/papel** da entidade no relacionamento.
- **Offset do Rótulo (`label_offset`)**: Ajusta a posição `(dx, dy)` da cardinalidade/papel em relação à linha da conexão.

---

## 🎯 Detalhes de Layout e Posicionamento Específico

O motor de layout do **Chen ER** combina algoritmos de posicionamento automatizados com recursos de controle manual preciso.

### 📍 Posicionamento Absoluto com `pos`
Ao especificar a propriedade `[pos: X, Y]` em qualquer nó principal (entidade, relacionamento ou especialização), você ativa o posicionamento absoluto para aquele elemento.
- **Como funciona**: O motor de layout lê a coordenada `(X, Y)` e fixa o centro do nó exatamente nessa posição do canvas.
- **Sincronização no Editor**: Quando você arrasta um elemento na interface visual, a propriedade `[pos: X, Y]` é atualizada dinamicamente no código do editor. Nós sem `pos` continuam sendo organizados pelo layout automático Dagre.
- **Exemplo**:
  ```chenER
  entity Cliente [pos: 150, 300]
  ```

### 🧭 Posicionamento Relativo com `dir`
Em conexões (`--` ou `==`), você pode forçar a direção em que o nó destino deve ser posicionado em relação ao nó origem.
- **Sintaxe**: `[dir: left|right|up|down]`
- **Como funciona**:
  - `right`: Posiciona o nó destino à direita do nó de origem, respeitando o espaçamento calculado.
  - `left`: Posiciona à esquerda.
  - `down`: Posiciona abaixo.
  - `up`: Posiciona acima.
- **Propagação de Layout**: Ao aplicar um direcionamento relativo a um nó, o deslocamento gerado é propagado como um vetor em cascata para todos os seus nós descendentes e sub-grafos conectados a jusante. Isso garante que sub-estruturas inteiras do diagrama permaneçam alinhadas coerentemente.
- **Exemplo**:
  ```chenER
  Cliente -- Compra [dir: right]
  ```

### 🌀 Layout de Atributos (`offset`)
Por padrão, os atributos de uma entidade ou relacionamento são distribuídos de forma radial ao redor do elemento pai (usando algoritmos baseados em forças ou estruturas circulares uniformes).
- Se você deseja mover um atributo específico para longe de sobreposições, pode usar a propriedade de offset relativo: `[offset: dx, dy]`.
- **Exemplo**:
  ```chenER
  entity Produto {
    nome [offset: -20, -10]
  }
  ```

---

## 🎨 Temas e Aparência

Você pode customizar os estilos visuais de nós individualmente (usando propriedades `fill`, `stroke`, `text` e `strokeWidth`) ou globalmente utilizando um dos temas nativos:
- **`default`**: Visual clássico em fundo claro com cores harmoniosas e bordas nítidas.
- **`dark`**: Interface escura elegante baseada em tons de grafite, com orbes brilhantes e tons ciano/neon.
- **`forest`**: Paleta orgânica com tons de verde escuro, terra e detalhes em sálvia.
- **`neutral`**: Aparência minimalista em escala de cinzas focada em diagramação formal e de alto contraste.

---

## 📜 Licença

Este projeto está licenciado sob a licença MIT - consulte o arquivo de licença para obter mais detalhes.
