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

### SBS-PERM-005: Restrict Broad Privileges for Non-Human Identities

**Control Statement:** Non-human identities (integration users, automation users, bot users, and API-only accounts) must not be assigned permissions that bypass sharing rules or grant administrative capabilities without documented business justification and implemented compensating controls.

**Description:**  
Non-human identities, including integration users, automation users, Einstein Bot users, and API-only accounts, must follow the principle of least privilege. These identities must not be granted broad privileges such as View All Data, Modify All Data, View All Users, Modify All Users, Manage Users, Author Apex, or other permissions that bypass object-level or record-level security unless explicitly required and documented. All non-human identities with broad privileges must be recorded in a system of record with business justification, owner identification, and documented compensating controls. Both justification and compensating controls are required for compliance.

**Rationale:**  
Non-human identities operate without human oversight and typically use persistent credentials (stored passwords, OAuth tokens, or certificates) that remain valid across sessions. Granting broad privileges to these identities creates significant security risk: compromised credentials provide attackers with extensive access to data and configuration, automated processes can cause widespread damage if misconfigured or exploited, and the lack of interactive human review means malicious activity may persist undetected. Unlike human users who may temporarily require elevated access for specific tasks, non-human identities with broad privileges represent a persistent attack surface. Restricting broad privileges to only necessary cases and requiring compensating controls reduces the blast radius of credential compromise and limits the potential for automated abuse.

**Audit Procedure:**  
1. Identify all non-human identities in the org by querying users where UserType indicates integration, automation, or bot usage, or where the user is designated as an API-only or service account.  
2. For each non-human identity, enumerate all assigned permissions via profiles, permission sets, and permission set groups.  
3. Flag any non-human identity with broad privileges including but not limited to: View All Data, Modify All Data, View All Users, Modify All Users, Manage Users, Author Apex, Customize Application, Modify Metadata, or any permission that bypasses sharing rules or grants administrative capabilities.  
4. For each flagged identity, verify that the organization's system of record contains:  
   - Documented business justification explaining why broad privileges are required,  
   - Identification of the system owner or responsible party, and  
   - Documented compensating controls (e.g., IP restrictions, OAuth scope limitations, monitoring/alerting, credential rotation policy, dedicated integration user per system).  
5. Verify that documented compensating controls are actually implemented and active.  
6. Flag as noncompliant any non-human identity with broad privileges that lacks documented justification, lacks documented compensating controls, or has compensating controls that are not implemented.

**Remediation:**  
1. Remove broad privileges from non-human identities that lack documented justification or do not require data bypass or administrative capabilities.  
2. Replace broad privileges with object-specific permissions, custom permissions, and sharing rules that grant only the minimum access necessary for the identity's function.  
3. For non-human identities that legitimately require broad privileges, document in the system of record:  
   - Clear business justification (e.g., "ETL process requires read access to all Account and Contact records"),  
   - System owner and responsible party,  
   - Implemented compensating controls.  
4. Implement compensating controls for all non-human identities with broad privileges, such as:  
   - IP address restrictions limiting access to known integration endpoints,  
   - OAuth scope limitations (if using OAuth),  
   - Monitoring and alerting for authentication and data access activity,  
   - Credential rotation policy with defined intervals,  
   - Dedicated identity per integration (avoid shared service accounts).  
5. Establish a periodic (e.g., quarterly) review process for all non-human identities with broad privileges to ensure justifications remain valid and compensating controls remain effective.

**Default Value:**  
Salesforce does not restrict the assignment of broad privileges to non-human identities. Administrators can assign any permission to any user type unless explicitly prevented by license limitations. No system of record or compensating control requirements exist by default.
