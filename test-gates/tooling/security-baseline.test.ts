import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

type PackageJson = {
  engines?: Record<string, string>
  devDependencies?: Record<string, string>
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf-8')) as T
}

function parseVersionRange(range: string): [number, number, number] {
  const match = range.match(/(\d+)\.(\d+)\.(\d+)/)
  if (!match) {
    throw new Error(`Could not parse version from "${range}"`)
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function expectAtLeast(range: string, expected: [number, number, number]) {
  const actual = parseVersionRange(range)
  expect(actual[0]).toBeGreaterThanOrEqual(expected[0])

  if (actual[0] === expected[0]) {
    expect(actual[1]).toBeGreaterThanOrEqual(expected[1])
  }

  if (actual[0] === expected[0] && actual[1] === expected[1]) {
    expect(actual[2]).toBeGreaterThanOrEqual(expected[2])
  }
}

const workspaceRoot = process.cwd()
const rootPackageJsonPath = join(workspaceRoot, 'package.json')
const appPackageJsonPath = join(workspaceRoot, 'packages/app/package.json')
const lockfilePath = join(workspaceRoot, 'pnpm-lock.yaml')
const nvmrcPath = join(workspaceRoot, '.nvmrc')

describe('security baseline', () => {
  it('pins the Node 22.22.1 baseline for this workspace', () => {
    const pkg = readJson<PackageJson>(rootPackageJsonPath)

    expect(existsSync(nvmrcPath)).toBe(true)
    expect(readFileSync(nvmrcPath, 'utf-8').trim()).toBe('22.22.1')
    expect(pkg.engines?.node).toContain('22.22.1')
  })

  it('uses patched Electron and updated Vite tooling', () => {
    const rootPkg = readJson<PackageJson>(rootPackageJsonPath)
    const appPkg = readJson<PackageJson>(appPackageJsonPath)

    expectAtLeast(appPkg.devDependencies?.electron ?? '', [35, 7, 5])
    expectAtLeast(rootPkg.devDependencies?.vite ?? '', [8, 0, 0])
    expectAtLeast(rootPkg.devDependencies?.vitest ?? '', [4, 1, 0])
    expectAtLeast(rootPkg.devDependencies?.['@vitejs/plugin-react'] ?? '', [6, 0, 1])
  })

  it('removes deprecated boolean 3.2.0 from the lockfile', () => {
    const lockfile = readFileSync(lockfilePath, 'utf-8')
    expect(lockfile.includes('/boolean@3.2.0:')).toBe(false)
  })
})
