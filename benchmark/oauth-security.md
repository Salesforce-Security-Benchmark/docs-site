## OAuth Security

This section defines controls related to OAuth-enabled Connected Apps, third-party integrations, and external access to Salesforce environments. These controls ensure that organizations maintain visibility, governance, and lifecycle management over external systems that authenticate to Salesforce via OAuth, reducing the risk of unauthorized access, data exfiltration, and stale integration pathways.

### SBS-OAUTH-001: Require Formal Installation of Connected Apps

**Control Statement:** Organizations must formally install all connected apps used for OAuth authentication rather than relying on user-authorized OAuth connections.

**Description:**  
The organization must ensure that any connected app used for OAuth authentication is formally installed in the Salesforce org as a managed or unmanaged connected app rather than implicitly created through user-initiated OAuth flows. Connected apps that appear only as user-authorized OAuth connections without formal installation expose the org to unmanaged security settings and prevent centralized governance.

**Risk:** <Badge type="danger" text="Critical" />  
Without formal installation, Connected Apps operate outside organizational control—inheriting security configuration from the external app developer rather than the Salesforce administrator. This establishes an unmanaged security boundary: refresh token lifetimes, session policies, and IP restrictions cannot be enforced, allowing tokens to persist indefinitely and enabling unauthorized access from any location. Attackers who compromise a user-authorized OAuth token gain persistent access that administrators cannot revoke or constrain through standard Connected App policies.

**Audit Procedure:**  
1. Enumerate all user-authorized OAuth connected apps via Setup or the Tooling/Metadata API.  
2. Identify all connected apps that are not formally installed as managed or unmanaged connected apps.  
3. Flag any connected app that is used but not formally installed as noncompliant.

**Remediation:**  
1. Formally install any connected app that appears only as a user-authorized OAuth connection.  
2. Configure the installed connected app's policies, including refresh token and session security settings.  
3. Remove the user-authorized OAuth connections that are now superseded by the installed connected app.

**Default Value:**  
When a user first authenticates to a connected app via OAuth, Salesforce automatically creates a user-authorized OAuth entry that is not formally installed.

### SBS-OAUTH-002: Require Profile or Permission Set Access Control for Connected Apps

**Control Statement:** Organizations must control access to each formally installed connected app exclusively through assigned profiles or permission sets.

**Description:**  
All formally installed connected apps must govern user access through explicit profile or permission set assignments. No connected app may rely on unrestricted or unmanaged access models.

**Risk:** <Badge type="danger" text="Critical" />  
Without explicit profile or permission set access control, Connected Apps may allow any user in the org to authenticate—bypassing the principle of least privilege and creating an uncontrolled access boundary. This enables unauthorized users to establish OAuth sessions with external systems, potentially exfiltrating data or performing actions beyond their intended scope. The lack of access scoping also eliminates audit visibility into who is authorized to use each integration, preventing detection of unauthorized access patterns.

**Audit Procedure:**  
1. Enumerate all formally installed connected apps via Setup or the Metadata API.  
2. For each installed connected app, verify that access is granted only through assigned profiles or permission sets.  
3. Flag any connected app that lacks access scoping via profiles or permission sets as noncompliant.

**Remediation:**  
1. For each connected app lacking profile or permission set access control, create or update profiles or permission sets to define which users are authorized to access the app.  
2. Assign the appropriate profiles or permission sets to the connected app configuration.  
3. Verify that no users can access the connected app without explicit authorization.

**Default Value:**  
Salesforce does not require profile or permission set access control for connected apps by default. Access models vary based on connected app configuration.

### SBS-OAUTH-003: Add Criticality Classification of OAuth-Enabled Connected Apps

**Control Statement:** All OAuth-enabled Connected Apps must be recorded in an authoritative system of record and assigned a documented vendor criticality rating reflecting integration importance and data sensitivity.

**Description:**  
Organizations must maintain a complete, authoritative inventory of all OAuth-enabled Connected Apps and assign each an explicit vendor criticality rating based on operational importance and the sensitivity of accessible Salesforce data.

**Risk:** <Badge type="warning" text="High" />  
Without a complete inventory and criticality classification, organizations lose visibility into their third-party integration landscape—preventing effective risk assessment, prioritization of security controls, and governance of external system connectivity. Security teams cannot identify which integrations access sensitive data, scope the impact of a vendor compromise, or respond effectively to incidents involving Connected Apps. This impairs detection, investigation, and response capabilities for integration-related security events.

**Audit Procedure:**  
1. Retrieve a list of all Connected Apps with active OAuth configurations from Salesforce Setup.  
2. Retrieve the organization's authoritative system of record for integration and vendor management.  
3. Compare the Salesforce Connected App list to the system of record and confirm every OAuth-enabled Connected App appears in the inventory.  
4. Verify each listed Connected App has an assigned vendor criticality rating documented in the system of record.  
5. Flag any apps missing from the inventory or lacking a documented criticality rating as noncompliant.

**Remediation:**  
1. Add any missing OAuth-enabled Connected Apps to the system of record.  
2. Document and assign a vendor criticality rating to each Connected App based on operational importance and data sensitivity.  
3. Implement a recurring process to synchronize Connected App changes with the system of record.

**Default Value:**  
Salesforce does not automatically maintain or enforce an external inventory or criticality classification for Connected Apps.

### SBS-OAUTH-004: Due Diligence Documentation for High-Risk Connected App Vendors

**Control Statement:** Organizations must review and retain available security documentation for all high-risk Connected App vendors and explicitly record any missing documentation as part of the vendor assessment.

**Description:**  
For each Connected App vendor classified as high-risk, the organization must collect, review, and store relevant security documentation—including terms of use, privacy policy, trust center or security overview, and any published information security guidelines—and must explicitly document when a required artifact does not exist.

**Risk:** <Badge type="tip" text="Moderate" />  
Without documented due diligence for high-risk vendors, organizations may onboard integrations without understanding the vendor's security posture, data handling practices, or contractual obligations. This increases the likelihood of undiscovered risks but does not directly enable unauthorized access—other controls (SBS-OAUTH-001, SBS-OAUTH-002) still govern the technical security boundary. Missing documentation primarily impacts audit readiness, risk assessment accuracy, and the organization's ability to make informed decisions about vendor relationships.

**Audit Procedure:**  
1. Retrieve the list of Connected App vendors classified as high-risk from the organization’s system of record.  
2. For each high-risk vendor, verify that the following documents, where available, are stored in the designated repository:  
   - Terms of use  
   - Privacy policy  
   - Trust center or security overview  
   - Published information security guidelines  
3. Confirm that any missing documentation is explicitly recorded as unavailable in the vendor assessment.  
4. Flag any high-risk vendor lacking required documentation or missing explicit acknowledgment of unavailable documents as noncompliant.

**Remediation:**  
1. Collect and store all required documentation for each high-risk vendor.  
2. Where documentation does not exist, record this absence in the vendor assessment.  
3. Update the vendor management process to ensure ongoing due diligence for high-risk vendors.

**Default Value:**  
Salesforce does not manage or enforce vendor due diligence requirements for Connected App providers.
