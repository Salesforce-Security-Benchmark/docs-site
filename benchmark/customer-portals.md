## Customer Portals

This section defines controls related to secure configuration and development practices for Salesforce customer portals, including Experience Cloud sites, Communities, and other external-facing Salesforce platforms. These controls ensure that organizations implement proper access controls, data isolation, and secure coding practices when exposing Salesforce functionality to external users.

### SBS-CPORTAL-001: Prevent Parameter-Based Record Access in Portal Apex

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

### SBS-CPORTAL-002: Restrict Guest User Record Access

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

### SBS-CPORTAL-003: Enable Clickjack Protection

**Control Statement:** All Experience Cloud sites must enable clickjack protection at "Allow framing by the same origin only" or "Don't allow framing" level.

**Description:**  
Organizations must configure clickjack protection for all Experience Cloud sites (Communities, customer portals, partner portals) to prevent malicious sites from embedding site pages in hidden iframes. Clickjacking attacks trick authenticated users into performing unintended actions by overlaying transparent or opaque layers over legitimate site content. Protection must be set to "Allow framing by the same origin only" (recommended default) or "Don't allow framing" (most restrictive). If business requirements necessitate external framing, the "Allow framing by specific external domains" option must document a justified list of trusted domains with change control.

**Risk:** <Badge type="warning" text="Moderate" />  
Clickjacking requires both a misconfigured protection setting and user action (visiting an attacker-controlled site while authenticated), making it a defense-in-depth control rather than a direct vulnerability. However, when protection is disabled or external framing is enabled without proper domain governance, attackers can embed site pages in malicious contexts and trick users into submitting forms, clicking buttons, or modifying data through UI manipulation. This is particularly effective against high-value targets (administrators, privileged users) who may be targeted via phishing campaigns. While not a Critical boundary violation, it represents a measurable increase in attack surface when disabled.

**Audit Procedure:**  
1. Navigate to **Setup → All Sites** and review all Experience Cloud sites.  
2. For each site, access **Builder → Settings → Security & Privacy** and verify the clickjack protection level.  
3. Flag sites configured with "Allow framing by any page" as noncompliant.  
4. For sites using "Allow framing by specific external domains," verify that trusted domains are documented, justified, and subject to change control.

**Remediation:**  
1. Navigate to **Setup → All Sites**, select the site, and access **Builder → Settings → Security & Privacy**.  
2. Set clickjack protection to "Allow framing by the same origin only" (recommended) or "Don't allow framing" for maximum protection.  
3. If external framing is required, select "Allow framing by specific external domains," document the business justification for each domain, and implement change control for modifications.

**Default Value:**  
Salesforce Experience Cloud sites default to "Allow framing by the same origin only" which provides appropriate protection.
