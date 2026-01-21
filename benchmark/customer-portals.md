## Customer Portals

This section defines controls related to secure configuration and development practices for Salesforce customer portals, including Experience Cloud sites, Communities, and other external-facing Salesforce platforms. These controls ensure that organizations implement proper access controls, data isolation, and secure coding practices when exposing Salesforce functionality to external users.

### SBS-CPORTAL-001: Enforce Context-Based Access Control in AuraEnabled Methods

**Control Statement:** All AuraEnabled methods exposed to customer portal users must enforce access control based on the authenticated user context, must implement proper sharing and permission checks appropriate to the user's trust level, and must not accept user-provided parameters that determine record access or query scope.

**Description:**  
Organizations must architect and implement AuraEnabled methods in customer portal environments (Experience Cloud, Communities, and Sites) according to a defense-in-depth access control model that relies exclusively on server-side evaluation of the authenticated user's context. This architecture must incorporate multiple layers of security control:

**Layer 1: Sharing Model Enforcement**  
Methods must operate with appropriate sharing keywords (`with sharing`, `inherited sharing`, or `without sharing`) based on the security requirements and user trust level. The default approach must be `with sharing` or `inherited sharing`, which respects Salesforce's organization-wide defaults (OWDs), sharing rules, manual shares, role hierarchy, and territory hierarchy. This ensures that the platform's native sharing model—already configured for the organization—acts as the primary enforcement mechanism.

**Layer 2: Programmatic Permission and Field-Level Security Checks**  
When methods must operate in `without sharing` context (required for specific architectural patterns such as guaranteed service-level operations, cross-user aggregations, or platform event processing), organizations must implement explicit permission verification using:
- Object-level CRUD checks via `DescribeSObjectResult` methods or `Schema.sObjectType` permissions
- Field-level security (FLS) validation through `DescribeFieldResult.isAccessible()` or `Security.stripInaccessible()`
- Record-level access verification via `UserRecordAccess` queries when needed
- Profile, permission set, or custom permission checks via `FeatureManagement.checkPermission()` when appropriate

**Layer 3: User Context-Based Logic**  
All data access decisions must derive from the running user's context obtained through `UserInfo` class methods (`UserInfo.getUserId()`, `UserInfo.getProfileId()`, `UserInfo.getUserType()`, `UserInfo.getUserRoleId()`). Methods must never accept frontend-supplied parameters that control:
- Which records are queried (e.g., record IDs, parent IDs, related object filters)
- SOQL WHERE clause predicates or filter conditions
- Field lists determining what data is returned
- Relationship traversals or query depth

**Unauthenticated User Considerations (Guest/Public Access):**  
Methods exposed to unauthenticated guest users present the highest risk and require additional architectural constraints. Guest users have `UserInfo.getUserType() = 'Guest'` and operate with severely limited platform permissions—however, any `without sharing` code executed in their context bypasses even these minimal protections. For guest user scenarios:
- Default to `with sharing` enforcement unless architectural requirements absolutely prohibit it
- If `without sharing` is unavoidable, implement allowlist-based data access (explicitly define what can be queried, never accept parameters)
- Never expose methods that accept record IDs, search terms, or filter parameters from unauthenticated users
- Consider implementing separate, heavily restricted methods specifically for guest access paths
- Apply rate limiting and request validation to prevent enumeration attacks

**When `without sharing` is Architecturally Required:**  
Certain design patterns necessitate `without sharing` execution context:
- **Service-level guarantees:** Platform events, asynchronous processing, or queueable jobs where consistency across user contexts is required
- **Cross-user operations:** Aggregations, reporting, or workflow logic that must operate uniformly regardless of the running user's sharing access
- **System integration accounts:** Integration users executing on behalf of multiple customer accounts where record ownership doesn't align with sharing rules

In these scenarios, developers must compensate by implementing rigorous programmatic access checks and eliminating any reliance on user-supplied parameters for data access decisions.

**Risk:** <Badge type="danger" text="Critical" />  
When AuraEnabled methods accept user-provided parameters to control record access, external users can manipulate these inputs to bypass intended access controls and exfiltrate unauthorized data. The risk escalates dramatically when combined with `without sharing` declarations or insufficient permission verification—transforming a single method into a direct data access vulnerability.

Customer portal users operate outside organizational trust boundaries with potential adversarial intent, fundamentally differing from internal users who undergo employee vetting and operate under acceptable use policies. A misconfigured method exposed to thousands of external portal users creates scalable attack surface where:
- Authenticated portal users can probe for records beyond their sharing-based access by iterating record IDs or manipulating query filters
- Unauthenticated guest users (the highest-risk population) can exploit `without sharing` contexts to access arbitrary organizational data
- Parameters controlling field selection can expose sensitive fields that should be restricted by FLS
- Filter parameters can bypass OWDs, sharing rules, and territory restrictions that protect record access

Unlike internal CRUD operations that inherit Salesforce's native security enforcement, Lightning components invoke Apex methods as custom code execution paths where developers bear full responsibility for implementing security controls. A single overlooked `without sharing` class accepting record IDs from the frontend creates a SQL injection-equivalent vulnerability in the Salesforce trust model—allowing attackers to read data without authentication or authorization checks, independent of any other security control failures. This constitutes a **Critical** boundary violation: unauthorized users access data they should never see, with no compensating controls required to fail.

**Audit Procedure:**  
1. **Identify portal-exposed Apex classes:** Query all Apex classes containing `@AuraEnabled` methods and determine which are exposed to customer portal sites (Experience Cloud, Communities, Sites). Review Lightning components, Aura components, and LWC modules deployed to these sites to identify which Apex methods they invoke.

2. **Classify user trust levels:** For each portal site, determine whether it serves authenticated users only, unauthenticated guest users, or both. Authenticated portal user methods require baseline security controls; guest user methods require elevated scrutiny and additional restrictions.

3. **Audit sharing keyword usage:** Review the class-level and method-level sharing declarations:
   - **Classes with `with sharing` or `inherited sharing`:** Verify that these appropriately leverage Salesforce's sharing model for the user type
   - **Classes with `without sharing`:** Flag for mandatory review—document the architectural justification and verify compensating programmatic access checks are implemented
   - **Classes with no explicit sharing keyword (default `without sharing` for Apex classes not invoked from Visualforce):** Treat as `without sharing` and flag for immediate review

4. **Parameter analysis—identify access control risks:** For each `@AuraEnabled` method, examine parameters to identify those that control data access:
   - **Record identifiers:** Parameters accepting record IDs, external IDs, or object names that determine which records are queried
   - **Filter parameters:** Parameters influencing SOQL WHERE clauses, search terms, field comparisons, or date ranges
   - **Field selection:** Parameters controlling which fields are queried or returned via dynamic SOQL or field sets
   - **Relationship traversal:** Parameters determining which related objects are queried or how deep relationships are traversed
   
   Methods accepting any of these parameter types must be flagged for security validation.

5. **User context dependency verification:** For flagged methods, verify that data access logic derives from server-side user context rather than frontend parameters:
   - **Confirm `UserInfo` usage:** Validate that methods call `UserInfo.getUserId()`, `UserInfo.getProfileId()`, `UserInfo.getUserType()`, or `UserInfo.getUserRoleId()` to establish the running user's identity and use these values (not frontend parameters) to determine accessible records
   - **Verify OWD and sharing rule alignment:** For `with sharing` or `inherited sharing` classes, confirm that the organization's OWD settings, sharing rules, and role hierarchy appropriately restrict portal users
   - **Validate compensating controls for `without sharing`:** For classes operating without sharing enforcement, confirm implementation of:
     - Object CRUD checks: `Schema.sObjectType.Object__c.isAccessible()`, `isCreateable()`, `isUpdateable()`, `isDeletable()`
     - Field-level security: `DescribeFieldResult.isAccessible()`, `isCreateable()`, `isUpdateable()` for all fields accessed
     - `Security.stripInaccessible()`: Applied to query results with `AccessType.READABLE` before returning data
     - UserRecordAccess queries: Validating read/edit/delete access to specific records when needed
     - Custom permission or profile checks: Validating that the user has explicit permissions for sensitive operations

6. **Test for parameter manipulation vulnerabilities:** Conduct penetration testing against representative methods:
   - **Authenticated portal user tests:** Attempt to pass record IDs owned by other portal users or internal users to determine if unauthorized record access is possible
   - **Guest user tests (if applicable):** Attempt to pass arbitrary record IDs, enumerate IDs sequentially, or inject filter parameters from unauthenticated sessions
   - **Field-level access bypass:** Attempt to retrieve fields that should be restricted by FLS by modifying frontend queries
   - **Role hierarchy bypass:** Verify that portal users cannot access records higher in the role hierarchy by manipulating parameters

7. **Document architectural patterns and exceptions:** For methods operating in `without sharing` context, require documented architectural justification including:
   - Why `without sharing` is required for the use case
   - Which compensating programmatic checks are implemented
   - What data the method can access and why that access level is appropriate
   - How the method prevents parameter-based access control bypass
   
   Flag any `without sharing` methods exposed to guest users for executive security review and documented acceptance of residual risk.

8. **Identify compliance gaps:** Generate a report of non-compliant methods including:
   - Methods accepting record IDs or filter parameters from the frontend
   - `without sharing` methods lacking documented justification and compensating controls
   - Methods exposed to guest users without allowlist-based access restrictions
   - Methods that fail penetration testing or allow unauthorized data access

**Remediation:**  
1. **Refactor parameter-based data access:** Eliminate all parameters that control record access, query scope, or field selection from `@AuraEnabled` methods. Replace with server-side logic that determines accessible data using the running user's context.

2. **Implement proper sharing model architecture:**
   - **Default to `with sharing`:** Apply `with sharing` or `inherited sharing` to all Apex classes containing portal-exposed methods unless architectural requirements prohibit it
   - **Configure appropriate OWDs:** Review organization-wide defaults to ensure they align with the principle of least privilege for portal users (typically Private or Public Read Only)
   - **Implement sharing rules:** Create sharing rules that grant portal users access only to records they own or that are explicitly shared with their account/contact hierarchy
   - **Validate role hierarchy:** Ensure portal users are positioned correctly in the role hierarchy and cannot access records above their level

3. **For `without sharing` requirements, implement compensating controls:**
   - **Add object CRUD verification:**
     ```apex
     if (!Schema.sObjectType.Account.isAccessible()) {
         throw new AuraHandledException('Insufficient permissions');
     }
     ```
   - **Implement FLS checks for all accessed fields:**
     ```apex
     if (!Schema.sObjectType.Account.fields.Name.isAccessible() ||
         !Schema.sObjectType.Account.fields.BillingCity.isAccessible()) {
         throw new AuraHandledException('Insufficient field permissions');
     }
     ```
   - **Apply `Security.stripInaccessible()` to query results:**
     ```apex
     List<Account> accounts = [SELECT Id, Name, BillingCity FROM Account WHERE OwnerId = :UserInfo.getUserId()];
     SObjectAccessDecision decision = Security.stripInaccessible(AccessType.READABLE, accounts);
     return decision.getRecords();
     ```
   - **Use `UserRecordAccess` for record-level validation:**
     ```apex
     List<UserRecordAccess> access = [SELECT RecordId, HasReadAccess 
                                       FROM UserRecordAccess 
                                       WHERE UserId = :UserInfo.getUserId() 
                                       AND RecordId = :recordId];
     if (access.isEmpty() || !access[0].HasReadAccess) {
         throw new AuraHandledException('Access denied');
     }
     ```

4. **Refactor to user context-based queries:**
   - **Replace frontend record ID parameters with server-side context:**
     ```apex
     // BEFORE (vulnerable):
     @AuraEnabled
     public static Account getAccount(Id accountId) {
         return [SELECT Id, Name FROM Account WHERE Id = :accountId];
     }
     
     // AFTER (secure):
     @AuraEnabled
     public static Account getAccount() {
         Id userId = UserInfo.getUserId();
         User currentUser = [SELECT ContactId FROM User WHERE Id = :userId];
         Contact portalContact = [SELECT AccountId FROM Contact WHERE Id = :currentUser.ContactId];
         return [SELECT Id, Name FROM Account WHERE Id = :portalContact.AccountId];
     }
     ```
   - **Replace filter parameters with user-context-derived filters:**
     ```apex
     // BEFORE (vulnerable):
     @AuraEnabled
     public static List<Case> getCases(String status, Date fromDate) {
         return [SELECT Id, Subject FROM Case WHERE Status = :status AND CreatedDate >= :fromDate];
     }
     
     // AFTER (secure):
     @AuraEnabled
     public static List<Case> getMyCases() {
         Id userId = UserInfo.getUserId();
         User currentUser = [SELECT ContactId FROM User WHERE Id = :userId];
         // Return only cases where the portal user's contact is the case contact
         return [SELECT Id, Subject, Status, CreatedDate 
                 FROM Case 
                 WHERE ContactId = :currentUser.ContactId 
                 ORDER BY CreatedDate DESC];
     }
     ```

5. **Implement guest user restrictions:** For methods exposed to unauthenticated users:
   - Create separate, explicitly scoped methods for guest access
   - Implement allowlist-based data access (never accept parameters)
   - Apply additional validation: `if (UserInfo.getUserType() == 'Guest') { /* restricted logic */ }`
   - Consider requiring CAPTCHA or rate limiting for guest-accessible operations
   - Restrict to read-only public data explicitly marked for guest consumption

6. **Document architectural decisions:** For each method, document in code comments or architectural decision records:
   - Sharing keyword choice and rationale
   - User context used to determine access (UserInfo properties, related records, etc.)
   - Compensating controls if `without sharing` is used
   - Security testing performed and results

7. **Implement automated security testing:** Create test classes that validate:
   - Portal users cannot access records belonging to other users
   - Guest users cannot access any non-public data
   - FLS restrictions are enforced
   - Parameter manipulation attempts result in access denial

8. **Establish code review requirements:** Mandate security-focused peer review for all portal-exposed Apex code with specific attention to:
   - Sharing keyword usage and justification
   - Parameter-based access control risks
   - User context validation
   - Compensating control implementation for `without sharing` patterns

**Default Value:**  
Salesforce does not enforce server-side validation of user context in custom Apex code. Developers bear full responsibility for implementing access controls in AuraEnabled methods. Apex classes execute in system context (`without sharing`) by default unless sharing keywords are explicitly declared. Salesforce does not prevent developers from accepting user-supplied parameters that control data access, nor does it require FLS or CRUD checks in custom code. Experience Cloud and Sites allow administrators to expose Lightning components and their associated Apex methods to external users without platform-enforced security review or parameter validation.
