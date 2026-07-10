## ADDED Requirements

### Requirement: Enlarged Specialization Node
The layout engine SHALL represent specialization nodes with a bounding box of $80 \times 80$ pixels (adding $15\text{px}$ of padding on all sides relative to the original $50 \times 50$ size).

#### Scenario: Rendering a specialization triangle
- **WHEN** rendering a specialization node in SVG
- **THEN** it has a base width of $80\text{px}$ and a height of $80\text{px}$, and its connection arrow marker points to its border at $40\text{px}$ from center (plus line clearance).
