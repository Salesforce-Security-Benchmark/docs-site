# Contributing to SBS

Thank you for your interest in contributing to the Security Benchmark for Salesforce (SBS)! Community contributions help make SBS more comprehensive, accurate, and valuable for the entire Salesforce security ecosystem.

## Governance & Roles

### Chief Editor

The Chief Editor oversees the benchmark's structure, consistency, and release cadence. The Chief Editor has final decision-making authority on control definitions, scope, and public content. Editorial authority does not reside with any single company or product team.

### Contributors (Named Individuals)

Contributors are individuals who have materially shaped the benchmark by proposing controls, refining audit procedures, improving definitions, or contributing significant domain expertise. Contributors will be publicly acknowledged and credited. Contribution does not imply organizational sponsorship or endorsement.

Contributors participate as individuals. Their inclusion does not imply that their employer endorses this standard or any organization using it.

## Ways to Contribute

### 1. Propose New Controls

If you've identified a security gap not covered by existing controls, you can propose a new control. New controls should:

- Address a genuine security risk in Salesforce environments
- Be auditable and enforceable
- Include clear pass/fail criteria
- Not duplicate existing controls
- Apply broadly across organizations (not be org-specific edge cases)

### 2. Improve Existing Controls

You can submit improvements to existing controls, including:

- Clarifying control language
- Enhancing audit procedures
- Adding remediation steps
- Fixing technical inaccuracies

### 3. Report Issues

If you find problems with SBS but aren't ready to submit a PR, please open an issue describing:

- Which control is affected
- What the problem is
- Suggested improvement (if applicable)

### 4. Fix Documentation Errors

Typos, formatting issues, broken links, and outdated information are always welcome fixes.

## How to Submit a Contribution

### Step 1: Fork and Branch

1. Fork the SBS repository https://github.com/Salesforce-Security-Benchmark/docs-site
2. Create a new branch: `git checkout -b feature/control-xyz` or `git checkout -b fix/control-abc`

### Step 2: Make Your Changes

**For new controls:**

Create a markdown file in the appropriate `benchmark/` category (or propose a new category) following the existing format:

```markdown
### SBS-CATEGORY-###: Control Title

**Control Statement:** One-sentence requirement.

**Description:**  
Detailed explanation of what organizations must do.

**Risk:** <Badge type="warning" text="High" />  
Explanation of what goes wrong if this control is not implemented and why that matters.

**Audit Procedure:**  
1. Step-by-step instructions for evaluating compliance
2. Specific queries, settings, or artifacts to check
3. Clear pass/fail criteria

**Remediation:**  
1. Step-by-step instructions to achieve compliance
2. Configuration changes needed
3. Process improvements required

**Default Value:**  
Salesforce's out-of-the-box behavior related to this control.

```

**Risk levels and Badge types:**

| Risk Level | Badge Type |
|------------|------------|
| Critical | `<Badge type="danger" text="Critical" />` |
| High | `<Badge type="warning" text="High" />` |
| Moderate | `<Badge type="tip" text="Moderate" />` |

**Important:** Before assigning a risk level, read the **Risk Modeling** section in `introduction.md`. It defines a decision framework with specific questions to determine whether a control is Critical, High, or Moderate. Apply those questions in order to classify your control correctly.

The Badge component is built into VitePress and renders as a colored pill. The risk level explanation should describe *what goes wrong* and *why that's dangerous*.

**Create control metadata (required for all controls):**

Create a metadata file in `control-metadata/` to define the risk level, remediation scope, and task title:

```yaml
# control-metadata/SBS-CATEGORY-###.yaml
control_id: SBS-CATEGORY-###
risk_level: High  # Required: Critical, High, or Moderate

remediation:
  scope: entity  # Choose one: org, entity, mechanism, inventory
  entity_type: ConnectedApp  # only required if scope = entity

task:
  title_template: "Clear, actionable task description"
```

**Risk level (required):**

The `risk_level` field must match the Badge in the markdown file. Valid values are `Critical`, `High`, or `Moderate`.

**Use the decision framework in `introduction.md` (Section 1.4 Risk Modeling) to determine the correct risk level.** The framework provides specific questions to apply in order—do not assign risk levels based on intuition.

The risk level in YAML is the source of truth for machine-readable output (XML). The Badge in markdown is for visual display only.

**Remediation scopes (choose one):**

- **org** — One org-level configuration change (e.g., enable setting, configure policy)
- **entity** — One task per noncompliant entity (e.g., per Connected App, per Profile)
- **mechanism** — Implement tooling or automated process (e.g., build scanner, deploy monitoring)
- **inventory** — Establish and maintain system of record (e.g., document approved users, track criticality ratings)

**Choosing the right scope:**

- If the control requires flipping switches or changing org settings → org
- If the control requires fixing each item individually → entity (and specify entity_type)
- If the control requires building custom tooling or automation → mechanism
- If the control requires maintaining external documentation/tracking → inventory

**Task title templates:**

- Must be clear, actionable, and deterministic
- For entity scope: Use mustache-style templates with double curly braces around variable names (like `entity.name` or `entity.id`) for dynamic values
- For other scopes: Use static, descriptive titles
- Examples:
  - org: "Implement SSO enforcement for production users"
  - entity: See the entity example in control-metadata/SBS-OAUTH-001.yaml
  - mechanism: "Implement regulated data detection for Long Text Area fields"
  - inventory: "Establish and maintain SSO bypass user inventory"

**Important:** Each control must map to exactly **one** remediation scope. If a control seems to require multiple scopes or multiple actions, it should be split into multiple controls.

**For existing control changes:**

Edit the markdown file and clearly describe what you changed and why in your PR. If you're modifying a control's scope or requirements, update the corresponding metadata file in `control-metadata/` if it exists.

### Step 3: Update Controls At-a-Glance

If you're adding a new control, add the control statement to `controls-at-a-glance.md` in the appropriate category and update the total control count.

### Step 4: Test Locally

Run the XML generation script to ensure your changes don't break parsing and that metadata validates correctly:

```bash
python3 scripts/generate_xml.py
```

The script will:
- Parse all markdown control files
- Load and validate any metadata files in `control-metadata/`
- Validate that `risk_level` is one of: Critical, High, Moderate
- Strip Badge markup from risk explanations for clean XML output
- Generate the complete XML output
- Report any errors in control format or metadata structure

If you created metadata files, verify that the generated XML includes `<risk_level>`, `<remediation_scope>`, and `<task>` blocks for your control.

### Step 5: Submit Pull Request

1. Push your branch to your fork
2. Open a PR against the main SBS repository
3. Provide a clear description of:
   - What you're changing and why
   - What security gap this addresses (for new controls)
   - Any breaking changes or impacts on existing controls

### Step 6: Review Process

- PRs will be reviewed by SBS maintainers
- Feedback may be provided for revisions
- Discussion may occur in PR comments
- Approved PRs will be merged into the next release

## Contribution Standards

### Control Quality Requirements

All controls must meet these standards:

**Atomic and Single-Purpose**
- Each control must define exactly **one** security obligation
- Each control must map to exactly **one** remediation scope (control, capability, or entity)
- If a control statement uses "and" to join multiple requirements, it likely needs to be split into multiple controls
- Example violation: "Organizations must install apps **and** control access via profiles" → Should be two controls

**Binary and Auditable**
- Controls must have clear pass/fail criteria
- Must be objectively verifiable
- Should not be subjective or open to interpretation

**Practical and Enforceable**
- Organizations must be able to reasonably implement the control
- Should not require unrealistic resources or capabilities
- Must not depend on Salesforce features that don't exist

**Broadly Applicable**
- Controls should apply to most Salesforce orgs
- Should address common security patterns, not edge cases
- Must not be specific to a particular industry unless clearly scoped

**Well-Documented**
- Clear rationale explaining the security benefit
- Detailed audit procedures that an auditor can follow
- Specific remediation steps

### Writing Style

- Use clear, professional language
- Be prescriptive, not suggestive ("must" not "should consider")
- Use active voice
- Be concise but complete
- Follow the existing tone and format

## Contributor Agreement

By submitting a contribution to SBS, you agree that:

1. **You have the right to submit the contribution** — You either created the content yourself or have permission to contribute it
2. **Your contribution is licensed under CC BY-SA 4.0** — The same license as the rest of SBS
3. **You grant SBS maintainers permission to include your work** — As part of the canonical SBS standard
4. **You understand SBS is a community standard** — Not owned by any single entity or company

This is not a formal CLA (Contributor License Agreement), but a statement of good faith that protects both contributors and the SBS project.

## Recognition

Contributors will be acknowledged in:
- The `about.md` page (for significant contributions)
- Git commit history (for all contributions)
- Release notes (when contributions are included in a version)

## Questions?

If you have questions about contributing, please:
- Open an issue for discussion
- Review existing controls to understand the format
- Read the full SBS documentation at the website

Thank you for helping make Salesforce environments more secure!

