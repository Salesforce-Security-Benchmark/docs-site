# Controls At-a-Glance

This page provides a quick reference to all SBS control statements. Each control statement is a concise, single-sentence summary of the requirement. For full details including rationale, audit procedures, and remediation steps, refer to the individual control sections.

## Foundations

**SBS-FDNS-001: Centralized Security System of Record**  
The organization must maintain a centralized system of record documenting all Salesforce security configurations, exceptions, justifications, and SBS-required inventories.

## Permissions

**SBS-PERM-001: Enforce a Documented Permission Set Model**  
All permission sets, permission set groups, and profiles must conform to a documented model maintained in a system of record and enforced continuously.

**SBS-PERM-002: Documented Justification for All API-Enabled Authorizations**  
Every authorization granting the "API Enabled" permission must have documented business or technical justification recorded in a system of record.

**SBS-PERM-003: Documented Justification for Approve Uninstalled Connected Apps Permission**  
The "Approve Uninstalled Connected Apps" permission must only be assigned to highly trusted users with documented justification and must not be granted to end-users.

**SBS-PERM-004: Documented Justification for All Super Admin–Equivalent Users**  
All users with simultaneous View All Data, Modify All Data, and Manage Users permissions must be documented in a system of record with clear business or technical justification.

## OAuth Security

**SBS-OAUTH-001: Require Formal Installation and Access Governance for Connected Apps**  
Organizations must formally install all connected apps and must control access to each installed app exclusively through assigned profiles or permission sets.

**SBS-OAUTH-002: Inventory and Criticality Classification of OAuth-Enabled Connected Apps**  
All OAuth-enabled Connected Apps must be recorded in an authoritative system of record and assigned a documented vendor criticality rating reflecting integration importance and data sensitivity.

**SBS-OAUTH-003: Revocation of Unused or Deprecated OAuth-Enabled Connected Apps**  
All OAuth-enabled Connected Apps that are unused, deprecated, or no longer required for business operations must be revoked and removed from the Salesforce environment.

**SBS-OAUTH-004: Due Diligence Documentation for High-Risk Connected App Vendors**  
Organizations must review and retain available security documentation for all high-risk Connected App vendors and explicitly record any missing documentation as part of the vendor assessment.

## Integrations

**SBS-INT-001: Enforce Governance of Browser Extensions Accessing Salesforce**  
Organizations must enforce a centrally managed mechanism that restricts which browser extensions are permitted to access Salesforce, and must not allow the use of unmanaged or uncontrolled extensions.

**SBS-INT-002: Inventory and Justification of Remote Site Settings**  
Organizations must maintain an authoritative inventory of all Remote Site Settings and document a business justification for each endpoint approved for Apex HTTP callouts.

**SBS-INT-003: Inventory and Justification of Named Credentials**  
Organizations must maintain an authoritative inventory of all Named Credentials and document a business justification for each external endpoint and authentication configuration approved for use in Salesforce.

## Code Security

**SBS-CODE-001: Mandatory Peer Review for Salesforce Code Changes**  
All Salesforce code changes must undergo peer review and receive approval before merging into any production-bound branch.

**SBS-CODE-002: Pre-Merge Static Code Analysis for Apex and LWC**  
Static code analysis with security checks for Apex and Lightning Web Components must execute successfully before any code change is merged into a production-bound branch.

**SBS-CODE-003: Implement Persistent Apex Application Logging**  
Organizations must implement an Apex-based logging framework that writes application log events to durable Salesforce storage and must not rely on transient Salesforce debug logs for operational or security investigations.

## Data Security

**SBS-DATA-001: Implement Mechanisms to Detect Regulated Data in Long Text Area Fields**  
The organization must implement a mechanism that continuously or periodically analyzes the contents of all Long Text Area fields to identify the presence of regulated or personal data.

**SBS-DATA-002: Maintain an Inventory of Long Text Area Fields Containing Regulated Data**  
The organization must maintain an up-to-date inventory of all Long Text Area fields that are known or detected to contain regulated or personal data.

---

*Total Controls: 17*

