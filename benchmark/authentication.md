## Authentication

This section defines controls related to user authentication in Salesforce production environments. These controls ensure that organizations implement strong identity verification mechanisms, centralize authentication through Single Sign-On, and maintain proper governance over authentication exceptions to reduce the attack surface and enforce consistent identity management practices.

### SBS-AUTH-001: Enforce Single Sign-On for All Standard Production Users

**Control Statement:** Salesforce production orgs must enforce Single Sign-On (SSO) for all standard users by enabling the org-level setting that disables Salesforce credential logins and assigning the “Is Single Sign-On Enabled” permission to all non-exempt accounts.

**Description:**  
Production orgs must require SSO authentication for all non-exempt human users by enabling the “Disable login with Salesforce credentials” setting and ensuring those users are assigned the “Is Single Sign-On Enabled” permission via profile or permission set.

**Risk:** <Badge type="warning" text="High" />  
Without enforced SSO, users can authenticate directly to Salesforce using local credentials—creating a parallel authentication path outside centralized identity management. This expands the attack surface by enabling password-based attacks (credential stuffing, phishing, brute force) against Salesforce directly, bypassing organizational identity controls, MFA policies, and session management enforced at the IdP layer.

**Audit Procedure:**  
1. Retrieve SingleSignOnSettings via Metadata API or UI and verify that `isLoginWithSalesforceCredentialsDisabled` is set to `true`.  
2. Enumerate all active human users.  
3. Enumerate all users assigned the “Is Single Sign-On Enabled” permission through profiles or permission sets.  
4. Verify that all non-exempt users (i.e., all users not classified as approved break-glass or administrative exceptions) have the “Is Single Sign-On Enabled” permission.  
5. Flag any user who lacks the permission but is not explicitly approved as an exception.

**Remediation:**  
1. Enable **Disable login with Salesforce credentials** under Single Sign-On Settings.  
2. Assign the “Is Single Sign-On Enabled” permission to all standard users via profiles or permission sets.  
3. Validate that standard users can authenticate only through the configured SSO provider.  
4. Remove local login capability from any non-exempt user.

**Default Value:**  
By default, Salesforce does not enable “Disable login with Salesforce credentials,” and users are not assigned the “Is Single Sign-On Enabled” permission.

### SBS-AUTH-002: Govern and Document All Users Permitted to Bypass Single Sign-On

**Control Statement:** All users who do not have the “Is Single Sign-On Enabled” permission must be explicitly authorized, documented in a system of record, and limited to approved administrative or break-glass use cases.

**Description:**  
Production orgs must maintain an authoritative inventory of all accounts permitted to authenticate with Salesforce credentials by identifying users without the “Is Single Sign-On Enabled” permission and documenting their justification, role, and approval.

**Risk:** <Badge type="warning" text="High" />  
Users permitted to bypass SSO represent unmanaged authentication paths outside centralized identity governance. Without formal documentation and approval, these accounts can proliferate unnoticed—creating elevated credential compromise risk, reducing visibility into access patterns, and undermining the security guarantees provided by SSO enforcement. Ungoverned bypass accounts are a common vector for persistent unauthorized access.

**Audit Procedure:**
1. Enumerate all users who do **not** have the "Is Single Sign-On Enabled" permission.
2. Verify each identified user appears in the approved system-of-record inventory with a business justification and owner.
3. Confirm each exception is authorized for administrative or break-glass purposes only.
4. Validate that these accounts follow strong local authentication controls (e.g., strong password policies, MFA if applicable).
5. Flag any user without documented approval.
6. Download API Total Usage logs (EventLogFile - ApiTotalUsage, available in free tier of Event Monitoring) to monitor SSO bypass account activity:
   - Filter API activity by users identified as SSO bypass accounts.
   - Review frequency and timing of API calls to verify usage aligns with documented break-glass purposes.
   - Flag any SSO bypass accounts with regular or unexpected API activity for review against documented justifications.

**Remediation:**  
1. Create or update a formal inventory documenting all SSO-bypass users and their business justification.  
2. Remove SSO-bypass capability by assigning the “Is Single Sign-On Enabled” permission to any undocumented or unjustified user.  
3. Ensure all documented exceptions adhere to least-privilege access and strong authentication controls.  
4. Establish periodic (e.g., quarterly) review of all SSO-bypass accounts.

**Default Value:**  
Salesforce allows all users to authenticate with Salesforce credentials unless the “Is Single Sign-On Enabled” permission is assigned and the org-level setting disabling local login is enabled.

### SBS-AUTH-003: Prohibit Broad or Unrestricted Profile Login IP Ranges

**Control Statement:** Profiles in Salesforce production orgs must not contain login IP ranges that effectively permit access from the full public internet or other overly broad ranges that bypass network-based access controls.

**Description:**  
Any profile-level login IP range must reflect explicitly authorized organizational network boundaries. Profiles must not include universally permissive ranges—such as `0.0.0.0–255.255.255.255` or other combinations that allow access from all or nearly all IP addresses—as these configurations disable intended Salesforce network restrictions and undermine authentication controls.

**Risk:** <Badge type="warning" text="High" />  
Overly broad login IP ranges effectively disable network-based access controls, allowing authentication from any location on the internet. This eliminates the network boundary as a defensive layer—compromised credentials can be exploited from anywhere, making unauthorized access significantly easier to execute and harder to detect. Attackers no longer need network proximity or VPN access to leverage stolen credentials.

**Audit Procedure:**
1. Retrieve all profile login IP ranges via **Setup → Profiles → Login IP Ranges** or by querying the Profile metadata (`loginIpRanges` field) using the Metadata API.
2. For each profile, enumerate all configured login IP ranges.
3. Identify any ranges that:
   - Cover the entire IPv4 space, or
   - Represent effectively unrestricted access (e.g., `0.0.0.0–255.255.255.255`, `1.1.1.1–255.255.255.255`, or similar patterns).
4. Confirm that all IP ranges align with organizational security policy and defined network boundaries.
5. Flag any profile with an impermissible or overly broad range.
6. Download API Total Usage logs (EventLogFile - ApiTotalUsage, available in free tier of Event Monitoring) to validate IP restrictions are effective:
   - Extract unique `CLIENT_IP` values from recent API activity.
   - Compare against documented approved organizational network ranges.
   - Identify any new or unexpected IP addresses making API calls.
   - Cross-reference unusual IPs with profile assignments to identify potential policy gaps.

**Remediation:**
1. Remove any profile login IP ranges that effectively grant unrestricted global access.  
2. Replace them with IP ranges that correspond to approved corporate networks, office locations, VPN ingress points, or other authorized infrastructure.  
3. Validate that updated network restrictions do not block legitimate access paths and that users can authenticate through sanctioned networks.  
4. Establish an internal governance process to review and approve all future additions of profile login IP ranges.

**Default Value:**  
Salesforce profiles do not include login IP ranges by default; they must be explicitly configured.

