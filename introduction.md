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

- **Control ID** — A unique identifier for reference (e.g., SBS-AG-003).  
- **Description** — A clear requirement that must be met for compliance.  
- **Rationale** — The security justification for the control.  
- **Audit Procedure** — Steps to evaluate whether the requirement is met.  
- **Remediation** — Actions needed to bring the environment into compliance.  
- **Default Value** — Salesforce’s default behavior relevant to this control.  

**Interpretation:**  
- If a control’s requirement is not satisfied, the environment is **noncompliant** with SBS.  
- Partial compliance is not recognized.  
- Organizations may choose to implement compensating controls, but these do not replace formal compliance unless explicitly documented and accepted by their internal security authority.

This format ensures that SBS remains consistent, measurable, and suitable for auditing, consulting, and automated scanning tools.

## 1.4 Risk Modeling

SBS classifies controls based on **risk**, reflecting the degree to which failure to implement a control weakens an organization's ability to safely operate Salesforce as a controlled system. Risk levels in SBS are not intended to describe traditional "hacking" scenarios or attacker sophistication. Instead, they model **loss of control, exposure amplification, and governance failure** within a SaaS platform where security outcomes are primarily driven by access, configuration, integration, and operational discipline. Risk levels are designed to help CISOs, security leaders, and auditors prioritize remediation efforts, assess residual risk, and make intentional, defensible decisions about risk acceptance.

### Critical Risk

A Critical Risk control addresses conditions where failure to implement the control results in a **loss of effective organizational control over Salesforce**, including access, data, or change activity. In these scenarios, unauthorized actions, data exposure, or material misconfiguration can occur without reliable prevention, detection, or accountability, and remediation after the fact may be incomplete or infeasible. Critical Risk controls define the minimum conditions required for Salesforce to function as a trusted system of record and must be implemented or explicitly accepted by appropriate risk authority.

### High Risk

A High Risk control addresses conditions that introduce **significant exposure or governance gaps** that materially increase the likelihood, scope, or persistence of misuse, over-privileged access, unintended data exposure, or unauthorized change. These weaknesses often do not cause incidents on their own, but they **compound other failures**, expand blast radius, or impair the organization's ability to detect, investigate, or respond effectively. High Risk controls require mitigation, documented compensating controls, or formal risk acceptance.

### Moderate Risk

A Moderate Risk control addresses **defense-in-depth, assurance, or operational maturity gaps** that do not directly enable misuse or exposure, but reduce confidence, consistency, or resilience of the Salesforce security program. These controls primarily affect governance quality, auditability, and long-term sustainability rather than immediate risk. Moderate Risk controls should be evaluated and addressed based on organizational context, scale, and risk tolerance.

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
