# Automated PayloadCMS testing

## General approach

PPF PayloadCMS automated tests are setup using Vitest test framework.

Tests are separated into two categories: Unit tests and Integration tests.

## Unit tests

`yarn test`

`yarn test:watch`

Test config: [./vitest.config.ts](./vitest.config.ts)

Runs unit tests in all `./src/` subfolders. Test files can be co-located with normal code files. Test files are matched by  `*.test.*` or `*.spec.*` suffix in the file-name.

Example unit-test:

```
🗁 utils
  🖹 add.ts
  🖹 add.test.ts
```

```typescript
// add.ts
export function add(a: number, b: number) {
    return a + b
}
```

```typescript
// add.test.ts
import { describe, expect, test } from 'vitest';
import { add } from './add'

describe('add', () => {
    test('1 + 1 = 2', () => {
        expect(add(1, 1)).toBe(2)
    })
})
```

## Integration tests

`yarn test:integration`

`yarn test:integration:watch`

Runs integration test in all `./test/` subfolders. Test files are matched by  `*.test.*` or `*.spec.*` suffix in the file-name.

Integration tests setup and run `payload` instance. This instance can be used to test real DB queries, authentication methods, etc.

### Configuration

Test config: [./test/vitest.config.ts](./test/vitest.config.ts)

Integration tests require seeded database to be running.

**Integration tests require all the mandatory `env` variables to run `payload`.** To run integration tests, `.env.test` needs to be created by populating `.env.test.example`. Vitest automatically tries to load `.env.test` or `.env` files.

### Running in docker

It is possible to run integration test suite isolated in docker.

`./integration-tests.ps1`

Docker compose populates env from `.env.test` file.

> Note: Unfortunately azure managed identity authentication in Docker container is [more complicated than it needs to be](https://github.com/Azure/azure-sdk-for-net/issues/19167). Current workaround is to acquire Azure access token through CLI and then inject it into the container. See `./integration-tests.ps1`

