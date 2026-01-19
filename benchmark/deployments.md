## Deployments

This section defines controls related to metadata deployment practices, configuration change governance, and production environment integrity. These controls ensure that organizations establish clear provenance for production changes, restrict high-risk metadata modifications to controlled deployment processes, and maintain continuous monitoring to detect unauthorized configuration drift.

### SBS-DEP-001: Require a Designated Deployment Identity for Metadata Changes

**Control Statement:** Salesforce production orgs must designate a single deployment identity that is exclusively used for all metadata deployments and high-risk configuration changes performed through automated or scripted release processes.

**Description:**  
A dedicated deployment identity (integration user) must be created and used as the sole account for CI/CD, metadata deployments, and automated release tooling. No human user—regardless of administrative privilege—may deploy metadata or execute automated deployment operations using their personal account.

**Risk:** <Badge type="warning" text="High" />  
Without a designated deployment identity, organizations cannot reliably attribute production changes—any administrator can deploy metadata, making it impossible to distinguish authorized CI/CD deployments from unauthorized manual changes. This loss of provenance prevents security teams from detecting unauthorized modifications, investigating configuration drift, or determining whether a change was part of an approved release. Attackers or malicious insiders can make direct production changes that blend into legitimate administrative activity, and incident responders cannot reconstruct the timeline of configuration changes during a breach investigation.

**Audit Procedure:**  
1. Identify the user account designated as the deployment identity.  
2. Enumerate all recent metadata deployments using tooling such as Deployment Status, Metadata API logs, or audit logs.  
3. Verify that all deployments were executed by the designated deployment identity.  
4. Flag any metadata deployment performed by a human user or non-deployment identity.

**Remediation:**  
1. Create or identify a dedicated deployment identity.  
2. Reconfigure CI/CD pipelines, release management tooling, and automated deployment scripts to authenticate exclusively with the deployment identity.  
3. Revoke deployment permissions from all human users.  
4. Re-deploy any metadata last deployed by a human user to restore provenance.

**Default Value:**  
Salesforce does not create or enforce a dedicated deployment identity by default.

### SBS-DEP-002: Establish and Maintain a List of High-Risk Metadata Types Prohibited from Direct Production Editing

**Control Statement:** Salesforce production orgs must maintain an explicit list of high-risk metadata types that must never be edited directly in production by human users, defaulting at minimum to the SBS baseline list while allowing organizations to extend or refine it as needed.

**Description:**  
Organizations must adopt the SBS baseline list of prohibited direct-in-production changes—which includes Apex Classes, Apex Triggers, LWCs, Aura Components, Profiles, Permission Set definitions, Remote Site Settings, Named Credentials, and core authentication or session security settings—and maintain this list as an internal policy. Organizations may extend this list or define exceptions, but the minimum baseline must be included and documented.

**Risk:** <Badge type="warning" text="High" />  
Without an explicit list of high-risk metadata types, organizations cannot define or enforce deployment governance boundaries—leaving critical configuration categories (Apex code, authentication settings, outbound connectivity, permissions) open to uncontrolled direct production editing. Security teams cannot distinguish between metadata that requires strict deployment controls and metadata that can be safely edited manually, resulting in inconsistent governance and gaps in change attribution. The absence of a defined list also prevents effective monitoring (SBS-DEP-003), as there is no baseline to compare against when detecting unauthorized changes.

**Audit Procedure:**  
1. Obtain the organization's documented list of high-risk metadata types prohibited from direct production editing.  
2. Confirm that the list, at minimum, includes all SBS baseline categories.  
3. Review the list for any documented exceptions and verify they are formally approved.  
4. Verify that only the deployment identity has modify permissions for metadata types on the list.

**Remediation:**  
1. Adopt the SBS baseline list of prohibited direct-in-production metadata changes.  
2. Add any organization-specific items or exceptions as needed.  
3. Remove modify permissions for these metadata types from all human users.  
4. Ensure all future changes to listed metadata types are performed exclusively by the deployment identity.

**Default Value:**  
Salesforce does not provide native restrictions or guidance preventing direct production edits to high-risk metadata.


### SBS-DEP-003: Monitor and Alert on Unauthorized Modifications to High-Risk Metadata

**Control Statement:** Salesforce production orgs must implement a monitoring capability that detects and reports any modification to high-risk metadata performed by a user other than the designated deployment identity.

**Description:**  
Organizations must maintain a monitoring process—manual or automated—that reviews administrative and metadata changes and identifies when high-risk metadata (as defined in SBS-DEP-002 or extended by the organization) is modified by a human user instead of the designated deployment identity. The monitoring method may use Salesforce APIs, audit logs, export files, CLI tooling, vendor tools, or any combination, provided it reliably detects unauthorized changes within the organization’s defined review interval.

**Risk:** <Badge type="warning" text="High" />  
Without monitoring for unauthorized metadata changes, organizations cannot detect when high-risk configuration is modified outside the approved deployment process—allowing malicious changes, accidental drift, or insider threats to persist undetected. Security teams lose the ability to identify unauthorized modifications to authentication settings, permission structures, Apex code, or outbound connectivity until a breach or incident reveals the gap. This impairs detection, investigation, and response capabilities for configuration-related security events, extending attacker dwell time and preventing timely remediation of unauthorized changes.

**Audit Procedure:**  
1. Interview system owners to identify the monitoring method(s) used for detecting changes to high-risk metadata.  
2. Review documentation describing how the monitoring process works—whether manual log review, automated scripts, API queries, CLI workflows, scheduled exports, or vendor tools.  
3. Verify that the monitoring process includes:  
   - Coverage of all high-risk metadata types defined by the organization and required by SBS-DEP-002.  
   - A review interval appropriate to the organization's change-management expectations (e.g., daily, weekly, or aligned with release cycles).  
   - A method for identifying the user who performed each change.  
4. Examine historical monitoring records or logs to confirm the process has been performed consistently.  
5. Flag noncompliance if no monitoring system exists or if the system cannot detect unauthorized human modifications to high-risk metadata.

**Remediation:**  
1. Implement a monitoring mechanism capable of identifying modifications to high-risk metadata and attributing them to the responsible user. Acceptable approaches include:  
   - Manual periodic review of the Salesforce Setup Audit Trail,  
   - Exporting audit logs for review,  
   - Scheduled API or CLI queries comparing metadata changes,  
   - Custom scripts,  
   - Vendor-based monitoring tools.  
2. Ensure the monitoring method covers all high-risk metadata types listed in the organization’s defined prohibited-direct-edit list.  
3. Define a repeatable review interval and assign responsibility for conducting the review.  
4. Document the monitoring approach and maintain records of reviews and findings.

**Default Value:**  
Salesforce does not provide built-in monitoring or alerting for unauthorized direct-in-production metadata changes; organizations must implement their own processes.

### SBS-DEP-004 — Establish Source-Driven Development Process

**Control Statement**  
Meaningful Salesforce metadata changes must be deployed through a source-driven, automated, and deterministic deployment process, except where the platform does not provide programmatic deployment support.

**Description:**  
Organizations must track all meaningful metadata changes in a centralized version control system and deploy them using an automated, repeatable, and deterministic process; manual changes in production are permitted only for metadata types that Salesforce does not expose for programmatic deployment.

**Risk:** <Badge type="warning" text="High" />  
Without a source-driven deployment process, organizations lose the verifiable audit trail that connects production configuration to approved changes—making it impossible to determine what changed, when, by whom, and whether it was authorized. Security teams cannot investigate configuration-related incidents, restore known-good state during outages, or attribute changes during forensic analysis. Manual production changes bypass code review, testing, and approval workflows, enabling unauthorized, accidental, or malicious modifications to security-sensitive settings without accountability or detection.

**Audit Procedure:**  
1. Identify the organization’s standard deployment process and designated deployment identity as defined in SBS-CHG-001.  
2. Review recent production metadata changes and their associated deployment records.  
3. Verify that changes deployable through Salesforce’s programmatic deployment mechanisms originated from centralized version control.  
4. Confirm that any manual production changes are limited to metadata types that Salesforce does not support for programmatic deployment.  
5. Flag any manually applied changes that could have been deployed through the source-driven process.

**Remediation:**  
1. Establish and maintain a centralized version control repository for Salesforce metadata.  
2. Implement or enforce an automated deployment pipeline that deploys changes exclusively from version control.  
3. Restrict direct production changes for metadata types that support programmatic deployment.  
4. Document and periodically review any required manual production changes for metadata types lacking deployment support.

**Default Value:**  
Salesforce allows direct manual changes to most metadata in production and does not require source control or automated deployments by default.