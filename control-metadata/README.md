# Control Metadata

This directory contains YAML metadata files for SBS controls that define remediation scope and canonical task titles for deterministic task generation in compliance tools.

## Schema

Each metadata file must be named exactly as the control ID (e.g., `SBS-OAUTH-002.yaml`) and may contain:

```yaml
control_id: <SBS-ID>
risk_level: <Critical | High | Moderate>

remediation:
  scope: entity  # Choose one: org, entity, mechanism, inventory
  entity_type: <required only if scope = entity>

task:
  title_template: "<human-readable task title>"
```

## Rules

1. **One remediation scope per control** - Each control must map to exactly one remediation shape
2. **entity_type required for entity scope** - If `scope = entity`, `entity_type` must be specified
3. **entity_type forbidden for other scopes** - Only `entity` scope may include `entity_type`
4. **Optional metadata** - Controls without metadata files default to `scope = org` with no task title
5. **Atomic Control Rule** - If a control implies multiple obligations, it must be split into multiple controls
6. **risk_level must match control document** - The `risk_level` must align with the Risk classification in the benchmark markdown

## Risk Levels

Risk levels are assigned based on the classification framework in the Introduction:

- **Critical** - Establishes a security boundary that, if absent, allows unauthorized access without requiring other controls to fail
- **High** - Provides visibility or response capability that, if absent, prevents detection, investigation, or response to security events
- **Moderate** - Provides assurance or defense-in-depth where other controls still provide coverage if this control fails

## Remediation Scopes

- **org** - One org-level configuration change (e.g., enable SSO enforcement)
- **entity** - One task per noncompliant entity (e.g., per Connected App, per Profile)
- **mechanism** - Implement tooling or automated process (e.g., build data scanner)
- **inventory** - Establish and maintain system of record (e.g., track approved bypass users)

## Examples

### Entity-Scoped Control

```yaml
# SBS-OAUTH-001
control_id: SBS-OAUTH-001

remediation:
  scope: entity
  entity_type: ConnectedApp

task:
  title_template: "Formally install Connected App: (use double curly braces around entity.name)"
```

This produces entity-level remediation where compliance tools generate one task per Connected App that isn't formally installed.

### Inventory-Scoped Control

```yaml
# SBS-OAUTH-003
control_id: SBS-OAUTH-003

remediation:
  scope: inventory

task:
  title_template: "Establish and maintain Connected App criticality inventory"
```

This produces one task to create and maintain a system of record for tracking Connected App criticality ratings.

## Task Title Templates

Task titles use mustache-style template syntax (double curly braces):

- Use `entity.name` wrapped in double curly braces - The name of the noncompliant entity
- Use `entity.id` wrapped in double curly braces - The ID of the noncompliant entity (if applicable)

Task titles must be self-contained, deterministic, and human-readable.

