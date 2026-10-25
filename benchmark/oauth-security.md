## OAuth Security

This section defines controls related to OAuth-enabled Connected Apps, third-party integrations, and external access to Salesforce environments. These controls ensure that organizations maintain visibility, governance, and lifecycle management over external systems that authenticate to Salesforce via OAuth, reducing the risk of unauthorized access, data exfiltration, and stale integration pathways.

### SBS-OAUTH-001: Require Formal Installation of Connected Apps

<span title="Restricting and governing third-party OAuth access to systems holding ePHI requires centrally managed Connected App controls."><Badge type="info" text="HIPAA" /></span> <span title="Appropriate technical and organizational measures for personal data include centrally governed OAuth application controls."><Badge type="info" text="GDPR" /></span> <span title="Access control and account management require administrators to govern which OAuth applications can establish access."><Badge type="info" text="NIST" /></span> <span title="Reasonable security for personal information includes centrally controlling OAuth integrations rather than unmanaged user-authorized access."><Badge type="info" text="CCPA/CPRA" /></span> <span title="Logical access and identity management require centrally governed application access paths."><Badge type="info" text="SOC 2" /></span> <span title="Access control and secure authentication require formal governance of OAuth-enabled applications."><Badge type="info" text="ISO 27001" /></span>

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

<span title="Restricting who may use OAuth-enabled applications is a direct access control for systems processing ePHI."><Badge type="info" text="HIPAA" /></span> <span title="Appropriate technical measures for personal data include explicit access scoping for OAuth-enabled applications."><Badge type="info" text="GDPR" /></span> <span title="Least privilege and access enforcement require connected apps to be limited to explicitly authorized users."><Badge type="info" text="NIST" /></span> <span title="Reasonable security for personal information includes limiting connected app use to authorized users only."><Badge type="info" text="CCPA/CPRA" /></span> <span title="Logical access and IAM controls require application access to be granted through explicit authorization models."><Badge type="info" text="SOC 2" /></span> <span title="Access control and privileged restriction require connected app access to be explicitly assigned and governed."><Badge type="info" text="ISO 27001" /></span>

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

<span title="Accountability for personal data access includes maintaining an inventory of OAuth-enabled applications and their business criticality."><Badge type="info" text="GDPR" /></span> <span title="Reasonable security for personal information includes maintaining visibility into which third-party applications can access Salesforce data."><Badge type="info" text="CCPA/CPRA" /></span> <span title="Documented IAM and integration governance routinely expect an authoritative inventory of connected applications."><Badge type="info" text="SOC 2" /></span> <span title="Asset, supplier, and access governance controls support an authoritative inventory and criticality classification of connected applications."><Badge type="info" text="ISO 27001" /></span>

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

<span title="Due diligence for vendors handling personal data includes reviewing available privacy and security documentation for high-risk connected apps."><Badge type="info" text="GDPR" /></span> <span title="Reasonable security for personal information includes documented review of high-risk vendors that may access Salesforce data."><Badge type="info" text="CCPA/CPRA" /></span> <span title="Supplier relationship and security governance controls support documented due diligence for high-risk connected app vendors."><Badge type="info" text="ISO 27001" /></span>

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

### SBS-OAUTH-005: Require DPoP Sender-Constrained Tokens for Organization-Owned OAuth Apps

<span title="Identification and authentication controls call for replay-resistant authentication; DPoP prevents stolen OAuth tokens from being replayed by another client."><Badge type="info" text="NIST" /></span> <span title="Logical access controls include protecting authentication credentials such as OAuth tokens from reuse by unauthorized parties."><Badge type="info" text="SOC 2" /></span> <span title="Secure authentication (A.8.5) supports binding OAuth tokens to the client that requested them."><Badge type="info" text="ISO 27001" /></span>

**Control Statement:** Every OAuth-enabled external client app and connected app whose OAuth settings are owned by the organization must have "Require DPoP (Demonstrating Proof-of-Possession)" enabled, unless an exception with documented justification is recorded in the system of record.

**Description:**  
OAuth 2.0 Demonstrating Proof-of-Possession (DPoP, RFC 9449) binds access tokens, refresh tokens, and authorization codes to a key pair held by the client. Every token and resource request must carry a DPoP proof signed by the private key, so a token that is leaked or stolen cannot be used without that key. Salesforce accepts DPoP proofs from any client, but continues to accept unbound (Bearer) tokens for the same app until "Require DPoP" is enabled in the app's OAuth settings.

This control applies to external client apps and connected apps defined in the organization's own orgs, where the organization controls the OAuth settings. External client apps installed from a managed package, and connected apps installed from another organization, are governed by their publisher and are out of scope; assess their DPoP support as part of vendor due diligence (SBS-OAUTH-004).

An app may be excepted only when its client cannot present DPoP proofs—for example, because it uses a flow that does not support DPoP (username-password, user-agent, or hybrid user-agent) or because the client software does not yet implement DPoP. Each exception must be recorded in the system of record maintained under SBS-OAUTH-003 with a justification and a review date.

**Risk:** <Badge type="tip" text="Moderate" />  
Without DPoP, OAuth access and refresh tokens are bearer credentials: anyone who obtains a token—through compromised client storage, logs, a malicious browser extension, or a breached integration platform—can replay it from their own infrastructure until it expires or is revoked. Refresh tokens make this access persistent. Exploitation requires a token to be exposed first, and other controls (connected app access policies, IP restrictions, refresh token policies, and token revocation) still limit the impact, so DPoP provides defense-in-depth rather than a primary access boundary.

**Audit Procedure:**  
1. Enumerate all external client apps and connected apps in the org, and exclude apps installed from a managed package or from another organization. For external client apps, query `ExternalClientApplication` and retain those whose `DistributionState` is `Local` or `Packaged`.  
2. For each in-scope external client app, retrieve its `ExtlClntAppGlobalOauthSettings` metadata (for example, `sf project retrieve start --metadata ExtlClntAppGlobalOauthSettings --target-metadata-dir <dir>`) and record the value of `isDPopEnabled`. Retrieval requires the org setting "Allow Access to OAuth Consumer Secrets via Metadata API" and the "View External Client Apps Consumer Secrets in Metadata" user permission. The retrieved files contain consumer secrets and must not be added to source control.  
3. For each in-scope connected app, open the app in Setup (App Manager → View) and record whether "Require DPoP (Demonstrating Proof-of-Possession)" is enabled in the OAuth settings. This setting is not exposed in the `ConnectedApp` metadata type as of API version 67.0.  
4. For each app without DPoP required, verify that the system of record contains an exception with a justification and a review date that has not passed.  
5. Flag any in-scope app that does not require DPoP and lacks a current documented exception as noncompliant.

**Remediation:**  
1. Confirm that each client using the app can present DPoP proofs. Salesforce Mobile SDK 14.0 and later requests DPoP-bound tokens by default; Apex clients can use `Auth.JWTUtil.generateDPoPProofForToken()`; other clients must implement RFC 9449, including the `dpop_jkt` parameter for authorization code flows and handling of the `use_dpop_nonce` error.  
2. Migrate existing sessions to DPoP-bound tokens before enforcement. Requiring DPoP rejects unbound (Bearer) tokens and logs out any user still on a Bearer session.  
3. Enable "Require DPoP (Demonstrating Proof-of-Possession)" in the app's OAuth settings.  
4. Where a client cannot support DPoP, record an exception with justification and a review date in the system of record, and plan migration to a DPoP-capable client or flow.

**Default Value:**  
"Require DPoP" is disabled for new and existing external client apps and connected apps. Salesforce validates DPoP proofs when a client presents them, but continues to accept unbound (Bearer) tokens until the setting is enabled. DPoP is available on a rolling basis starting October 5, 2026 (Release 264).
