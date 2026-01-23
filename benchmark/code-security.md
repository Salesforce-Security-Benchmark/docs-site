## Code Security

This section defines controls related to secure development practices for Salesforce code, including Apex, Lightning Web Components, and other programmatic assets. These controls ensure that organizations implement quality gates, peer review, and automated security testing within their development lifecycle to prevent vulnerable or flawed code from entering production environments.

### SBS-CODE-001: Mandatory Peer Review for Salesforce Code Changes

**Control Statement:** All Salesforce code changes must undergo peer review and receive approval before merging into any production-bound branch.

**Description:**  
Organizations must configure their source control system to require at least one peer reviewer to approve all changes to Apex, Lightning Web Components, and other programmatic assets before those changes are merged into branches used for production deployments.

**Risk:** <Badge type="tip" text="Moderate" />  
Without mandatory peer review, a single developer—whether compromised, malicious, or simply mistaken—can introduce insecure or flawed code directly into the deployment pipeline. This eliminates shared oversight of changes to sensitive business logic, allowing vulnerabilities, backdoors, or destructive changes to reach production without independent human verification before deployment.

**Audit Procedure:**  
1. Inspect source control settings to confirm merge rules require peer review on production-bound branches.  
2. Review merge history or representative pull requests to verify peer approvals were recorded.  
3. Confirm that peer review processes include security checks such as verifying logging statements do not expose sensitive data.
4. Flag any repositories or branches that allow merging without peer approval.

**Remediation:**  
1. Update branch protection rules to require peer review before merge.  
2. Train developers on the peer review workflow, including security checks such as identifying sensitive data in logging statements.  
3. Block direct commits to production-bound branches.

**Default Value:**  
Salesforce does not enforce code review requirements; these controls depend on the organization's source control configuration.

### SBS-CODE-002: Pre-Merge Static Code Analysis for Apex and LWC

**Control Statement:** Static code analysis with security checks for Apex and Lightning Web Components must execute successfully before any code change is merged into a production-bound branch.

**Description:**  
Organizations must implement static application security testing (SAST) in their CI/CD pipeline and configure it to run prior to merge, enforcing security rulesets that detect vulnerabilities specific to Apex and LWC.

**Risk:** <Badge type="tip" text="Moderate" />  
Without enforced static code analysis, known vulnerability patterns in Apex and LWC—such as SOQL injection, insecure data exposure, and improper access control—may enter production undetected. This increases the likelihood of exploitable flaws persisting in deployed code, creating potential vectors for data breaches or unauthorized access that human reviewers may not catch.

**Audit Procedure:**  
1. Inspect CI/CD pipeline configuration to confirm a static code analysis step runs before merges.  
2. Verify the SAST tool includes security rulesets for Apex and Lightning Web Components.  
3. Review pipeline logs from representative merges to ensure scans executed and passed.  
4. Flag pipelines or branches missing enforced pre-merge scanning.

**Remediation:**  
1. Integrate static code analysis into the CI/CD pipeline for all production-bound branches.  
2. Enable Apex and LWC security rulesets within the scanning tool.  
3. Configure pipelines to block merges when static analysis fails.

**Default Value:**  
Salesforce does not provide or enforce static code analysis; organizations must implement external SAST tooling.

### SBS-CODE-003: Implement Persistent Apex Application Logging

**Control Statement:** Organizations must implement an Apex-based logging framework that writes application log events to durable Salesforce storage and must not rely on transient Salesforce debug logs for operational or security investigations.

**Description:**  
The organization must deploy a dedicated Apex logging framework—custom-built, open source, or vendor-provided—that programmatically captures application-level log events and stores them in durable Salesforce data structures, such as custom objects, to ensure logs persist beyond the limitations of Salesforce debug logs.

**Risk:** <Badge type="warning" text="High" />  
Salesforce debug logs are transient, size-limited, and automatically purged—making them unsuitable for forensic analysis or security investigations. Without persistent application logging, organizations cannot reliably reconstruct access patterns, detect anomalous behavior, or investigate security incidents after the fact. This impairs the ability to identify compromise, attribute malicious activity, or understand the scope of a breach—significantly extending attacker dwell time and reducing accountability for actions taken within the system.

**Audit Procedure:**  
1. Review the Salesforce org for the presence of an Apex logging framework implemented as one or more Apex classes dedicated to log generation and persistence.  
2. Verify that the framework writes logs to durable storage, such as a custom object purpose-built for log retention.  
3. Confirm that operational and security investigations rely on this persistent logging mechanism rather than Salesforce debug logs.  
4. Inspect recent log records to ensure the framework is actively capturing runtime events.

**Remediation:**  
1. Implement or install an Apex logging framework designed for persistent log storage.  
2. Create or configure a custom object (or equivalent durable storage) to store log records.  
3. Update Apex code to route log events through the framework.  
4. Train engineering and security teams to use persistent logs instead of debug logs for investigations.

**Default Value:**  
Salesforce does not provide persistent application-level logging by default; debug logs are transient, size-limited, and automatically purged.

