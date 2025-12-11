# Contributing to SBS

Thank you for your interest in contributing to the Security Benchmark for Salesforce (SBS)! Community contributions help make SBS more comprehensive, accurate, and valuable for the entire Salesforce security ecosystem.

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
- Updating references
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

**Rationale:**  
Why this control exists and what risk it mitigates.

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

**References:**  
- Relevant Salesforce documentation
- Industry standards (NIST, CIS, OWASP, etc.)
- Compliance frameworks (GDPR, HIPAA, etc.)
```

**For existing control changes:**

Edit the markdown file and clearly describe what you changed and why in your PR.

### Step 3: Update Controls At-a-Glance

If you're adding a new control, add the control statement to `controls-at-a-glance.md` in the appropriate category and update the total control count.

### Step 4: Test Locally

Run the XML generation script to ensure your changes don't break parsing:

```bash
python3 scripts/generate_xml.py
```

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
- References to authoritative sources

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

