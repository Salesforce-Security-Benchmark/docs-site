## Authentication

This section defines controls related to user authentication in Salesforce production environments. These controls ensure that organizations implement strong identity verification mechanisms, centralize authentication through Single Sign-On, and maintain proper governance over authentication exceptions to reduce the attack surface and enforce consistent identity management practices.

### SBS-AUTH-001: Enforce Single Sign-On for All Standard Production Users

**Control Statement:** Salesforce production orgs must enforce Single Sign-On (SSO) for all standard users by enabling the org-level setting that disables Salesforce credential logins and assigning the “Is Single Sign-On Enabled” permission to all non-exempt accounts.

**Description:**  
Production orgs must require SSO authentication for all non-exempt human users by enabling the “Disable login with Salesforce credentials” setting and ensuring those users are assigned the “Is Single Sign-On Enabled” permission via profile or permission set.

**Rationale:**  
Enforcing SSO for standard users prevents password-based authentication, centralizes identity management, and reduces authentication attack surface across the production environment.

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

**References:**  
- Salesforce Help: Single Sign-On Settings  
- Salesforce Metadata API: SingleSignOnSettings  
- NIST SP 800-63: Digital Identity Guidelines  


### SBS-AUTH-002: Govern and Document All Users Permitted to Bypass Single Sign-On

**Control Statement:** All users who do not have the “Is Single Sign-On Enabled” permission must be explicitly authorized, documented in a system of record, and limited to approved administrative or break-glass use cases.

**Description:**  
Production orgs must maintain an authoritative inventory of all accounts permitted to authenticate with Salesforce credentials by identifying users without the “Is Single Sign-On Enabled” permission and documenting their justification, role, and approval.

**Rationale:**  
Users who bypass SSO pose elevated authentication risk; maintaining formal governance ensures that such accounts exist only for necessary operational continuity and do not create unmanaged access paths.

**Audit Procedure:**  
1. Enumerate all users who do **not** have the “Is Single Sign-On Enabled” permission.  
2. Verify each identified user appears in the approved system-of-record inventory with a business justification and owner.  
3. Confirm each exception is authorized for administrative or break-glass purposes only.  
4. Validate that these accounts follow strong local authentication controls (e.g., strong password policies, MFA if applicable).  
5. Flag any user without documented approval.

**Remediation:**  
1. Create or update a formal inventory documenting all SSO-bypass users and their business justification.  
2. Remove SSO-bypass capability by assigning the “Is Single Sign-On Enabled” permission to any undocumented or unjustified user.  
3. Ensure all documented exceptions adhere to least-privilege access and strong authentication controls.  
4. Establish periodic (e.g., quarterly) review of all SSO-bypass accounts.

**Default Value:**  
Salesforce allows all users to authenticate with Salesforce credentials unless the “Is Single Sign-On Enabled” permission is assigned and the org-level setting disabling local login is enabled.

**References:**  
- Salesforce Help: Single Sign-On Settings  
- Salesforce Metadata API: SingleSignOnSettings  
- CIS Controls v8: Access Control Mechanisms

### SBS-AUTH-003: Enforce a Minimum Global Password Policy for Local Authentication

**Control Statement:** Salesforce production orgs that permit any local (non-SSO) authentication must configure the global password policy to meet or exceed the ISSB-defined minimum baseline for password strength, lifetime, reuse prevention, lockout, and reset handling.

**Description:**  
If any user in the production org is allowed to authenticate using Salesforce credentials, the org’s global password policy must be configured to at least the following minimum values:  
- **User password expiration:** 180 days  
- **Password history:** 24 passwords remembered  
- **Minimum password length:** 12 characters  
- **Password complexity:** Must include alphabetic, numeric, and special characters  
- **Password question requirement:** Security answer must not contain the password  
- **Maximum invalid login attempts:** 3  
- **Lockout effective period:** Forever (indefinite lockout)  
- **Obscure secret answer for password resets:** Enabled  
- **Require minimum 1-day password lifetime:** Enabled  
- **Allow use of setPassword() API for self-resets:** Disabled  

**Rationale:**  
This control establishes the minimum acceptable password security baseline for any Salesforce environment that relies on password-based authentication.

**Audit Procedure:**  
1. Navigate to **Setup → Password Policies** or retrieve `PasswordPolicies` using the Metadata API.  
2. Verify each global password policy setting meets or exceeds the minimum values defined in the Description.  
3. Enumerate all active users without the “Is Single Sign-On Enabled” permission; if none exist, this control is not applicable.  
4. Flag noncompliance if any password policy setting falls below the required minimum while local authentication is in use.

**Remediation:**  
1. Update global password policy settings to meet or exceed the required minimum baseline.  
2. Validate that all users who authenticate with Salesforce credentials are subject to the updated policy.  
3. Optionally eliminate local authentication entirely by assigning the “Is Single Sign-On Enabled” permission to all users and enabling org-wide SSO enforcement.

**Default Value:**  
Salesforce’s default password policy values vary by org and typically do not meet the minimum requirements defined by this control.

**References:**  
- Salesforce Help: Password Policies  
- NIST SP 800-63B: Digital Identity Guidelines  

### SBS-AUTH-004 — Prohibit Broad or Unrestricted Profile Login IP Ranges

**Control Statement:** Profiles in Salesforce production orgs must not contain login IP ranges that effectively permit access from the full public internet or other overly broad ranges that bypass network-based access controls.

**Description:**  
Any profile-level login IP range must reflect explicitly authorized organizational network boundaries. Profiles must not include universally permissive ranges—such as `0.0.0.0–255.255.255.255` or other combinations that allow access from all or nearly all IP addresses—as these configurations disable intended Salesforce network restrictions and undermine authentication controls.

**Rationale:**  
Overly broad login IP ranges allow users to authenticate from anywhere, bypassing expected network security controls, and creating a high-risk exposure path for credential compromise or unauthorized access.

**Audit Procedure:**  
1. Retrieve all profile login IP ranges via **Setup → Profiles → Login IP Ranges** or by querying the Profile metadata (`loginIpRanges` field) using the Metadata API.  
2. For each profile, enumerate all configured login IP ranges.  
3. Identify any ranges that:  
   - Cover the entire IPv4 space, or  
   - Represent effectively unrestricted access (e.g., `0.0.0.0–255.255.255.255`, `1.1.1.1–255.255.255.255`, or similar patterns).  
4. Confirm that all IP ranges align with organizational security policy and defined network boundaries.  
5. Flag any profile with an impermissible or overly broad range.

**Remediation:**  
1. Remove any profile login IP ranges that effectively grant unrestricted global access.  
2. Replace them with IP ranges that correspond to approved corporate networks, office locations, VPN ingress points, or other authorized infrastructure.  
3. Validate that updated network restrictions do not block legitimate access paths and that users can authenticate through sanctioned networks.  
4. Establish an internal governance process to review and approve all future additions of profile login IP ranges.

**Default Value:**  
Salesforce profiles do not include login IP ranges by default; they must be explicitly configured.

**References:**  
- Salesforce Help: Profile Login IP Ranges  
- NIST SP 800-53 AC-19: Access Control for Remote Access  
- OWASP ASVS: V2 Authentication and Session Management  
