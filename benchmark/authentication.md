## Authentication

This section defines controls related to user authentication in Salesforce production environments. These controls ensure that organizations implement strong identity verification mechanisms, centralize authentication through Single Sign-On, and maintain proper governance over authentication exceptions to reduce the attack surface and enforce consistent identity management practices.

### SBS-AUTH-001: Enforce Single Sign-On for All Standard Production Users

**Control Statement:** Salesforce production orgs must enforce Single Sign-On (SSO) for all standard users by enabling the org-level setting that disables Salesforce credential logins and assigning the “Is Single Sign-On Enabled” permission to all non-exempt accounts.

**Description:**  
Production orgs must require SSO authentication for all non-exempt human users by enabling the “Disable login with Salesforce credentials” setting and ensuring those users are assigned the “Is Single Sign-On Enabled” permission via profile or permission set.

**Risk:** <Badge type="danger" text="Critical" />  
Without enforced SSO, users can authenticate directly to Salesforce using local credentials—creating a parallel authentication path outside centralized identity management. This establishes an uncontrolled security boundary: password-based attacks (credential stuffing, phishing, brute force) can target Salesforce directly, enabling unauthorized access without requiring any other control to fail. Attackers bypass organizational identity controls, MFA policies, and session management enforced at the IdP layer.

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

**Risk:** <Badge type="tip" text="Moderate" />  
Users permitted to bypass SSO represent exceptions to centralized identity governance. Without formal documentation and approval, these accounts can proliferate unnoticed—reducing visibility into access patterns and undermining audit readiness. However, this control provides assurance and governance rather than establishing a security boundary; the primary protection is SSO enforcement (SBS-AUTH-001). Undocumented exceptions increase risk but require credential compromise for exploitation.

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

**Risk:** <Badge type="tip" text="Moderate" />  
Overly broad login IP ranges effectively disable network-based access controls, allowing authentication from any location on the internet. However, exploitation requires credentials to be compromised first—this control provides defense-in-depth rather than establishing a primary security boundary. When authentication controls (SBS-AUTH-001) are enforced, IP restrictions serve as an additional layer that limits the blast radius of credential compromise.

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

### SBS-AUTH-004: Enforce Strong Multi-Factor Authentication for External Users with Substantial Access to Sensitive Data 

**Control Statement:** 
All Salesforce interactive authentication flows for external human users with substantial access to sensitive data must enforce multi-factor authentication that includes at least one strong authentication factor.

**Description:**  
Salesforce must be configured so that every interactive login method available to external human users with substantial access to sensitive data enforces multi-factor authentication using either a strong second factor in addition to a password, or a passwordless flow requiring two or more factors with at least one strong factor, regardless of whether authentication is performed directly by Salesforce or via a single sign-on identity provider.

Organizations must document in their system of record:
1. **Definition of "substantial access to sensitive data"** — The organization's interpretation of what data classifications or access levels constitute substantial access for purposes of this control.
2. **Identification of in-scope users** — Either a list of specific users, or the combination of Salesforce access controls (profiles, permission sets, etc.) that result in substantial access.

**Example system-of-record entry:**
- **Definition:** "Substantial access to sensitive data" means access to Personally Identifiable Information (as defined under GDPR) relating to individuals other than the user themselves, or access to Special Category Data (as defined under GDPR) relating to any individual.
- **In-scope users:** All users assigned the "Service Channel Partner" profile.

For the purposes of this control, a strong authentication factor is defined as an authentication factor that is resistant to phishing, replay, and credential stuffing attacks. Acceptable strong authentication factors include:
 - Push-notification based authenticator app such as Salesforce Authenticator or Okta Verify
 - RFC 6238 compliant Time-based One-Time Password Algorithm (TOTP) authenticator app
 - FIDO2 hardware key compliant with either WebAuthn or U2F standard
 - Biometric authentication such as Touch ID or Windows Hello

**Risk:** <Badge type="danger" text="Critical" />  
Without enforced multi-factor authentication, external users with substantial access to sensitive data can authenticate using only a password—establishing a single point of failure for the authentication boundary. External users present elevated credential risk due to weaker identity proofing, less organizational oversight, and exposure to consumer-grade phishing attacks. Attackers who compromise a single password through phishing, credential stuffing, or account takeover gain direct access to sensitive data without requiring any other control to fail. This creates an unprotected authentication path to high-value data that bypasses the defense-in-depth protections applied to internal users.

**Audit Procedure:**  
1. Enumerate all active external human users with substantial access to sensitive data.
2. Validate that in-scope users have the “Multi-Factor Authentication for User Interface Logins” permission through profiles or permission sets.
3. Flag any in-scope users who lack the “Multi-Factor Authentication for User Interface Logins” permission.

**Remediation:**  
1. Apply the “Multi-Factor Authentication for User Interface Logins” permission through profiles or permission sets for all active external users with substantial access to sensitive data.
2. Configure suitable strong second-factor options in Setup -> Identity -> Identity Verification (e.g., authenticator app, FIDO2 security key).

**Default Value:**  
By default, Salesforce does not enforce strong multi-factor authentication for all external user login flows, and external users may authenticate using single-factor or weak-factor methods unless explicitly restricted by configuration.

**References:**  
- Salesforce Documentation: Multi-Factor Authentication  
- NIST SP 800-63B Authentication and Lifecycle Management  
- NIST SP 800-53 IA-2

### SBS-AUTH-005: Enable Session IP Security Restrictions

**Control Statement:** Production orgs must enable "Lock sessions to the IP address from which they originated" and must enable "Enforce login IP ranges on every request" for users with profile-level IP restrictions.

**Description:**  
Organizations must configure session security settings to lock sessions to originating IP addresses and enforce IP range restrictions on every API request, not just at login.

**Risk:** <Badge type="tip" text="Moderate" />  
Without session IP locking, stolen session IDs can be used from any IP address—enabling session hijacking attacks. Without enforcing IP ranges on every request, users can authenticate from allowed IPs but then make API calls from unauthorized locations, bypassing intended network restrictions. These settings provide defense-in-depth against credential theft and session hijacking but require session compromise for exploitation; authentication controls (SBS-AUTH-001) remain the primary protection.

**Audit Procedure:**  
1. Navigate to Setup → Session Settings.  
2. Verify "Lock sessions to the IP address from which they originated" is enabled.  
3. For profiles with configured login IP ranges, verify "Enforce login IP ranges on every request" is enabled.

**Remediation:**  
1. Enable "Lock sessions to the IP address from which they originated" in Session Settings.  
2. Enable "Enforce login IP ranges on every request" in Session Settings.  
3. Test with mobile devices and applications that may change IPs to ensure legitimate use cases function correctly.

**Default Value:**  
Salesforce does not enable these settings by default. Session IP locking and continuous IP range enforcement must be explicitly configured.