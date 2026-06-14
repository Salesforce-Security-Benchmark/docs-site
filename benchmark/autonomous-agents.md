## Autonomous Agent and Intelligent Automation Security

This section defines controls related to the governance and auditability of autonomous agents operating within Salesforce environments. These controls apply specifically to autonomous agent frameworks where the action set is determined at runtime based on a goal and available tool catalogue — not at implementation time. Scheduled Apex, batch jobs, Autolaunched Flows with predetermined logic, and integration automation users are explicitly out of scope. Governance for those patterns occurs at deployment time and is addressed by existing SBS-DEP controls.

### SBS-AUTO-001: Enforce Pre-Execution Governance Validation for Autonomous Agent Actions {#sbs-auto-001}

**Control Statement:** 
All autonomous agent frameworks that select and initiate actions at runtime must evaluate the executing context against a defined governance policy before any DML or external callout proceeds.

**Description:**
Organisations must implement a governance validation mechanism that intercepts autonomous agent action execution before write-path operations are initiated. The validation must evaluate the identity and trust classification of the executing agent, whether the requested action is permitted for that trust level, and whether the action falls within defined operational boundaries for the current execution context.

This mechanism must be implemented at the platform layer. Each autonomous agent action invocation must pass through the governance check before proceeding. Execution must not continue if the check does not return an explicit approval.

Execution pathways in scope are limited to autonomous agent frameworks where the action set is determined at runtime based on a goal and an available tool catalogue, not at implementation time. This includes Agentforce agent actions and equivalent frameworks invoking Apex actions or Flow-based action plans through runtime action selection.

Scheduled Apex, batch jobs, Autolaunched Flows with predetermined logic, and integration automation users are  explicitly out of scope. Governance for those patterns occurs at deployment time and is addressed by existing SBS-DEP controls.

Governance policy rules must be defined in a durable, version-controlled configuration store — such as Custom Metadata Types — and must not be editable by the agent identities whose actions the policy governs.

**Risk:** Critical

Without this control, autonomous agents can initiate privileged write-path operations with no checkpoint evaluating whether the specific action selected at runtime is permitted. Unlike scheduled Apex or integration automation — where the action set is determined, reviewed, and approved at implementation time — an autonomous agent selects actions dynamically from a catalogue. The specific action does not exist at deployment time, so deployment governance cannot evaluate it. Pre-execution governance is the only point in the execution lifecycle where the action is known and can be assessed. No existing SBS control closes this gap — SBS-DEP controls address deployment governance, SBS-ACS controls address permissions, but neither addresses an autonomous agent selecting and executing an action at runtime.

**Audit Procedure:**
1. Identify all autonomous agent frameworks deployed in the org that select actions at runtime, including Agentforce agent configurations and equivalent frameworks. Query AgentDefinition and AgentActionDefinition metadata to enumerate deployed agents and their available action catalogues. Scheduled Apex, batch jobs, and integration automation are not in scope for this control.
2. For each deployed agent, verify that a pre-execution governance check is invoked before any DML or callout proceeds.
3. Confirm the governance mechanism evaluates the executing agent identity or classification, the action type requested, and whether the combination is explicitly permitted under the defined policy.
4. Verify that the mechanism blocks execution — not merely logs — when the governance check does not return explicit approval.
5. Review the policy store (Custom Metadata Types or equivalent) to confirm governance rules are defined, versioned, and protected from modification by the agent identities they govern.
6. Flag any autonomous agent action pathway that initiates write-path operations without a pre-execution governance check as noncompliant.

**Remediation:**
1. Implement a governance validation service — an Apex class invoked at the entry point of each autonomous agent action — that evaluates the executing context against a defined policy before any write-path operation proceeds.
2. Define governance policy rules in Custom Metadata Types or an equivalent durable configuration store, classifying permitted action types by agent identity or trust classification.
3. Configure all autonomous agent action pathways to invoke the governance service as the first operation, before any DML or callout.
4. Implement hard-stop behaviour: if the governance check does not return explicit approval, execution must halt and the attempt must be recorded.
5. Restrict write access to the governance policy store to administrative identities separate from the agent identities whose behaviour the policy governs.

**Default Value:**
Salesforce does not provide a pre-execution governance validation mechanism for autonomous agent action selection. Agentforce agent actions proceed directly to execution once selected by the agent runtime, with no platform-enforced checkpoint evaluating whether the action is permitted for the executing context.

---

### SBS-AUTO-002: Maintain Durable Audit Record of Autonomous Agent Action Decisions {#sbs-auto-002}

**Control Statement:** Organisations must retain a durable, queryable record of each autonomous agent action decision, capturing the executing agent identity, the governance evaluation outcome, and the action type attempted.

**Description:**
For every execution of an autonomous agent action that passes through the governance validation required by SBS-AUTO-001, organisations must write a structured audit record to durable Salesforce storage — such as a dedicated custom object — before the action proceeds. Records must capture at minimum:

- The identity of the executing agent
- The action type requested
- The governance evaluation outcome (approved or blocked)
- The timestamp of the decision
- Sufficient context to reconstruct the execution event during a forensic investigation

Records must not rely on Salesforce debug logs, which are transient, size-limited, and automatically purged. The audit store must be queryable by security and compliance teams independently of the executing agent's own logs.

Agent identities whose actions are being recorded must not hold delete permissions on the audit store.

**Risk:** High

Without durable audit records of autonomous agent action decisions, security teams cannot reconstruct what agents did, when, under what authority, and whether governance controls functioned correctly. In regulated environments, this creates a direct compliance gap: HIPAA, FDA 21 CFR Part 11, and Basel operational risk standards require demonstrable audit trails for automated processes acting on regulated data. Without this record, a compromised or misconfigured agent could execute write-path operations at scale with no forensic trail, leaving investigators without the basis to determine scope, attribution, or compliance status after the fact.

**Audit Procedure:**
1. Verify that a durable audit record store — a custom object or equivalent persistent storage — exists and is dedicated to capturing autonomous agent action decisions.
2. Confirm that records are written for every agent action decision, covering both approved and blocked outcomes.
3. Inspect a representative sample of records to verify they contain the executing agent identity, action type, governance outcome, and timestamp at a minimum.
4. Confirm that records persist beyond Salesforce debug log retention limits and are not written solely to debug logs.
5. Verify the audit store is queryable by security and compliance teams using standard Salesforce query tools.
6. Confirm that agent identities whose actions are recorded do not hold delete or modify permissions on the audit store.
7. Flag any autonomous agent action pathway covered by SBS-AUTO-001 that does not produce a corresponding audit record as noncompliant.

**Remediation:**
1. Create a dedicated custom object to store agent action audit records, with fields for executing agent identity, action type, governance outcome, timestamp, and execution context.
2. Update the governance validation service (SBS-AUTO-001) to write an audit record as part of every governance evaluation, before returning the outcome to the calling agent.
3. Restrict delete and modify permissions on the audit object to administrative identities only. Agent identities require create access only.
4. Implement a retention policy ensuring records are preserved for the duration required by applicable regulatory obligations.

**Default Value:**
Salesforce does not generate or retain durable audit records of autonomous agent action decisions by default. Agentforce action execution does not produce persistent, queryable governance audit records. Salesforce debug logs are transient and unsuitable for forensic or compliance purposes.