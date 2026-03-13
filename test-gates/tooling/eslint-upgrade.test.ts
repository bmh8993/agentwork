import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const workspaceRoot = process.cwd()
const packageJsonPath = join(workspaceRoot, 'package.json')
const eslintConfigPath = join(workspaceRoot, 'eslint.config.mjs')

function readPackageJson() {
  return JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
    devDependencies?: Record<string, string>
  }
}

describe('eslint toolchain', () => {
  it('uses ESLint 9 with typescript-eslint 8', () => {
    const pkg = readPackageJson()
    const devDependencies = pkg.devDependencies ?? {}

    expect(devDependencies.eslint).toMatch(/^\^9\./)
    expect(devDependencies['@typescript-eslint/eslint-plugin']).toMatch(/^\^8\./)
    expect(devDependencies['@typescript-eslint/parser']).toMatch(/^\^8\./)
  })

  it('has a flat ESLint config file', () => {
    expect(existsSync(eslintConfigPath)).toBe(true)
  })
})
