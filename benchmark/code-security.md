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
3. Flag any repositories or branches that allow merging without peer approval.

**Remediation:**  
1. Update branch protection rules to require peer review before merge.  
2. Train developers on the peer review workflow.  
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

### SBS-CODE-004: Prevent Sensitive Data in Application Logs

**Control Statement:** Custom application logging frameworks and Salesforce system logging mechanisms must not capture, store, or transmit credentials, authentication tokens, personally identifiable information (PII), regulated data, or other sensitive values in log messages or structured log fields.

**Description:**  
Organizations must ensure that both custom Apex logging frameworks and Salesforce's built-in logging systems (debug logs, Event Monitoring, API usage logs) exclude sensitive data from all log outputs. This applies to:

- Custom logging frameworks writing to custom objects or external systems
- `System.debug()` statements that write to Salesforce debug logs
- API callout logging captured in Event Monitoring
- Error handling routines that log exception details

Logging implementations must prevent the capture of:

- Authentication credentials (passwords, API keys, client secrets, OAuth tokens, session IDs, refresh tokens)
- Personally identifiable information (SSNs, passport numbers, driver's license numbers, tax IDs, account numbers)
- Regulated financial data (credit card numbers, bank account details, routing numbers, CVV codes)
- Protected health information (medical record numbers, diagnosis codes, treatment details)
- Full SOQL query results containing sensitive fields (log record IDs or counts instead)
- Request/response payloads containing authentication headers or authorization tokens
- Unmasked field values from high-sensitivity objects (mask or tokenize before logging)

Logging frameworks must provide sanitization functions that developers can invoke to remove or mask sensitive data before log events are persisted. Organizations must establish code review requirements that specifically check for sensitive data exposure in logging calls.

**Risk:** <Badge type="danger" text="Critical" />  
When application logs capture sensitive data, attackers who compromise low-privilege accounts with Read access to log storage objects can exfiltrate credentials, PII, or regulated data without triggering access controls on the original source objects. A single developer logging full request payloads "for debugging" creates a persistent secondary store of unprotected sensitive data accessible to anyone with object permissions—transforming a logging framework into a data leakage vector. This is especially severe in regulated industries: a compromised administrator querying log objects can extract thousands of customer records containing SSNs, account numbers, or health data in minutes. The organization's audit trail shows only "legitimate" queries against a custom logging object, making detection nearly impossible. During breach investigations, logs become evidence of regulatory violations (GDPR, GLBA, HIPAA) rather than forensic tools, triggering consent orders, third-party assessments, and multi-million fines.

**Audit Procedure:**  
1. Review all Apex classes to identify logging statements in both custom frameworks and `System.debug()` calls.  
2. Examine log message construction to detect patterns that may capture sensitive data:
   - Logging full SObject records or field values from high-sensitivity objects
   - Logging request/response payloads without sanitization
   - Logging query results or method parameters containing PII or credentials
   - Concatenating user input directly into log messages without validation
   - Using `System.debug()` with full object serialization or sensitive field values
3. Query recent log records stored in custom objects and review Salesforce debug logs to inspect actual log content for sensitive data:
   - Search for patterns matching SSNs, credit card numbers, email addresses, phone numbers
   - Identify authentication tokens, session IDs, or API keys in log messages
   - Flag any log records containing regulated data or PII
4. Review Event Monitoring logs (if enabled) for API request/response bodies containing sensitive data.
5. Verify that the logging framework provides and enforces sanitization functions for sensitive data.  
6. Confirm that code review processes include checks for sensitive data exposure in all logging mechanisms.

**Remediation:**  
1. Implement sanitization utilities in custom logging frameworks and establish patterns for `System.debug()` calls:
   ```apex
   public class SecureLogger {
       public static void logInfo(String message, Map<String, Object> context) {
           // Sanitize context before logging
           Map<String, Object> sanitized = sanitizeContext(context);
           Logger.info(message, sanitized);
       }
       
       private static Map<String, Object> sanitizeContext(Map<String, Object> ctx) {
           Map<String, Object> result = new Map<String, Object>();
           for (String key : ctx.keySet()) {
               // Mask sensitive fields, log IDs instead of full records
               if (key.containsIgnoreCase('password') || 
                   key.containsIgnoreCase('token') || 
                   key.containsIgnoreCase('ssn')) {
                   result.put(key, '***REDACTED***');
               } else if (ctx.get(key) instanceof SObject) {
                   result.put(key, ((SObject)ctx.get(key)).Id);
               } else {
                   result.put(key, ctx.get(key));
               }
           }
           return result;
       }
   }
   ```
2. Audit existing log records in custom objects and purge Salesforce debug logs containing sensitive data.  
3. Update all logging calls to use sanitization functions and avoid logging sensitive data:
   ```apex
   // BAD - logs full account with SSN field
   System.debug('Processing: ' + acc);
   Logger.info('Processing account', new Map<String, Object>{'account' => acc});
   
   // GOOD - logs only record ID
   System.debug('Processing account: ' + acc.Id);
   SecureLogger.logInfo('Processing account', new Map<String, Object>{
       'accountId' => acc.Id,
       'recordCount' => 1
   });
   ```
4. Establish automated testing that validates log outputs do not contain sensitive data patterns.  
5. Add logging security checks to peer review and static analysis workflows.  
6. Disable or restrict Event Monitoring features that capture full API request/response bodies in regulated environments.

**Default Value:**  
Salesforce does not prevent or sanitize sensitive data in custom application logs or system debug logs; developers bear full responsibility for ensuring log content complies with data protection requirements.
