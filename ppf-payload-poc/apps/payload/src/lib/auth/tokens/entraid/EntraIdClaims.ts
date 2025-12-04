export enum IdType {
  User = "user",
  App = "app",
}

/**
 * Base interface for common Microsoft Entra ID claims.
 *
 * https://learn.microsoft.com/en-us/entra/identity-platform/access-tokens
 */
export type EntraIDBaseClaims = {
  /**
   * Identifies the security token service (STS) that constructs and returns the token, and the Azure AD tenant in which the user was authenticated.
   *
   *
   * If the token was issued by the v2.0 endpoint, the URI will end in /v2.0.
   *
   *
   * Ex: 'https://sts.windows.net/9188040d-6c67-4c5b-b112-36a304b66dad'
   *
   * Your app should use the GUID portion of the claim to restrict the set of tenants that can sign in to the app, if applicable.
   */
  iss: string;
  /**
   * A GUID that represents the Azure AD tenant that the user is from. Ex: '9188040d-6c67-4c5b-b112-36a304b66dad'
   */
  tid?: string;
  /**
   * IssuedAt
   */
  iat: number;
  /**
   * NotBeforee
   */
  nbf: number;
  /**
   * ExpiresAt
   */
  exp: number;
  /**
   *
   * The application ID of the client using the token. The application can act as itself or on behalf of a user.
   * The application ID typically represents an application object, but it can also represent a service object in Azure AD.
   *
   * Identity.ClientId
   */
  appid: string;
  /**
   * Indicates how the client was authenticated. For a public client, the value is "0". If client ID and client secret are used, the value is "1".
   * If a client certificate was used for authentication, the value is "2".
   */
  appidacr: "0" | "1" | "2";
  /**
   * 	Indicates the version of the token. E.g '1.0'.
   */
  ver: string;
  /**
   * An internal claim used by Azure AD to record data for token reuse. Should be ignored.
   */
  aio?: string;
  /**
   * 	An internal claim used by Azure to revalidate tokens. Should be ignored.
   */
  uti?: string;
  /**
   * The principal about which the token asserts information, such as the user of an app. This value is immutable and cannot be reassigned or reused.
   *
   * The subject is a pairwise identifier - it is unique to a particular application ID.
   * Therefore, if a single user signs into two different apps using two different client IDs, those apps will receive two different values for the subject claim.
   *
   * Identity.principalId or Identity.objectId
   */
  sub: string;
  /**
   * The value is app when the token is an app-only token. This claim is the most accurate way for an API to determine if a token is an app token or user token.
   */
  idtyp: IdType | string;
  /**
   * The immutable identifier for an object. This ID uniquely identifies the user across applications
   */
  oid: string;
  /**
   * Purpose:
   *
   * This claim is associated with Continuous Access Evaluation (CAE) in Azure AD.
   * CAE allows for real-time enforcement of policies, enabling immediate revocation of tokens when certain events occur, such as user account disablement or password changes.
   *
   * Usage:
   *
   * The presence of the xms_cae claim indicates that the token is capable of participating in continuous access evaluation, allowing Azure AD to enforce policies dynamically during the token's lifetime.
   *
   * Ref: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-continuous-access-evaluation
   */
  xms_cae?: string;
  /**
   * Identity relationship between the managed identity and the Azure resource.
   * Example: '7 10'
   */
  xms_idrel: string;
  /**
   * Token creation date and time, expressed as a Unix timestamp in seconds.
   * Example: 123123123
   */
  xms_tcdt: number;
  /**
   * WARNING: The user can belong to so many groups that it may require filtering and is not necessarily reliable.
   *
   * Provides object IDs that represent the subject's group memberships. These values are unique (see Object ID) and can be safely used for managing access,
   * such as enforcing authorization to access a resource. The groups included in the groups claim are configured on a per-application basis, through the
   * groupMembershipClaims property of the application manifest.
   */
  groups?: string[];
};

/**
 * Interface representing Azure Managed Identity claims.
 */
export type AzureManagedIdentityAppClaims = EntraIDBaseClaims & {
  /**
   * Identifies the intended recipient of the token. In id_tokens, the audience is your app's Application ID, assigned to your app in the Azure portal. Your app should validate this value, and reject the token if the value does not match.
   */
  aud: "https://management.azure.com";
  /**
   * Expected: "app"
   */
  idtyp: "app";
  /**
   * Identifying the Authenticating Authority: The idp claim specifies which identity provider authenticated the user (should be same as iss).
   */
  idp: string;
  /**
   * Azure Resource ID of the resource to which the identity is assigned.
   * Example: '/subscriptions/{subscription-id}/resourcegroups/{resource-group-name}/providers/Microsoft.App/containerApps/{app-name}'
   */
  xms_az_rid: string;
  /**
   * Azure Resource ID of the managed identity.
   * Example: '/subscriptions/{subscription-id}/resourcegroups/{resource-group-name}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{identity-name}'
   */
  xms_mirid: string;
};

export type EntraIDUserClaims = EntraIDBaseClaims & {
  /**
   * Expected: "user"
   */
  idtyp: "user";
  /**
   * Identifies the intended recipient of the token. In id_tokens, the audience is your app's Application ID, assigned to your app in the Azure portal. Your app should validate this value, and reject the token if the value does not match.
   */
  aud: "https://management.azure.com";
  /**
   * Session ID. This claim serves as a unique identifier for a user's session with the authentication server.
   *
   * Logout Mechanism: In the context of OpenID Connect Back-Channel Logout, the sid claim is used to identify which session should be terminated.
   *
   * A Logout Token must contain either a sub (subject) or sid claim, and may contain both.
   */
  sid: string;
  /**
   * The username of the user. May be a phone number, email address, or unformatted string.
   * Should only be used for display purposes and providing username hints in reauthentication scenarios.
   */
  upn: string;
  /**
   * The name claim provides a human-readable value that identifies the subject of the token. The value is not guaranteed to be unique, it is mutable, and it's designed to be used only for display purposes.
   * The profile scope is required in order to receive this claim.
   */
  name?: string;
  /**
   * 	Provides the last name, surname, or family name of the user as defined on the user object.
   */
  family_name?: string;
  /**
   * Provides the first or given name of the user, as set on the user object.
   */
  given_name?: string;
  /**
   * The IP address the user authenticated from.
   */
  ipaddr?: string;
  /**
   * In cases where the user has an on-premises authentication, this claim provides their SID. This can be used for authorization in legacy applications.
   */
  onprem_sid?: string;
  /**
   * An internal claim used by Azure to revalidate tokens. Should be ignored.
   */
  rh?: string;
  /**
   * The set of scopes exposed by your application for which the client application has requested (and received) consent. Your app should verify that these scopes are valid ones exposed by your app, and make authorization decisions based on the value of these scopes.
   *
   * Only included for user tokens.
   */
  scp?: string;
  /**
   * Provides a human readable value that identifies the subject of the token.
   * This value is not guaranteed to be unique within a tenant and should be used only for display purposes. Only issued in v1.0 id_tokens.
   */
  unique_name?: string;
  /**
   *  Personal Unique Identifier and is used to uniquely identify a user within a particular system or service, not standard.
   */
  puid?: string;
  /**
   * Identifies how the subject of the token was authenticated. Microsoft identities can authenticate in a variety of ways, which may be relevant to your application.
   *
   * The amr claim is an array that can contain multiple items, such as ["mfa", "rsa", "pwd"], for an authentication that used both a password and the Authenticator app.
   *
   *  See the amr claim section in Azure Active Directory access tokens documentation for values.
   */
  amr: string[];
  /**
   * The "Authentication context class" claim. A value of "0" indicates the end-user authentication did not meet the requirements of ISO/IEC 29115.
   */
  acr: string;
  /**
   * The wid claim represents the tenant-wide roles assigned to the user from the roles present in the Microsoft Entra built-in roles.
   */
  wids?: string[];
};
