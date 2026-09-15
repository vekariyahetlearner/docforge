import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

function readPackageJson(pkgPath) {
  return JSON.parse(readFileSync(resolve(rootDir, pkgPath, 'package.json'), 'utf-8'));
}

test('Architectural Invariant: conversion-core must not depend on Express', () => {
  const pkg = readPackageJson('packages/conversion-core');
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  assert.equal('express' in allDeps, false, 'conversion-core must remain decoupled from Express');
});

test('Architectural Invariant: conversion-core must not depend on the web application', () => {
  const pkg = readPackageJson('packages/conversion-core');
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  assert.equal('@docforge/web' in allDeps, false, 'conversion-core must not depend on apps/web');
});

test('Architectural Invariant: API must not depend on web', () => {
  const pkg = readPackageJson('apps/api');
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  assert.equal('@docforge/web' in allDeps, false, 'apps/api must not depend on apps/web');
});

test('Architectural Invariant: shared must remain framework-independent', () => {
  const pkg = readPackageJson('packages/shared');
  const deps = pkg.dependencies || {};
  assert.equal(
    Object.keys(deps).length,
    0,
    'packages/shared must have zero external runtime dependencies'
  );
});

test('Architectural Invariant: approved workspace structure must remain intact', () => {
  const rootPkg = readPackageJson('.');
  assert.deepEqual(
    rootPkg.workspaces,
    ['apps/*', 'packages/*'],
    'root workspaces must define apps/* and packages/*'
  );
});
