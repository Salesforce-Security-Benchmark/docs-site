## Data Security

This section defines controls related to the protection, classification, and management of data stored within Salesforce environments. These controls ensure that organizations maintain visibility over sensitive data locations, implement appropriate safeguards for regulated information, and establish processes to support privacy compliance and breach response capabilities.

### SBS-DATA-001: Implement Mechanisms to Detect Regulated Data in Long Text Area Fields

**Control Statement:** The organization must implement a mechanism that continuously or periodically analyzes the contents of all Long Text Area fields to identify the presence of regulated or personal data.

**Description:**  
Salesforce organizations must employ a technical or procedural mechanism to inspect the stored values of all Long Text Area (LTA) fields for regulated data, including PII, PHI, or GDPR-governed attributes. For example, a sales representative may enter customer phone numbers, email addresses, or even payment card details into an Opportunity "Follow-Up Notes" field, creating unstructured storage of regulated data that is difficult to detect without systematic scanning.

**Risk:** <Badge type="warning" text="High" />  
Long Text Area fields often contain unstructured, user-entered information that may include sensitive personal data. Without a detection mechanism, regulated data accumulates in unknown locations—obstructing compliance with GDPR Right to Erasure, CCPA deletion requests, and similar privacy obligations. During a security incident, the inability to identify which fields contain personal information makes it impossible to accurately assess exposure, determine the scope of compromised records, or fulfill breach notification requirements. This governance gap significantly impairs incident response and creates ongoing regulatory liability.

**Audit Procedure:**  
1. Identify all Long Text Area fields using Salesforce metadata.  
2. Determine whether the organization has a mechanism that scans the *contents* of each LTA field for regulated data.  
3. Confirm that scanning occurs continuously or on a defined recurring schedule.  
4. Review scan logs, detection outputs, or configuration details to verify that the mechanism is operational.  
5. Validate that all LTA fields across all objects are included in scope.  
6. Determine compliance based on whether such a mechanism exists and is functioning.

**Remediation:**  
1. Deploy or configure a tool, script, or process capable of analyzing the contents of LTA fields for regulated data.  
2. Ensure scans run continuously or on a recurring schedule.  
3. Confirm all applicable fields across all objects are included.  
4. Document the scanning process and store execution evidence for audit support.

**Default Value:**  
Salesforce does not natively scan the contents of Long Text Area fields for regulated data.

### SBS-DATA-002: Maintain an Inventory of Long Text Area Fields Containing Regulated Data

**Control Statement:** The organization must maintain an up-to-date inventory of all Long Text Area fields that are known or detected to contain regulated or personal data.

**Description:**  
Organizations must maintain a documented inventory listing each Long Text Area field that contains or is reasonably expected to contain regulated data, based on scanning outputs or operational use. For example, if a Case "Internal Comments" field routinely includes client account numbers or health-related information entered by support agents, that field must appear in the inventory and be tracked accordingly.

**Risk:** <Badge type="tip" text="Moderate" />  
Without a current inventory of fields containing regulated data, organizations cannot systematically apply appropriate protection, retention, or access controls to sensitive data locations—and may be unable to fulfill privacy obligations such as GDPR's Right to Erasure or CCPA deletion requests that require knowing all locations where personal data is stored. During audits or breach investigations, the absence of a maintained inventory delays response times and may result in incomplete remediation or missed data locations.

**Audit Procedure:**  
1. Obtain the organization's documented inventory of Long Text Area fields containing regulated data.  
2. Compare the inventory against Salesforce metadata to confirm all relevant fields are included.  
3. Review scan results or administrative evidence demonstrating how fields were identified.  
4. Verify that the inventory includes object name, field API name, data classification, and last review date.  
5. Determine whether the inventory is maintained and current; missing, outdated, or incomplete inventories indicate noncompliance.

**Remediation:**  
1. Generate an inventory using scan results, administrative review, and metadata analysis.  
2. Document all LTA fields containing regulated data and classify the associated data types.  
3. Establish a recurring review cycle to update the inventory.  
4. Integrate the inventory into governance functions such as retention, DLP, access reviews, and breach response planning.

**Default Value:**  
Salesforce does not maintain or provide an inventory of Long Text Area fields containing regulated data.

### SBS-DATA-004: Require Field History Tracking for Sensitive Fields

**Control Statement:** The organization must maintain a documented list of sensitive fields and ensure Field History Tracking is enabled for each listed field on all in-scope objects.

**Description:**  
Organizations must define which fields are sensitive (e.g., regulated data, financial identifiers, or security-relevant attributes) and enable Field History Tracking for those fields so changes can be audited. Any sensitive field without tracking is noncompliant.

**Risk:** <Badge type="warning" text="High" />  
Without field history tracking on sensitive fields, unauthorized or accidental changes cannot be reliably detected or investigated. This reduces auditability, impairs incident response, and weakens accountability for changes to regulated or high-impact data.

**Audit Procedure:**  
1. Obtain the organization’s documented list of sensitive fields and in-scope objects.  
2. Enumerate Field History Tracking settings for those objects.  
3. Verify that each listed sensitive field has Field History Tracking enabled.  
4. Flag any sensitive field without tracking.

**Remediation:**  
1. Enable Field History Tracking for all listed sensitive fields.  
2. Update the sensitive-field list as schemas evolve.  
3. Re-verify tracking coverage after changes.

**Default Value:**  
Salesforce does not enable Field History Tracking for sensitive fields by default.
