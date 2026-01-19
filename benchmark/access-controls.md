## Access Controls

This section defines controls related to permission sets, permission set groups, profiles, and access governance within Salesforce environments. These controls ensure that organizations maintain a structured, documented, and enforced approach to authorization management, reducing privilege sprawl and unauthorized access risks.

### SBS-ACS-001: Enforce a Documented Permission Set Model

**Control Statement:** All permission sets, permission set groups, and profiles must conform to a documented model maintained in a system of record and enforced continuously.

**Description:**  
The organization must define, document, and enforce a standardized permission set model within its system of record. A permission set model defines how the organization structures permissions—for example, using permission set groups to represent personas or departments, and permission sets to represent specific actions or capabilities. The specific structure is determined by the organization, but all profiles, permission sets, and permission set groups must conform to the documented model. No permission constructs may exist outside the defined model, and compliance must be evaluated and enforced on a near real-time basis.

**Example models:**
- Permission set groups represent job roles (Sales Rep, Service Agent), and individual permission sets represent capabilities (View Reports, Edit Accounts)
- Permission set groups represent departments (Sales, Marketing), and permission sets represent access tiers (Standard, Advanced)
- Permission sets represent business functions with no grouping hierarchy

**Risk:** <Badge type="warning" text="High" />  
Without a documented and enforced permission set model, organizations lose visibility into their authorization structure—accumulating ad hoc permission constructs created for one-time needs that are never reviewed or removed. This results in privilege sprawl, inconsistent access patterns, and inability to audit who has what access and why. Security teams cannot assess authorization posture, detect drift, or investigate access-related incidents when no authoritative model exists to compare against. The lack of continuous enforcement means unauthorized or excessive permissions can persist indefinitely without detection.

**Audit Procedure:**  
1. Obtain the organization's documented permission set model from the designated system of record.  
2. Enumerate all Profiles, Permission Sets, and Permission Set Groups using Salesforce Setup, Metadata API, or Tooling API.  
3. Compare each enumerated item against the documented model to determine whether:  
   - Its purpose or persona aligns with the model.  
   - Its included permissions conform to the model's structure and boundaries.  
   - Its naming and classification match the documented conventions.  
4. Identify any profiles, permission sets, or permission set groups that do not conform to the model.  
5. Verify that the organization has a process or automation that enforces model compliance in near real time (e.g., continuous scanning, pipelines, or governance workflows).

**Remediation:**  
1. Update or deprecate noncompliant profiles, permission sets, and permission set groups to align with the documented permission set model.  
2. Migrate users off legacy or misaligned authorization constructs.  
3. Implement or enhance automated enforcement to ensure continuous alignment with the defined model.  
4. Update the system-of-record documentation as the model changes.

**Default Value:**  
Salesforce does not enforce any specific permission set model. Profiles, permission sets, and permission set groups can be created without structure or alignment unless governed by the organization.

### SBS-ACS-002: Documented Justification for All `API-Enabled` Authorizations

**Control Statement:** Every authorization granting the `API Enabled` permission must have documented business or technical justification recorded in a system of record.

**Description:**  
All profiles, permission sets, and permission set groups that grant the `API Enabled` permission must be recorded in a designated system of record with a documented business or technical justification for requiring API access. Any authorization lacking documented rationale is noncompliant.

**Risk:** <Badge type="warning" text="High" />  
Without documented justification for API-enabled authorizations, organizations lose visibility into which users and systems can programmatically access Salesforce data at scale. The `API Enabled` permission enables large-scale data extraction, bulk modification, and automated operations—capabilities that create significant exposure when granted without oversight. Undocumented API access paths accumulate over time, preventing security teams from assessing data exfiltration risk, investigating suspicious API activity, or enforcing least privilege across automated access patterns.

**Audit Procedure:**  
1. Enumerate all profiles, permission sets, and permission set groups that include the `API Enabled` permission using Salesforce Setup, Metadata API, Tooling API, or an automated scanner.  
2. Compare the enumerated list against the organization’s designated system of record for API-enabled authorizations.  
3. Verify that every profile, permission set, and permission set group granting “API Enabled” has a corresponding entry in the system of record.  
4. Confirm that each entry includes:  
   - A clear business or technical justification for API access, and  
   - Any applicable exception or approval documentation.  
5. Flag as noncompliant any authorizations lacking documentation or justification.

**Remediation:**  
1. Remove the `API Enabled` permission from any profile, permission set, or permission set group that lacks a documented justification and is not required for business operations.  
2. For any authorization that legitimately requires API access, add or update the rationale in the system of record to clearly justify the need.  
3. Reconcile and update the system of record to ensure complete and accurate inventory of all API-enabled authorizations.

**Default Value:**  
Salesforce does not require or maintain a system of record for API-enabled authorizations. The `API Enabled` permission is disabled by default for standard profiles but may be granted by administrators.

### SBS-ACS-003: Documented Justification for `Approve Uninstalled Connected Apps` Permission

**Control Statement:** The `Approve Uninstalled Connected Apps` permission must only be assigned to highly trusted users with documented justification and must not be granted to end-users.

**Description:**  
All profiles, permission sets, and permission set groups that grant the `Approve Uninstalled Connected Apps` permission must be recorded in a designated system of record with a documented business or technical justification. This permission should only be assigned to highly trusted users, such as administrators and developers involved in managing or testing connected app integrations. Any authorization lacking documented rationale is noncompliant.

**Risk:** <Badge type="danger" text="Critical" />  
The `Approve Uninstalled Connected Apps` permission allows users to bypass Connected App usage restrictions and self-authorize any OAuth application without administrator approval. This establishes an uncontrolled security boundary: users with this permission can grant external applications access to Salesforce data without oversight, enabling data exfiltration, unauthorized integrations, and potential account compromise. Unlike other permissions that require additional failures to exploit, this permission directly enables unauthorized third-party access the moment it is misassigned—making it a primary security boundary that must be tightly controlled.

**Audit Procedure:**  
1. Enumerate all profiles, permission sets, and permission set groups that include the `Approve Uninstalled Connected Apps` permission using Salesforce Setup, Metadata API, Tooling API, or an automated scanner.  
2. Compare the enumerated list against the organization's designated system of record for this permission.  
3. Verify that every profile, permission set, and permission set group granting "Approve Uninstalled Connected Apps" has a corresponding entry in the system of record.  
4. Confirm that each entry includes:  
   - A clear business or technical justification for requiring this permission,  
   - Identification of the user role or persona (e.g., administrator, developer, integration manager),  
   - Any applicable exception or approval documentation, and  
   - Confirmation that the use case is limited to testing or managing connected app integrations.  
5. Verify that the permission is not assigned to end-user profiles or permission sets intended for general business users.  
6. Flag as noncompliant any authorizations lacking documentation, justification, or assigned to unauthorized user populations.

**Remediation:**  
1. Remove the `Approve Uninstalled Connected Apps` permission from any profile, permission set, or permission set group that lacks a documented justification or is assigned to end-users.  
2. For any authorization that legitimately requires this permission (e.g., administrators or developers testing connected apps), add or update the rationale in the system of record to clearly justify the need and identify the specific role or use case.  
3. Ensure that connected apps required for business operations are properly installed and allowlisted rather than relying on this permission for end-user access.  
4. Reconcile and update the system of record to ensure complete and accurate inventory of all assignments of this permission.

**Default Value:**  
The `Approve Uninstalled Connected Apps` permission is not granted by default in Salesforce. This permission was introduced in September 2025 as part of Connected App Usage Restrictions changes. Organizations must explicitly assign this permission to users who require it for legitimate testing or integration management purposes.

### SBS-ACS-004: Documented Justification for All Super Admin–Equivalent Users

**Control Statement:** All users with simultaneous `View All Data`, `Modify All Data`, and `Manage Users` permissions must be documented in a system of record with clear business or technical justification.

**Description:**  
All users who hold *simultaneous* authorization for `View All Data`, `Modify All Data`, and `Manage Users`—collectively constituting Super Admin–level access—must be identified and documented in the system of record with a clear business or technical justification. Any user with this combination of permissions who lacks documented rationale is noncompliant.

**Risk:** <Badge type="warning" text="High" />  
Without documented justification for Super Admin–equivalent users, organizations lose visibility into who possesses unrestricted access to the entire Salesforce environment. These users can read and modify all data, manage user accounts, and alter the security posture of the org without oversight. Undocumented Super Admin access prevents security teams from assessing breach impact, investigating administrative actions, or maintaining accountability for the most sensitive operations. The inability to identify and justify these users also prevents effective access reviews and creates persistent exposure from forgotten or orphaned administrative accounts.

**Audit Procedure:**  
1. Enumerate all users who simultaneously possess the following permissions through any profile, permission set, or permission set group:  
   - `View All Data`
   - `Modify All Data`  
   - `Manage Users`
2. Compile a list of all users meeting the criteria for Super Admin–equivalent access.  
3. Compare the list against the organization’s system of record.  
4. Verify that each Super Admin–equivalent user has corresponding documentation that includes:  
   - A clear business or technical justification for requiring this level of access, and  
   - Any relevant exception or approval records.  
5. Flag as noncompliant any users with Super Admin–equivalent access lacking documentation or justification.

**Remediation:**  
1. Remove one or more of the Super Admin–equivalent permissions from any user who does not have a documented business or technical justification.  
2. For users who legitimately require this level of access, add or update rationale within the system of record.  
3. Reassess user access to ensure alignment with least privilege, reducing broad permissions where narrower privileges are sufficient.

**Default Value:**  
Salesforce does not limit the number of users who may receive these permissions, and does not maintain any system of record regarding administrative access.

### SBS-ACS-005: Only Use Custom Profiles for Active Users

**Control Statement:**
All active users must be assigned custom profiles. The out-of-the-box standard profiles must not be used.

**Description:**  
Any regular user that can access the org, must use a custom profile. If a user has one of the standard profiles (e.g. "System Administrator", "Standard User", "Salesforce - Minimum Access"), the user is non-compliant. This only affects personal users, not machine users that use the default "API Only" permission sets.

**Risk:** <Badge type="warning" text="High" />  
Standard profiles are managed by Salesforce, not the organization—meaning Salesforce can enable permissions and object access on these profiles when features are released or platform updates occur without administrator approval. This creates an uncontrolled change vector: users assigned to standard profiles may gain new capabilities unexpectedly, bypassing the organization's authorization governance. Standard profiles are also overly permissive by default (e.g., "Standard User" grants "View Setup," "System Administrator" grants developer-level permissions), making it impossible to enforce least privilege. Without custom profiles, organizations cannot investigate authorization changes or maintain accountability for who approved which permissions.

**Audit Procedure:**  
1. Enumerate all **human** users that are "Active" (`IsActive = true` on the user flag)
2. Flag all users noncompliant that use a standard profile (`IsCustom = false` on the profile metadata)

**Remediation:**  
1. Setup a custom profile for each standard profile that is used
2. Manage permissions and object access on these profiles to be compliant with the other controls of the SBS
3. Assign the new custom profiles to your active users, following the principle of "least privilege access"

**Default Value:**  
Salesforce does not require to create and assign custom profiles.

### SBS-ACS-006: Documented Justification for `Use Any API Client` Permission

**Control Statement:** The `Use Any API Client` permission, which bypasses default behavior in orgs with "API Access Control" enabled, must only be assigned to highly trusted users with documented justification and must not be granted to end-users.

**Description:**  
All profiles, permission sets, and permission set groups that grant the `Use Any API Client` permission must be recorded in a designated system of record with a documented business or technical justification. This permission should only be assigned to highly trusted users, such as administrators and developers involved in managing or testing connected app integrations. Any authorization lacking documented rationale is noncompliant.

**Risk:** <Badge type="danger" text="Critical" />  
The `Use Any API Client` permission allows users to bypass API Access Control entirely, authorizing any OAuth-connected application without requiring it to be pre-vetted or allowlisted. This establishes an uncontrolled security boundary: users with this permission can grant data access to arbitrary external applications, enabling data exfiltration, unauthorized integrations, and potential account compromise without administrator oversight. Granting this permission to unauthorized personnel completely defeats the purpose of API Access Control, creating a direct path to unauthorized third-party access that requires no other control to fail.

**Audit Procedure:**  
1. Enumerate all profiles, permission sets, and permission set groups that include the `Use Any API Client` permission using Salesforce Setup, Metadata API, Tooling API, or an automated scanner.  
2. Compare the enumerated list against the organization's designated system of record for this permission.  
3. Verify that every profile, permission set, and permission set group granting `Use Any API Client` has a corresponding entry in the system of record.  
4. Confirm that each entry includes:  
   - A clear business or technical justification for requiring this permission,  
   - Identification of the user role or persona (e.g., administrator, developer, integration manager),  
   - Any applicable exception or approval documentation, and  
   - Confirmation that the use case is limited to testing or managing connected app integrations.  
5. Verify that the permission is not assigned to end-user profiles or permission sets intended for general business users.  
6. Flag as noncompliant any authorizations lacking documentation, justification, or assigned to unauthorized user populations.

**Remediation:**  
1. Remove the `Use Any API Client` permission from any profile, permission set, or permission set group that lacks a documented justification or is assigned to end-users.  
2. For any authorization that legitimately requires this permission (e.g., administrators or developers testing connected apps), add or update the rationale in the system of record to clearly justify the need and identify the specific role or use case.  
3. Ensure that connected apps required for business operations are properly vetted and allowlisted rather than relying on this permission for end-user access.  
4. Reconcile and update the system of record to ensure complete and accurate inventory of all assignments of this permission.

**Default Value:**  
The `Use Any API Client` permission is not granted by default in Salesforce. Organizations must explicitly assign this permission to users who require it for legitimate testing or integration management purposes.


### SBS-ACS-007: Maintain Inventory of Non-Human Identities

**Control Statement:** Organizations must maintain an authoritative inventory of all non-human identities, including integration users, automation users, bot users, and API-only accounts.

**Description:**  
Non-human identities operate without direct human oversight and often possess persistent credentials with elevated access. Organizations must maintain a complete and current inventory of all such identities to enable effective governance, access reviews, and incident response. The inventory must include identity type, purpose, owner, creation date, and last activity date.

**Risk:** <Badge type="warning" text="High" />  
Without a comprehensive inventory of non-human identities, organizations cannot detect, investigate, or respond to security incidents involving automated access. Non-human identities are frequently created for integrations or automation projects and then forgotten—accumulating as orphaned accounts with persistent credentials and elevated access. Security teams cannot assess which automated systems access Salesforce data, identify compromised integration credentials, or scope the impact of a vendor breach. This loss of visibility prevents effective governance of automated access and creates persistent security exposure from untracked machine accounts.

**Audit Procedure:**  
1. Request the organization's inventory of non-human identities
2. Query Salesforce for all users where `IsActive = true` and any of the following conditions apply:
   - Username contains "integration", "api", "bot", "automation", or "service"
   - Profile name contains "Integration", "API", or similar indicators
   - User has "API Only User" permission enabled
   - User is associated with Einstein Bot or Flow automation
3. Compare the inventory to the query results to identify discrepancies
4. Verify the inventory includes: identity name, type, purpose, business owner, creation date, and last login date
5. Confirm the inventory is reviewed and updated at least quarterly

**Remediation:**  
1. Query Salesforce to identify all potential non-human identities using the criteria in the audit procedure
2. For each identified identity, document: name, type (integration/bot/API), purpose, business owner, creation date
3. Establish a process to update the inventory when non-human identities are created, modified, or deactivated
4. Implement quarterly reviews of the inventory to identify and deactivate unused accounts
5. Store the inventory in an authoritative system of record accessible to security and compliance teams

**Default Value:**  
Salesforce does not provide a built-in inventory or classification system for non-human identities. Organizations must create and maintain this inventory manually or through third-party tools.

### SBS-ACS-008: Restrict Broad Privileges for Non-Human Identities

**Control Statement:** Non-human identities must not be assigned permissions that bypass sharing rules or grant administrative capabilities unless documented business justification exists.

**Description:**  
Non-human identities should follow the principle of least privilege and be granted only the minimum permissions necessary to perform their intended function. Permissions that bypass object-level or record-level security (such as View All Data, Modify All Data) or grant administrative capabilities (such as Manage Users, Modify Metadata) create significant security risk when assigned to automated accounts. Organizations must document a specific business justification for any non-human identity that requires such permissions.

**Risk:** <Badge type="warning" text="High" />  
Without documented justification for broad non-human identity privileges, organizations lose visibility into which automated systems can bypass sharing rules or perform administrative operations. Non-human identities operate without human judgment, making over-privileged automation a high-impact target—compromised credentials can result in complete data extraction, system-wide configuration changes, or persistent backdoor access. Many non-human identities are granted excessive permissions during initial setup and never reviewed, creating long-lived security exposure that security teams cannot detect, investigate, or remediate without knowing which identities have which privileges and why.

**Audit Procedure:**  
1. Using the non-human identity inventory from SBS-ACS-006, identify all non-human identities
2. For each non-human identity, query assigned permissions through profiles, permission sets, and permission set groups
3. Flag any non-human identity with one or more of the following permissions:
   - View All Data
   - Modify All Data
   - Manage Users
   - Author Apex
   - Customize Application
   - Any permission that bypasses sharing rules or grants administrative access
4. For each flagged identity, verify that documented business justification exists explaining why the permission is required
5. Confirm the justification was approved by appropriate stakeholders (security, compliance, or management)

**Remediation:**  
1. For each non-human identity with broad privileges, evaluate whether the permission is genuinely required for the identity's function
2. Remove broad privileges that are not necessary; replace with more granular permissions where possible
3. For non-human identities that legitimately require broad privileges, document:
   - Specific business function requiring the permission
   - Why more granular permissions cannot satisfy the requirement
   - Business owner and technical owner
   - Approval from security or compliance team
4. Implement a formal approval process for granting broad privileges to non-human identities
5. Establish periodic review (at least annually) of all non-human identities with broad privileges

**Default Value:**  
Salesforce does not restrict the assignment of broad privileges to non-human identities. Administrators can grant any permission to any user type without requiring justification or approval.

### SBS-ACS-009: Implement Compensating Controls for Privileged Non-Human Identities

**Control Statement:** Non-human identities with permissions that bypass sharing rules or grant administrative capabilities must have compensating controls implemented to mitigate risk.

**Description:**  
When non-human identities require broad privileges for legitimate business purposes, organizations must implement defense-in-depth protections to reduce the risk of credential compromise or misuse. Compensating controls include IP address restrictions, OAuth scope limitations, activity monitoring and alerting, credential rotation policies, and dedicated identities per integration. Multiple compensating controls should be implemented based on the sensitivity of accessible data and the scope of granted permissions.

**Risk:** <Badge type="tip" text="Moderate" />  
Without compensating controls, privileged non-human identities rely solely on credential secrecy for protection—a single point of failure. Unlike human users, these identities typically use persistent credentials (API keys, OAuth tokens, certificates) that do not expire and are not protected by multi-factor authentication. Compensating controls provide defense-in-depth: IP restrictions limit where credentials can be used, monitoring enables detection of compromise, and credential rotation limits the window of exposure. However, other controls (SBS-ACS-008) still govern whether broad privileges are granted; compensating controls reduce blast radius rather than establishing the primary security boundary.

**Audit Procedure:**  
1. Using the results from SBS-ACS-007, identify all non-human identities with broad privileges that have documented business justification
2. For each privileged non-human identity, verify that at least two of the following compensating controls are implemented:
   - **IP Address Restrictions:** Profile or permission set restricts login to specific IP ranges
   - **OAuth Scope Limitations:** Connected app uses minimal OAuth scopes; refresh tokens have expiration
   - **Activity Monitoring:** Automated monitoring alerts on unusual activity (off-hours access, high volume, geographic anomalies)
   - **Credential Rotation:** Credentials are rotated at least every 90 days
   - **Dedicated Identity:** Separate identity per integration (not shared across multiple systems)
3. Verify that monitoring alerts are actively reviewed and responded to
4. Confirm that compensating controls are documented in the justification for the privileged access

**Remediation:**  
1. For each privileged non-human identity, implement IP address restrictions in the assigned profile or permission set to limit access to known integration sources
2. For OAuth-based integrations, configure connected apps with minimal required scopes and enable refresh token expiration
3. Implement automated monitoring for privileged non-human identity activity using Event Monitoring, Shield Event Monitoring, or third-party SSPM tools
4. Establish credential rotation policies requiring API keys, passwords, and certificates to be rotated at least every 90 days
5. Ensure each integration uses a dedicated non-human identity rather than sharing credentials across multiple systems
6. Document all implemented compensating controls in the access justification

**Default Value:**  
Salesforce does not require or enforce compensating controls for privileged non-human identities. IP restrictions, OAuth scopes, monitoring, and credential rotation must be configured manually by administrators.
Salesforce does not require creating and assigning custom profiles.

### SBS-ACS-011: Enforce Documented Controls for Access and Authorization Modifications

**Control Statement:** All changes to user access and authorization-related configuration must follow a documented change management process that includes approval, implementation tracking, and audit logging.

**Description:** The organization must implement a documented change management governance process that covers all changes to authorization and access control mechanisms in Salesforce. This includes:
* Creation, modification, or deletion of users
* Assignment or removal of profiles, permission sets, or permission set groups
* Modification of permission set or profile permissions (add/remove/modify)
* Changes to role hierarchies
* Changes to permission set groups
* Modification of structure or membership of public groups, queues, or sales territories
* Custom permission creation or modification
* Sharing rule or restriction rule changes that affect access

The change management process must define:
* Request and approval workflow (who requests, who approves, approval criteria)
* Change categorization (standard, expedited, emergency) with defined SLAs
* Implementation procedure and tracking
* Rollback or reversal procedures
* Documentation and audit trail requirements
* Emergency procedures with compensating controls if expedited approval is permitted

The process must ensure that all changes are intentional, approved before implementation, traceable to a business justification, and auditable. Changes must not circumvent the documented permission set model (SBS-ACS-001) or access review process (SBS-ACS-010).

**Example implementations:**
* Centralized access request system (ServiceNow, Okta, or similar) where users request access changes through a portal; requests route to manager for approval and then System Administrator for implementation; all changes logged with timestamps, approver, and justification
* Decentralized process where permission set owners manage their own permission sets with approval required from a centralized access governance team before deployment; changes tracked in version control with pull request reviews
* Emergency change procedure for urgent access needs with restricted approvers and mandatory review within 5 business days; expedited changes tracked separately with enhanced logging and earlier review cycle
* Automated provisioning driven by source-of-truth systems (HR system, Azure AD) with manual exception handling; provisioning rules documented as policy and exception requests follow formal change process

**Risk:** <Badge type="warning" text="Moderate" />  Access control governance ensures that all access modifications are intentional, authorized, and traceable. Without formal controls, access changes may be made ad hoc without approval, lack business justification, and create blind spots in audit trails. Formal governance prevents unauthorized access escalation, ensures changes align with organizational policy and the documented permission model, and provides evidence of controls during compliance audits. Approval workflows distribute decision-making appropriately (managers validate job necessity; security validates policy compliance). Audit trails enable detection of unauthorized changes and support forensic investigation if access is misused. Emergency procedures ensure that urgent access needs can be met while still maintaining accountability and subsequent review.

**Audit Procedure:**
1. Understand the organization's documented control procedures for access and authorization modifications, including:
   * Request workflow and approval authority
   * Change categorization and response expectations
   * Implementation procedures
   * Rollback or remediation procedures
   * Documentation requirements
   * Expedited procedures (if permitted) and compensating controls
2. Assess whether these control procedures are communicated and enforced through a defined system or process (such as an access request system, ticketing system, workflow, or equivalent mechanism).
3. Evaluate changes made to user access, permission sets, profiles, roles, or permission configuration during a representative sample period. Select a timeframe and sample size appropriate to the organization's change volume and control maturity.
4. Examine a representative sample of changes to assess consistency of control execution:
   * An associated request or approval record exists
   * The request includes documented business justification or change rationale
   * Appropriate approval is documented from relevant stakeholders (manager, business owner, security, or other defined authorities)
   * Implementation is documented with timestamp and implementer identity
   * The implemented change aligns with the approved request
   * Change is recorded in available audit or change history mechanisms
5. For any identified changes without documented approval:
   * Evaluate whether the change was authorized but not formally recorded
   * Assess whether an exception or expedited process was appropriately followed
   * Determine the authorization status of the change
6. Evaluate whether the control procedures align with and enforce the organization's documented access model and governance framework. Identify any changes that deviated from documented standards and assess whether deviations were authorized exceptions.
7. If expedited or emergency procedures exist, examine samples to assess:
   * Whether usage is appropriately limited to genuine business needs
   * Whether approval authority is clearly defined
   * Whether expedited changes are flagged for later review and reconciliation
   * Whether compensating controls are documented and operational

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

**SBS-ACS-010 and SBS-ACS-010 work together:**
* **SBS-ACS-001** (Enforce Documented Permission Set Model) defines *what* the permission structure should be
* **SBS-ACS-010** (Access Review) validates that the structure remains correct over time and catches exceptions
* **SBS-ACS-011** (Access Controls) enforces *how* changes to that structure are governed

**Typical governance sequence:**
1. Define and document the permission set model (SBS-ACS-001)
2. Implement change management for all access modifications (SBS-ACS-011)
3. Conduct initial access review to validate current state (SBS-ACS-010)
4. Remediate any noncompliant access identified
5. Establish periodic access review cycle (SBS-ACS-010) to maintain governance