## Change Management

This section defines controls related to metadata deployment practices, configuration change governance, and production environment integrity. These controls ensure that organizations establish clear provenance for production changes, restrict high-risk metadata modifications to controlled deployment processes, and maintain continuous monitoring to detect unauthorized configuration drift.

### SBS-CHG-001: Require a Designated Deployment Identity for Metadata Changes

**Control Statement:** Salesforce production orgs must designate a single deployment identity that is exclusively used for all metadata deployments and high-risk configuration changes performed through automated or scripted release processes.

**Description:**  
A dedicated deployment identity (integration user) must be created and used as the sole account for CI/CD, metadata deployments, and automated release tooling. No human user—regardless of administrative privilege—may deploy metadata or execute automated deployment operations using their personal account.

**Rationale:**  
A designated deployment identity establishes provenance, prevents impersonation, eliminates ambiguity in production-change attribution, and enables detection of unauthorized manual edits to high-risk metadata.

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

### SBS-CHG-002: Establish and Maintain a List of High-Risk Metadata Types Prohibited from Direct Production Editing

**Control Statement:** Salesforce production orgs must maintain an explicit list of high-risk metadata types that must never be edited directly in production by human users, defaulting at minimum to the SBS baseline list while allowing organizations to extend or refine it as needed.

**Description:**  
Organizations must adopt the SBS baseline list of prohibited direct-in-production changes—which includes Apex Classes, Apex Triggers, LWCs, Aura Components, Profiles, Permission Set definitions, Remote Site Settings, Named Credentials, and core authentication or session security settings—and maintain this list as an internal policy. Organizations may extend this list or define exceptions, but the minimum baseline must be included and documented.

**Rationale:**  
High-risk metadata types directly impact application integrity, authentication, authorization, outbound connectivity, and secure configuration. Restricting these changes to the deployment identity ensures reliable provenance and prevents unintended or unauthorized drift in production.

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


### SBS-CHG-003: Monitor and Alert on Unauthorized Modifications to High-Risk Metadata

**Control Statement:** Salesforce production orgs must implement a monitoring capability that detects and reports any modification to high-risk metadata performed by a user other than the designated deployment identity.

**Description:**  
Organizations must maintain a monitoring process—manual or automated—that reviews administrative and metadata changes and identifies when high-risk metadata (as defined in SBS-CHG-002 or extended by the organization) is modified by a human user instead of the designated deployment identity. The monitoring method may use Salesforce APIs, audit logs, export files, CLI tooling, vendor tools, or any combination, provided it reliably detects unauthorized changes within the organization’s defined review interval.

**Rationale:**  
Monitoring for unauthorized direct-in-production changes preserves deployment provenance, reduces configuration drift, and ensures timely identification of high-risk modifications that bypass established deployment governance.

**Audit Procedure:**  
1. Interview system owners to identify the monitoring method(s) used for detecting changes to high-risk metadata.  
2. Review documentation describing how the monitoring process works—whether manual log review, automated scripts, API queries, CLI workflows, scheduled exports, or vendor tools.  
3. Verify that the monitoring process includes:  
   - Coverage of all high-risk metadata types defined by the organization and required by SBS-CHG-002.  
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

### SBS-CHG-004: Establish Source-Driven Development Process

**Control Statement:** Meaningful changes must be deployed with a source-driven, automated deployment process.

**Description:**  
Organizations must track all meaningful changes to metadata in a centralized version control system. The process to deploy those changes must include appropriate validation and testing, and must be automated in a fashion that it is repeatable and deterministic. This control makes no assumptions on the complexity of the org and the need for modularization and general scalability of the deployment process. To be compliant, it is sufficient to keep track of changes in version control and deploy deterministically.

**Rationale:**  
Without adequate version control and automation, it is almost impossible to recover in case of failure. It is one root cause for "configuration drift" (the situation, where sandboxes deviate from production orgs). Version control and automated delivery are fundamental to identify **who** made changes in case of problems.

**Audit Procedure:**  
1. Follow the procedure described in SBS-CHG-001 to enforce a designated deployment identity.
2. Investigate all processes that propagated changes from development environments to production. 
3. Flag all processes that did not use a centralized version control.

**Remediation:**  
1. Set up a version control system such as `git`.
2. Ensure that the version control is centralized and accessible by all developers.
3. Evaluate if a progressive transistion is necessary (gradually migrate metadata to source-driven process).
4. Introduce appropriate measures that from now on, all changes are tracked in source.

**Default Value:**  
Salesforce allows changes of most metadata types on production by default.