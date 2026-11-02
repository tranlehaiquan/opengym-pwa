#!/usr/bin/env node
// pnpm audit for each package directory, split the way it matters: what ships (runtime
// dependencies: in the images, the APK, the IPA) and what only builds and tests it (dev).
// Fails when a shipped dependency has a high or critical advisory; dev findings are listed.
//
//   node scripts/ci/deps-audit.mjs frontend mcp
import { execFileSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'

const dirs = process.argv.slice(2)
const audit = (dir, omitDev) => {
  let out
  try {
    out = execFileSync('pnpm', ['audit', '--json', ...(omitDev ? ['--prod'] : [])], { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  } catch (e) {
    out = e.stdout // pnpm audit exits 1 when it finds anything
  }
  try { return JSON.parse(out) } catch { return { error: String(out).slice(0, 300) } }
}
const SEV = ['critical', 'high', 'moderate', 'low', 'info']
const lines = ['### Dependency audit', '', '| Package dir | Shipped: critical / high / moderate / low | Dev only: critical / high / moderate / low |', '|---|---|---|']
const details = []
let fail = false
for (const dir of dirs) {
  const prod = audit(dir, true)
  const all = audit(dir, false)
  const count = (r) => SEV.slice(0, 4).map((s) => r?.metadata?.vulnerabilities?.[s] ?? '?').join(' / ')
  const devOnly = {}
  for (const s of SEV) devOnly[s] = (all?.metadata?.vulnerabilities?.[s] || 0) - (prod?.metadata?.vulnerabilities?.[s] || 0)
  lines.push(`| ${dir} | ${prod.error ? 'audit failed' : count(prod)} | ${SEV.slice(0, 4).map((s) => devOnly[s]).join(' / ')} |`)
  const prodAdvisories = new Set(Object.values(prod?.advisories || {}).map((a) => a.module_name))
  for (const a of Object.values(all?.advisories || {})) {
    const name = a.module_name
    const shipped = prodAdvisories.has(name)
    details.push(`- ${dir}: **${name}** ${a.severity}${shipped ? ' (shipped)' : ' (dev)'}${a.patched_versions ? ', fixed in ' + a.patched_versions : ''}: ${a.title} (${a.url})`)
    if (shipped && (a.severity === 'high' || a.severity === 'critical')) fail = true
  }
}
const md = [...lines, '', details.length ? details.join('\n') : 'No known advisories.', ''].join('\n')
console.log(md)
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n')
if (fail) { console.log('::error::a shipped dependency has a high or critical advisory'); process.exit(1) }

