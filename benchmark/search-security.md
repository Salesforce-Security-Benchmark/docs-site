## Search Security

This section defines controls related to the security of the Salesforce search platform, including the Einstein Search index, SOSL query execution, Search Manager configuration, Federated Search, Salesforce Knowledge, and the storage and use of search data. These controls address inference attacks and misconfiguration patterns that create unintended data exposure through search. An inference attack occurs when search behaviour reveals the existence or content of data that a user does not have direct permission to view.

### SBS-SRCH-001: Protect Sensitive Custom Fields Within the Search Index FLS Limit

<span title="Access to ePHI must be limited to authorized users across every access path, including search matching."><Badge type="info" text="HIPAA" /></span> <span title="Inference of special-category personal data through search undermines integrity and confidentiality (Art. 5(1)(f), Art. 9, Art. 32)."><Badge type="info" text="GDPR" /></span> <span title="Access enforcement and least privilege must apply to sensitive fields in the search index."><Badge type="info" text="NIST" /></span>

**Control Statement:** For every object with more than 100 searchable, non-picklist custom fields, no field classified as sensitive may be both included in the search index and absent from the Search Manager Protected list.

**Description:**  
The Salesforce search index applies field-level security to all standard fields and to a maximum of 100 searchable custom fields per object. Custom picklist fields are always protected and do not count against this limit. When an object has more than 100 searchable, non-picklist custom fields, the extra fields are unprotected: unless they are removed from the search index, the search engine matches results based on them without applying field-level security. Any user who can read the record can submit a query that matches against those unprotected field values, even if their profile or permission set denies access to the field itself.

Users cannot see the unprotected field value in search results. The risk is inference. When a search query returns a record, the user can infer that one of the record's fields, possibly the unprotected one, matched their search term. Salesforce's example is a Trade Union field on an Employee object: if it isn't protected, users can search for the trade union's name and find all employees in that trade union. For objects containing sensitive attributes such as health conditions, trade union membership, salary bands, or litigation flags, this inference capability constitutes unauthorized disclosure. The data is deducible from system behaviour without being directly presented.

Since Summer '24 (June 2024), Salesforce provides admin control over which custom fields receive FLS protection in the search index. Before this release, search applied FLS to the first 100 searchable custom fields and admins could not choose which fields those were. Organizations that have not reviewed this configuration since Summer '24 may have sensitive fields in unprotected positions.

**Risk:** <Badge type="danger" text="Critical" />  
An inference attack against unprotected search index fields enables users to determine whether sensitive field values exist on records they can read, without having permission to view those values. In regulated environments such as healthcare, financial services, and HR, this can expose special-category personal data, protected health information, or confidential business data through search, even though field-level security restricts the field elsewhere. The 100-field limit cannot be increased, so excess fields require explicit prioritization decisions or removal from the index. Salesforce describes the likely impact as low and mostly limited to edge cases, because exploiting it requires access to the object and records plus knowledge of fields the user can't access and of their values; the control is rated Critical here because, where it is absent, users can infer the values of fields they are not permitted to read without any other control failing.

**Audit Procedure:**  
1. From Setup, in the Quick Find box, enter Search Manager, select **Index Management**, and identify the objects that Search Manager shows as having unprotected fields.
2. For each such object, select it from the Salesforce Objects list and click **Manage Field-Level Security for Search**. Unprotected fields are listed in **Not Protected**.
3. Using the organization's data classification policy, identify every field on the object classified as sensitive.
4. Flag any sensitive field that is in the **Not Protected** list and has not been removed from the search index.
5. If Search Manager displays a banner on the object page indicating that changes are pending, re-check after they apply; protection changes are usually applied the next day but can take up to a few days.
6. The control passes if no sensitive field on any object is both in the search index and unprotected.

**Remediation:**  
1. For each flagged object, from Setup, in the Quick Find box, enter Search Manager, select **Index Management**, select the object from the Salesforce Objects list, and click **Manage Field-Level Security for Search**.
2. Move sensitive fields to the **Protected** list, moving lower-sensitivity fields to **Not Protected** where needed to stay within the 100-field limit.
3. For any sensitive field that cannot fit within the limit, remove it from the search index: on the same Index Management object page, select **Remove from search index** from the field's dropdown, confirm, and save. Removed fields don't appear in search results and aren't used to match results. Standard fields can't be removed.
4. After saving, confirm the changes have applied: field-level security changes are usually applied the next day and Search Manager displays a banner on the object page while they are pending; index changes can take a few hours.
5. Document the allocation decisions, including which fields were left unprotected or removed from the index and the justification.
6. Re-run this review whenever custom fields are added to an object at or near the 100-field limit, in both sandboxes and production.

**Default Value:**  
Salesforce applies FLS protection in the search index to all standard fields, all custom picklist fields, and up to 100 other searchable custom fields per object. Before Summer '24, the first 100 searchable custom fields were protected and admins could not choose them. Since Summer '24, admins can choose which custom fields are protected. The 100-field limit cannot be increased.

### SBS-SRCH-002: Prohibit Unscoped SOSL in Apex Where Results Are Exposed to Restricted Users

<span title="Appropriate technical measures (Art. 32) must cover code-level access to personal data, including search matching."><Badge type="info" text="GDPR" /></span> <span title="Access enforcement must be implemented in application code; unscoped SOSL is a data leakage path."><Badge type="info" text="NIST" /></span> <span title="Secure coding (A.8.28) and information access restriction (A.8.3) apply to custom search components."><Badge type="info" text="ISO 27001" /></span>

**Control Statement:** Apex that executes SOSL queries using the `IN ALL FIELDS` search group, or that omits the `IN` clause entirely, must not expose matched records to users whose field-level security restricts one or more of the searchable fields on the queried objects, unless the query runs in user mode and testing demonstrates that FLS-restricted fields do not influence which records are returned.

**Description:**  
When a SOSL (Salesforce Object Search Language) query uses `IN ALL FIELDS`, or omits the `IN` clause entirely (which defaults to `IN ALL FIELDS`), the search engine matches against every searchable field on the queried objects. If the matched records are then returned to a user via a Lightning component, Visualforce page, Flow, or API endpoint, the fact that a record appeared for a specific query can reveal that a field the user cannot read contained the search term. The user does not see the restricted field value, but the match itself discloses information. For example, a service console component that searches `IN ALL FIELDS` in system mode and displays only Case Subject and Status can return a Case because a restricted custom field on it contains the search term.

The access mode determines how much protection applies, but neither mode is documented to prevent this inference:

- **System mode** runs without the current user's object and field permissions; in Salesforce's words, the current user "can access all data regardless of their permissions". Apex classes saved at API version 66.0 or earlier run SOSL in system mode unless an access mode is specified, and any query that specifies `WITH SYSTEM_MODE` or `AccessLevel.SYSTEM_MODE` runs in system mode regardless of API version.
- **User mode** enforces the sharing rules, field-level security, and object permissions of the current user. It is the default from API version 67.0 (Summer '26). Salesforce does not document whether user mode excludes FLS-restricted fields from search matching. For comparison, Salesforce documents that search matches results on unprotected custom fields even for users without permission to those fields (SBS-SRCH-001), and that Knowledge doesn't support search protection for most of its fields (SBS-SRCH-005).

Checks that operate on returned records and fields do not prevent this. `Security.stripInaccessible()` and `Schema` describe checks act on the records and fields returned, and the `RETURNING` clause affects what data is returned, not what data is searched, so a query can pass these checks and still leak information through which records were returned. (`WITH SECURITY_ENFORCED` is documented only for SOQL `SELECT` queries and was removed from API version 67.0.) Within the query, the `IN` clause affects what data is searched, but it does not apply to articles, documents, feed comments, feed items, files, products, or solutions: when these objects are in the `RETURNING` clause, all their fields are searched regardless of the `IN` clause.

SOSL also ignores tab visibility. Tab settings affect which objects appear in global search results, but SOSL run from Apex, the Developer Console, or the REST API searches an object even if its tab isn't visible. Tab visibility is therefore not a security boundary for SOSL.

**Risk:** <Badge type="danger" text="Critical" />  
Custom search components built on unscoped SOSL create inference attack surfaces in custom code. A user with no FLS access to a sensitive field can submit a search term and determine, from the returned record set, whether that value exists on any record they can read. In Experience Cloud sites, this pattern can expose internal data to external users. The behaviour is a property of the code, so it must be identified through code review and corrected by the development team.

**Audit Procedure:**  
1. Retrieve all Apex classes from the org using the Metadata API or Tooling API.
2. Search all Apex class bodies for SOSL queries containing `IN ALL FIELDS`, and for SOSL `FIND` statements and `Search.query` calls that do not include an `IN` clause.
3. For each identified query, record its access mode: system mode if it specifies `WITH SYSTEM_MODE` or `AccessLevel.SYSTEM_MODE`, or specifies no access mode and the class is saved at API version 66.0 or earlier; otherwise user mode.
4. Determine whether the result set is returned to or displayed for end users via `@AuraEnabled` methods, `@RemoteAction` methods, Flow invocable actions, or API-accessible endpoints.
5. For each user-exposed query, determine whether any user who can invoke the component or endpoint has FLS restrictions on any searchable field on the queried objects.
6. Do not treat `Security.stripInaccessible()` or `Schema` checks on returned fields as satisfying this control; they do not affect which fields are matched.
7. The control passes if every user-exposed query is scoped to `IN NAME FIELDS`, `IN EMAIL FIELDS`, or `IN PHONE FIELDS` as appropriate to the use case and does not return articles, documents, feed comments, feed items, files, products, or solutions (which the `IN` clause doesn't scope) unless they are restricted by the controls in SBS-SRCH-005 or the organization's file sharing model, or runs in user mode with retained test evidence that terms present only in FLS-restricted fields do not return records for a restricted user, and the queried objects comply with SBS-SRCH-001.

**Remediation:**  
1. Replace `IN ALL FIELDS`, and any SOSL with no `IN` clause, with the most restrictive search group appropriate to the use case: `IN NAME FIELDS`, `IN EMAIL FIELDS`, or `IN PHONE FIELDS`. Because the `IN` clause doesn't apply to articles, documents, feed comments, feed items, files, products, or solutions, remove those objects from the `RETURNING` clause where they aren't needed, and otherwise restrict access to the underlying records (see SBS-SRCH-005).
2. If broader search scope is genuinely required, run the query in user mode (`WITH USER_MODE` or `AccessLevel.USER_MODE`), protect or remove sensitive fields on the queried objects per SBS-SRCH-001, and add a test with a restricted user confirming that terms present only in FLS-restricted fields do not return records. If the test shows that restricted fields still influence matching, scope the `IN` clause instead.
3. Check object accessibility (for example, `Schema.sObjectType.ObjectName.isAccessible()`) before returning results, and remove object-level Read permission rather than relying on tab visibility to keep objects out of search.
4. Set an explicit access mode on every SOSL query, as Salesforce recommends regardless of API version, and do not use system mode for SOSL whose results are returned to users.
5. Add a static analysis rule to the pre-merge code analysis pipeline (see SBS-CODE-002) that flags `IN ALL FIELDS` SOSL and SOSL without an `IN` clause in user-facing Apex classes.
6. Review all components identified in the audit and remediate in order of user population size and sensitivity of the searchable objects.

**Default Value:**  
`IN ALL FIELDS` is the default search group when no `IN` clause is specified, and the `IN` clause doesn't apply to articles, documents, feed comments, feed items, files, products, or solutions. Apex saved at API version 66.0 or earlier runs SOSL in system mode by default; from API version 67.0 it runs in user mode by default unless system mode is specified. SOSL run from Apex searches an object even if its tab isn't visible. Salesforce does not document whether user-mode SOSL excludes FLS-restricted fields from matching.

### SBS-SRCH-003: Validate FLS Prerequisites for All Search Manager Rules

<span title="Logical access controls must be implemented and operate effectively."><Badge type="info" text="SOC 2" /></span>

**Control Statement:** Each Search Manager rule must reference only fields that all of its target users can read; any rule referencing a field that is FLS-restricted for one or more target profiles must be corrected or backed by an independent access control.

**Description:**  
Search Manager allows administrators to add rules to a search configuration. Rules are hidden filters that exclude records from search results based on field values, for example excluding closed cases or records of a specific record type. Rules can be defined on filterable fields of type Lookup, Picklist, RecordType, and Checkbox, up to 10 per object in a configuration, and apply to keyword search, instant results, recommended results, and Search Answers.

Rules defined for a field only apply to users who have read access to the field. For a user without read access to the rule's field, whether through their profile or permission sets, the rule doesn't apply, so the records it is meant to exclude are not filtered out of that user's search results. This behaviour is documented in Considerations for Rules, not in the steps for creating rules.

This matters particularly in Experience Cloud sites, where external user profiles may have narrower FLS than internal profiles. For example, a rule on Case that excludes records where a custom checkbox field such as Internal Only is true, intended to keep internal cases out of external users' results, has no effect on those users if that field is not readable by their profile.

**Risk:** <Badge type="tip" text="Moderate" />  
Silent rule failure means that scoping enforced through Search Manager cannot be relied upon as a security control for any user whose FLS does not include the filtered field. Organizations may incorrectly believe that certain record populations are excluded from search results for specific user groups. Because record-level access is still governed by sharing, the exposure is limited to records the user can already access, but the rule's intended restriction is defeated without any visible indication.

**Audit Procedure:**  
1. From Setup, in the Quick Find box, enter Search Manager, select **Query Configurations**, and for each configuration review the rules defined on each object.
2. For each rule, identify the field referenced in the rule condition.
3. Enumerate all profiles and permission sets assigned to users in the target population for whom the rule is intended to apply.
4. For each such profile or permission set, verify that the field referenced in the rule has Read or Edit field-level security.
5. Flag any rule where one or more target profiles do not have read access to the rule's field as non-operative for those user populations.
6. The control passes if every Search Manager rule is either readable by all its target users, or is backed by an independent access control (object permissions, organization-wide defaults, or sharing) that achieves the same restriction.

**Remediation:**  
1. For each rule with an FLS mismatch, grant read access to the rule's field on the affected profiles if that is consistent with the broader access model.
2. If granting read access is not appropriate, enforce the restriction directly: remove object access for the target profiles, tighten organization-wide defaults, or adjust sharing so the excluded records are not accessible.
3. Do not rely on Search Manager rules as a primary security control. Treat them as result-relevance enhancements for users who already have appropriate access.
4. Document all Search Manager rules in the organization's access control inventory and record the FLS prerequisite for each rule.

**Default Value:**  
Search Manager rules apply only to users who have read access to the field referenced in the rule. A saved rule is applied immediately.

### SBS-SRCH-004: Restrict Federated Search External Data Sources to Authorized Profiles

<span title="External content containing personal data surfaced in Salesforce search requires technical measures against unauthorized access (Art. 32)."><Badge type="info" text="GDPR" /></span> <span title="Access enforcement must extend to external content surfaced through Salesforce."><Badge type="info" text="NIST" /></span> <span title="Logical access to information assets, including integrated external content, must be restricted to authorized users."><Badge type="info" text="SOC 2" /></span>

**Control Statement:** Search results from external data sources of type "Federated Search: OpenSearch" must be visible only to profiles for which the external content is appropriate, and must not be made visible to all profiles unless the external content is explicitly classified as appropriate for every user in the organization.

**Description:**  
Federated Search lets users search in Salesforce and access data from external search providers that support the OpenSearch standard, such as providers serving repositories like Dropbox, Confluence, and SharePoint. When creating a Federated Search external data source, the **Search results visible to all profiles** option makes the external search results visible to all profiles during the initial setup. If the option is cleared or appears disabled, the administrator sets manually which profiles get search results. External results appear in the search results page, instant results, and Experience Cloud site search results.

If a source is made visible to all profiles during setup and contains restricted content such as HR documentation, legal communications, financial models, or internal strategy documents, users who would not normally have access to that system can see result titles and summaries directly in Salesforce. The external system's own access controls may prevent the user from opening the document, but the title and summary shown in the Salesforce search result may themselves constitute disclosure.

**Risk:** <Badge type="danger" text="Critical" />  
Federated Search external objects contain only the fields defined by the external data source, and the content of each result comes from the external provider. Within Salesforce, visibility is controlled by which profiles get search results from the source and by field-level security on the external object's fields. Salesforce does not document any filtering of the external content itself, so beyond those settings, what each user sees depends on what the provider returns. If a source containing restricted content is visible to all profiles, every Salesforce user can see the result fields that field-level security allows, such as titles and summaries, for their query. Unlike the inference attacks described in other controls in this section, this is direct data exposure.

**Audit Procedure:**  
1. From Setup, open External Data Sources and identify all data sources of type "Federated Search: OpenSearch".
2. For each Federated Search data source, review which profiles get search results from the source, including whether results were made visible to all profiles, and the field-level security on its external object.
3. Obtain a content classification for each external source.
4. Flag any data source visible to all profiles, or to profiles for which the content is not appropriate, where the source contains restricted content or no classification exists.
5. The control passes if every Federated Search data source is visible only to profiles for which its classified content is appropriate, and any source visible to all profiles has a documented classification confirming the content is appropriate for the entire user population.

**Remediation:**  
1. For each Federated Search data source visible to profiles for which its content is not appropriate, remove those profiles' access to its search results.
2. Grant access only to the profiles for which the external content is appropriate, and configure field-level security on the external object's fields.
3. Review the external search provider's access control configuration. With OAuth, the same bearer token is used for all users, so it authorizes but doesn't identify the user. The provider's OpenSearch description can define URL template parameters for the searching user's ID, login, and email (which aren't sent if the connection is anonymous) and org ID. Confirm whether the provider uses the user's identity to authorize results.
4. Require content classification and an explicit profile access decision for every new Federated Search data source before go-live, and do not make results visible to all profiles during setup unless the content is classified as appropriate for every user.
5. Document the access model for each Federated Search data source in the organization's integration or data processing inventory.

**Default Value:**  
**Search results visible to all profiles** is offered when the external data source is created and makes results visible to all profiles during initial setup. When it is cleared, profile access must be configured manually.

### SBS-SRCH-005: Enforce Article-Level Access Controls for Knowledge Discoverability

<span title="Restricted content in Knowledge custom fields can be inferred through search; technical measures must cover this path (Art. 32)."><Badge type="info" text="GDPR" /></span> <span title="Data leakage protections must cover search matching on Knowledge fields where FLS is not enforced."><Badge type="info" text="NIST" /></span>

**Control Statement:** Organizations using Salesforce Knowledge must restrict the discoverability of articles containing sensitive custom field content through article-level controls such as data categories, and must not rely on field-level security to keep that content out of search.

**Description:**  
Salesforce states that the Knowledge object "doesn't currently support the mechanism for protecting most standard and custom fields" in search, and that admins therefore "can't change FLS settings on fields for this object" in Search Manager. For other objects, the search index applies FLS to protected fields so that values in fields a user cannot read are not used to match results for that user. For Knowledge articles, custom fields containing internal infrastructure details, restricted policy content, legal notes, or clinical guidance may be used to match articles for users who have no FLS access to those fields.

Read together with how search treats unprotected fields on other objects (SBS-SRCH-001), this means the same inference risk should be assumed for most standard and custom fields on Knowledge. A user searching for a term that appears only in a restricted Knowledge field, such as a server name in an IT-only "Infrastructure Details" field, may receive the article in their results. The field value is hidden, but the match, together with the article title and summary, reveals information. Where Search Answers or AI-Generated Search Answers is enabled, answers in global search and the service console are drawn from Knowledge articles and may surface content from them. Since March 2025 (Spring '25) these features can't be newly enabled, but existing enablements continue to work. AI-Generated Search Answers from Data Cloud sources, available since March 2025, doesn't support the standard Knowledge object as a source; to use articles, they are mapped to a Data Cloud DMO.

The correct mechanism for restricting Knowledge article discoverability is article-level access rather than field-level security: data category assignments combined with data category visibility, or, where standard sharing for Lightning Knowledge is enabled, sharing settings. Once data category visibility is set, users with no data category visibility only see uncategorized articles unless the associated categories are made visible by default, and a user whose visibility for a category group is revoked still sees articles not classified in that group.

**Risk:** <Badge type="danger" text="Critical" />  
For organizations that use Knowledge to store both customer-facing and internal content in the same org, the lack of search field protection on Knowledge should be treated as an inference attack surface across most fields on the object. Users in customer-facing roles or external users of a support site can issue targeted searches to determine whether restricted content exists within articles they can read. In healthcare, financial services, or legal environments, this creates a gap between the intended access model and the access model that the platform actually enforces.

**Audit Procedure:**  
1. Identify all custom fields on the Knowledge object (`Knowledge__kav` by default; the prefix can be changed through the object's Object Name in Object Manager) that are FLS-restricted for one or more profiles.
2. For each FLS-restricted field, determine in Search Manager, under Index Management, whether it is in the search index.
3. For each FLS-restricted field that remains in the search index, identify the articles containing values in that field and confirm they are assigned to data categories or, where standard sharing for Lightning Knowledge is enabled, restricted by sharing.
4. Confirm that data category visibility on the roles, permission sets, permission set groups, or profiles of users who should not see those articles excludes the relevant categories, or that sharing excludes them.
5. If any form of Search Answers is enabled, confirm that users without access to the restricted articles cannot receive answers drawn from them.
6. The control is not met if any FLS-restricted Knowledge field remains in the search index and articles containing sensitive values in that field are uncategorized, unrestricted by sharing where sharing is used, or otherwise visible to users who should not discover them.

**Remediation:**  
1. Audit all custom fields on the Knowledge object and classify their content sensitivity.
2. For any sensitive field whose content is not appropriate for all users who can read the Knowledge object, evaluate whether the information belongs in Knowledge at all; a restricted custom object or private library may be more appropriate.
3. Where sensitive content must remain in Knowledge, assign articles containing it to a restricted data category and ensure no such article is left uncategorized, or, where standard sharing for Lightning Knowledge is enabled, restrict them through sharing.
4. Configure data category visibility to exclude restricted categories for user populations who should not discover those articles.
5. For any sensitive custom field that cannot be adequately controlled through article-level access, remove the field from the search index in Search Manager, under Index Management, where Index Management lists it, and confirm the field no longer matches results.
6. If any form of Search Answers is enabled, verify with a restricted test user that answers do not draw on restricted articles.
7. Document the data category access model as part of the organization's Knowledge governance policy.

**Default Value:**  
Salesforce Knowledge doesn't currently support the search mechanism for protecting most standard and custom fields. Until data category visibility is set up, all users can see all data categories. Once it is set, users with no data category visibility only see uncategorized articles unless categories are made visible by default.

### SBS-SRCH-006: Include Einstein Search Query Storage in Data Processing Assessments

<span title="Search queries can contain PHI and are stored in a separate environment that Salesforce states may not be covered like the production environment."><Badge type="info" text="HIPAA" /></span> <span title="Records of processing and risk assessment must include where search query text containing personal data is stored and retained."><Badge type="info" text="GDPR" /></span>

**Control Statement:** Organizations using Einstein Search must record the storage location and retention of search query and Search Analytics data in their data processing inventory and assess it against applicable regulatory obligations, including HIPAA.

**Description:**  
CRM data, including the search index, is stored in the customer's production environment and is covered by any compliance certification that applies to the service. Salesforce documentation states that search queries are stored in a separate environment that may not be similarly covered, which matters in particular for HIPAA. Users routinely type personal and sensitive information into the search bar, for example "John Smith diabetes management", so query text can itself contain regulated data.

Search Analytics also captures query text, interaction data, and result data in Data Cloud data model objects (DMOs). The Search Queries DMO (`SASearchQueries_dlm`) stores the first 100 characters of each query and, if optional user data is included, the `UserId__c` and `UserLicense__c` fields. Salesforce documentation does not describe a setting to change where search queries are stored, so this risk is managed through assessment, policy, and user awareness.

**Risk:** <Badge type="tip" text="Moderate" />  
If search query storage is not included in the organization's data processing assessment, regulated data entered into the search bar may be stored in a location outside the scope of the organization's compliance agreements, such as a HIPAA Business Associate Agreement, without the organization being aware of it. The exposure depends on what users type into search, which the organization cannot technically restrict.

**Audit Procedure:**  
1. Determine whether Einstein Search and Search Analytics are enabled in the org.
2. Review the organization's data processing inventory or records of processing and confirm it includes search query storage and the Search Analytics DMOs, including `SASearchQueries_dlm`.
3. Confirm that the DMO locations and retention have been reviewed and documented.
4. For organizations subject to HIPAA, confirm a documented assessment exists of whether search query storage falls within the compliance-covered services the organization relies on, including any HIPAA Business Associate Agreement.
5. The control passes if search query storage is inventoried, assessed against applicable obligations, and the outcome is documented.

**Remediation:**  
1. Add search query storage and the Search Analytics DMOs to the organization's data processing inventory.
2. Review DMO storage locations and retention, and whether optional user data is included in Search Analytics.
3. Assess search query storage against applicable regulatory obligations and contractual commitments, including HIPAA, and document the outcome.
4. Where the assessment identifies a risk, address it through policy and user training on what should not be entered into the search bar.

**Default Value:**  
Search queries are stored in an environment separate from the production environment that holds CRM data and the search index. In Government Cloud, Einstein Search doesn't send usage data, such as search queries, outside Government Cloud data centres, and Search Analytics isn't available.

### SBS-SRCH-007: Document the Einstein Customer Data Access Decision for Each Production Org

<span title="Use of customer personal data to train shared models must be assessed, documented, and where required disclosed."><Badge type="info" text="GDPR" /></span> <span title="Use of personal information beyond direct service delivery must be reflected in data inventories and disclosures."><Badge type="info" text="CCPA/CPRA" /></span>

**Control Statement:** Each production org must have a documented decision on whether Salesforce may access its Customer Data, including to train Einstein global models, and the org's **Opt Out of Customer Data Access** consent setting must match that decision.

**Description:**  
Einstein Search and some other Einstein features use global models, which look for aggregate, anonymous trends across multiple Salesforce orgs; the query classification and ranking models used by Einstein Search require data sets only achievable through global models. When an org shares Customer Data with Salesforce, Salesforce has consent to use it to train global predictive AI models, improve the services and features the org has access to, and conduct research into and development of new services and features. The setting covers a wide range of services, including Einstein Search, Einstein Search for Knowledge, Einstein Article Recommendations, Einstein Bots, Einstein Case Classification, Einstein Opportunity Scoring, services and features branded as Agentforce, and services and features that use Hybrid Search or Search Actions.

Customer data access is allowed by default unless the org uses Government Cloud (opted out by default since February 2026) or has previously opted out. The consent setting is managed in Setup on the **Opt Out of Customer Data Access** page, which requires Einstein Setup to be turned on and the Opt Out of Customer Data Access user permission. If the page is read-only, the org either uses Government Cloud or has opted out by other means, and consent can't be turned on. If the setting isn't visible once Einstein is enabled, Salesforce's offline alternative is a support case with the Activations Team, with "Global Model opt-out request" in the subject; a case is needed for each org. Sandboxes are excluded from global models.

When access is turned off, no new data is shared, data already collected for service improvement is retained for up to 30 days and then deleted, and Salesforce employees will not view Customer Data outside a support case, a pilot, or as otherwise described in the organization's legal agreements. Salesforce states that opting out of global models doesn't affect the ability to use any Einstein Search feature but can reduce the quality of search results, particularly for org-specific or industry-specific terms, and that the org can't participate in pilot programs or early access to Agentforce and Einstein features.

**Risk:** <Badge type="tip" text="Moderate" />  
An organization whose data-use policy prohibits use of customer data beyond direct service delivery may be in breach of that policy simply by using an Einstein feature, because customer data access is allowed by default outside Government Cloud. Because the decision is made per org and earlier opt-outs may have been made through support cases, the status is easily lost when administrators change, and the organization may be unable to demonstrate its position to auditors or regulators.

**Audit Procedure:**  
1. Identify all production orgs in Enterprise, Performance, or Unlimited Edition that use Einstein or Agentforce features.
2. For each such org, confirm a documented decision on Salesforce access to Customer Data exists and is consistent with the organization's data-use policy.
3. From Setup, in the Quick Find box, enter Opt Out of Customer Data Access, select it, and confirm the consent setting matches the documented decision.
4. If the page is read-only, record that the org is opted out through Government Cloud or by other means, and retain any related support case.
5. The control passes if every in-scope production org has a documented decision and its consent setting matches it.

**Remediation:**  
1. Determine the organization's position on Salesforce access to Customer Data against its data-use policy and applicable regulations.
2. For each production org that must opt out, from Setup, enter Einstein Setup in the Quick Find box and make sure Einstein Setup is turned on, then open **Opt Out of Customer Data Access** and turn consent off. If the setting isn't visible once Einstein is enabled, submit a support case with the Activations Team and include "Global Model opt-out request" in the subject.
3. Retain evidence of the setting or the support case confirmation for each org.
4. Record the decision and status in the organization's data processing inventory so that it survives administrator changes.

**Default Value:**  
Customer data access is allowed by default unless the org uses Government Cloud, which has been opted out by default since February 2026, or has previously opted out. Sandboxes are excluded from global models. After opting out, previously collected data is retained for up to 30 days and then deleted.
