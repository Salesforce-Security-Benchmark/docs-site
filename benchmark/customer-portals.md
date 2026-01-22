## Customer Portals

This section defines controls related to secure configuration and development practices for Salesforce customer portals, including Experience Cloud sites, Communities, and other external-facing Salesforce platforms. These controls ensure that organizations implement proper access controls, data isolation, and secure coding practices when exposing Salesforce functionality to external users.

### SBS-CPORTAL-001: Enforce Sharing Model in Portal-Exposed Apex Classes

**Control Statement:** All Apex classes containing methods exposed to customer portal users must implement appropriate sharing keywords (`with sharing` or `inherited sharing`), and any use of `without sharing` in portal-exposed classes must be documented in the organization's system of record with explicit business justification.

**Description:**  
Organizations must ensure that Apex classes containing `@AuraEnabled` methods or other portal-accessible entry points operate within Salesforce's native sharing model by declaring `with sharing` or `inherited sharing` at the class level. This ensures that SOQL queries respect organization-wide defaults (OWDs), sharing rules, role hierarchy, and manual shares—leveraging the platform's built-in access controls as the primary enforcement mechanism.

When architectural requirements necessitate `without sharing` execution (such as guaranteed service-level operations, cross-user aggregations, or platform event processing), organizations must document each exception in their system of record, including the business justification, compensating security controls implemented, and the date of approval.

**Risk:** <Badge type="danger" text="Critical" />  
Apex classes default to `without sharing` (system context) unless explicitly declared otherwise, bypassing all record-level security configured in the org. When portal-exposed methods execute without sharing enforcement, external users can query records beyond their intended access scope—effectively nullifying organization-wide defaults, sharing rules, and role hierarchy restrictions. This establishes an uncontrolled security boundary where a single undeclared class creates persistent access to any record in the system, independent of the user's assigned permissions or record ownership. Unlike internal users who operate under organizational trust, portal users are external parties with potential adversarial intent, making sharing model violations a Critical boundary failure.

**Audit Procedure:**  
1. Identify all Apex classes containing `@AuraEnabled` methods or other methods exposed to customer portal sites (Experience Cloud, Communities, Sites).  
2. Review each class declaration to verify the presence of `with sharing` or `inherited sharing` keywords.  
3. For classes declared with `without sharing`, verify that the usage is documented in the organization's system of record with explicit business justification and documented compensating controls.  
4. Flag any portal-exposed class lacking a sharing declaration or documented `without sharing` justification as noncompliant.

**Remediation:**  
1. Add `with sharing` or `inherited sharing` declarations to all portal-exposed Apex classes that lack explicit sharing keywords.  
2. For classes that must use `without sharing`, document the business justification, compensating controls, and approval in the system of record.  
3. Review organization-wide defaults, sharing rules, and role hierarchy configuration to ensure they appropriately restrict portal user access when `with sharing` is enforced.  
4. Establish a code review requirement that mandates verification of sharing keywords for all portal-accessible Apex code.

**Default Value:**  
Apex classes execute in system context (`without sharing`) by default unless sharing keywords are explicitly declared. Salesforce does not require or enforce sharing declarations for portal-exposed code.

### SBS-CPORTAL-002: Prevent Parameter-Based Record Access in Portal Apex

**Control Statement:** All Apex methods exposed to customer portal users must not accept user-provided parameters that determine which records are accessed, and must instead derive record access exclusively from the authenticated user's context.

**Description:**  
Organizations must architect portal-exposed Apex methods to prevent Insecure Direct Object Reference (IDOR) vulnerabilities by prohibiting acceptance of user-supplied record identifiers, SOQL filter predicates, field selection lists, or relationship traversal parameters. Methods must derive data access from server-side evaluation of the running user's context using `UserInfo` class methods (`UserInfo.getUserId()`, `UserInfo.getContactId()`, etc.) and traverse relationships from the authenticated user's associated records (User → Contact → Account) rather than trusting client-side input.

Examples of prohibited parameter patterns include:
- Record IDs passed from the frontend to control which records are queried
- Dynamic WHERE clause components or filter criteria supplied by the user  
- Field lists determining what data is returned via dynamic SOQL
- Parent/child relationship identifiers controlling query scope

**Risk:** <Badge type="danger" text="Critical" />  
When portal-exposed methods accept user-controlled parameters to determine record access, external users can manipulate these inputs to bypass intended access controls and exfiltrate unauthorized data. By iterating record IDs, modifying query filters, or injecting field names, attackers gain direct access to records beyond their sharing-based permissions—even when proper sharing keywords are declared. This vulnerability is especially severe in customer portal contexts where thousands of external users with adversarial intent can systematically enumerate organizational data. A single method accepting a record ID parameter from the frontend creates a SQL injection-equivalent vulnerability in the Salesforce trust model—allowing attackers to read, modify, or delete data without authentication or authorization checks, independent of any other security control failures. This constitutes a Critical boundary violation: unauthorized users access data they should never see, with no compensating controls required to fail.

**Audit Procedure:**  
1. Identify all Apex classes containing `@AuraEnabled` methods or other methods exposed to customer portal sites.  
2. For each method, examine the parameter list to identify parameters of type `Id`, `String`, `List<Id>`, `List<String>`, `Set<Id>`, or `Map<String, Object>` that could control record access.  
3. Review the method implementation to determine if parameters influence SOQL query construction (WHERE clauses, record IDs, field selection, relationship traversal).  
4. Verify that methods derive record access from `UserInfo.getUserId()` or related user context rather than accepting frontend-supplied identifiers.  
5. Conduct penetration testing by attempting to pass unauthorized record IDs or manipulated parameters from portal user sessions.  
6. Flag any method that accepts user-supplied parameters controlling record access as noncompliant.

**Remediation:**  
1. Refactor portal-exposed methods to eliminate all parameters that control record access, query scope, or field selection.  
2. Implement server-side logic that determines accessible records based on the running user's context:
   ```apex
   @AuraEnabled
   public static Account getMyAccount() {
       Id userId = UserInfo.getUserId();
       User currentUser = [SELECT ContactId FROM User WHERE Id = :userId];
       Contact portalContact = [SELECT AccountId FROM Contact WHERE Id = :currentUser.ContactId];
       return [SELECT Id, Name FROM Account WHERE Id = :portalContact.AccountId];
   }
   ```
3. For methods that must operate on specific records, validate ownership using `UserRecordAccess` before returning data:
   ```apex
   List<UserRecordAccess> access = [SELECT RecordId, HasReadAccess 
                                     FROM UserRecordAccess 
                                     WHERE UserId = :UserInfo.getUserId() 
                                     AND RecordId = :recordId];
   if (access.isEmpty() || !access[0].HasReadAccess) {
       throw new AuraHandledException('Access denied');
   }
   ```
4. Establish code review requirements that specifically check for parameter-based access control in portal-exposed methods.

**Default Value:**  
Salesforce does not prevent or validate user-supplied parameters in custom Apex code. Developers bear full responsibility for implementing access controls.

### SBS-CPORTAL-003: Enforce Programmatic CRUD and FLS in Portal Apex

**Control Statement:** When Apex classes exposed to portal users bypass native Salesforce security enforcement, they must implement explicit programmatic checks for object-level CRUD permissions and field-level security (FLS) before accessing or returning data.

**Description:**  
Organizations must ensure that portal-exposed Apex code operating in elevated security contexts (such as `without sharing` or system mode) explicitly validates object-level Create, Read, Update, Delete (CRUD) permissions and field-level security (FLS) before performing data operations. This includes:

- Object-level CRUD checks using `Schema.sObjectType.Object__c.isAccessible()`, `isCreateable()`, `isUpdateable()`, `isDeletable()`
- Field-level security validation via `DescribeFieldResult.isAccessible()`, `isCreateable()`, `isUpdateable()` for all fields accessed
- Application of `Security.stripInaccessible()` with `AccessType.READABLE` to query results before returning data to portal users
- Record-level access verification via `UserRecordAccess` queries when required

Methods must fail securely by throwing explicit exceptions when permission checks fail rather than silently returning partial data or allowing unauthorized operations.

**Risk:** <Badge type="danger" text="Critical" />  
When Apex bypasses native platform security without implementing compensating programmatic checks, portal users can access objects and fields beyond their profile and permission set grants. This is particularly severe for `without sharing` classes where record-level security is also bypassed, creating a complete access control failure. External portal users executing methods without CRUD/FLS enforcement can read sensitive fields (PII, financial data, confidential records), modify data they should not update, or delete critical records—all while the platform's audit trail shows their user performing the action, masking the underlying permission bypass. This establishes a Critical security boundary violation where a single method exposes unrestricted data access to thousands of external users.

**Audit Procedure:**  
1. Identify all portal-exposed Apex classes declared with `without sharing` or that execute in system mode.  
2. Review each method's implementation to verify presence of explicit CRUD checks before SOQL queries and DML operations.  
3. Confirm that field-level security checks are performed for all fields accessed in queries and returned to the frontend.  
4. Verify that `Security.stripInaccessible()` is applied to query results before returning data.  
5. Test methods by authenticating as a portal user with restricted permissions and attempting to access objects/fields that should be denied.  
6. Flag any method lacking explicit CRUD/FLS checks as noncompliant.

**Remediation:**  
1. Add object-level CRUD checks to all portal-exposed methods operating without sharing:
   ```apex
   if (!Schema.sObjectType.Account.isAccessible()) {
       throw new AuraHandledException('Insufficient permissions');
   }
   ```
2. Implement field-level security validation:
   ```apex
   if (!Schema.sObjectType.Account.fields.Name.isAccessible() ||
       !Schema.sObjectType.Account.fields.BillingCity.isAccessible()) {
       throw new AuraHandledException('Insufficient field permissions');
   }
   ```
3. Apply `Security.stripInaccessible()` to all query results:
   ```apex
   List<Account> accounts = [SELECT Id, Name, BillingCity FROM Account WHERE OwnerId = :UserInfo.getUserId()];
   SObjectAccessDecision decision = Security.stripInaccessible(AccessType.READABLE, accounts);
   return decision.getRecords();
   ```
4. Establish automated testing that validates permission enforcement for portal user personas with restricted access.

**Default Value:**  
Salesforce does not enforce CRUD or FLS checks in custom Apex code. Developers must explicitly implement these validations.

### SBS-CPORTAL-004: Restrict Guest User Record Access

**Control Statement:** Unauthenticated guest users in customer portals must be restricted to authentication and registration flows only, with no direct access to business objects or custom Apex methods that query organizational data.

**Description:**  
Organizations must configure customer portal guest user profiles to prohibit access to all business-related standard and custom objects, limiting guest user capabilities exclusively to authentication flows (login, registration, password reset, self-service account creation). Guest users must not be granted object-level permissions, field-level access, or the ability to invoke custom Apex methods that return organizational data.

When business requirements necessitate limited guest user access to specific public data (such as knowledge articles, public case submission forms, or product catalogs), organizations must:
- Implement a dedicated service layer architecture where controllers invoke secure service classes that perform explicit access validation
- Use allowlist-based data access (explicitly define queryable records, never accept parameters)
- Apply additional validation using `UserInfo.getUserType() == 'Guest'` to enforce restricted logic paths
- Consider rate limiting and CAPTCHA protection to prevent enumeration attacks

**Risk:** <Badge type="danger" text="Critical" />  
Guest users represent the highest-risk trust boundary in Salesforce portals—they are unauthenticated, have zero accountability, generate minimal audit trail, and operate with potential adversarial intent. When guest users are granted object permissions or can invoke custom Apex methods, attackers can systematically enumerate organizational data without even creating an account. Historical Salesforce security updates have repeatedly addressed guest user permission defaults because vendors consistently misconfigure this boundary. A single guest-accessible method that queries user records, cases, accounts, or custom objects creates a public API for data exfiltration accessible to anyone on the internet. This constitutes a Critical boundary violation: unauthenticated attackers access organizational data with no authentication required.

**Audit Procedure:**  
1. Identify all guest user profiles used by customer portal sites (typically named "Site Guest User" or similar).  
2. Review object-level permissions for guest user profiles and verify that all business-related standard and custom objects have Read, Create, Edit, Delete permissions set to disabled.  
3. Enumerate all custom Apex classes containing `@AuraEnabled` methods and verify that none are accessible to guest users (either by checking profile permissions or testing invocation from guest context).  
4. For any guest-accessible functionality beyond authentication flows, verify implementation of service layer architecture with explicit access controls.  
5. Test by accessing the portal without authentication and attempting to invoke Apex methods or query objects via built-in Lightning controllers.  
6. Flag any guest user object permissions or method access as noncompliant.

**Remediation:**  
1. Remove all object-level permissions from guest user profiles except those explicitly required for authentication flows.  
2. Audit and remove guest user access to any custom Apex methods that query or return organizational data.  
3. For public data requirements (knowledge articles, case submission), implement service layer pattern:
   ```apex
   @AuraEnabled
   public static List<Knowledge__kav> getPublicArticles() {
       if (UserInfo.getUserType() == 'Guest') {
           // Allowlist-based, no parameters accepted
           return [SELECT Id, Title, Summary FROM Knowledge__kav 
                   WHERE PublicationStatus = 'Online' 
                   AND IsVisibleInPkb = true 
                   LIMIT 10];
       }
       throw new AuraHandledException('Access denied');
   }
   ```
4. Implement network-level rate limiting and CAPTCHA for guest-accessible endpoints.  
5. Review Salesforce security updates and apply guest user permission restrictions from recent releases.

**Default Value:**  
Salesforce has progressively restricted guest user default permissions in recent releases, but older orgs may retain permissive configurations. Guest user profiles do not prevent object access or Apex invocation by default—administrators must explicitly configure restrictions.
