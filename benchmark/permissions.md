## Permissions

This section defines controls related to permission sets, permission set groups, profiles, and access governance within Salesforce environments. These controls ensure that organizations maintain a structured, documented, and enforced approach to authorization management, reducing privilege sprawl and unauthorized access risks.

### SBS-PERM-001: Enforce a Documented Permission Set Model

**Control Statement:** All permission sets, permission set groups, and profiles must conform to a documented model maintained in a system of record and enforced continuously.

**Description:**  
The organization must define, document, and enforce a standardized permission set model within its system of record. A permission set model defines how the organization structures permissions—for example, using permission set groups to represent personas or departments, and permission sets to represent specific actions or capabilities. The specific structure is determined by the organization, but all profiles, permission sets, and permission set groups must conform to the documented model. No permission constructs may exist outside the defined model, and compliance must be evaluated and enforced on a near real-time basis.

**Example models:**
- Permission set groups represent job roles (Sales Rep, Service Agent), and individual permission sets represent capabilities (View Reports, Edit Accounts)
- Permission set groups represent departments (Sales, Marketing), and permission sets represent access tiers (Standard, Advanced)
- Permission sets represent business functions with no grouping hierarchy

**Rationale:**  
A defined and enforced permission set model provides consistent, least-privilege access governance across the Salesforce environment. Without a documented model, organizations accumulate ad hoc permission constructs created for one-time needs, resulting in privilege sprawl, inconsistent access patterns, and inability to audit who has what access and why. A documented model ensures every permission construct exists for a defined purpose and follows organizational standards. Continuous enforcement prevents drift and ensures that changes to permissions are intentional and aligned with the model.

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

### SBS-PERM-002: Documented Justification for All API-Enabled Authorizations

**Control Statement:** Every authorization granting the "API Enabled" permission must have documented business or technical justification recorded in a system of record.

**Description:**  
All profiles, permission sets, and permission set groups that grant the “API Enabled” permission must be recorded in a designated system of record with a documented business or technical justification for requiring API access. Any authorization lacking documented rationale is noncompliant.

**Rationale:**  
The “API Enabled” permission allows users to authenticate to and interact with Salesforce via APIs, which enables large-scale data extraction, modification, or destructive operations. Unauthorized or unjustified API-enabled access increases the risk of data exfiltration, privilege misuse, and compromise. Maintaining a complete system-of-record inventory with documented rationale ensures visibility, enforces least privilege, and prevents accumulation of unnecessary API-capable access paths.

**Audit Procedure:**  
1. Enumerate all profiles, permission sets, and permission set groups that include the “API Enabled” permission using Salesforce Setup, Metadata API, Tooling API, or an automated scanner.  
2. Compare the enumerated list against the organization’s designated system of record for API-enabled authorizations.  
3. Verify that every profile, permission set, and permission set group granting “API Enabled” has a corresponding entry in the system of record.  
4. Confirm that each entry includes:  
   - A clear business or technical justification for API access, and  
   - Any applicable exception or approval documentation.  
5. Flag as noncompliant any authorizations lacking documentation or justification.

**Remediation:**  
1. Remove the “API Enabled” permission from any profile, permission set, or permission set group that lacks a documented justification and is not required for business operations.  
2. For any authorization that legitimately requires API access, add or update the rationale in the system of record to clearly justify the need.  
3. Reconcile and update the system of record to ensure complete and accurate inventory of all API-enabled authorizations.

**Default Value:**  
Salesforce does not require or maintain a system of record for API-enabled authorizations. The “API Enabled” permission is disabled by default for standard profiles but may be granted by administrators.

### SBS-PERM-003: Documented Justification for Approve Uninstalled Connected Apps Permission

**Control Statement:** The "Approve Uninstalled Connected Apps" permission must only be assigned to highly trusted users with documented justification and must not be granted to end-users.

**Description:**  
All profiles, permission sets, and permission set groups that grant the "Approve Uninstalled Connected Apps" permission must be recorded in a designated system of record with a documented business or technical justification. This permission should only be assigned to highly trusted users, such as administrators and developers involved in managing or testing connected app integrations. Any authorization lacking documented rationale is noncompliant.

**Rationale:**  
The "Approve Uninstalled Connected Apps" permission allows users to self-authorize uninstalled connected apps via OAuth, bypassing Connected App usage restrictions. This capability is necessary for administrators and developers who must test apps before installation, but it creates a significant security risk if granted to end-users or unauthorized personnel. Unjustified assignment of this permission increases the risk of unauthorized third-party app access, data exfiltration, and privilege escalation. Maintaining a complete system-of-record inventory with documented rationale ensures that this high-privilege permission is restricted to legitimate use cases and prevents privilege sprawl.

**Audit Procedure:**  
1. Enumerate all profiles, permission sets, and permission set groups that include the "Approve Uninstalled Connected Apps" permission using Salesforce Setup, Metadata API, Tooling API, or an automated scanner.  
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
1. Remove the "Approve Uninstalled Connected Apps" permission from any profile, permission set, or permission set group that lacks a documented justification or is assigned to end-users.  
2. For any authorization that legitimately requires this permission (e.g., administrators or developers testing connected apps), add or update the rationale in the system of record to clearly justify the need and identify the specific role or use case.  
3. Ensure that connected apps required for business operations are properly installed and allowlisted rather than relying on this permission for end-user access.  
4. Reconcile and update the system of record to ensure complete and accurate inventory of all assignments of this permission.

**Default Value:**  
The "Approve Uninstalled Connected Apps" permission is not granted by default in Salesforce. This permission was introduced in September 2025 as part of Connected App Usage Restrictions changes. Organizations must explicitly assign this permission to users who require it for legitimate testing or integration management purposes.

### SBS-PERM-004: Documented Justification for All Super Admin–Equivalent Users

**Control Statement:** All users with simultaneous View All Data, Modify All Data, and Manage Users permissions must be documented in a system of record with clear business or technical justification.

**Description:**  
All users who hold *simultaneous* authorization for **View All Data**, **Modify All Data**, and **Manage Users**—collectively constituting Super Admin–level access—must be identified and documented in the system of record with a clear business or technical justification. Any user with this combination of permissions who lacks documented rationale is noncompliant.

**Rationale:**  
Super Admin–equivalent permissions grant unrestricted read and write access across the Salesforce environment and allow the management of user accounts. This level of privilege enables extensive data extraction, broad configuration changes, and actions that can significantly alter or compromise the security posture of the organization. Untracked or unjustified Super Admin access increases the risk of data leakage, administrative sprawl, privilege escalation, and malicious or accidental system-wide impact. Documenting and justifying all Super Admin–equivalent users ensures strict adherence to least privilege and maintains governance over the most sensitive access levels.

**Audit Procedure:**  
1. Enumerate all users who simultaneously possess the following permissions through any profile, permission set, or permission set group:  
   - **View All Data**  
   - **Modify All Data**  
   - **Manage Users**  
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
Salesforce does not limit the number of users who may receive **View All Data**, **Modify All Data**, or **Manage Users**, and does not maintain any system of record regarding administrative access.

### SBS-PERM-005: Only Use Custom Profiles for Active Users

**Control Statement:**
All active users must be assigned custom profiles. The out-of-the-box standard profiles must not be used.

**Description:**  
Any regular user that can access the org, must use a custom profile. If a user has one of the standard profiles (e.g. "System Administrator", "Standard User", "Salesforce - Minimum Access"), the user is non-compliant. This only affects personal users, not machine users that use the default "API Only" permission sets.

**Rationale:**  
Standard profiles cannot be managed by Org Admins. They are too permissive (e.g. Standard User grants "View Setup", regular "System Administrator" grants multiple Developer-level permissions). Additionally, Salesforce sometimes enables permissions and object access on these profiles when features are enabled or when new permissions are introduced by platform releases. To remain in control over what a user can access, it is imperative to only use custom profiles.

**Audit Procedure:**  
1. Enumerate all **human** users that are "Active" (`IsActive = true` on the user flag)
2. Flag all users noncompliant that use a standard profile (`IsCustom = false` on the profile metadata)

**Remediation:**  
1. Setup a custom profile for each standard profile that is used
2. Manage permissions and object access on these profiles to be compliant with the other controls of the SBS
3. Assign the new custom profiles to your active users, following the principle of "least privilege access"

**Default Value:**  
Salesforce does not require to create and assign custom profiles.

### SBS-PERM-006: Maintain Inventory of Non-Human Identities

**Control Statement:** Organizations must maintain an authoritative inventory of all non-human identities, including integration users, automation users, bot users, and API-only accounts.

**Description:**  
Non-human identities operate without direct human oversight and often possess persistent credentials with elevated access. Organizations must maintain a complete and current inventory of all such identities to enable effective governance, access reviews, and incident response. The inventory must include identity type, purpose, owner, creation date, and last activity date.

**Rationale:**  
Without a comprehensive inventory, organizations cannot effectively govern non-human identity access, identify unused or orphaned accounts, or respond to security incidents involving automated access. Non-human identities are frequently created for integrations or automation projects and then forgotten, creating persistent security risks. An authoritative inventory is the foundation for all other non-human identity governance controls.

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

### SBS-PERM-007: Restrict Broad Privileges for Non-Human Identities

**Control Statement:** Non-human identities must not be assigned permissions that bypass sharing rules or grant administrative capabilities unless documented business justification exists.

**Description:**  
Non-human identities should follow the principle of least privilege and be granted only the minimum permissions necessary to perform their intended function. Permissions that bypass object-level or record-level security (such as View All Data, Modify All Data) or grant administrative capabilities (such as Manage Users, Modify Metadata) create significant security risk when assigned to automated accounts. Organizations must document a specific business justification for any non-human identity that requires such permissions.

**Rationale:**  
Non-human identities operate without human judgment or oversight, making over-privileged automation a high-impact security risk. Compromised credentials for a non-human identity with broad privileges can result in unauthorized data access, data exfiltration, or system-wide configuration changes. Many non-human identities are granted excessive permissions during initial setup and never reviewed, creating persistent security exposure. Requiring documented justification ensures that broad privileges are granted only when genuinely necessary and subject to approval.

**Audit Procedure:**  
1. Using the non-human identity inventory from SBS-PERM-006, identify all non-human identities
2. For each non-human identity, query assigned permissions through profiles, permission sets, and permission set groups
3. Flag any non-human identity with one or more of the following permissions:
   - View All Data
   - Modify All Data
   - View All Users
   - Modify All Users
   - Manage Users
   - Author Apex
   - Customize Application
   - Modify Metadata
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

### SBS-PERM-008: Implement Compensating Controls for Privileged Non-Human Identities

**Control Statement:** Non-human identities with permissions that bypass sharing rules or grant administrative capabilities must have compensating controls implemented to mitigate risk.

**Description:**  
When non-human identities require broad privileges for legitimate business purposes, organizations must implement defense-in-depth protections to reduce the risk of credential compromise or misuse. Compensating controls include IP address restrictions, OAuth scope limitations, activity monitoring and alerting, credential rotation policies, and dedicated identities per integration. Multiple compensating controls should be implemented based on the sensitivity of accessible data and the scope of granted permissions.

**Rationale:**  
Non-human identities with broad privileges represent high-value targets for attackers. Unlike human users, these identities typically use persistent credentials (API keys, OAuth tokens, certificates) that do not expire and are not protected by multi-factor authentication. Compensating controls create additional barriers to unauthorized access and enable detection of suspicious activity. Without these protections, a single compromised credential can result in complete data breach or system compromise.

**Audit Procedure:**  
1. Using the results from SBS-PERM-007, identify all non-human identities with broad privileges that have documented business justification
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
