# Payload Authentication

❌ - Feature that we don't use and have disabled or restricted.
✅ - Feature that is used.
✨ - Feature that has been customized.
⚠️ - Attention
🐛 - Bug

## NextAuth

We are using Next-Auth which is a AuthN framework, which we have implemented using a database strategy (Postgres) to manage sessions.

### NextAuth Built-In Endpoints

| Endpoint                    | Description | |
|-----------------------------|-------------|-------------|
| `GET /api/auth/providers`   | Retrieves a list of authentication providers. | |
| `GET /api/auth/signin`      | Displays the sign-in page `nextAuthConfig.pages.signin` |
| `POST /api/auth/signin/:provider` | Initiates sign-in with a specific provider. |  |
| `GET /api/auth/session`     | Retrieves the current user session. | |
| `GET /api/auth/csrf`        | Fetches the CSRF token for secure requests. | |
| `POST /api/auth/signout`    | Logs the user out and ends the session. | ⚠️ Calling this endpoint by itself is not enough to revoke tokens |

[NextAuth REST API](https://next-auth.js.org/getting-started/rest-api)

### Issues that NextAuth does not solve for you

* Revoking tokens
* Federated-signout to IdP
* Refreshing access_token (Partially solved)
* Updating access_token, id_token and refresh_token after initial login. (Solved)
* Middleware in edge-runtime

These issues need to be solved through custom implementation of those parts.

## PayloadCMS


### Payload AuthN Endpoints

| Endpoint                               | Description                          | Status |  |
|----------------------------------------|--------------------------------------|--|--|
| `POST /api/user/login`                 | Login                     | ❌ |  |
| `POST /api/user/logout`                | Logout                     | ✅✨  | Used internally by the framework, even with custom auth strategy. For example when inactivity is triggerd or for some other reason a logout is detected. We have customized this endpoint to revoke the user tokens and clear the relevant cookies. ⚠️ However, it does currently not perform federated-logout or handle CSRF. |
| `POST /api/user/unlock`                | Unlocks a user account.              | ❌ |  |
| `POST /api/user/refresh-token`         | Refresh tokens  | ✅✨ | Integrated with NextAuth to perform rolling refresh of tokens. |
| `POST /api/user/verify/{token}`        | Email verification | ❌ | |
| `GET /api/user/me`                     | Retrieves the current authenticated user. | ✅✨ | Integrated with NextAuth |
| `POST /api/user/forgot-password`       | Initiates a password reset request.  | ❌ |  |
| `POST /api/user/reset-password`        | Resets a user's password.            | ❌ |  |

### Payload Admin Pages

The following routes can be disabled through [admin routes](https://payloadcms.com/docs/admin/overview#admin-level-routes) settings. 

| Endpoint                               | Description                          | Status |  |
|----------------------------------------|--------------------------------------|--|--|
| `/admin/login`                 | The login page.                     | ✅ | |
| `/admin/logout`                | The logout page.                     | ✅| This endpoint loads and calls `/api/user/logout` endpoint. |
| `/admin/unauthorized`                | The unauthorized page.                     |   | 🐛 [B01](#b01) |
| `/admin/account`                | The user's account page.                     | ✅ | |
| `/admin/forgot`                | The password reset page.                  | ❌  | |
| `/admin/reset`                | The password reset page.                 | ❌  | |
| `/logout-inactivity`                | The page to redirect to after inactivity.                 | ✅  | When enabled seem to behave similarly to LogoutPage. |
| `/create-first-user`                | The page to create the first user.                 | ❌  | |

## Current issues with customizing AuthN

The framework has their internal client/side utility which manages the user state on the client-site with inactivity-timers, rolling token refresh rotation and so on.

These use built in endpoints for [AuthOperations](https://payloadcms.com/docs/rest-api/overview#auth-operations).

It is possible to customize these endpoints and things to make sure the session is destroyed and tokens are revoked. However, implementing CSRF and federated-signout that is applied not only when the user manually presses 'logout' is tricky and requires patching of the underlying packages.

## Issue with LetsEncrypt preventing Backchannel-Logout

[Shortening the Let's Encrypt Chain of Trust](https://letsencrypt.org/2023/07/10/cross-sign-expiration/)

Status: In Progress

## General questions

* Is 'state' required during login?

* Should the federated-logout signout from `https://authdevifcuritydemo.azurewebsites.net`. What is the expected implementatation? Should the Id_Token or SessionId from login be passed? How does it know who to signout?

## Bugs List

### <a id="b01"></a>B01: Unauthorized Page Bug
Visual bug - If you are a guest and go to `/admin/unauthorized`, it will show a button to SignOut, which should not be there.