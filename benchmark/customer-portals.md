## Customer Portals

This section defines controls related to secure configuration and development practices for Salesforce customer portals, including Experience Cloud sites, Communities, and other external-facing Salesforce platforms. These controls ensure that organizations implement proper access controls, data isolation, and secure coding practices when exposing Salesforce functionality to external users.

### SBS-CPORTAL-001: Prevent Insecure Direct Object Reference (IDOR) in Portal Apex

**Control Statement:**  
All Apex methods exposed to Experience Cloud or customer portal users must enforce server-side authorization for every record accessed or modified. User-supplied parameters (including record IDs, filters, field names, or relationship references) must not be trusted as the basis for access control and must be validated against the running user's sharing, CRUD, and FLS permissions before use.

**Description:**  
Portal-exposed Apex methods are callable by external users and therefore must not rely on client-provided identifiers or query inputs to determine record access. Accepting record IDs, filter criteria, field lists, or relationship paths without validating the running user's access creates Insecure Direct Object Reference (IDOR) vulnerabilities.

Methods must:

* Run `with sharing` unless explicitly justified.
* Enforce object- and field-level permissions.
* Prevent user-controlled SOQL structure (e.g., dynamic WHERE clauses or field lists).
* Restrict data scope to records the authenticated user is authorized to access according to business rules.

Parameters may be accepted when required for legitimate functionality, but must be validated server-side before querying or performing DML.

**Risk:** <Badge type="danger" text="Critical" />  
If portal-exposed Apex trusts user-controlled parameters to determine record access, external users can manipulate inputs to retrieve or modify unauthorized records. This may enable record enumeration, data exfiltration, or data corruption. IDOR vulnerabilities represent a critical authorization boundary failure.

**Audit Procedure:**  
1. Identify all Apex classes exposing `@AuraEnabled`, `@InvocableMethod`, or `@RestResource` methods accessible to portal users.
2. Review method parameters of type `Id`, `String`, collections, or maps that could influence record access.
3. Verify that:

   * Classes run `with sharing` or implement equivalent authorization checks.
   * Record access is validated before query or DML.
   * CRUD and FLS are enforced.
   * Dynamic SOQL does not incorporate unsanitized user input.
4. Attempt to access unauthorized records by manipulating record IDs or filter inputs from a portal user session.
5. Flag any method that relies solely on user-supplied parameters to control record access as noncompliant.

**Remediation:**  
* Enforce `with sharing` on portal-facing classes by default.
* Scope queries using the running user's context where possible.
* If record IDs are accepted as parameters, verify access using sharing or `UserRecordAccess` before returning or modifying data.
* Remove user-controlled query structure and whitelist allowable filter inputs.
* Enforce CRUD and FLS on all returned or modified records.

**Default Value:**  
Salesforce does not validate user-supplied parameters in custom Apex. Developers are responsible for implementing server-side authorization controls in all portal-exposed methods.

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


### SBS-CPORTAL-003: Inventory Portal-Exposed Apex Classes and Flows

**Control Statement:** Organizations must maintain an authoritative inventory of all Apex classes and Autolaunched Flows exposed to Experience Cloud sites, documenting which components are accessible to external and guest users.

**Description:**  
Organizations must document all Apex classes with `@AuraEnabled` methods and all Autolaunched Flows that can be invoked from Experience Cloud sites. The inventory must include which portal user profiles and permission sets can access each component.

**Risk:** <Badge type="warning" text="High" />  
Without a complete inventory of portal-exposed components, organizations cannot assess their external attack surface or enforce security reviews for externally accessible code. Security teams lose visibility into which business logic external users can invoke, preventing effective security testing, incident response, and access governance. This impairs the ability to detect unauthorized exposure of sensitive functionality or identify components requiring security hardening.

**Audit Procedure:**  
1. Request the organization's inventory of portal-exposed Apex classes and Flows from the designated system of record.
2. Query all Apex classes with `@AuraEnabled` methods accessible to portal user profiles.
3. Query all Autolaunched Flows invoked from Experience Cloud pages or components.
4. Verify each component appears in the inventory with documentation of which portal profiles can access it.
5. Flag any portal-exposed component missing from the inventory as noncompliant.

**Remediation:**  
1. Enumerate all Apex classes containing `@AuraEnabled` methods.
2. Enumerate all Autolaunched Flows embedded in Experience Cloud sites.
3. For each component, document which portal user profiles and permission sets have access.
4. Store the inventory in the designated system of record.
5. Establish a process to update the inventory when new components are exposed to portals.

**Default Value:**  
Salesforce does not require or maintain an inventory of portal-exposed components.

### SBS-CPORTAL-004: Prevent Parameter-Based Record Access in Portal-Exposed Flows

**Control Statement:** Autolaunched Flows exposed to customer portal users must not accept user-supplied input variables that directly determine which records are accessed.

**Description:**  
Flows invoked from Experience Cloud must not accept input variables for record IDs, object names, or filter criteria. All record access must be derived from the authenticated user's context using `$User.ContactId` or similar user context resources.

**Risk:** <Badge type="danger" text="Critical" />  
Flows accepting user-controlled input variables for record access create IDOR vulnerabilities allowing external users to access any record in the org. Because Autolaunched Flows run in system context without sharing by default, a single flow accepting a record ID input parameter bypasses all permissions and sharing rules. This constitutes a Critical boundary violation: unauthorized users access data they should never see, with no compensating controls required to fail.

**Audit Procedure:**  
1. Using the inventory from SBS-CPORTAL-003, identify all portal-exposed Autolaunched Flows.
2. For each flow, examine input variables for types that could contain record IDs (Text, Record, Text Collection).
3. Review flow logic to determine if input variables influence Get Records, Update Records, or Delete Records elements.
4. Flag any flow accepting user-supplied input variables that control record access as noncompliant.

**Remediation:**  
1. Refactor flows to eliminate input variables controlling record access.
2. Derive accessible records from authenticated user context (e.g., `$User.Id`, `$User.ContactId`, `$User.AccountId`).
3. Configure flows to run in user context ("With Sharing") where available.

**Default Value:**
Salesforce does not prevent flows from accepting user-supplied input variables. Autolaunched Flows run in system context without sharing by default.

### SBS-CPORTAL-005: Conduct Penetration Testing for Portal Security

**Control Statement:** Organizations with Experience Cloud sites must conduct penetration testing of portal security controls before initial go-live and subsequently after major releases or on a defined cadence.

**Description:**
Penetration testing validates that authentication boundaries, authorization controls, and data access restrictions function correctly under adversarial conditions. Testing must target portal-exposed Apex classes, Flows, and components, including parameter manipulation, IDOR attempts, and privilege escalation scenarios. Organizations determine ongoing testing frequency based on regulatory requirements and change velocity.

**Risk:** <Badge type="warning" text="High" />
Without regular penetration testing, organizations cannot verify that portal security controls function correctly when adversaries attempt to exploit them. Configuration audits verify settings exist but cannot validate runtime behavior under attack. Undetected vulnerabilities in portal-exposed components allow unauthorized data access.

**Audit Procedure:**
1. Verify penetration testing was conducted before initial portal go-live.
2. Verify the organization has defined an ongoing testing cadence based on regulatory requirements and change frequency.
3. Request documentation of the most recent portal penetration test.
4. Verify testing occurred according to the defined cadence or after major releases.
5. Confirm test scope included portal-exposed Apex classes and Flows.
6. Review test report for identified vulnerabilities and remediation status.
7. Flag as noncompliant if no go-live testing occurred, ongoing testing does not follow the defined cadence, or if high/critical findings remain unremediated.

**Remediation:**
1. Conduct penetration testing before initial portal go-live.
2. Define ongoing testing cadence based on regulatory requirements and release frequency.
3. Engage qualified penetration testers with Salesforce Experience Cloud expertise.
4. Define test scope covering all portal-exposed components.
5. Conduct testing according to defined cadence and after major portal changes.
6. Remediate identified vulnerabilities before production deployment.

**Default Value:**
Salesforce does not require or conduct penetration testing of customer implementations.

### SBS-CPORTAL-006: Minimize Object and Field Permissions for Authenticated Portal User Profiles and Permission Sets

**Control Statement:**
Authenticated portal user profiles and permission sets must only provide object-level (CRUD) and field-level (FLS) permissions to those objects and fields required for portal functionality. Objects not used by any portal component must have all permissions removed from external user profiles and permission sets.

**Description:**
When an external user authenticates to an Experience Cloud site, their profile and permission sets determine which objects and fields they can access—not only through the portal UI, but also through Salesforce's standard Aura components that underpin Digital Experience sites. These built-in components (such as those powering record detail pages, list views, and related lists) respect object-level and field-level permissions but do not restrict access to only the objects explicitly placed on portal pages. Any object with Read access granted to a portal user profile or permission set can be queried through standard Aura component requests, even if no portal page or custom component references that object. This creates a hidden data exposure surface that is invisible to administrators reviewing portal pages alone.

Organizations must:

* Audit all object-level permissions granted to external user profiles and permission sets.
* Remove Read, Create, Edit, and Delete permissions for any object not explicitly required by a portal component or business process.
* Restrict field-level access to the minimum set of fields required for each permitted object.
* Treat portal user profile and permission set permissions as defining the full attack surface, not just the visible UI surface.

**Risk:** <Badge type="danger" text="Critical" />
Authenticated portal users with excessive object permissions can use standard Salesforce Aura components to query any object their profile and permission sets permit, regardless of whether that object appears in the portal UI. Attackers with valid portal credentials—or who compromise a portal account—can script calls to enumerate and exfiltrate Leads, Contacts, Accounts, Opportunities, Cases, and custom objects containing sensitive organizational data. This is not a theoretical risk: automated tooling exists to discover and exploit these overly permissive configurations. The exposure is Critical because it enables bulk data exfiltration through a legitimate channel with no additional vulnerability required.

**Audit Procedure:**
1. Identify all profiles and permission sets assigned to authenticated external portal users.
2. For each profile, enumerate all objects with Read or higher CRUD permissions.
3. Cross-reference permitted objects against the inventory of portal components (SBS-CPORTAL-003) to identify objects that are not used by any portal page, Lightning component, or Flow.
4. Review field-level security for permitted objects and identify fields not required by portal functionality.
5. Test access by authenticating as a portal user and querying objects not displayed in the portal UI.
6. Flag any object permission not justified by a portal component or documented business requirement as noncompliant.

**Remediation:**
1. Remove CRUD permissions from portal user profiles and permission sets for all objects not required by portal functionality.
2. For objects that must remain accessible, restrict field-level access to the minimum required fields.
3. Establish a review process so that new objects added to the org are not automatically accessible to portal users.
4. Use dedicated portal-specific profiles or permission sets rather than cloning internal user profiles.
5. Periodically re-audit portal user permissions against the component inventory from SBS-CPORTAL-003.

**Default Value:**
Salesforce does not restrict which objects are queryable via standard Aura components based on portal UI configuration. Any object with Read permission on a portal user's profile or permission set is accessible through standard Aura components regardless of portal page composition.

### SBS-CPORTAL-007: Restrict External Organization-Wide Default Sharing Settings

**Control Statement:**
External Organization-Wide Default (OWD) sharing settings must be set to Private for all objects containing sensitive or internal data accessible by portal users. Objects must not use Public Read Only or Public Read/Write external sharing defaults unless a documented business justification exists and compensating controls are in place.

**Description:**
Salesforce maintains separate internal and external Organization-Wide Default sharing settings. The external OWD controls the baseline record visibility for external users such as portal and community members. When an object's external OWD is set to Public Read Only, all authenticated portal users can access every record of that object—not just records they own or that are shared with them through sharing rules, roles, or account relationships.

Organizations must:

* Set external OWDs to Private for all objects containing business, customer, or sensitive data.
* Implement explicit sharing rules or programmatic sharing to grant portal users access only to their own records.
* Document and justify any object where the external OWD is not set to Private.
* Review external sharing settings when new objects are created or when sharing configuration changes.

**Risk:** <Badge type="danger" text="Critical" />
When external OWDs are set to Public Read Only, every authenticated portal user can read every record of that object across the entire org. A single portal user with legitimate credentials can access the complete dataset—including records belonging to other customers, partners, or internal teams. This cross-tenant data exposure is especially damaging in multi-customer portals where isolation between portal users is a business requirement. Combined with SBS-CPORTAL-006, an attacker can script bulk extraction of all records in any object with permissive external sharing. This constitutes a Critical data isolation failure.

**Audit Procedure:**
1. Navigate to Setup > Sharing Settings and review the Organization-Wide Defaults for all objects.
2. Identify objects where the external access level is set to Public Read Only or Public Read/Write.
3. For each object with a non-Private external OWD, determine whether external portal users have access to the object via profile or permission set.
4. Verify whether a documented business justification and compensating controls exist for any non-Private external OWD.
5. Test by authenticating as a portal user and querying records owned by other users or accounts.
6. Flag any object with a non-Private external OWD and portal user access that lacks documented justification as noncompliant.

**Remediation:**
1. Set external OWDs to Private for all objects accessible to portal users.
2. Use sharing rules scoped to portal user roles or groups to grant access only to appropriate records (e.g., records owned by the user's account).
3. Where Apex-managed sharing is used, verify that sharing records are granted with the minimum necessary access level.
4. After changing external OWDs to Private, test portal functionality to confirm that portal users can still access their own records through sharing rules.
5. Establish a governance process to review external OWD settings whenever new custom objects are created.

**Default Value:**
Salesforce allows administrators to configure external OWDs independently from internal defaults. New custom objects do not enforce Private external access by default—administrators must explicitly set the external sharing model. Some standard objects may default to non-Private external access depending on org configuration.
