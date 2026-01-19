# 1. Introduction

This section defines the purpose, scope, definitions, and control structure for the Security Benchmark for Salesforce (SBS).

## 1.1 Purpose

Salesforce provides industry-leading security capabilities, certifications, and compliance frameworks built into the platform. The Security Benchmark for Salesforce (SBS) is a **practitioner-developed standard** that helps organizations fully leverage these capabilities by defining baseline security requirements for operating Salesforce environments at enterprise scale.

SBS establishes a **common reference** for evaluating security posture in a consistent, auditable, and repeatable manner. It is intended for use by:

- Security teams assessing configuration, governance, and operational practices  
- Auditors and consultants conducting structured compliance evaluations  
- System integrators implementing secure Salesforce environments  
- Security tooling designed to measure and report on compliance  

SBS is complementary to established frameworks such as NIST and ISO. While those frameworks define program-level security principles, SBS translates them into **Salesforce-specific requirements**—concrete, auditable expectations for Salesforce environments.

**Important:** SBS is not a certification program and does not replace regulatory or compliance obligations. It is an independent initiative, not a Salesforce product, and is not endorsed or supported by Salesforce, Inc.

## 1.2 Motivation

Most Salesforce environments evolve organically—permissions accumulate, integrations multiply, and configurations drift. Over time, it becomes difficult to answer basic security questions: *Who has access to what? Why? Is this configuration still appropriate?*

SBS provides a structured way to answer these questions. By adopting the benchmark, organizations gain:

- **Clarity** — A defined standard to measure against, rather than subjective assessments or tribal knowledge about what "secure" means for your org.

- **Confidence** — The ability to demonstrate to leadership, auditors, and regulators that your Salesforce environment meets a recognized security baseline.

- **Control** — Visibility into permissions, integrations, and configurations—with documented justifications for why things are the way they are.

- **Continuity** — A repeatable process for evaluating security posture over time, detecting drift, and onboarding new team members with clear expectations.

SBS doesn't require perfection. It requires knowing where you stand, documenting your decisions, and maintaining accountability for your security posture.

## 1.3 Control Format and Interpretation

Each SBS control is written in a **prescriptive, binary format** designed to determine compliance. Controls include the following components:

- **Control ID** — A unique identifier for reference (e.g., SBS-AUTH-001).  
- **Control Statement** — A clear requirement that must be met for compliance.  
- **Description** — Additional context on what the control requires.  
- **Risk** — The risk level and explanation of what goes wrong if the control is not implemented.  
- **Audit Procedure** — Steps to evaluate whether the requirement is met.  
- **Remediation** — Actions needed to bring the environment into compliance.  
- **Default Value** — Salesforce's default behavior relevant to this control.  

**Interpretation:**  
- If a control’s requirement is not satisfied, the environment is **noncompliant** with SBS.  
- Partial compliance is not recognized.  
- Organizations may choose to implement compensating controls, but these do not replace formal compliance unless explicitly documented and accepted by their internal security authority.

This format ensures that SBS remains consistent, measurable, and suitable for auditing, consulting, and automated scanning tools.

## 1.4 Risk Modeling

SBS classifies controls based on **risk**, reflecting the security impact when a control is not implemented. Risk levels help CISOs, security leaders, and auditors prioritize remediation efforts, assess residual risk, and make intentional, defensible decisions about risk acceptance.

### Classification Framework

To determine a control's risk level, apply these questions in order:

1. **Does this control establish a security boundary?** If the control fails, can unauthorized users gain access, or can authorized users take actions beyond their intended scope—without requiring other controls to also fail? → **Critical**

2. **Does this control provide visibility?** If the control fails, is the organization's ability to detect security events, investigate incidents, or respond to breaches materially degraded? → **High**

3. **Does this control add assurance?** If the control fails, do other controls still provide coverage, with this control primarily improving confidence, consistency, or audit readiness? → **Moderate**

### Critical

A Critical control establishes a **security boundary** that, if absent, allows unauthorized access or actions without requiring other controls to fail. These are foundational controls—the organization cannot operate Salesforce as a trusted system without them.

**Indicators:**
- Unauthorized users can authenticate or access data
- Authorized users can exceed their intended permissions
- Changes can occur without any accountability mechanism
- The failure enables direct exploitation, not just increased likelihood

**Examples:** SSO enforcement (prevents credential-based attacks), core permission boundaries (prevents unauthorized data access), audit trail integrity (prevents unaccountable changes).

### High

A High control provides **visibility or response capability** that, if absent, prevents the organization from detecting, investigating, or responding to security events. The control doesn't prevent incidents directly, but its absence means incidents go unnoticed, unscoped, or unremediated.

**Indicators:**
- Security events cannot be detected or alerted on
- Incidents cannot be investigated or attributed
- Breach scope cannot be determined
- Compliance obligations requiring visibility cannot be met

**Examples:** Persistent application logging (enables investigation), regulated data discovery (enables breach scoping), security monitoring and alerting (enables detection).

### Moderate

A Moderate control provides **assurance or defense-in-depth** that reduces the likelihood of issues but where other controls still provide coverage if this control fails. These controls improve confidence, consistency, and operational maturity rather than serving as primary defenses.

**Indicators:**
- Other controls catch the same issues (defense-in-depth)
- The control improves quality but isn't the last line of defense
- Failure increases risk but requires additional failures to cause harm
- The control primarily supports governance, training, or process consistency

**Examples:** Peer code review (SAST and testing also catch issues), documentation requirements (support auditability but don't prevent incidents), security training (reduces likelihood but other controls enforce boundaries).

## 1.5 Versioning

SBS uses a three-part version number: **MAJOR.MINOR.REVISION**

**MAJOR** — Increased when controls are added, removed, renumbered, recategorized, or when a control's requirement meaningfully changes. These are breaking changes that may affect compliance status.

**MINOR** — Increased when supporting text (description, audit steps, remediation, rationale) changes without altering the control requirement. Organizations remain compliant, but implementation guidance has improved.

**REVISION** — Increased for purely editorial updates such as typos, formatting, or link fixes. No substantive changes to controls or guidance.

Once a version is published, it is never modified. Any change requires incrementing one of the version segments.

### Draft Phase (0.x.y)

During active development, MAJOR remains 0, even if controls are added, removed, or significantly changed. All drafts evolve within 0.MINOR.REVISION.

The first stable public release becomes **1.0.0**.

**Examples:**
- `0.3.0` — Draft with added/removed controls
- `0.3.1` — Editorial fixes during draft
- `1.0.0` — First official SBS release
- `1.1.0` — Updated descriptions and audit steps
- `2.0.0` — Added new controls
