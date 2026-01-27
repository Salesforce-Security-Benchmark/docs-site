## Foundations

This section establishes the foundational requirements for SBS compliance. These controls define the organizational capabilities and documentation practices that enable all other controls in the benchmark. Without a centralized system of record, organizations cannot reliably demonstrate compliance, maintain audit trails, or govern exceptions consistently across their Salesforce security posture.

### SBS-FDNS-001: Centralized Security System of Record

**Control Statement:** The organization must maintain a centralized system of record documenting all Salesforce security configurations, exceptions, justifications, and SBS-required inventories.

**Description:**  
The organization must maintain a centralized, durable, and accessible system of record that documents all Salesforce security-relevant configurations, exceptions, justifications, approvals, and control-specific inventories required by the SBS. The system of record must not rely on personal knowledge or undocumented institutional memory.

**Rationale:**  
A formally maintained system of record is foundational for ensuring repeatable, auditable, and transparent security governance. Without a centralized repository, organizations cannot reliably track required justifications, exceptions, or configuration states, resulting in control failures, loss of historical context, and inconsistent application of security standards. A system of record enables auditors, security engineers, and automation tools to validate compliance objectively.

**Audit Procedure:**  
1. Identify and review the organization’s designated system of record for Salesforce security governance.  
2. Verify that the system of record is centrally accessible to authorized personnel and is not dependent on individual personnel knowledge.  
3. Confirm that the system of record includes all artifacts required by SBS controls, including:  
   - Documented justifications for elevated permissions or exceptions.  
   - Inventories of profiles, permission sets, permission set groups, integrations, API-enabled entities, and other required listings.  
   - Recorded security decisions, approvals, and exceptions.  
4. Validate that the system of record is current and reflects the state of the Salesforce environment at the time of audit.

**Remediation:**  
1. Establish or designate a centralized system of record capable of storing and maintaining all required SBS documentation.  
2. Populate the system of record with all missing inventories, justifications, and security-relevant artifacts mandated by SBS controls.  
3. Implement a maintenance process to keep the system of record current with ongoing changes to the Salesforce environment.

**Default Value:**  
Salesforce does not provide or require a system of record for documenting security-relevant metadata, exceptions, or justifications.

### SBS-FDNS-002: Document and Maintain a Salesforce Exit Plan

**Control Statement:** The organization must maintain a documented Salesforce exit plan that defines how data, metadata, integrations, and business processes would be migrated or decommissioned.

**Description:**  
Organizations must maintain a current exit plan that includes data export and retention requirements, metadata migration approach, integration dependencies, ownership, and cutover/rollback strategy. The plan must be reviewed on a defined schedule and updated after material architectural or integration changes.

**Risk:** <Badge type="tip" text="Moderate" />  
Without a documented exit plan, organizations risk data loss, extended downtime, and uncontrolled exposure during platform transitions, contract termination, or major incidents requiring rapid migration.

**Audit Procedure:**  
1. Obtain the documented Salesforce exit plan.  
2. Verify the plan includes data export/retention, metadata migration, integration dependencies, ownership, and cutover/rollback steps.  
3. Confirm the review schedule and evidence of the most recent review.  
4. Flag noncompliance if any required section is missing or the plan is outdated.

**Remediation:**  
1. Create and document the exit plan with required sections.  
2. Assign ownership and define a review cadence.  
3. Update the plan after major system or integration changes.

**Default Value:**  
Salesforce does not provide an organization-specific exit plan by default.
