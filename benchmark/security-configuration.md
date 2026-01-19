## Security Configuration

This section defines controls related to Salesforce platform security settings and configuration management. These controls ensure that organizations establish clear security baselines, continuously monitor configuration drift, and maintain intentional security postures through systematic review and remediation of platform settings.

### SBS-SECCONF-001: Establish a Salesforce Health Check Baseline

**Control Statement:** Salesforce production orgs must define and maintain a Salesforce Health Check baseline—including Salesforce's native baseline XML or an equivalent customized baseline—and ensure it reflects the organization's intentional security configuration posture.

**Description:**  
Organizations must create, upload, and maintain a Salesforce Health Check baseline template in XML format. The baseline must reflect the organization's required security configuration for key platform settings across authentication, session management, content security, and other Health Check parameters. Organizations may use Salesforce's default baseline, an SBS-recommended baseline, or a custom internal baseline, but the baseline must be explicitly defined, documented, and uploaded into Salesforce Health Check.

**Risk:** <Badge type="warning" text="High" />  
Without a defined Health Check baseline, organizations have no authoritative reference for what their security configuration should be—making it impossible to detect drift, evaluate deviations, or determine whether current settings reflect intentional decisions or accumulated neglect. Security teams cannot assess configuration-related risk, investigate whether settings were deliberately changed, or demonstrate compliance with security requirements. The absence of a baseline also prevents effective use of Health Check deviation monitoring (SBS-SECCONF-002), as there is no standard to measure against.

**Audit Procedure:**  
1. Navigate to **Setup → Health Check** and confirm that a baseline template is uploaded and active.  
2. Review the XML baseline directly (via UI or API) to verify that the baseline exists and contains intentional values rather than defaults left unexamined.  
3. Interview administrators to confirm the baseline was deliberately chosen or customized and is understood as the organization's configuration standard.  
4. If the organization lacks a baseline, flag the control as noncompliant.

**Remediation:**  
1. Create or select a Health Check baseline (Salesforce default, SBS-recommended baseline, or a custom-defined XML).  
2. Upload the baseline XML into **Setup → Health Check**.  
3. Document ownership of the baseline and establish a process for periodic review and updates.  
4. Communicate the baseline's purpose and implications to system owners and security stakeholders.

**Default Value:**  
Salesforce provides a default baseline but does not require organizations to review, customize, or maintain it.

### SBS-SECCONF-002: Review and Remediate Salesforce Health Check Deviations

**Control Statement:** Salesforce production orgs must periodically review Health Check results against the defined baseline and remediate deviations or formally document approved exceptions.

**Description:**  
Organizations must maintain a repeatable process for reviewing deviations identified in Salesforce Health Check. The process may be manual or automated, and may use Salesforce's native UI, exported Health Check data, API-driven reports, or third-party tooling. The organization must remediate deviations that represent unapproved risk or document and track exceptions when deviations are intentional or operationally necessary.

**Risk:** <Badge type="warning" text="High" />  
Without periodic review and remediation of Health Check deviations, configuration drift accumulates undetected—weakening security posture over time as settings diverge from the intended baseline. Security teams cannot identify when critical platform settings (authentication, session management, content security) have been changed or misconfigured, preventing timely response to emerging vulnerabilities. Unaddressed deviations may persist indefinitely, creating exploitable gaps that remain invisible until a breach or audit reveals the exposure.

**Audit Procedure:**  
1. Interview system owners to identify the established Health Check review process and review interval (e.g., monthly, quarterly).  
2. Examine evidence of recent Health Check reviews, such as documented review artifacts, exported reports, tickets, changes, or exception records.  
3. Verify that deviations were:  
   - Remediated within the review window, **or**  
   - Documented as exceptions with clear justification and approval.  
4. Confirm that the review process is repeatable, assigned to an owner, and actually followed.  
5. Flag noncompliance if:  
   - No review process exists,  
   - No review evidence can be produced, or  
   - Deviations occur without remediation or exception documentation.

**Remediation:**  
1. Establish a recurring review process using any reliable method, including:  
   - Salesforce Health Check UI,  
   - API exports,  
   - CLI automation,  
   - Scheduled scripts,  
   - Vendor tooling.  
2. Assign ownership for conducting the review and maintaining documentation.  
3. Review current deviations and either remediate them or document exceptions.  
4. Implement tracking to ensure deviations are remediated or re-reviewed in future cycles.

**Default Value:**  
Salesforce does not require or track periodic Health Check reviews; deviations may persist indefinitely without administrative action.
