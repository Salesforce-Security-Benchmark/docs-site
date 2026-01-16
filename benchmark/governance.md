# Governance

This section defines controls related to access governance processes, including access review and recertification, change management, and accountability mechanisms. These controls ensure that organizations maintain intentional authorization decisions, documented approval of all access changes, periodic validation of governance decisions, reducing the risk of privilege creep, unauthorized access changes, unauthorized users, and lack of accountability in access control decisions.

### SBS-GOV-001: Enforce Periodic Access Review and Recertification

**Control Statement:** All user access, permission sets, permission set groups, and role assignments must be formally reviewed and recertified at least annually by designated business stakeholders, with documented approval and remediation of unauthorized or excessive access.

**Description:** The organization must implement a periodic access review process that ensures all active user access is intentional, necessary, and aligned with current job responsibilities. An access review encompasses all authorization constructs including user profiles, permission set assignments, permission set group memberships, and role hierarchies. A designated business stakeholder (typically a manager, department lead, or data owner) must certify that each user's access is appropriate, with documented evidence of review and approval. Any access identified as excessive, outdated, or no longer required must be documented and remediated within a defined timeframe. The review must include both individual user access and permission construct usage.

The process must establish clear ownership, defined frequency (minimum annual but may be more frequent for sensitive roles or data), and tracked remediation of findings. Organizations may conduct reviews by individual, by business unit, by data classification, or by application—but all access must be reviewed at least annually in aggregate.

**Example implementations:**
* Annual access reviews conducted by department managers in Q1, with remediation required within 30 days; tracked in a centralized system of record with sign-off by HR and Security
* Rolling quarterly reviews where each business unit certifies access for their users on a rotating schedule, with all users reviewed within the calendar year
* Role-based reviews where each application owner certifies all users assigned to specific permission sets or profiles, ensuring full coverage across all users annually
* Sensitive role reviews conducted semi-annually (e.g., System Administrator, Finance, HR users) while standard users are reviewed annually

**Rationale:** Access review is the foundational control for preventing privilege creep, detecting unauthorized access, and remediating excessive permissions. Without periodic review, users accumulate access over time—permissions granted for past roles remain after job changes, access added for temporary projects becomes permanent, and no formal mechanism ensures access remains least-privilege. Periodic formal recertification by business stakeholders ensures that access governance remains aligned with organizational reality. Documentation of review creates an audit trail and ensures accountability. Regular remediation prevents drift and maintains the integrity of the permission set model defined in SBS-PERM-001.

**Audit Procedure:**
1. Obtain the organization's documented access review policy, including:
   * Defined frequency (annual minimum)
   * Designated reviewers and escalation path
   * Coverage scope (all users, all access types)
   * Remediation timeframe for findings
   * System of record for tracking review and findings
2. Identify the most recent completed access review cycle (within 12 months of audit date).
3. Sample the access review documentation (minimum 20% of user population or 50 users, whichever is greater) to verify:
   * Evidence of formal review by designated stakeholder (sign-off, approval, attestation)
   * Date of review and certification
   * Scope of access reviewed (all access constructs or documented scope)
   * Any findings or exceptions documented
4. For any access identified as excessive, unauthorized, or not recertified:
   * Verify the finding was documented
   * Confirm remediation action taken or justified exception approved
   * Check completion date against defined remediation SLA
5. Verify that the organization maintains a system of record tracking:
   * Who reviewed what access
   * When the review occurred
   * What was approved or questioned
   * What remediation was required and completed
6. Confirm that the review process captures all user access types, including:
   * Standard user profiles
   * Permission set assignments
   * Permission set group memberships
   * Role and role hierarchy assignments
   * Delegated administration or elevated permissions

**Remediation:**
1. If no access review process exists, establish documented policy including frequency, reviewers, scope, and remediation SLAs.
2. Conduct an initial comprehensive access review of all active users, with business unit or department ownership of sign-off.
3. Identify and remediate all access determined excessive, unauthorized, or inappropriate during the initial review.
4. Implement a system of record (spreadsheet, governance tool, or integrated platform) to track reviews, findings, and remediation.
5. Schedule recurring access reviews at minimum annual frequency, with quarterly reviews for sensitive roles or high-risk data.
6. Document the review process, including templates, stakeholder roles, and escalation procedures.
7. Establish accountability for reviewers and tie review completion to performance management or audit requirements.

**Default Value:** Salesforce does not automatically initiate user access reviews or require stakeholder recertification of access. Organizations must manually track and document access review processes. Without a defined process, access authorization decisions are not systematically validated, and no audit trail of business stakeholder approval exists.

---

### SBS-GOV-002: Enforce Documented Change Management Governance for Access and Authorization

**Control Statement:** All changes to user access, permission sets, permission set groups, profiles, roles, and authorization-related configuration must follow a documented change management process that includes approval, implementation tracking, and audit logging.

**Description:** The organization must implement a documented change management governance process that covers all changes to authorization and access control mechanisms in Salesforce. This includes:
* Creation, modification, or deletion of users
* Assignment or removal of profiles, permission sets, or permission set groups
* Modification of permission set or profile permissions (add/remove/modify)
* Changes to role hierarchies
* Custom permission creation or modification
* Sharing rule changes that affect access
* Setup permission or user permission changes

The change management process must define:
* Request and approval workflow (who requests, who approves, approval criteria)
* Change categorization (standard, expedited, emergency) with defined SLAs
* Implementation procedure and tracking
* Rollback or reversal procedures
* Documentation and audit trail requirements
* Emergency procedures with compensating controls if expedited approval is permitted

The process must ensure that all changes are intentional, approved before implementation, traceable to a business justification, and auditable. Changes must not circumvent the documented permission set model (SBS-PERM-001) or access review process (SBS-GOV-001).

**Example implementations:**
* Centralized access request system (ServiceNow, Okta, or similar) where users request access changes through a portal; requests route to manager for approval and then System Administrator for implementation; all changes logged with timestamps, approver, and justification
* Decentralized process where permission set owners manage their own permission sets with approval required from a centralized access governance team before deployment; changes tracked in version control with pull request reviews
* Emergency change procedure for urgent access needs with restricted approvers and mandatory review within 5 business days; expedited changes tracked separately with enhanced logging and earlier review cycle
* Automated provisioning driven by source-of-truth systems (HR system, Azure AD) with manual exception handling; provisioning rules documented as policy and exception requests follow formal change process

**Rationale:** Change management governance ensures that all access modifications are intentional, authorized, and traceable. Without formal change management, access changes may be made ad hoc without approval, lack business justification, and create blind spots in audit trails. Formal governance prevents unauthorized access escalation, ensures changes align with organizational policy and the documented permission model, and provides evidence of controls during compliance audits. Approval workflows distribute decision-making appropriately (managers validate job necessity; security validates policy compliance). Audit trails enable detection of unauthorized changes and support forensic investigation if access is misused. Emergency procedures ensure that urgent access needs can be met while still maintaining accountability and subsequent review.

**Audit Procedure:**
1. Obtain the organization's documented change management policy for access and authorization, including:
   * Request workflow and approval authority
   * Change categorization and SLAs
   * Implementation procedures
   * Rollback procedures
   * Documentation requirements
   * Emergency procedures (if permitted) and compensating controls
2. Verify that the policy is communicated and enforced through a defined system or process (access request system, ticketing system, email workflow, or equivalent).
3. Identify all changes made to user access, permission sets, profiles, roles, or permission configuration during a sample period (minimum 30 days, recommended 90 days).
4. Sample a minimum of 20 changes or 10% of changes during the period (whichever is greater) to verify:
   * An associated request or approval record exists
   * The request includes business justification or change reason
   * Appropriate approval is documented (manager, business owner, security)
   * Implementation is documented with timestamp and implementer identity
   * The implemented change matches the approved request
   * Change is recorded in Salesforce audit logs or setup change history
5. For any identified changes without documented approval:
   * Determine if the change was authorized but not recorded
   * Verify if an exception process was followed
   * Identify if change was unauthorized
6. Verify that the change management process is integrated with or enforces the documented permission set model (SBS-PERM-001) and does not allow changes that violate the model.
7. If emergency or expedited procedures exist, sample procedures to verify:
   * Usage is limited to genuine emergencies
   * Approval authority is clearly defined
   * Expedited changes are flagged for later formal review
   * Compensating controls are documented and operating

**Remediation:**
1. If no change management process exists, develop and document policy covering change request, approval, implementation, and audit requirements.
2. Select or implement a system of record to track access change requests and approvals (can be as simple as a controlled shared spreadsheet with approval workflows, or as sophisticated as integrated provisioning and access governance platform).
3. Define change categorization with clear criteria:
   * Standard changes: routine access requests following documented procedures (5–10 business day SLA typical)
   * Expedited changes: justified urgent requests with restricted approval (24–48 hour SLA; not routine)
   * Emergency changes: genuine emergencies with designated emergency approver and mandatory review within 5 business days (use sparingly)
4. Require all requests to include:
   * Requestor name and role
   * User(s) affected
   * Specific access change requested
   * Business justification
   * Manager or business owner approval
   * Approval date and approver identity
5. Establish implementation procedures that:
   * Require approval before implementation
   * Document who implemented and when
   * Verify changes deployed match approved request
   * Create auditable record in Salesforce
6. Implement rollback procedures for changes that must be reversed (incorrect access granted, user left organization, etc.).
7. Integrate change process with the access review cycle (SBS-GOV-001) to catch unauthorized changes during periodic review.
8. Periodically audit change logs to identify:
   * Changes lacking documented approval
   * Patterns of bypassed approval
   * Excessive use of emergency procedures
   * Changes violating the documented permission model

**Default Value:** Salesforce does not enforce change management governance for access modifications. System Administrators can directly modify user access, permission sets, profiles, or roles without approval workflow, request documentation, or business justification. Changes are recorded in Setup Audit Trail (if enabled), but no approval or governance policy is enforced. Many organizations create custom solutions (Apex workflows, custom applications, or integrated third-party systems) to implement change management, but without policy and process definition, implementation is inconsistent.

---

## Integration Notes

**SBS-GOV-001 and SBS-GOV-002 work together:**
* **SBS-PERM-001** (Enforce Documented Permission Set Model) defines *what* the permission structure should be
* **SBS-GOV-002** (Change Management) enforces *how* changes to that structure are governed
* **SBS-GOV-001** (Access Review) validates that the structure remains correct over time and catches exceptions

**Typical governance sequence:**
1. Define and document the permission set model (SBS-PERM-001)
2. Implement change management for all access modifications (SBS-GOV-002)
3. Conduct initial access review to validate current state (SBS-GOV-001)
4. Remediate any noncompliant access identified
5. Establish periodic access review cycle (SBS-GOV-001) to maintain governance
