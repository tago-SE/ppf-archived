import path from 'node:path'
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { loadEnv } from 'vite'

export default defineConfig({
  test: {
    include: ['./__test__/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    testTimeout: 30_000, // 30 seconds
    env: loadEnv('test', process.cwd(), ''),
    /*
      Resolves next and next-auth transpilation issues
      https://github.com/nextauthjs/next-auth/discussions/9385#discussioncomment-11064988
    */
    server: {
      deps: {
        inline: ['next']
      }
    }
  },

  /* Enables absolute path imports */
  plugins: [tsconfigPaths()],
  resolve: {
    alias: [
      { find: '@/', replacement: path.resolve(__dirname, './src/*') }
    ]
  },
})