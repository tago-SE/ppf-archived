import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import payloadConfig from '@/payload.config'
import { getPayload, Payload } from "payload"
import { x_auth_method } from '@/lib/auth/payload/collection/strategy'
import { authStrategyName as externalUserStrategyName } from '@/lib/auth/payload/collection/strategy/ExternalEntraUserStrategy'
import { authStrategyName as curityStrategyName } from '@/lib/auth/payload/collection/strategy/CurityClientCredentialsStrategy'
import { defaultCmsConsumerScopes, OAUTH_TOKEN_ENDPOINT } from '@/lib/auth/config'
import { IdType } from '@/lib/auth/tokens/entraid/EntraIdClaims'
import { UserPrincipalTypes } from '@/collections/Users/userPrincipalTypes'


let payload: Payload
describe('test', () => {
    beforeAll(async () => {
        payload = await getPayload({ config: payloadConfig })
    })
    afterAll(async () => {
        if (payload.db.destroy !== undefined) {
            await payload.db.destroy()
        }
    })

    describe(`${x_auth_method}: ${curityStrategyName}`, () => {
        const tenantSlug = 'tenant-2'
        const curityClientId = process.env.TEST_CURITY_CLIENT_ID!
        const curityClientSecret = process.env.TEST_CURITY_CLIENT_SECRET!
        test('auth', async () => {
            const response = await fetch(OAUTH_TOKEN_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: curityClientId,
                    client_secret: curityClientSecret,
                    grant_type: 'client_credentials',
                    scope: defaultCmsConsumerScopes[0]
                })
            })
            const responseBody = await response.json()
            expect(response.ok, `Cannot obtain curity token: [${response.status} ${response.statusText}] ${responseBody.error ?? ''} ${responseBody.error_description ?? ''}`)
                .toBeTruthy()

            const token = responseBody.access_token
            expect(token).toBeTruthy()

            const authResult = await payload.auth({
                headers: new Headers({
                    [x_auth_method]: curityStrategyName,
                    'x-ppf-tenant-slug': tenantSlug,
                    'Authorization': `Bearer ${token}`
                })
            });

            const { user } = authResult

            expect(user).toBeTruthy()
            expect(user!.sub).toBe(curityClientId)
            expect(user!.userType).toBe(IdType.App)
            expect(user!.principalType).toBe(UserPrincipalTypes.CurityClient)
            expect(user!.curityClient).toBeTruthy()
            expect(user!.curityClient!.clientId).toBe(curityClientId)
        })
    })

    /**
     * Skip user-token authentication test.
     * Manually enable it by changing `describe.skip` to `describe` and replace `token` value with personal user bearer token
     */
    describe.skip(`${x_auth_method}: ${externalUserStrategyName}`, () => {
        const tenantSlug = 'tenant-1'
        const token = 'eyJ0...'
        test('auth', async () => {
            const authResult = await payload.auth({
                headers: new Headers({
                    [x_auth_method]: externalUserStrategyName,
                    'x-ppf-tenant-slug': tenantSlug,
                    'Authorization': `Bearer ${token}`
                })
            });
            expect(authResult.user).toBeTruthy()
        })
    })
})