## Integrations

This section defines controls related to outbound connectivity from Salesforce to external systems, including Remote Site Settings and Named Credentials. These controls ensure that organizations maintain visibility and governance over approved external endpoints, authentication mechanisms, and data flows initiated by Salesforce, reducing the risk of unauthorized data transmission, dependency on untrusted services, and configuration drift in integration pathways.

### SBS-INT-001: Enforce Governance of Browser Extensions Accessing Salesforce

**Control Statement:** Organizations must enforce a centrally managed mechanism that restricts which browser extensions are permitted to access Salesforce, and must not allow the use of unmanaged or uncontrolled extensions.

**Description:**  
Organizations must deploy a centrally managed governance mechanism—such as Chrome Browser Cloud Management, MDM policies, or configuration profiles—that enforces an allow-list or blocklist for browser extensions accessing Salesforce domains.

**Risk:** <Badge type="tip" text="Moderate" />  
Without centralized governance over browser extensions, malicious or cloned extensions—increasingly common with AI-generated code—can harvest session tokens, exfiltrate data, and execute unauthorized operations within authenticated Salesforce sessions. However, this control provides governance and defense-in-depth rather than establishing a Salesforce-native security boundary: exploitation requires a malicious extension to be installed and an authenticated session to exist. Other controls (SSO, session management) still provide protection, and this governance mechanism operates outside Salesforce via MDM or browser management.

**Audit Procedure:**
1. Request evidence of a browser-extension governance mechanism applied to user devices (e.g., Chrome Browser Cloud Management, Intune configuration profile, Jamf configuration profile, Active Directory GPO, or equivalent).
2. Require a screenshot, exported policy file, or screen capture demonstrating that extension controls are active and enforceable (e.g., an allow-list or blocklist configuration for Chrome extensions).
3. Verify that the mechanism explicitly restricts installation or execution of unapproved extensions that can access Salesforce domains.
4. Flag the organization as noncompliant if no enforceable governance mechanism exists or if extension governance is based solely on policy, awareness, or voluntary user behavior.
5. Download API Total Usage logs (EventLogFile - ApiTotalUsage, available in free tier of Event Monitoring) and analyze for indicators of unauthorized browser extension activity:
   - Review `USER_AGENT` field for patterns indicating browser extensions (e.g., extension identifiers, non-standard user agents).
   - Identify API call patterns characteristic of auto-refresh extensions (e.g., Inspector Reloader) such as regular-interval repeated requests.
   - Flag any anomalous patterns for investigation against approved extension inventory.

**Remediation:**  
1. Implement a centrally managed browser or device management solution capable of enforcing extension restrictions (e.g., Chrome Browser Cloud Management, Intune, Jamf, or GPO-based controls).  
2. Define and apply an allow-list or blocklist policy governing which extensions are permitted to interact with Salesforce.  
3. Remove or disable any unapproved browser extensions from managed devices.  
4. Apply enforcement policies to all corporate-managed devices accessing Salesforce.

**Default Value:**  
Salesforce provides no mechanism to prevent or detect browser extension usage; unmanaged browser extensions are permitted by default, including those capable of accessing Salesforce data and authenticated sessions.

### SBS-INT-002: Inventory and Justification of Remote Site Settings

**Control Statement:** Organizations must maintain an authoritative inventory of all Remote Site Settings and document a business justification for each endpoint approved for Apex HTTP callouts.

**Description:**  
All Remote Site Settings configured in Salesforce must be recorded in the organization’s system of record along with a clear business justification demonstrating why the endpoint is required and trusted for use in Apex HTTP callouts.

**Risk:** <Badge type="tip" text="Moderate" />  
Without a documented inventory and justification for Remote Site Settings, unvetted or insecure endpoints may be authorized for Apex HTTP callouts—exposing the organization to data leakage, dependency risks, or communication with untrusted services. However, this control provides governance documentation rather than detection or prevention capability: it supports audit readiness and informed decision-making, but other controls are required to detect or prevent actual data exfiltration through approved endpoints.

**Audit Procedure:**  
1. Enumerate all Remote Site Settings via Salesforce Setup or the Metadata API.  
2. Retrieve the organization’s system of record for approved outbound endpoints.  
3. Compare the Salesforce list to the system of record to confirm each Remote Site Setting is documented.  
4. Verify that each documented Remote Site Setting includes a clear business justification.  
5. Flag any Remote Site Settings missing from the inventory or lacking justification as noncompliant.

**Remediation:**  
1. Add all undocumented Remote Site Settings to the system of record.  
2. Document a valid business justification for each endpoint.  
3. Remove or disable any Remote Site Settings that cannot be justified.  
4. Implement a recurring process to reconcile Remote Site Settings with the system of record.

**Default Value:**  
Salesforce does not require or maintain business justification for Remote Site Settings and does not enforce an external inventory.

### SBS-INT-003: Inventory and Justification of Named Credentials

**Control Statement:** Organizations must maintain an authoritative inventory of all Named Credentials and document a business justification for each external endpoint and authentication configuration approved for use in Salesforce.

**Description:**  
All Named Credentials defined in Salesforce—regardless of authentication type or use case—must be recorded in the organization’s system of record, including the endpoint URL, authentication model, and a clear business justification demonstrating why the connection is required and trusted for Apex callouts, External Services, or external data access.

**Risk:** <Badge type="tip" text="Moderate" />  
Without a documented inventory and justification for Named Credentials, undocumented or unjustified configurations may expose the organization to data leakage, unauthorized integrations, or reliance on insecure or untrusted endpoints. However, this control provides governance documentation rather than detection or prevention capability: it supports audit readiness and informed decision-making about authenticated external connections, but other controls are required to detect or prevent actual misuse of approved credentials.

**Audit Procedure:**  
1. Enumerate all Named Credentials using Salesforce Setup, Metadata API, Tooling API, or Connect REST API.  
2. Retrieve the organization’s system of record for approved external endpoints and integration credentials.  
3. Compare the Salesforce list to the system of record to confirm all Named Credentials are documented.  
4. Verify that each documented Named Credential includes:  
   - The external endpoint URL  
   - The authentication type (named principal or per-user)  
   - The business justification for the integration  
5. Flag any Named Credentials missing from the inventory or lacking justification as noncompliant.

**Remediation:**  
1. Add any undocumented Named Credentials to the system of record.  
2. Document a valid business justification for each Named Credential.  
3. Remove, disable, or reconfigure any Named Credentials that cannot be justified or that reference untrusted endpoints.  
4. Establish a recurring reconciliation process to ensure Named Credentials remain fully inventoried and justified.

**Default Value:**  
Salesforce does not maintain or enforce an external inventory or business justification for Named Credentials.

### SBS-INT-004: Retain API Total Usage Event Logs for 30 Days

**Control Statement:**
The organization must retain API Total Usage event log data (EventLogFile EventType=ApiTotalUsage) for at least the immediately preceding 30 days using Salesforce-native retention or automated external export and storage.

**Description**:
If the organization’s Salesforce does not provide at least 30 days of ApiTotalUsage EventLogFile availability in Salesforce, the organization must automatically export newly available ApiTotalUsage event log files at least once every 24 hours to an external log store that retains a minimum of 30 days of data.

**Risk:** <Badge type="warning" text="High" />  
Without retained API Total Usage logs, organizations lose visibility into REST, SOAP, and Bulk API activity—including user identity, connected app, client IP, resource accessed, and status codes. This materially degrades the ability to detect anomalous API behavior, investigate security incidents, attribute unauthorized access, and determine the scope of potential breaches. The absence of this visibility creates a significant gap in incident detection and response capabilities.

**Audit Procedure**:
1. Determine whether the organization relies on Salesforce-native retention (Event Monitoring/Shield/Event Monitoring add-on) or an external log store as the system of record for ApiTotalUsage EventLogFile data.
2. If the organization relies on Salesforce-native retention, verify that EventLogFile data is retained for at least 30 days (for example, confirm the org is entitled to and configured for Event Log File retention that is at least 30 days and can retrieve ApiTotalUsage EventLogFile data within the preceding 30-day window).
3. If the organization relies on an external log store (including all orgs with only 1-day ApiTotalUsage availability in Salesforce):
- Verify an automated process exists that retrieves EventLogFile entries where EventType='ApiTotalUsage' and downloads the associated log files at least once every 24 hours.
- Inspect job schedules/run history and confirm successful executions covering at least the last 30 days (no missed days).
- From the external log store, retrieve ApiTotalUsage logs for (a) the oldest day in the preceding 30-day window and (b) the most recent day, and confirm both are accessible and attributable to the organization.
- Verify access to the external log store is restricted to authorized roles and service identities responsible for monitoring and investigations.

**Remediation**:
1. If the organization has only 1-day ApiTotalUsage EventLogFile availability in Salesforce, implement an automated daily export that downloads newly available ApiTotalUsage log files and stores them externally for at least 30 days.
2. If the organization uses Salesforce-native retention, ensure the configured retention period for Event Log Files is not less than 30 days.
3. Restrict access to the retained logs (Salesforce-native or external) to authorized personnel and designated service identities.

**Default Value**:
Enterprise, Unlimited, and Performance Edition organizations have free access to the ApiTotalUsage event type with 1-day data retention, while organizations with Shield/Event Monitoring add-on retain Event Log Files for 30 days by default (and may be eligible to extend retention).
