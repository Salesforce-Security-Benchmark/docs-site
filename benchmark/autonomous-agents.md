## Autonomous Agent and Intelligent Automation Security

This section defines controls related to the governance and auditability of autonomous agents and automated execution pipelines operating within Salesforce environments. These controls apply to any programmatic execution pathway that initiates write-path operations — including DML and external callouts — without a human actor present at the point of execution. This includes AI agent frameworks, Autolaunched Flows running in system context, scheduled Apex, and integration automation users.

### SBS-AUTO-001: Enforce Pre-Execution Governance Validation for Autonomous Agent Actions

**Control Statement:** All autonomous agents and automated execution pipelines that initiate write-path operations must evaluate the executing context against a defined governance policy before any DML or external callout proceeds.

**Description:**
Organisations must implement a governance validation mechanism that intercepts autonomous execution before write-path operations are initiated. The validation must evaluate the identity and trust classification of the executing agent or automation, whether the requested action class is permitted for that trust level, and whether the action falls within defined operational boundaries for the current execution context.

This mechanism must be implemented at the platform layer, not delegated to individual automation components. Each autonomous execution pipeline must invoke the governance check before proceeding. Execution must not continue if the check does not return an explicit approval.

Execution pathways in scope include:
- AI agent frameworks invoking Apex actions or Flow-based action plans
- Autolaunched Flows initiated without a human actor in the execution context
- Scheduled Apex jobs performing DML or callouts
- Integration users executing record modifications via API
- `@InvocableMethod` endpoints callable by automated pipelines

Governance policy rules must be defined in a durable, version-controlled configuration store — such as Custom Metadata Types — and must not be editable by the automation users whose actions the policy governs.

**Risk:** <Badge type="danger" text="Critical" />
Without this control, autonomous agents and automated pipelines can initiate privileged write-path operations — including record creation, modification, deletion, and external callouts — with no checkpoint evaluating whether the action is permitted. Because automated pipelines frequently run under elevated system-context permissions, bypassing sharing rules by default, a single misconfigured or compromised automation can modify or exfiltrate data at scale. Unlike human-initiated actions, which require interactive authentication and generate login-time signals, automated execution provides no inherent checkpoint between permission grant and action execution. This control establishes that checkpoint. Its absence means no other control prevents unauthorised automated write-path activity without also failing.

**Audit Procedure:**
1. Identify all autonomous execution pathways in the org, including AI agent frameworks, Autolaunched Flows without human actors, scheduled Apex, integration users executing DML via API, and `@InvocableMethod` endpoints callable by automated pipelines.
2. For each pathway, verify that a pre-execution governance check is invoked before any DML or callout proceeds.
3. Confirm the governance mechanism evaluates the executing identity or agent classification, the action type requested, and whether the combination is explicitly permitted under the defined policy.
4. Verify that the mechanism blocks execution — not merely logs — when the governance check does not return explicit approval.
5. Review the policy store (Custom Metadata Types or equivalent) to confirm governance rules are defined, versioned, and protected from modification by the automation users they govern.
6. Flag any automated execution pathway that initiates write-path operations without a pre-execution governance check as noncompliant.

**Remediation:**
1. Implement a governance validation service — an Apex class invoked at the entry point of each autonomous execution pathway — that evaluates the executing context against a defined policy before any write-path operation proceeds.
2. Define governance policy rules in Custom Metadata Types or an equivalent durable configuration store, classifying permitted action types by agent or automation identity.
3. Configure all autonomous execution pathways to invoke the governance service as the first operation, before any DML or callout.
4. Implement hard-stop behaviour: if the governance check does not return explicit approval, execution must halt and the attempt must be recorded.
5. Restrict write access to the governance policy store to administrative identities separate from the automation users whose behaviour the policy governs.

**Default Value:**
Salesforce does not provide a pre-execution governance validation mechanism for autonomous agent actions or automated execution pipelines. Agentforce agent actions, Autolaunched Flows, scheduled Apex, and integration automation proceed directly to execution once invoked, with no platform-enforced checkpoint evaluating whether the action is permitted for the executing context. Governance is entirely the responsibility of the implementing organisation.

---

### SBS-AUTO-002: Maintain Durable Audit Record of Autonomous Agent Action Decisions

**Control Statement:** Organisations must retain a durable, queryable record of each autonomous agent action decision, capturing the executing identity, the governance evaluation outcome, and the action type attempted.

**Description:**
For every execution of an autonomous agent action or automated pipeline that passes through the governance validation required by SBS-AUTO-001, organisations must write a structured audit record to durable Salesforce storage — such as a dedicated custom object — before the action proceeds. Records must capture at minimum:

- The identity of the executing agent or automation
- The action type requested
- The governance evaluation outcome (approved or blocked)
- The timestamp of the decision
- Sufficient context to reconstruct the execution event during a forensic investigation

Records must not rely on Salesforce debug logs, which are transient, size-limited, and automatically purged. The audit store must be queryable by security and compliance teams independently of the executing automation's own logs.

Automation users whose actions are being recorded must not hold delete permissions on the audit store.

**Risk:** <Badge type="warning" text="High" />
Without durable audit records of agent action decisions, security teams cannot reconstruct what autonomous agents did, when, under what authority, and whether governance controls functioned correctly. In regulated environments, this creates a direct compliance gap: HIPAA, FDA 21 CFR Part 11, and Basel operational risk standards require demonstrable audit trails for automated processes acting on regulated data. Without this record, a compromised or misconfigured automation could execute write-path operations at scale with no forensic trail, leaving investigators without the basis to determine scope, attribution, or compliance status after the fact.

**Audit Procedure:**
1. Verify that a durable audit record store — a custom object or equivalent persistent storage — exists and is dedicated to capturing autonomous agent action decisions.
2. Confirm that records are written for every agent action decision, covering both approved and blocked outcomes.
3. Inspect a representative sample of records to verify they contain the executing identity, action type, governance outcome, and timestamp at minimum.
4. Confirm that records persist beyond Salesforce debug log retention limits and are not written solely to debug logs.
5. Verify the audit store is queryable by security and compliance teams using standard Salesforce query tools.
6. Confirm that automation users whose actions are recorded do not hold delete or modify permissions on the audit store.
7. Flag any autonomous execution pathway covered by SBS-AUTO-001 that does not produce a corresponding audit record as noncompliant.

**Remediation:**
1. Create a dedicated custom object to store agent action audit records, with fields for executing identity, action type, governance outcome, timestamp, and an execution context field.
2. Update the governance validation service (SBS-AUTO-001) to write an audit record as part of every governance evaluation, before returning the outcome to the calling automation.
3. Restrict delete and modify permissions on the audit object to administrative identities only. Automation users require create access only.
4. Implement a retention policy ensuring records are preserved for the duration required by applicable regulatory obligations.

**Default Value:**
Salesforce does not generate or retain durable audit records of autonomous agent action decisions by default. Agentforce action execution, Autolaunched Flow invocations, and scheduled Apex runs do not produce persistent, queryable governance audit records. Salesforce debug logs are transient and unsuitable for forensic or compliance purposes. Organisations are fully responsible for implementing durable audit storage for automated execution events.
