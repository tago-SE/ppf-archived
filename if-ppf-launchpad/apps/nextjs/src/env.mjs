import { env as nextEnv } from "next-runtime-env";
import { z } from 'zod';

const isProduction = process.env.NODE_ENV == 'production';
const isServer = typeof window === 'undefined';
const skipNextPublicOnClientForEnVars = ['NODE_ENV'];

/**
 * Specify your server-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars.
 */
const server = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production'])
});

// /**
//  * Specify your client-side environment variables schema here. This way you can ensure the app isn't
//  * built with invalid env vars. To expose them to the client, prefix them with `NEXT_PUBLIC_`.
//  */
const client = z.object({
    NEXT_PUBLIC_RUNTIME_TEST: z.string().optional()
});

/**
 * Ensures that we are not able to get a value on the client for env variables which do not start with 'NEXT_PUBLIC_'
 * 
 * @param {string} key 
 */
function getEnv(key) {
    if (isServer) {
        return nextEnv(key); // Safe
    }
    // If client variable we enforce that it starts with NEXT_PUBLIC
    if (key.startsWith('NEXT_PUBLIC_') && !skipNextPublicOnClientForEnVars.includes(key)) {
        return nextEnv(key);
    }
    // Ensure that we do not leak server variable values to the client
    return undefined;
}


/**
 * 
 * @param {string} value 
 * @param {boolean} defaultValue 
 * @returns 
 */
function toBoolean(value) {
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['true', '1', 'yes', 'y'].includes(normalized)) {
            return true;
        }
        if (['false', '0', 'no', 'n'].includes(normalized)) {
            return false;
        }
    }
    return undefined;
}


/**
 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
 * middlewares) or client-side so we need to destruct manually.
 *
 * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | boolean | undefined | object>}
 */
let processEnv = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_RUNTIME_TEST: getEnv("NEXT_PUBLIC_RUNTIME_TEST")
};

// Don't touch the part below.
// --------------------------

const merged = server.merge(client);

/** @typedef {z.input<typeof merged>} MergedInput */
/** @typedef {z.infer<typeof merged>} MergedOutput */
/** @typedef {z.SafeParseReturnType<MergedInput, MergedOutput>} MergedSafeParseReturn */

// @ts-ignore
let env = /** @type {MergedOutput} */ (process.env);


if (!process.env.SKIP_ENV_VALIDATION) {
    const parsed = /** @type {MergedSafeParseReturn} */ (
        isServer
            ? merged.safeParse(processEnv) // on server we can validate all env vars
            : client.safeParse(processEnv) // on client we can only validate the ones that are exposed
    );
    if (parsed.success === false) {
        console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
        throw new Error('Invalid environment variables');
    }
    env = new Proxy(parsed.data, {
        get(target, prop) {
            if (typeof prop !== 'string') return undefined;
            // Throw a descriptive error if a server-side env var is accessed on the client
            // Otherwise it would just be returning `undefined` and be annoying to debug
            if (!isServer && !prop.startsWith('NEXT_PUBLIC_') && !skipNextPublicOnClientForEnVars.includes(prop))
                throw new Error(
                    isProduction
                        ? '❌ Attempted to access a server-side environment variable on the client'
                        : `❌ Attempted to access server-side environment variable '${prop}' on the client. Value '${prop.data}'` // remove prop.data
                );
            return target[/** @type {keyof typeof target} */ (prop)];
        },
    });
}

export { env };
