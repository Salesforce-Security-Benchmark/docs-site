## OAuth Security

This section defines controls related to OAuth-enabled Connected Apps, third-party integrations, and external access to Salesforce environments. These controls ensure that organizations maintain visibility, governance, and lifecycle management over external systems that authenticate to Salesforce via OAuth, reducing the risk of unauthorized access, data exfiltration, and stale integration pathways.

### SBS-OAUTH-001: Require Formal Installation and Access Governance for Connected Apps

**Control Statement:** Organizations must formally install all connected apps and must control access to each installed app exclusively through assigned profiles or permission sets.

**Description:**  
The organization must ensure that any connected app used for OAuth authentication is formally installed in the Salesforce org rather than implicitly created through user-initiated OAuth flows, and that access to each installed connected app is governed solely through profiles or permission sets. Connected apps that appear only as user-authorized OAuth connections without installation expose the org to unmanaged security settings and uncontrolled user access.

**Rationale:**  
Implicitly created OAuth connections inherit configuration from the external app developer and prevent administrators from enforcing critical security settings such as refresh token policies and session timeout. Formal installation combined with profile- or permission-set–based access control ensures centralized governance, predictable security behavior, and elimination of uncontrolled authorization paths.

**Audit Procedure:**  
1. Enumerate all user-authorized OAuth connected apps via Setup or the Tooling/Metadata API.  
2. Identify all connected apps that are not formally installed as managed or unmanaged connected apps.  
3. For each formally installed connected app, verify that access is granted only through assigned profiles or permission sets.  
4. Flag any connected app that is (a) used but not formally installed, or (b) installed but lacks access scoping via profiles or permission sets.

**Remediation:**  
1. Formally install any connected app that appears only as a user-authorized OAuth connection.  
2. Configure the installed connected app’s policies, including refresh token and session security settings.  
3. Create or update profiles or permission sets to define which users are authorized to access the connected app.  
4. Remove any user-authorized OAuth connections that bypass the installed connected app controls.

**Default Value:**  
When a user first authenticates to a connected app via OAuth, Salesforce automatically creates a user-authorized OAuth entry that is not formally installed and is not governed by profiles or permission sets.

**References:**  
- Salesforce Connected App Documentation  
- OAuth 2.0 Security Best Current Practice (IETF)  
- NIST SP 800-204A: Building Secure Microservices-Based Applications Using OAuth 2.0

### SBS-OAUTH-002: Inventory and Criticality Classification of OAuth-Enabled Connected Apps

**Control Statement:** All OAuth-enabled Connected Apps must be recorded in an authoritative system of record and assigned a documented vendor criticality rating reflecting integration importance and data sensitivity.

**Description:**  
Organizations must maintain a complete, authoritative inventory of all OAuth-enabled Connected Apps and assign each an explicit vendor criticality rating based on operational importance and the sensitivity of accessible Salesforce data.

**Rationale:**  
Without a complete inventory and criticality classification, organizations cannot adequately assess the risk posed by third-party integrations, prioritize security controls, or meet governance requirements for external system connectivity.

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

**References:**  
- Salesforce Help: Connected Apps and OAuth  
- NIST SP 800-53: SA-9 External Information System Services  
- CIS Controls v8: Control 15 – Service Provider Management

### SBS-OAUTH-003: Due Diligence Documentation for High-Risk Connected App Vendors

**Control Statement:** Organizations must review and retain available security documentation for all high-risk Connected App vendors and explicitly record any missing documentation as part of the vendor assessment.

**Description:**  
For each Connected App vendor classified as high-risk, the organization must collect, review, and store relevant security documentation—including terms of use, privacy policy, trust center or security overview, and any published information security guidelines—and must explicitly document when a required artifact does not exist.

**Rationale:**  
High-risk vendors introduce elevated exposure to sensitive data and business processes, and maintaining documented due diligence ensures that risks are understood, assessed, and traceable within the vendor management process.

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

**References:**  
- NIST SP 800-53: SA-12 Supply Chain Protection  
- CIS Controls v8: Control 15 – Service Provider Management  
- OWASP ASVS: Section 1.5 Vendor Security Documentation
