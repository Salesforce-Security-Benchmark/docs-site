## Search Security

This section defines controls related to the security of the Salesforce search platform, including the Einstein Search index, SOSL query execution, Search Manager configuration, Federated Search, and Salesforce Knowledge. These controls address inference attacks and misconfiguration patterns that create unintended data exposure through search. An inference attack occurs when search behaviour reveals the existence or content of data that a user does not have direct permission to view.

### SBS-SRCH-001: Audit and Prioritize FLS Protection Slots in the Search Index for Objects with Sensitive Custom Fields {#sbs-srch-001}

**Control Statement:** For every object with more than 100 searchable custom fields, the organization must review and configure Search Manager to assign all 100 available FLS protection slots to the fields with the highest sensitivity classification, and must either reassign lower-sensitivity fields to the unprotected list or remove the most sensitive excess fields from the search index entirely.

**Description:**  
The Salesforce search index applies field-level security to a maximum of 100 custom fields per object. Custom picklist fields are always protected and do not count against this limit. When an object has more than 100 searchable, non-picklist custom fields, every field beyond the 100th is included in the search index without FLS enforcement. Any user who can read the record can submit a query that matches against those unprotected field values, even if their profile or permission set denies access to the field itself.

Users cannot see the unprotected field value in search results. The risk is inference. When a search query returns a record, the user can conclude that the unprotected field value matched their search term. For objects containing sensitive attributes such as health conditions, trade union membership, salary bands, or litigation flags, this inference capability constitutes unauthorized disclosure. The data is deducible from system behaviour without being directly presented.

Since Summer '24, Salesforce provides admin control over FLS slot allocation via Setup, Quick Find "Search Manager", Index Management, then Manage Field-Level Security for Search on the relevant object. Before this release, slot allocation was determined by field creation order and could not be controlled. Organizations that have not reviewed this configuration since before Summer '24 may have critical fields in unprotected positions.

**Risk:** <Badge type="danger" text="Critical" />  
An inference attack against unprotected search index fields enables users to determine whether sensitive field values exist on records they can read, without having permission to view those values. In regulated environments such as healthcare, financial services, and HR, this exposes special-category personal data, protected health information, or confidential business data through a search interface that most organizations assume is governed by the same FLS rules that protect the field in every other context. The 100-slot limit cannot be extended, and excess fields require explicit prioritization decisions or must be removed from the index entirely.

**Audit Procedure:**

1. From Setup, enter Search Manager in the Quick Find box and select **Index Management**.
2. Review the Index Management page, which indicates how many objects have unprotected fields in the search index.
3. For each flagged object, select it from the Salesforce Objects list and click **Manage Field-Level Security for Search**.
4. Count the total number of searchable, non-picklist custom fields on the object.
5. If the object has more than 100 such fields, verify that the 100 protection slots are assigned to the fields with the highest sensitivity classification per the organization's data classification policy.
6. Identify any sensitive fields that are not in the Protected list and have not been removed from the search index.
7. Check for the "changes pending" banner; configuration changes may take up to several days to apply.
8. The control passes if no sensitive field is in an unprotected search index position on any object where the 100-slot limit has been reached.

**Remediation:**

1. Identify all objects with more than 100 searchable, non-picklist custom fields.
2. For each such object, from Setup, enter Search Manager in the Quick Find box, select **Index Management**, then select the object and click **Manage Field-Level Security for Search**.
3. Using the organization's data classification policy, rank all custom fields on the object by sensitivity.
4. Move the 100 highest-sensitivity fields to the Protected list.
5. For any sensitive field that cannot fit within the 100-slot limit, use the **Remove from search index** option to exclude it from search matching entirely.
6. Document the allocation decisions and retain a record of which fields were moved to the unprotected list or removed from the index, including the justification.
7. Establish a recurring review process triggered whenever new custom fields are added to objects at or near the 100-field limit.

**Default Value:**  
Salesforce applies FLS protection to the first 100 searchable custom fields per object, in creation order, by default. Before Summer '24, this allocation could not be administratively reconfigured. After Summer '24, admin control is available but must be explicitly configured. The 100-field limit cannot be increased.

---

### SBS-SRCH-002: Prohibit SOSL `IN ALL FIELDS` Scope in System-Mode Apex Where Results Are Exposed to Restricted Users {#sbs-srch-002}

**Control Statement:** Apex classes that execute SOSL queries using the `IN ALL FIELDS` search group, or that omit the search group entirely, must not expose matched records to users whose field-level security would restrict one or more of the indexed fields being searched.

**Description:**  
SOSL (Salesforce Object Search Language) in Apex runs in system context by default. System context ignores field-level security. When a SOSL query uses `IN ALL FIELDS` or omits the `IN` clause entirely (which defaults to `IN ALL FIELDS`), the search engine evaluates every searchable field on every searchable object regardless of the running user's FLS configuration. If the matched records are then returned to the user via a Lightning component, Visualforce page, Flow, or API endpoint, those results reflect a search that bypassed FLS enforcement.

The exposure is structurally identical to the search index FLS limit problem: the user does not see the restricted field value, but the fact that a record appeared in results for a specific query reveals that the restricted field matched. Developers often choose `IN ALL FIELDS` for convenience, or omit the clause without realizing that omission defaults to the same scope. Unlike the Search Manager FLS limit, which is a platform constraint, this is a code-level choice that is fully within the developer's control and must be governed through code review and static analysis.

**Risk:** <Badge type="warning" text="High" />  
Custom search components built on `IN ALL FIELDS` SOSL in system mode create inference attack surfaces that are invisible to the Search Manager audit view and cannot be detected through Salesforce Setup. A user with no FLS access to a sensitive field can submit a search term and determine, from the returned record set, whether that value exists on any record they can read. In Experience Cloud orgs, this pattern can expose internal data to external portal users. Because the behaviour is by design in Apex system mode, it is not flagged by Salesforce as a misconfiguration; it must be identified and corrected by the development team.

**Audit Procedure:**

1. Retrieve all Apex classes from the org using the Metadata API or Tooling API.
2. Search all Apex class bodies for SOSL query strings containing `IN ALL FIELDS`, and for SOSL `FIND` statements that do not include an `IN` clause.
3. For each identified query, determine whether the query result set is returned to or displayed for end users via `AuraEnabled` methods, `@RemoteAction`, Flow invocable actions, or API-accessible endpoints.
4. For each user-exposed query, determine whether any user who can invoke the component or endpoint has FLS restrictions on any field that is searchable on the queried objects.
5. If any user-facing component exposes results from an `IN ALL FIELDS` SOSL query to users with FLS restrictions, the control is not met.
6. The control passes if the `IN` clause is scoped to `NAME FIELDS`, `EMAIL FIELDS`, or `PHONE FIELDS` matching the use case, or if the component enforces user-context FLS using `WITH SECURITY_ENFORCED` or explicit Schema checks before returning results.

**Remediation:**

1. Replace `IN ALL FIELDS` with the most restrictive search group appropriate to the use case: `IN NAME FIELDS`, `IN EMAIL FIELDS`, or `IN PHONE FIELDS`.
2. If `IN ALL FIELDS` scope is required for the use case, enforce user context explicitly by running the query `WITH USER_MODE` (available since API v56.0) or validating FLS on each returned record before presenting it.
3. Add a static analysis rule to the pre-merge code analysis pipeline (see SBS-CODE-002) that flags `IN ALL FIELDS` SOSL patterns in user-facing Apex classes.
4. Review all existing components identified in the audit and remediate in order of user population size and sensitivity of the searchable objects.

**Default Value:**  
Salesforce Apex runs in system mode by default. SOSL queries in system-mode Apex ignore field-level security. `IN ALL FIELDS` is the default search scope when no `IN` clause is specified.

---

### SBS-SRCH-003: Validate FLS Prerequisites for All Search Manager Filtering Rules {#sbs-srch-003}

**Control Statement:** Each Search Manager filtering rule must reference only fields for which all target user profiles have read access; any rule referencing a field that is FLS-restricted for one or more target profiles must be corrected or supplemented with an alternative access control.

**Description:**  
Search Manager allows administrators to define filtering rules that exclude records from search results based on field values. For example, a rule might exclude records of a specific record type, status, or classification from appearing for certain users. These rules improve result relevance and enforce coarse-grained scoping.

Salesforce only applies a Search Manager rule to users who have read access to the field referenced in the rule. If the rule references a field that is FLS-restricted for a given profile, the rule is silently skipped for users on that profile. Records that should be excluded continue to appear in their search results, and the administrator receives no indication that the rule is not being applied.

This failure mode is particularly significant in Experience Cloud environments, where Community User profiles routinely have narrower FLS than internal profiles. A rule designed to restrict external-facing users from seeing internal record types may have no effect on those users at all if the RecordType field, or the custom classification field used in the rule, is not readable by Community User profiles.

**Risk:** <Badge type="tip" text="Moderate" />  
Silent rule failure means that access scoping enforced through Search Manager cannot be relied upon as a security control for any user whose FLS does not include the filtered field. Organizations may incorrectly believe that certain record populations are excluded from search results for specific user groups, creating undetected exposure. The impact depends on the sensitivity of the excluded records. If the rule was designed to prevent disclosure of a restricted record type, its silent failure defeats that intent without any visible indication.

**Audit Procedure:**

1. From Setup, enter Search Manager in the Quick Find box and select **Index Management**. Review all active filtering rules.
2. For each rule, identify the field referenced in the rule condition.
3. Enumerate all profiles and permission sets assigned to users in the target population for whom the rule is intended to apply.
4. For each such profile or permission set, verify that the field referenced in the rule is readable with FLS set to Read or Edit.
5. Identify any rule where one or more target profiles do not have read access to the rule's field. Flag those rules as non-operative for those user populations.
6. The control passes if every active Search Manager rule is either applied only to users who can read the rule's field, or supplemented by an alternative access control such as object-level permissions, sharing rules, or OWD that achieves the same restriction independently.

**Remediation:**

1. For each rule with an FLS mismatch, grant read access to the rule's field on the affected profiles if that is consistent with the broader access model.
2. If granting read access is not appropriate, replace the Search Manager rule with a direct access control: restrict the target profiles from reading the object, tighten OWD, or apply sharing rules to limit which records are accessible.
3. Do not rely on Search Manager rules as a primary security control for user groups who cannot read the rule's field. Treat Search Manager rules as result-quality enhancements for users who already have appropriate access.
4. Document all active Search Manager rules in the organization's access control inventory and record the FLS prerequisite for each rule.

**Default Value:**  
Salesforce silently skips Search Manager rules for users who cannot read the field referenced in the rule. No warning is displayed in Search Manager or in the audit log when a rule is not applied due to FLS restrictions.

---

### SBS-SRCH-004: Restrict Federated Search External Data Sources to Authorized Profiles {#sbs-srch-004}

**Control Statement:** Federated Search external data sources of type "Federated Search: OpenSearch" must not have the "Search results visible to all profiles" setting enabled unless the external content is explicitly classified as appropriate for every user in the organization.

**Description:**  
Federated Search allows Salesforce to incorporate search results from external systems such as Confluence wikis, SharePoint libraries, knowledge bases, and partner portals directly into the global Salesforce search bar. When configuring a Federated Search external data source, there is a checkbox labeled **Search results visible to all profiles**. If enabled, every user in the org sees search results from that external source regardless of their profile.

This setting is frequently left enabled after initial configuration and testing. If the external source contains restricted content such as HR documentation, legal communications, financial models, or internal strategy documents, users who would not normally have access to that system can see result titles and summaries directly in Salesforce. The external system's own access controls may prevent the user from opening the document, but the title and summary shown in the Salesforce search result may themselves contain sufficient information to constitute disclosure.

**Risk:** <Badge type="warning" text="High" />  
Federated Search result titles and summaries are surfaced in the Salesforce UI as plain text and do not benefit from Salesforce FLS, sharing rules, or object-level permissions, which apply only to Salesforce data. If "visible to all profiles" is enabled on a source containing restricted content, every Salesforce user can see whatever text the external provider returns in the title and summary fields for their query. Unlike the inference attacks described in other controls in this section, this is direct data exposure: the sensitive text appears in the search result rather than being deducible from search behaviour.

**Audit Procedure:**

1. Navigate to Setup, then External Data Sources, and filter for data sources of type "Federated Search: OpenSearch."
2. For each Federated Search data source, check whether the **Search results visible to all profiles** checkbox is enabled.
3. For any data source with this setting enabled, obtain a content classification for the external source.
4. Determine whether the external source contains content that is appropriate for every user in the organization.
5. If the source contains any restricted content, or if no classification exists, flag the data source as noncompliant.
6. The control passes if every Federated Search data source with "visible to all profiles" enabled has documented classification confirming the content is appropriate for the entire user population, and all other data sources have explicit profile-level access configured.

**Remediation:**

1. For each Federated Search data source where "visible to all profiles" is enabled and the content is not classified as universally appropriate, disable the setting.
2. Configure explicit profile-level access by navigating to the External Data Source settings and granting access only to the profiles for which the external content is appropriate.
3. Review the external data source's own access control configuration to confirm that it enforces user-level authorization before returning results.
4. Establish a review process for all new Federated Search data sources during configuration, requiring content classification and explicit profile access decisions before go-live.
5. Document the access model for each Federated Search data source in the organization's integration or data processing inventory.

**Default Value:**  
Salesforce does not enforce a default restriction on Federated Search result visibility. The "Search results visible to all profiles" checkbox can be enabled at any time and applies immediately.

---

### SBS-SRCH-005: Enforce Article-Level Access Controls for Knowledge Object Discoverability {#sbs-srch-005}

**Control Statement:** Organizations using Salesforce Knowledge must enforce article-level visibility through data category assignments and must not rely on field-level security as the primary mechanism for restricting Knowledge article discoverability via search.

**Description:**  
The Salesforce Knowledge object does not fully support the field-level security mechanism that governs search index protection for other objects. For standard and custom objects, the search engine applies FLS to protected custom fields and excludes unprotected field values from matching for users who lack access. For Knowledge articles, this protection mechanism does not operate in the same way. Custom fields on Knowledge articles, including fields containing internal infrastructure details, restricted policy content, legal notes, or clinical guidance, may be used by the search engine to match articles for users who have no FLS access to those fields.

The consequence is structurally identical to the 100-field limit inference attack on other objects, but it applies to all custom fields on Knowledge, not just those beyond the 100th. A user searching for a term that appears only in a restricted Knowledge field may receive the article in their results. The field value is hidden, but the match reveals the information. In environments using Search Answers, where AI-generated summaries surface Knowledge article content in the search bar, this risk extends further: AI-generated responses may synthesize content from fields that are formally FLS-restricted.

The correct mechanism for restricting Knowledge article discoverability is data category assignments combined with data category visibility settings on user profiles, not field-level security.

**Risk:** <Badge type="warning" text="High" />  
For organizations that use Knowledge to store both customer-facing and internal content in the same org, the absence of search FLS enforcement on Knowledge creates an inference attack surface across all custom fields on the object. Users in customer-facing roles or external portal users can issue targeted searches to determine whether restricted content exists within articles they can read. In healthcare, financial services, or legal environments where Knowledge articles contain sensitive content in custom fields, this creates a gap between the intended access model and the access model that the platform actually enforces.

**Audit Procedure:**

1. Identify all custom fields on the Knowledge object (`Knowledge__kav`) that are configured with FLS restrictions for one or more profiles.
2. For each FLS-restricted field, determine whether the field is included in the search index by confirming it has not been removed via Search Manager, Index Management.
3. For each FLS-restricted field that remains in the search index, verify whether the article population containing values in that field is segmented using data categories with appropriate visibility restrictions.
4. Confirm that data category visibility is configured on the profiles of users who should not have access to articles in those categories.
5. If any FLS-restricted Knowledge field is in the search index and the articles containing sensitive values in that field are not restricted by data category visibility for the relevant user populations, the control is not met.
6. If Search Answers is enabled, verify that article-level data category controls are sufficient to prevent restricted articles from being included in answer generation for users without category visibility.

**Remediation:**

1. Audit all custom fields on the Knowledge object and classify their content sensitivity.
2. For any sensitive field that contains content not appropriate for all users who have read access to the Knowledge object, evaluate whether the information belongs in a Knowledge article.
3. Where sensitive content must remain in Knowledge, restructure article populations so that articles containing sensitive custom field content are assigned to a restricted data category.
4. Configure data category visibility on user profiles to prevent access to restricted data categories for user populations who should not discover those articles.
5. For any sensitive custom field that cannot be adequately controlled through data category scoping, remove the field from the search index via Setup, Quick Find "Search Manager", then Index Management.
6. If Search Answers is enabled, review the data category configuration of articles that inform AI-generated responses and confirm that restricted categories are excluded from answer generation for users without category visibility.
7. Document the data category access model as part of the organization's Knowledge governance policy.

**Default Value:**  
Salesforce Knowledge does not apply the standard search index FLS protection mechanism that applies to other objects. Data category visibility must be explicitly configured by the administrator. Search Answers generates responses from all Knowledge articles accessible to the running user and does not apply additional content filtering based on field-level security.
